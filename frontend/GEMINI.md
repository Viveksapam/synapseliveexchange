# Frontend — React System Specification

---

## 1. Stack & Core Constraints

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React (JavaScript) | No TypeScript; compensated by mandatory PropTypes |
| Styling | Plain CSS | No Tailwind, no UI libraries |
| Data Fetching | Fetch API only | No Axios |
| Type Safety | PropTypes (required on all components) | Replaces TypeScript; catches prop contract violations at runtime in dev |
| Dependencies | No new packages without explicit team approval | Minimises supply-chain attack surface |

---

## 2. Folder Structure

```
frontend/src/
  ├── api/              ← All fetch calls and config.js. Never fetch inside components.
  ├── components/       ← Shared/reusable UI (Buttons, Modals, Inputs)
  ├── hooks/            ← Global custom hooks
  ├── pages/            ← Page orchestrators (organised as folders)
  │   └── <PageName>/
  │       ├── <PageName>.jsx           ← Main orchestrator, < 150 lines
  │       └── <PageName><Section>.jsx  ← Extracted sub-components
  ├── errors/           ← ErrorBoundary components and fallback UIs
  ├── styles/           ← Global CSS variables and resets
  ├── utils/            ← Pure helper functions (formatters, validators)
  └── assets/           ← Images, SVGs, static media
```

---

## 3. Coding Standards

### 3.1 File Density

- **Hard limit**: No file exceeds 150 lines. Extract immediately on breach.
- Components: prefer under 100 lines. Composition over nesting.

### 3.2 Naming Conventions

| Category | Pattern | Example |
|---|---|---|
| String variable | `str<Name>` | `strUserEmail` |
| Number variable | `num<Name>` | `numRetryCount` |
| Boolean variable | `bool<Name>` | `boolIsLoading` |
| Array variable | `arr<Name>` | `arrProductList` |
| Object variable | `obj<Name>` | `objUserProfile` |
| State variable | `<prefix><Name>State` | `arrItemsState` |
| API functions | `<verb><Resource>` | `fetchProductList()` |
| Event handlers | `handle<Event>` | `handleFormSubmit()` |
| Components | `<NameType>.jsx` | `ProductCard.jsx` |

### 3.3 Props

- Descriptive, no abbreviations: `productId`, not `pid`.
- **PropTypes required on every component**. Missing PropTypes is a lint error.

### 3.4 Code Splitting

- Route-level splitting required via `React.lazy` + `Suspense`.
- Each page folder loads lazily from the router.

```jsx
// router entry — correct
const ProductPage = React.lazy(() => import('./pages/ProductPage/ProductPage'));
```

---

## 4. Architecture Rules

### 4.1 API Isolation

- All fetch calls live exclusively in `src/api/`.
- Components call API functions; they never call `fetch` directly.
- Every API function must include a `try/catch` block and return a normalised `{ data, error }` shape.

```js
// src/api/products.js
export async function fetchProductList() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      credentials: 'include', // send httpOnly cookies
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}
```

### 4.2 State Management

- Prefer `useState` and `useContext` (React native).
- Server state pattern: loading / data / error triad in every data-fetching hook.
- Promote to a dedicated state solution only with explicit team decision and justification documented.

### 4.3 Error Handling — Two Layers

**Layer 1 — API errors** (network, HTTP 4xx/5xx): caught in `src/api/`, surfaced via `strErrorMsgState` in the relevant component.

**Layer 2 — Render errors** (unexpected JS exceptions): caught by `ErrorBoundary` components. Every page-level component must be wrapped by an `ErrorBoundary` with a fallback UI.

```jsx
// src/errors/PageErrorBoundary.jsx
class PageErrorBoundary extends React.Component {
  state = { boolHasError: false };

  static getDerivedStateFromError() {
    return { boolHasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToMonitoring(error, info); // Sentry or equivalent
  }

  render() {
    if (this.state.boolHasError) return <ErrorFallback />;
    return this.props.children;
  }
}
```

### 4.4 Configuration

- Constants (base URLs, magic numbers, feature flags) in `src/api/config.js`.
- Environment variables via `REACT_APP_` prefix.
- **Document every `REACT_APP_` variable in `.env.example`** with a comment marking it as safe-for-client or restricted.
- Never place secrets, private keys, or service credentials in client code. These are visible in the compiled bundle.

---

## 5. Security

### 5.1 XSS Prevention

- `dangerouslySetInnerHTML` is **banned by default**.
- If raw HTML rendering is unavoidable (e.g., CMS content), require: `DOMPurify.sanitize()` wrapping the content, a code-review exception comment, and a second reviewer sign-off on the PR.

```jsx
// Banned — no exceptions without the above process
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// Correct if raw HTML is truly required
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### 5.2 Authentication & Token Storage

- Auth tokens must **never** be stored in `localStorage` or `sessionStorage`. Both are accessible to any JavaScript on the page and are vulnerable to XSS exfiltration.
- Auth tokens must be stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies, managed server-side.
- API calls use `credentials: 'include'` to send cookies automatically.

### 5.3 Dependency Auditing

- `npm audit --audit-level=high` runs in CI on every push.
- PRs are blocked from merging if high or critical severity vulnerabilities are found.
- Run `npm audit` locally before every push.

### 5.4 Content Security Policy

- CSP headers are enforced at the infrastructure layer (CDN / reverse proxy), not in React.
- The frontend must not inline scripts or use `eval()`. Doing so breaks a standard CSP and signals a design flaw.

### 5.5 Sensitive Data in Logs

- Never log auth tokens, passwords, PII (names, emails, IDs), or API keys to `console`, error trackers, or analytics.
- Error monitoring payloads must be reviewed to confirm no sensitive data is captured in breadcrumbs or request bodies.

---

## 6. Accessibility (WCAG 2.1 AA)

Accessibility is a correctness requirement, not a polish step. Violations are a legal liability (ADA; EU EAA 2025).

### 6.1 Structural Requirements

- Semantic HTML elements used correctly (`<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, landmark roles).
- All images have meaningful `alt` text. Decorative images use `alt=""`.
- Heading hierarchy is logical and unbroken (`h1` → `h2` → `h3`; no skipping).
- Colour contrast: ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components.

### 6.2 Interaction Requirements

- All interactive elements (buttons, links, inputs, modals) are fully keyboard-navigable.
- Visible focus indicators on all focusable elements (no `outline: none` without a custom replacement).
- Focus is managed programmatically on route changes and modal open/close.
- ARIA attributes used only when native semantics are insufficient; incorrect ARIA is worse than none.

### 6.3 Enforcement

- `jest-axe` integrated into component tests. Any `axe` violation fails the test.
- Colour contrast verified in design review before implementation.
- Manual keyboard-only walkthrough required before marking a feature as done.

```jsx
// Example: accessibility test in a component test file
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('ProductCard has no accessibility violations', async () => {
  const { container } = render(<ProductCard productId="1" productName="Widget" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 7. Performance

### 7.1 Core Web Vitals Targets

| Metric | Target | Definition |
|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5 s | Perceived load speed |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Visual stability |
| INP (Interaction to Next Paint) | ≤ 200 ms | Responsiveness |

### 7.2 Bundle Discipline

- Route-level code splitting is mandatory (see §3.4).
- Run `source-map-explorer` or `webpack-bundle-analyzer` before every significant release.
- No dependency added without checking its minified + gzipped size cost.

### 7.3 Lighthouse CI

- Lighthouse CI runs in the CI pipeline on every PR.
- PRs fail if LCP > 2.5 s or CLS > 0.1 on the test deployment.

---

## 8. Observability & Error Monitoring

- A production error monitoring service (e.g., Sentry) is initialised at the application root before the React tree mounts.
- `ErrorBoundary.componentDidCatch` forwards errors to the monitoring service.
- Unhandled promise rejections are captured globally.
- Monitoring is configured to **scrub PII** from payloads before transmission.
- Alerts are configured for error rate spikes; `console.error` is not a substitute for monitoring.

---

## 9. Testing Strategy

### 9.1 Test Pyramid

```
           ┌──────────┐
           │   E2E    │  Few — Playwright. Critical user journeys only.
          ┌┴──────────┴┐
          │Integration │  Some — React Testing Library + MSW. Page-level flows.
         ┌┴────────────┴┐
         │  Unit Tests  │  Many — Vitest/Jest. utils/, hooks/, pure logic.
        ┌┴──────────────┴┐
        │  A11y + Visual │  All components — jest-axe; optional Chromatic.
        └────────────────┘
```

### 9.2 Coverage Targets

| Layer | Target | Scope |
|---|---|---|
| Unit | ≥ 80% line coverage | `src/utils/`, `src/hooks/` |
| Integration | Key user flows covered | Page-level happy path + primary error path |
| E2E | Critical journeys covered | Auth, primary conversion flow, error recovery |
| Accessibility | Zero violations | All rendered components |

### 9.3 Test Placement

- Test files are co-located adjacent to source: `ProductCard.test.jsx` beside `ProductCard.jsx`.
- E2E tests live in `e2e/` at the project root.

### 9.4 Mocking Policy

- Mock at the **network layer** using MSW (`msw`) — not by mocking `fetch` directly.
- Mock `src/api/` functions in integration tests only when MSW is insufficient.
- Never mock the component under test.

### 9.5 What to Test

**Test:**
- Business-critical user flows (auth, purchase, form submission).
- Error states and recovery paths.
- All shared hooks (loading, error, data states).
- All utility functions, including edge cases (empty input, null, boundary values).
- Accessibility of all shared components.

**Do not test:**
- React internals or framework behaviour.
- Trivial pass-through props.
- One-off page-specific layout components with no logic.

### 9.6 E2E with Playwright

```js
// e2e/checkout.spec.js — example structure
test('user can complete checkout', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
});
```

---

## 10. CI/CD Pipeline

Every push to any branch triggers the full pipeline. PRs cannot be merged without a green pipeline.

```
Step 1 — Lint
  eslint --max-warnings 0
  (Zero warnings tolerated; warnings are errors.)

Step 2 — Dependency Audit
  npm audit --audit-level=high
  (Fail on high or critical CVEs.)

Step 3 — Unit & Integration Tests
  npm run test -- --coverage
  (Fail if coverage drops below targets in §9.2.)

Step 4 — Accessibility Tests
  Included in Step 3 via jest-axe.

Step 5 — Build
  npm run build
  (Fail on any build error or warning.)

Step 6 — Performance Audit
  Lighthouse CI against preview deployment.
  (Fail if LCP > 2.5s or CLS > 0.1.)

Step 7 — Preview Deployment
  Auto-deploy PR branch to a preview URL.
  (URL posted to PR for manual QA and stakeholder review.)

Step 8 — E2E Tests (on preview deployment)
  Playwright critical-journey suite.
  (Fail if any critical journey fails.)
```

**Branch protection rules:**
- `main` and `develop` are protected branches.
- Direct push is blocked; all changes via PR.
- Minimum one code-review approval required.
- Pipeline must be green before merge is permitted.

---

## 11. Development Workflow

### 11.1 Before Every Commit

```bash
eslint src/          # zero warnings
npm run test         # all tests green
npm audit            # no high/critical
```

### 11.2 Before Every PR

- Manual keyboard-only walkthrough of changed UI.
- Confirm no PII, tokens, or secrets appear in changed files.
- Confirm PropTypes are defined on any new component.
- Run Lighthouse locally if performance-sensitive code changed.

### 11.3 Commit Messages

Follow Conventional Commits format for automated changelog generation:

```
feat(cart): add quantity selector to CartItem
fix(auth): clear token cookie on session expiry
refactor(homepage): delete v1 and v2 page components and dead assets
chore(deps): update react to 18.3.1
```

---

## 12. Agent Behaviour (AI-assisted Development)

- **Planning**: Show a file-level plan before changing multiple files.
- **Safety**: Never install packages without explicit confirmation. Never delete files without confirmation.
- **Readability**: Prefer clarity over cleverness; optimise for the next engineer reading the code.
- **Security**: Flag any pattern that resembles `dangerouslySetInnerHTML`, token storage in localStorage, or `eval()` — even if found in existing code.
- **Accessibility**: Add `jest-axe` assertions to every new component test file automatically.
- **Cleanup**: When touching a file, flag any violation from §13–§15 in the same response. Do not silently leave known debt.

---

## 13. Styling & Aesthetic Guidelines

- Custom, intentional aesthetic. No generic defaults or templated AI-style patterns.
- Emojis: minimal usage. Universally understood emojis only where strictly necessary.
- All colour choices must satisfy WCAG 2.1 AA contrast ratios before implementation.
- `prefers-reduced-motion` respected in all CSS animations and transitions.
- `prefers-color-scheme` considered for any dark/light theming decisions.

---

## 14. Quick Reference — What Goes Where

| Concern | Location | Rule |
|---|---|---|
| Fetch calls | `src/api/` | Only place; `try/catch` always; `credentials: 'include'` |
| Constants / URLs | `src/api/config.js` | No magic strings in components |
| Shared UI | `src/components/` | PropTypes required; jest-axe in test |
| Custom hooks | `src/hooks/` | ≥ 80% test coverage |
| Pure functions | `src/utils/` | ≥ 80% test coverage; no side effects |
| Shared prop shapes | `src/utils/propShapes.js` | One definition; imported by all consumers |
| Page layout | `src/pages/<Name>/` | Wrapped in `PageErrorBoundary`; lazy-loaded |
| Error boundaries | `src/errors/` | One per page; forwards to monitoring |
| Global styles | `src/styles/` | CSS variables; no inline styles for theming |

---

## 15. Refactoring Philosophy

Refactoring is not a separate activity scheduled "later." It is the discipline of
leaving every file you touch in a cleaner state than you found it.

**The Boy Scout Rule**: Before submitting any PR, scan the files you touched.
If you see a violation listed in §16–§18, fix it in the same PR — not a follow-up ticket.

**Scope discipline**: Refactors that touch more than 5 files must be their own
dedicated PR, separate from feature work. Mixing refactor and feature changes makes
both harder to review and harder to revert.

---

## 16. Design Iteration Debt — Multiple Homepage Versions

This codebase has accumulated dead code from multiple homepage design iterations.
The following rules govern how to identify and eliminate it permanently.

### 16.1 Dead Page Components

Any page component not reachable from the active router is dead code.
Dead pages must be **deleted**, not commented out or renamed to `_old`.

**Audit process:**
1. Open the router file (`App.jsx` or `router.jsx`).
2. List every `<Route>` path currently defined.
3. List every folder in `src/pages/`.
4. Any folder not referenced in the active route list is dead — delete it.

```bash
# List all page folders
ls src/pages/

# Cross-reference with router imports
grep -r "import" src/App.jsx | grep "pages"
```

### 16.2 Dead CSS

Multiple design iterations accumulate CSS that no element references.

| Category | Detection Method |
|---|---|
| Entire CSS files not imported anywhere | `grep -r "import.*\.css" src/` — any `.css` absent from results is dead |
| CSS class names not used in JSX | IDE "find usages" on the class name; zero results = dead |
| Duplicate `--variable-name` definitions | Scan `src/styles/` for the same custom property defined more than once |
| Rules overridden in the same file | Two selectors targeting the same element with the same property |
| Redundant vendor prefixes | `-webkit-`, `-moz-` for properties now universally supported |

**Rule**: Do not accumulate commented-out CSS blocks. If a style is removed, delete it.
Git history preserves it if needed.

### 16.3 Dead Assets

```bash
# List all assets
find src/assets/ -type f

# Check each against the codebase — zero results means dead
grep -r "hero-v2.png" src/
```

Old hero images, alternate logo variants, and unused icon sets from previous design iterations
are among the largest files in the repository. Delete them as soon as they are superseded.

### 16.4 Dead Components

Any component in `src/components/` not imported by any active page or other component is dead.

```bash
for f in src/components/**/*.jsx; do
  name=$(basename "$f" .jsx)
  count=$(grep -r "$name" src/ --include="*.jsx" --include="*.js" | grep -v "$f" | wc -l)
  if [ "$count" -eq 0 ]; then echo "DEAD: $f"; fi
done
```

Run before any significant release. Delete what this script reports.

### 16.5 Duplicate Utility Functions

Multiple iterations often produce near-identical utility functions (e.g., two `formatDate`
implementations in different files).

**Rule**: One utility function per logical operation. If two functions do the same thing,
keep the one with tests and delete the other. Update all call sites before closing the PR.

---

## 17. Code-Level Refactoring Rules

### 17.1 No Commented-Out Code

Commented-out code is prohibited in any committed file.

```jsx
// BANNED
{/* <OldHeroSection backgroundImage={strOldHero} /> */}

// BANNED
// const strOldApiUrl = 'https://old-endpoint.example.com/api';
```

**Only permitted exception**: A `TODO:` or `FIXME:` with a ticket number and owner.
```js
// TODO(#142): Replace polling with WebSocket when backend supports it — @yourname
```

### 17.2 No Magic Numbers or Strings

Any literal value that is not immediately self-evident must be a named constant in `config.js`.

```js
// WRONG
setTimeout(handleAutoLogout, 1800000);

// CORRECT — src/api/config.js
export const NUM_SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
```

### 17.3 No Business Logic in Components

React components render UI and handle user events. Data transformation, formatting,
and decision logic belong in `src/utils/` or custom hooks.

```jsx
// WRONG — logic inside JSX
<p>{product.numPrice > 1000
  ? `${(product.numPrice / 100).toFixed(2)} (bulk rate)`
  : `${product.numPrice.toFixed(2)}`}
</p>

// CORRECT
import { formatProductPrice } from '../utils/formatters';
<p>{formatProductPrice(product.numPrice)}</p>
```

### 17.4 Single Source of Truth for Prop Shapes

Do not redefine the same PropTypes shape in multiple components.
Extract it to `src/utils/propShapes.js` when more than one component uses it.

```js
// src/utils/propShapes.js
import PropTypes from 'prop-types';

export const productShape = PropTypes.shape({
  productId: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
  numPrice: PropTypes.number.isRequired,
});
```

### 17.5 No Dead Imports

No unused import statements in any file. ESLint `no-unused-vars` catches these;
zero warnings policy in CI means they are blocked from merging.

### 17.6 No console.log in Production Paths

`console.log`, `console.warn`, and `console.error` are development tools.
Remove all of them before committing. Use the error monitoring service for
production-grade logging.

---

## 18. Refactoring Workflow

### 18.1 Scheduled Cleanup Sprint

Once per development cycle (every 4–6 feature sprints), run a dedicated cleanup sprint
with no feature work. Agenda:

1. Dead page audit — §16.1.
2. Dead component audit — §16.4.
3. Dead asset audit — §16.3.
4. Dead CSS audit — §16.2.
5. Duplicate utility function audit — §16.5.
6. `package.json` unused dependency audit — `npx depcheck`.

Document findings as a list of small, independently reviewable cleanup PRs.

### 18.2 Refactor PR Rules

A PR whose primary purpose is refactoring must:
- Use `refactor:` Conventional Commit prefix.
- Not change any user-visible behaviour.
- Include a "before / after" summary in the PR description.
- Pass all existing tests without modifying test assertions.
  If test assertions must change, the refactor changed behaviour — stop and reassess.

### 18.3 When to Refactor vs. Dedicated PR

| Signal | Action |
|---|---|
| File exceeds 150 lines | Extract immediately, same PR |
| Function does more than one thing | Extract now if it blocks understanding |
| Naming violates convention | Rename in same PR using IDE rename tool |
| Logic duplicated in 2 places | Extract to shared util before adding a third |
| Logic duplicated in 3+ places | Dedicated refactor PR before any further feature work |
| Page replaced by a new design | Delete old page folder in the same PR that ships the new one |

---

## 19. Definition of Done — Frontend

A task is only done when all of the following are true:

- [ ] No file in the changeset exceeds 150 lines.
- [ ] All new components have PropTypes defined.
- [ ] All new components have a `jest-axe` assertion in their test file.
- [ ] No commented-out code in the changeset.
- [ ] No dead imports — ESLint passes with zero warnings.
- [ ] No `console.log` / `console.warn` / `console.error` in production paths.
- [ ] Every CSS class introduced is used in JSX within the same PR.
- [ ] No magic numbers or strings — all literals are named constants.
- [ ] Old page / component / asset deleted if replaced by this PR.
- [ ] CI pipeline is fully green (lint → audit → test → build → Lighthouse → E2E).

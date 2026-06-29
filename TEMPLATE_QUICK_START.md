# Template Integration: Quick Start Guide

**TL;DR** — Three essential steps before merging new templates:

---

## Step 1: Protect Business Content (2-3 hours)

**Goal**: Ensure no text/messaging is lost during template swap

1. Find all text in your React components (UI labels, headers, error messages, product copy)
2. Move it to JSON files in `src/content/business/`:
   ```
   src/content/business/
   ├── ui-strings.json        (navigation, buttons, labels)
   ├── marketing-copy.json    (taglines, feature descriptions)
   ├── legal-notices.json     (ToS, privacy, disclaimers)
   └── error-messages.json    (validation, system errors)
   ```
3. Update components to use these files instead of hardcoding text
4. Save snapshot: `TEMPLATE_SNAPSHOTS/pre-merge-snapshot.json`

**Verify**: Search code for your brand name → should only appear in `src/content/business/`

---

## Step 2: Audit Template Debt (1-2 hours)

**Goal**: Identify which old template patterns to delete

1. List all files in your current templates folder
2. For each file, note:
   - Is it actually used by any component?
   - Does it conflict with new v2 templates?
   - Are styles bleeding into other components?
3. Document findings in `TEMPLATE_AUDIT_LOG.md`

**Do NOT delete anything yet** — just catalog what needs cleanup

---

## Step 3: Safe Merge (4-6 hours)

**Goal**: Bring in new templates without breaking anything

1. Create branch: `git checkout -b feature/template-integration-v2`
2. Copy v2 templates to `src/templates/v2/`
3. Update ONE component at a time:
   - Change import from v1 → v2
   - Test it works
   - Commit: `git commit -m "feat: migrate Header to v2 template"`
4. After all components migrated, delete v1 files
5. Final build test: `npm run build` (should have zero errors)

---

## Three Key Documents

| Document | Use Case | Time to Read |
|----------|----------|--------------|
| `TEMPLATE_MANAGEMENT_STRUCTURE.md` | Big picture: how to organize templates + content | 10 min |
| `TEMPLATE_AUDIT_LOG.md` | Running record: what you found & what you did | 5 min (add notes as you go) |
| `TEMPLATE_MERGE_CHECKLIST.md` | Before merging: 20-point checklist to verify safety | 3 min (use as checklist) |

---

## One-Page Risk Mitigation

```
RISK: Text gets lost when templates change
→ SOLUTION: Extract all text to src/content/business/ FIRST

RISK: Dead code left in codebase after cleanup
→ SOLUTION: Delete v1 templates only after all migrations complete

RISK: Styling conflicts break layout
→ SOLUTION: Document each v2 template's styling scope; use CSS modules/BEM

RISK: Forgot to test something, broke production
→ SOLUTION: Follow TEMPLATE_MERGE_CHECKLIST.md — all 20 steps
```

---

## Git Commit Strategy

**Every commit should be logical & reversible:**

```bash
# ✓ Good: one component per commit
git commit -m "feat: migrate Header to v2 template"

# ✓ Good: extract business content separately
git commit -m "refactor: extract UI strings to src/content/business/"

# ✓ Good: cleanup at the end
git commit -m "refactor: remove unused v1 templates"

# ✗ Bad: everything in one giant commit
git commit -m "big refactor"

# ✗ Bad: no message
git commit -m "."
```

**Why?** If something breaks, you can revert a single logical commit without losing other work.

---

## Before You Start

**Answer these questions:**

1. **Where is your React code?**
   - Path: `frontend/src/` or `src/`?

2. **What styling are you using?**
   - CSS files, SCSS, Tailwind, CSS-in-JS?

3. **Where are your v2 templates?**
   - Design tool export (Figma)?
   - Separate folder in repo?

4. **Do you have tests?**
   - Unit tests for components?
   - Visual regression tests?

5. **Who needs to sign off?**
   - Designer, product manager, QA team?

---

## Getting Started: Right Now

1. Read `TEMPLATE_MANAGEMENT_STRUCTURE.md` (10 min)
2. Open `TEMPLATE_AUDIT_LOG.md` and add today's date
3. Start Step 1: find all hardcoded text in components
4. Paste findings into the audit log
5. Tomorrow: create `src/content/business/ui-strings.json`

---

## Need Help?

Check the relevant section in:
- `TEMPLATE_MANAGEMENT_STRUCTURE.md` → problem with step-by-step strategy
- `TEMPLATE_AUDIT_LOG.md` → stuck on data gathering
- `TEMPLATE_MERGE_CHECKLIST.md` → ready to merge, need verification steps

**All documents are in the root of your project** (`sle/`)

---

**You're ready to begin.** Start with the audit log and take it step-by-step.

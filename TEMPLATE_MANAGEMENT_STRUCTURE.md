# Template & Business Content Management Structure

**Purpose**: Establish a safe, verifiable system for integrating design templates while preserving business content and preventing template conflicts.

---

## 1. Content Classification

### Business Content (Non-Negotiable)
Text, messaging, and copy that define brand voice, legal requirements, or business logic:
- Product descriptions and value propositions
- Legal/compliance text (ToS, privacy notices)
- Marketing copy and messaging
- Feature descriptions
- Error messages and user-facing notifications
- SEO metadata (titles, descriptions)

**Storage**: `src/content/business/` (JSON/YAML files)
**Version Control**: Track separately from code

### Design Templates (Replaceable)
Visual structure, styling, and layout that can evolve:
- Component layouts
- Styling patterns
- Visual hierarchy rules
- Animation/transition definitions
- Design tokens (colors, spacing, typography)
- Template-specific markup/structure

**Storage**: `src/templates/` (JSX/CSS files)
**Version Control**: Track with Git, but separate concerns

---

## 2. Directory Structure

```
sle/
├── TEMPLATE_MANAGEMENT_STRUCTURE.md    (this file)
├── TEMPLATE_AUDIT_LOG.md              (running record of changes)
├── TEMPLATE_MERGE_CHECKLIST.md        (verification steps)
│
├── frontend/
│   ├── src/
│   │   ├── content/
│   │   │   ├── business/
│   │   │   │   ├── ui-strings.json
│   │   │   │   ├── marketing-copy.json
│   │   │   │   ├── legal-notices.json
│   │   │   │   └── product-descriptions.json
│   │   │   │
│   │   │   └── constants.js            (non-semantic constants only)
│   │   │
│   │   ├── templates/
│   │   │   ├── v1/                     (old templates - to be cleaned)
│   │   │   │   ├── components/
│   │   │   │   ├── layouts/
│   │   │   │   └── styles/
│   │   │   │
│   │   │   └── v2/                     (new templates - from design project)
│   │   │       ├── components/
│   │   │       ├── layouts/
│   │   │       ├── styles/
│   │   │       └── TEMPLATE_MANIFEST.md
│   │   │
│   │   ├── components/                 (business logic + template)
│   │   └── App.jsx
│   │
│   └── TEMPLATE_SNAPSHOTS/             (backup before changes)
│       ├── pre-cleanup-snapshot.json
│       └── pre-merge-snapshot.json
│
├── design-project/                    (external design tool exports)
│   ├── templates-v2-export.figma
│   ├── text-constants-export.json
│   └── DESIGN_TO_CODE_MAPPING.md
│
└── docs/
    ├── TEMPLATE_INTEGRATION_GUIDE.md
    └── BUSINESS_CONTENT_REFERENCE.md
```

---

## 3. Pre-Merge Verification Checklist

**Before applying new templates**, run these checks:

### Phase 1: Audit Current State
- [ ] **Snapshot existing codebase**
  - Export component tree with props
  - Capture all hardcoded text strings
  - Record current styling/layout rules

- [ ] **Identify template debt**
  - List all v1 template files that are unused
  - Mark components using legacy patterns
  - Document conflicting style namespaces

- [ ] **Extract business content**
  - Export all user-facing text from existing components
  - Verify no business copy will be lost
  - Record where text is sourced (hardcoded vs. data)

**Deliverable**: `TEMPLATE_AUDIT_LOG.md` entry with date and findings

### Phase 2: Prepare New Templates
- [ ] **Map design to code**
  - Document v2 template components
  - List new dependencies/patterns
  - Identify breaking changes from v1

- [ ] **Extract text from design project**
  - Export all placeholder/default text from Figma/design tool
  - Compare against business content repository
  - Resolve conflicts (design text vs. business text)

- [ ] **Create template manifest**
  - List all v2 components with their imports
  - Document prop interfaces
  - Note styling scope (CSS-in-JS, CSS modules, Tailwind, etc.)

**Deliverable**: `templates/v2/TEMPLATE_MANIFEST.md` + `DESIGN_TO_CODE_MAPPING.md`

### Phase 3: Safe Integration
- [ ] **Isolation branch**
  - Create feature branch: `feature/template-integration-v2`
  - Import v2 templates alongside v1 (no deletion yet)
  - Verify v1 still works

- [ ] **Content injection**
  - Replace hardcoded business text with imports from `src/content/business/`
  - Verify all text is now externalized
  - Add fallback/warning if business content is missing

- [ ] **Migrate components (one at a time)**
  - Convert 1 component to use v2 template
  - Test functionality + visual appearance
  - Verify business content renders correctly
  - Document any issues in audit log

- [ ] **Remove v1 template debt**
  - Only after all v2 migrations are complete
  - Delete unused v1 template files
  - Update imports across codebase
  - Verify no broken references

**Deliverable**: Git commits with clear messages (`feat: migrate Header to v2 template`, `refactor: extract business copy to constants`)

---

## 4. Business Content Format

**File**: `src/content/business/ui-strings.json`
```json
{
  "header": {
    "brand_name": "Synapse-LE",
    "tagline": "Learning Experience Platform",
    "nav_home": "Home",
    "nav_courses": "Courses",
    "nav_about": "About"
  },
  "footer": {
    "copyright": "© 2026 Synapse-LE. All rights reserved.",
    "legal_link_text": "Legal",
    "privacy_link_text": "Privacy"
  },
  "errors": {
    "load_failed": "Unable to load content. Please refresh.",
    "auth_required": "Please log in to continue."
  }
}
```

**Usage in components**:
```jsx
import businessContent from '@/content/business/ui-strings.json';

export function Header() {
  return (
    <header>
      <h1>{businessContent.header.brand_name}</h1>
      <p>{businessContent.header.tagline}</p>
    </header>
  );
}
```

---

## 5. Template Manifest Format

**File**: `src/templates/v2/TEMPLATE_MANIFEST.md`

```markdown
# Template V2 Manifest

## Components

### Header
- **File**: `src/templates/v2/components/Header.jsx`
- **Props**: title (string), nav (array), onNavClick (func)
- **Styling**: CSS Modules (Header.module.css)
- **Dependencies**: None
- **Breaking Changes from V1**: 
  - Removed `subtitle` prop
  - Changed `nav` shape from {label, href} to {label, action}

### Card
- **File**: `src/templates/v2/components/Card.jsx`
- **Props**: title, children, variant ('default'|'featured'|'loading')
- **Styling**: Tailwind CSS + CSS variables
- **Dependencies**: Icon library (lucide-react)
- **Notes**: Replaces v1 Box component

...
```

---

## 6. Audit Log Format

**File**: `TEMPLATE_AUDIT_LOG.md`

```markdown
# Template Integration Audit Log

## 2026-06-29 - Initial Audit
**Status**: PENDING_CLEANUP
**Auditor**: [Your Name]

### Current State
- Found 12 v1 template components
- 45 hardcoded text strings identified
- 3 conflicting CSS namespace collisions

### Actions Required
1. Remove unused v1 layouts (sidebar, deprecated-hero)
2. Extract business copy to JSON
3. Resolve color token conflicts (primary-blue defined in 2 places)

### Risks
- Header component uses inline styles + Bootstrap classes (mixing)
- Some text is stored in reducer state, not easily exportable

---

## 2026-06-30 - Content Extraction Complete
**Status**: READY_FOR_MERGE
**Auditor**: [Your Name]

### Completed
- [x] All UI text exported to `src/content/business/`
- [x] v2 templates imported (no breakage)
- [x] Component migration started: Header ✓, Sidebar ✓

### Remaining
- [ ] Footer component migration
- [ ] v1 cleanup + deletion
```

---

## 7. Pre-Merge Verification Snapshot

**Purpose**: Automated backup before each major step.

**Script location**: `scripts/template-snapshot.js`

```javascript
// Captures:
// 1. Component tree structure
// 2. All text strings in UI
// 3. CSS class names and styles in use
// 4. Import dependencies

// Run before cleanup: node scripts/template-snapshot.js
// Output: TEMPLATE_SNAPSHOTS/pre-cleanup-snapshot.json
```

---

## 8. Risk Mitigation

| Risk | Prevention |
|------|-----------|
| **Text loss during migration** | All business content externalized to `src/content/business/` BEFORE any template changes |
| **Broken component references** | Run component dependency audit; maintain v1+v2 parallel imports during transition |
| **CSS conflicts/override issues** | Document styling scope in manifest; prefix v2 styles; avoid cascading global changes |
| **Incomplete v1 removal leaving dead code** | Audit log + checklist; final cleanup PR lists all deletions |
| **Design intent lost** | DESIGN_TO_CODE_MAPPING.md documents why each v2 decision was made |

---

## 9. Rollback Plan

If issues arise after merge:

1. **Revert last commit**: `git revert HEAD`
2. **Restore snapshot**: Compare with `TEMPLATE_SNAPSHOTS/pre-merge-snapshot.json`
3. **Identify breaking change**: Check audit log for the problematic migration step
4. **Fix in isolation**: Resolve on feature branch, re-test, re-merge

---

## 10. Next Steps

1. **This week**: Complete Phase 1 (Audit Current State)
   - [ ] Run template snapshot
   - [ ] Extract business content
   - [ ] Create audit log entry

2. **Next week**: Complete Phase 2 (Prepare New Templates)
   - [ ] Map design exports to code
   - [ ] Create TEMPLATE_MANIFEST.md
   - [ ] Document text conflicts

3. **Week after**: Complete Phase 3 (Safe Integration)
   - [ ] Create feature branch
   - [ ] Migrate components one-by-one
   - [ ] Merge with confidence

---

**Questions?** Update this document as you discover new risks or patterns.

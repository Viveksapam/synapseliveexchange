# Template Merge Verification Checklist

**Purpose**: Step-by-step verification before, during, and after merging new templates with existing codebase

**Project**: Synapse-LE  
**Last Updated**: 2026-06-29

---

## PRE-MERGE: Preparation (Do This First)

### Content Backup & Audit
- [ ] **Snapshot current site**
  - Export complete list of components and their props
  - Capture all visible text on the site
  - Record styling system (colors, spacing, fonts)
  - **File to create**: `TEMPLATE_SNAPSHOTS/pre-merge-snapshot.json`

- [ ] **Business content extracted**
  - All UI text exported to JSON files in `src/content/business/`
  - No business copy remains hardcoded in components
  - **Verification**: Search codebase for marketing/product copy — should find zero results
  - **File to verify**: `src/content/business/ui-strings.json`, `marketing-copy.json`, `legal-notices.json`

- [ ] **Design project audited**
  - v2 template files documented in `TEMPLATE_MANIFEST.md`
  - All placeholder text in design reviewed against business content
  - Breaking changes from v1 → v2 documented
  - **File to verify**: `src/templates/v2/TEMPLATE_MANIFEST.md`

- [ ] **v1 template debt identified**
  - List of unused/legacy v1 components documented
  - Conflicting styles/namespaces noted
  - Cleanup plan created (which files to delete, in what order)
  - **File to verify**: `TEMPLATE_AUDIT_LOG.md` contains "Cleanup Template Debt" section

---

## MERGE: Safe Integration Process

### Step 1: Create Isolated Branch
- [ ] Create feature branch from `main`: 
  ```
  git checkout -b feature/template-integration-v2
  ```
- [ ] Verify you're on the correct branch
- [ ] All work happens here until verification complete

### Step 2: Import v2 Templates (No Deletions Yet)
- [ ] Copy v2 template files to `src/templates/v2/`
  - Do NOT delete v1 files yet
  - v1 and v2 coexist during this phase
  
- [ ] Update imports in components to use v2
  - **Example change**:
    ```jsx
    // OLD: import Header from '@/components/Header'
    // NEW: import Header from '@/templates/v2/Header'
    ```
  - Do this ONE COMPONENT at a time (see next step)
  - **Verification**: Run `npm run build` — should have zero errors

- [ ] Verify v1 templates are still available (not modified)
  - Check that old import paths still work (if any fallback exists)

### Step 3: Migrate Components (One Per Commit)

For each component that needs the v2 template:

- [ ] **Update component file**
  - Replace v1 template reference with v2 import
  - Update component props to match v2 interface
  - Example commit message: `feat: migrate Header component to v2 template`

- [ ] **Inject business content**
  - Any hardcoded text → replace with import from `src/content/business/`
  - Example:
    ```jsx
    import businessContent from '@/content/business/ui-strings.json';
    
    <h1>{businessContent.header.brand_name}</h1>
    ```
  - **Verification**: Run `grep -r "product name"` — no results from hardcoded strings

- [ ] **Test functionality**
  - Component renders without errors
  - All props pass correctly
  - Styling applies correctly (no CSS conflicts)
  - **Test method**: Manual browser test or automated test (if available)

- [ ] **Verify business content renders**
  - Text displays correctly (no encoding issues, line breaks intact)
  - Spacing/layout matches design for real content
  - Run `npm run build` — zero errors

- [ ] **Commit with clear message**
  ```
  feat: migrate [ComponentName] to v2 template
  
  - Replaced v1 [OldTemplate] with v2 template
  - Extracted business text to src/content/business/
  - Verified no functionality loss
  ```

### Step 4: Clean Up v1 Templates (Only After All Migrations Complete)

- [ ] **Verify all v1 files have been replaced**
  - Check that no components still import from `src/templates/v1/`
  - Search codebase: `grep -r "templates/v1"` — should find zero results

- [ ] **Delete v1 template files**
  - Remove `src/templates/v1/` directory entirely
  - Example commit: `refactor: remove v1 templates (replaced by v2)`

- [ ] **Run final build**
  - `npm run build` — zero errors
  - `npm run lint` — zero errors

- [ ] **Verify all imports still work**
  - Check that no broken imports remain
  - Search for "undefined" component errors in build output

### Step 5: Prepare for Merge

- [ ] **Create summary of all changes**
  - List all components migrated
  - List all files deleted
  - Note any new dependencies added
  - **File to create**: `MERGE_SUMMARY.md` (include in PR description)

- [ ] **Update TEMPLATE_AUDIT_LOG.md**
  - Add entry: "Migration Complete"
  - List all commits and changes
  - Record any issues encountered and how they were resolved

- [ ] **Final snapshot**
  - Run template snapshot tool again
  - **File to create**: `TEMPLATE_SNAPSHOTS/post-merge-snapshot.json`
  - Compare with pre-merge snapshot to confirm only intended changes

---

## VERIFICATION: Before Merging to Main

### Code Review Checklist
- [ ] All v1 template references removed (no orphaned imports)
- [ ] All business content comes from `src/content/business/` (no hardcoding)
- [ ] No CSS conflicts or style overrides between v1 and v2
- [ ] All new v2 components have props properly typed (if using TypeScript)
- [ ] No breaking changes to public component APIs

### Functional Testing Checklist
- [ ] Website builds without errors: `npm run build`
- [ ] All pages/routes load without console errors
- [ ] Text content displays correctly (all business strings render)
- [ ] Styling/layout matches design intent
- [ ] No visual regression (compare screenshots: before/after)
- [ ] Forms, buttons, interactions work as before
- [ ] Mobile responsive design works (if applicable)

### Business Content Verification Checklist
- [ ] All user-facing text comes from business content files
- [ ] No marketing copy or product descriptions hardcoded
- [ ] Legal text unchanged and compliant
- [ ] Spelling/grammar checked
- [ ] Brand terminology consistent across site

### Rollback Readiness
- [ ] Git history is clean (logical commits, good messages)
- [ ] Can revert to main with one command: `git revert HEAD`
- [ ] Pre-merge snapshot saved: `TEMPLATE_SNAPSHOTS/pre-merge-snapshot.json`
- [ ] All risky changes documented in audit log

---

## POST-MERGE: Validation

After merging to `main`:

### Immediate (Same Day)
- [ ] Verify build/deployment succeeded
- [ ] Check production site (if deployed) for visual issues
- [ ] Monitor error logs for new errors
- [ ] Notify stakeholders: "Templates successfully integrated"

### Follow-up (Next 48 Hours)
- [ ] Collect feedback on design/functionality
- [ ] Monitor for user-reported issues
- [ ] Compare actual site vs. design mocks
- [ ] Document any unforeseen issues in audit log

---

## Rollback Instructions

If critical issues discovered after merge:

1. **Revert the merge**:
   ```
   git revert -m 1 <merge-commit-hash>
   ```

2. **Identify the problem**:
   - Compare pre/post snapshots: `TEMPLATE_SNAPSHOTS/pre-merge-snapshot.json` vs. `post-merge-snapshot.json`
   - Check audit log for migration notes
   - Determine which component migration caused the issue

3. **Fix in isolation**:
   - Create new feature branch
   - Redo the problematic migration step
   - Test thoroughly
   - Re-submit for merge

---

## Quick Reference: Git Commands

```bash
# Create feature branch
git checkout -b feature/template-integration-v2

# Commit after each component migration
git add .
git commit -m "feat: migrate [Component] to v2 template"

# Before merging, ensure branch is up to date
git fetch origin
git rebase origin/main

# Create pull request (via GitHub/GitLab)
# Request code review from team

# After approval, merge to main
git checkout main
git merge feature/template-integration-v2

# If rollback needed
git revert -m 1 <merge-commit-hash>
```

---

## Questions During Merge?

### "Is it safe to delete v1 template file X?"
→ Search codebase: `grep -r "templates/v1/X"` — if zero results, safe to delete

### "Will this break existing components?"
→ Run tests: `npm run test` and verify all pass after each migration

### "How do I know business content is correct?"
→ Compare `src/content/business/` against pre-merge snapshot and design project

### "Something broke after merge — can I revert?"
→ Yes. See "Rollback Instructions" section above

---

**Status**: Ready to use  
**Last Reviewed**: 2026-06-29  
**Next Review**: After Phase 1 completion

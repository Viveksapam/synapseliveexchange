# Claude Code Guidelines

## Emoji Usage

**No emoji in UI text or content, except for emoji reactions/interactions.**

Emoji should only appear in:
- Reaction buttons (❤️, 😂, 🛡️, etc.)
- Interactive elements where emoji is the primary interaction

Do not use emoji in:
- Section headers or titles
- Body text and descriptions
- Button labels (unless the button is specifically for emoji selection)
- Navigation or informational text

## Git Branch, Commit, and PR Naming

This repo is public-facing and reviewed by people outside the immediate team (including prospective employers), so history needs to read cleanly.

- **Branch names must describe the work they contain.** Don't keep reusing one branch (or one leftover branch name from an earlier task) for unrelated follow-up work — e.g. a branch named after a comment-spacing fix should not also end up carrying login-gating changes, a source-review feature, or migration bugfixes. Cut a new, topic-appropriate branch per piece of work.
- **Commit messages must summarize the actual change**, not the branch or session it happened to be developed under. Lead with an imperative summary line, and use the body to explain *why* when it's non-obvious.
- **PR titles must be specific to their diff.** A reviewer (or an employer skimming the PR list) should be able to tell what changed without opening it.
- Do not rewrite or force-push already-merged history to "clean up" past naming mistakes — fix the convention going forward instead.

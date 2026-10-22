---
name: atomic-commits
description: >-
  Use this skill to enforce atomic, function-scoped git commits during development in the TeNo codebase.
  Ensures every change to a file or cohesive group of files contributing to a specific
  function, step, or sub-module is verified, tested, and committed before moving on to the next
  function, module, or step.
---

# Atomic & Modular Git Commits

This skill provides step-by-step instructions for committing code changes in small, atomic, function-scoped increments within the **TeNo** repository.

## Core Principle

> **Rule:** Every functional change to a file or cohesive set of files must be committed before proceeding to the next function, next step, or next module.

Never accumulate changes across multiple unrelated functions or modules into a single monolithic commit. Keeping commits modular and atomic ensures easy rollbacks, clear audit history, and reliable code reviews across the web app, browser extension, backend serverless functions, and database rules.

---

## When to Use This Skill

Activate this skill:
- When implementing a new feature composed of multiple functions or steps.
- When fixing bugs across one or more modules in `teno-web` or `teno-extension`.
- When refactoring a specific module, utility, or component.
- After completing any cohesive unit of work and before starting work on the next component or function.

---

## Workflow Steps

### Step 1: Identify the Functional Boundary
- Define the single, cohesive unit of work just completed (e.g., adding an option to delete items when deleting a label, updating a serverless joinLabel handler, adjusting responsive styles in `teno-web/src/index.css`).
- Identify all files that directly contributed to this functional unit (including implementation code, test files, and configs).
- Ensure no unintended files (temporary files, build artifacts, `.DS_Store`, stray logs) are included.

### Step 2: Pre-Commit Verification
Before staging files, verify that the changes are sound:
1. **Run Targeted Tests:** Execute the module's test suite (using the `targeted-module-testing` skill, e.g., in `teno-web/`: `npx vitest run tests/...`). Ensure all tests pass (`0 failures`).
2. **Review Diff:** Run `git diff` or review unstaged changes to ensure only intentional modifications are present.
3. **Check Status:** Run `git status` to see exact modified and untracked files.

### Step 3: Granular Staging
Stage **only** the files relevant to the specific functional increment:
```bash
git add <path/to/file1> <path/to/file2>
```
- Avoid blanket `git add .` or `git add -A` unless all changed files strictly belong to that single functional unit.
- If multiple unrelated changes exist, stage them selectively or split them into separate commits.

### Step 4: Craft a Semantic Commit Message (Single Line Only)
Use the Semantic Commit format on **one line only**:
```text
<type>(<scope>): <comprehensive subject in present tense>
```

**Key Constraints:**
- **Single-Line Only:** Never include multi-line bodies, footers, or line breaks in commit messages.
- **Present Tense:** Write the subject in present tense (e.g. `add`, `update`, `fix`, `refactor`, `remove`, not `added`, `fixed`, `adding`).

**Allowed Types:**
- `feat`: A new feature or function
- `fix`: A bug fix
- `test`: Adding or updating tests
- `test-fix`: Fixing existing tests or test configurations
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `style`: Formatting, CSS tweaks, missing semicolons, etc.
- `docs`: Documentation only changes
- `chore`: Maintenance, dependency updates, tooling

**Standard TeNo Scopes:**
- `web`: Changes to the `teno-web` application
- `extension`: Changes to the `teno-extension` browser extension
- `links`: Bookmarks and links module (`LinkStorer.jsx`, etc.)
- `cart`: Saved items and reading/purchase cart module
- `reminders`: Reminders and todo task manager module (`Reminders.jsx`, etc.)
- `timer`: Productivity countdown timer module (`Timer.jsx`, etc.)
- `theme`: Dual-theme engine, CSS custom properties, Minimalist/Modern styling (`ThemeContext.jsx`, `uiConfig.jsx`, `index.css`)
- `labels`: Unified label architecture, label sharing, invite tokens, RBAC (`ShareModal.jsx`, `MembersModal.jsx`)
- `db`: Database abstraction layer (`TeNoDatabase`, `db.js`)
- `api`: Serverless API endpoints (`joinLabel.js`, `delete-account.js`)
- `rules`: Firestore security rules (`firestore.rules`)
- `migrations`: Database migration scripts or rollout docs (`migrations/`)
- `settings`: Settings page, DPDP/GDPR export, account deletion flow
- `skills`: Agent workflow skills (`.agents/skills/`)
- `rules`: Agent guidelines (`AGENTS.md`)

**Examples:**
- `feat(labels): provide option to delete items when deleting a label`
- `fix(links): use icon.horse for all favicons to guarantee 200 OK responses`
- `test(components): add unit tests for LinkStorer label deletion modal`
- `refactor(db): streamline unified label query subscription in TeNoDatabase`
- `style(theme): enhance glassmorphic card borders in modern dark theme`
- `fix(api): ensure joinLabel returns correct redirect type for reminders`

### Step 5: Execute Commit & Verify Clean State
1. Commit the staged changes using a single-line message:
   ```bash
   git commit -m "<type>(<scope>): <comprehensive subject in present tense>"
   ```
2. Verify that the commit was successfully recorded:
   ```bash
   git log -n 1 --oneline
   ```
3. Check working directory status:
   ```bash
   git status
   ```

### Step 6: Transition to Next Step
Only after the commit is recorded and the workspace status for this unit is clean, proceed to work on the next function, step, or module.

---

## Anti-Patterns to Avoid

- ❌ **The "Kitchen Sink" Commit:** Modifying a component in `teno-web`, an unrelated script in `teno-extension`, and `firestore.rules` all in one commit.
- ❌ **Premature Next Step:** Starting edits on Module B while uncommitted changes in Module A are pending.
- ❌ **Unverified Commit:** Committing code before running the module's targeted tests.
- ❌ **Vague Commit Messages:** Using messages like `updates`, `fix bug`, `wip`, or `changes`.

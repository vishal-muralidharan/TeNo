---
name: atomic-commits
description: >-
  Use this skill to enforce atomic, function-scoped git commits during development in the TeNo codebase.
  Ensures every change to a file or cohesive group of files contributing to a specific
  function, step, or sub-module across teno-web and teno-extension is verified, tested, and committed
  before moving on to the next function, module, or step.
---

# Atomic & Modular Git Commits

This skill provides step-by-step instructions for committing code changes in small, atomic, function-scoped increments across both the **Web (`teno-web`)** and **Extension (`teno-extension`)** versions of TeNo.

## Core Principle

> **Rule:** Every functional change to a file or cohesive set of files must be committed before proceeding to the next function, next step, or next module.

Never accumulate changes across multiple unrelated functions, components, or sub-projects (`teno-web` vs `teno-extension`) into a single monolithic commit. Keeping commits modular and atomic ensures easy rollbacks, clear audit history, and reliable code reviews across the web app, browser extension, serverless API, and database rules.

---

## When to Use This Skill

Activate this skill:
- When implementing a new feature composed of multiple functions or steps.
- When fixing bugs across one or more modules in `teno-web` or `teno-extension`.
- When updating shared components (such as `LinkStorer.jsx` or `Reminders.jsx`) across web and extension.
- When refactoring a database utility (`teno-web/src/lib/db.js` which is symlinked to `teno-extension/src/lib/db.js`).
- After completing any cohesive unit of work and before starting work on the next component or function.

---

## Web vs Extension Commit Separation

TeNo consists of two separate distribution surfaces:
1. **`teno-web`**: Web application running in full browser tabs and mobile viewports.
2. **`teno-extension`**: Browser extension popup running in constrained popup dimensions.

### Multi-Target Commit Discipline:
- **Never commingle Web and Extension changes in a single commit:** Even if a feature affects both versions (e.g. adding a delete confirmation option to `LinkStorer.jsx`), implement, test, and commit the `teno-web` changes first using the `web` or component scope. Then, implement and commit the `teno-extension` changes using the `extension` scope.
- **Symlink Awareness (`teno-extension/src/lib`):** Changes to `teno-web/src/lib/db.js` affect both web and extension. Commit the core library change with its unit tests in `teno-web` before updating any extension consumer components that rely on the new API.

---

## Workflow Steps

### Step 1: Identify the Functional Boundary
- Define the single, cohesive unit of work just completed (e.g., adding an option to delete items when deleting a label in `teno-web`, updating popup scrolling behavior in `teno-extension`, updating serverless `joinLabel` handler).
- Identify all files that directly contributed to this functional unit (implementation, tests, styles).
- Ensure no unintended files (build outputs in `dist/`, `.DS_Store`, stray logs) are included.

### Step 2: Pre-Commit Verification
Before staging files, verify that the changes are sound:
1. **For `teno-web` changes:** Run the targeted Vitest test suite (`cd teno-web && npx vitest run tests/...`). Ensure all tests pass (`0 failures`).
2. **For `teno-extension` changes:** Verify component syntax and test build (`cd teno-extension && npm run build` or syntax check).
3. **Review Diff:** Run `git diff` or review unstaged changes to ensure only intentional modifications are present.
4. **Check Status:** Run `git status` to see exact modified and untracked files.

### Step 3: Granular Staging
Stage **only** the files relevant to the specific functional increment:
```bash
git add <path/to/file1> <path/to/file2>
```
- Avoid blanket `git add .` or `git add -A` unless all changed files strictly belong to that single functional unit.
- If changes span both `teno-web` and `teno-extension`, stage and commit them separately.

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
- `web`: Web application specific changes (`teno-web/`)
- `extension`: Browser extension specific changes (`teno-extension/`)
- `links`: Bookmarks and links module (`LinkStorer.jsx`)
- `cart`: Saved items and reading/purchase cart module
- `reminders`: Reminders and todo task manager module (`Reminders.jsx`)
- `timer`: Productivity countdown timer module (`Timer.jsx`)
- `terminal`: Terminal / command drawer component (`Terminal.jsx`)
- `theme`: Dual-theme engine, CSS custom properties, Minimalist/Modern styling
- `labels`: Unified label architecture, label sharing, invite tokens, RBAC
- `db`: Database abstraction layer (`TeNoDatabase`, `db.js`)
- `api`: Serverless API endpoints (`joinLabel.js`, `delete-account.js`)
- `rules`: Firestore security rules (`firestore.rules`)
- `migrations`: Database migration scripts or rollout docs (`migrations/`)
- `settings`: Settings page, DPDP/GDPR export, account deletion flow
- `skills`: Agent workflow skills (`.agents/skills/`)
- `rules`: Agent guidelines (`AGENTS.md`)

**Web vs Extension Commit Examples:**
- `feat(web): add dual-mode label delete modal in LinkStorer`
- `feat(extension): port dual-mode label delete modal to extension popup`
- `fix(web): prevent scroll chaining on ShareModal in modern theme`
- `fix(extension): constrain popup height and enable smooth scroll in tab pane`
- `refactor(db): streamline unified label query subscription in TeNoDatabase`
- `test(web): add unit tests for LinkStorer label deletion options`

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

- ❌ **Monolithic Web + Extension Commit:** Modifying `teno-web/src/components/LinkStorer.jsx` and `teno-extension/src/components/LinkStorer.jsx` together in one commit without separate verification.
- ❌ **Premature Next Step:** Starting edits on Extension while uncommitted changes in Web are pending.
- ❌ **Unverified Commit:** Committing web code without running Vitest, or committing extension code with syntax errors.
- ❌ **Vague Commit Messages:** Using messages like `updates`, `fix bug`, `wip`, or `changes`.

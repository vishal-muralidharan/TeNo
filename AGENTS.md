# Agent Development Guidelines & Routine

This document defines the mandatory development workflows and standards that all AI agents and contributors must follow when working in the **TeNo** codebase.

---

## 1. Mandatory Development Principles

Every development task in this repository must strictly adhere to the following mandatory core principles:

### Rule 1: Step-by-Step Atomic Commits
* **Skill Reference:** [.agents/skills/atomic-commits/SKILL.md](file:///.agents/skills/atomic-commits/SKILL.md)
* **Rule:** Every change in a file or a cohesive group of files that contribute to a similar function or step must be committed **before** moving on to the next function, module, or step.
* **Prohibited:** Accumulating changes across multiple distinct functions, components, or sub-projects (`teno-web` vs `teno-extension`) into a single batch commit.

### Rule 2: Targeted Module Testing & Test Synchronization
* **Skill Reference:** [.agents/skills/targeted-module-testing/SKILL.md](file:///.agents/skills/targeted-module-testing/SKILL.md)
* **Rule:** 
  1. **Test Every Change:** Any changed module in `teno-web` must be tested using that specific module's test suite, even when only a small or single-line change is made.
  2. **Update Tests on Significant Changes:** Whenever new functionality is introduced, contracts/APIs change, new branches/conditions are created, or modal/UI behaviors change, corresponding test files must be updated or added in the same step.
  3. **Coverage Compliance:** `teno-web/vite.config.js` sets 100% coverage thresholds across lines, functions, branches, and statements. Never introduce uncovered branches.
* **Prohibited:** Skipping tests because a change is deemed "minor", or committing significant code changes without accompanying test coverage.

### Rule 3: Architecture & Directory Placement
* **Skill Reference:** [.agents/skills/review-directory-structure/SKILL.md](file:///.agents/skills/review-directory-structure/SKILL.md)
* **Rule:** Every new or moved file must be positioned strictly within its designated architectural layer (`teno-web/src/components/`, `teno-web/src/pages/`, `teno-web/src/lib/`, `teno-web/src/utils/`, `teno-web/api/`, `teno-web/tests/`, `teno-extension/`, or root Firebase configurations).
* **Root Cleanliness Policy:** The root directory is strictly reserved for `.gitignore`, `AGENTS.md`, `README.md`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, and primary architectural subdirectories (`.agents/`, `docs/`, `migrations/`, `scripts/`, `teno-web/`, `teno-extension/`). Secondary configs, temporary logs, or scratch scripts must never reside loose in the root.

### Rule 4: File & Folder Naming Conventions
* **Skill Reference:** [.agents/skills/file-folder-naming/SKILL.md](file:///.agents/skills/file-folder-naming/SKILL.md)
* **Rule:** File and directory names must strictly adhere to casing standards: `PascalCase.jsx` for React components, page views, modals, and Context providers; `camelCase.js` for utilities, client libraries (`db.js`), and API wrappers; `camelCase.js` or `kebab-case.js` for serverless API endpoints; and mirrored `<ComponentName>.test.jsx` / `<name>.test.js` in `teno-web/tests/`.

### Rule 5: Database Structure & Schema Integrity
* **Skill Reference:** [.agents/skills/review-db-structure/SKILL.md](file:///.agents/skills/review-db-structure/SKILL.md)
* **Rule:** Any reading, writing, modifying, or refactoring of Firestore collections, documents, fields, or security rules must strictly conform to the canonical database architecture (`docs/features/collaboration-and-sharing.md`), maintain `memberUids` denormalization across related collections (`links`, `cart_items`, `reminders`), guarantee non-undefined payloads, route client operations through `TeNoDatabase` (`teno-web/src/lib/db.js`), and follow the pre-commit DB checklist.

### Rule 6: Responsive Mobile Design & Dual-Theme System
* **Skill Reference:** [.agents/skills/review-responsive-design/SKILL.md](file:///.agents/skills/review-responsive-design/SKILL.md)
* **Rule:** Every UI component, page, modal, or form must support BOTH the **Minimalist** (`[data-style="minimal"]`) and **Modern** (`[data-style="modern"]`) styles as well as light/dark modes. TeNo uses Pure CSS custom properties (no Tailwind). All overlays and modals must implement dynamic viewport heights (`dvh`), bounded scroll containers (`max-height: 85dvh`, `overflow-y: auto`), safe-area insets (`env(safe-area-inset-*)`), ergonomic touch targets (minimum 44x44px), body scroll locking, and iOS Safari auto-zoom prevention (minimum 16px font on mobile inputs). Consume the translation dictionary (`uiConfig.jsx`) for theme-aware strings.

### Rule 7: Pre-Implementation Audit & Structured Planning
* **Skill Reference:** [.agents/skills/audit-and-planning/SKILL.md](file:///.agents/skills/audit-and-planning/SKILL.md)
* **Rule:** Before writing or modifying any code for a bug fix, feature, or refactor, you must first perform an audit of existing code, search related usages across both `teno-web` and `teno-extension`, diagnose verified root causes (for bugs) or requirements and layout reflow (for features), and formulate a clear, step-by-step implementation plan composed of atomic, testable increments.
* **Prohibited:** Writing or editing code prematurely without auditing the codebase, diagnosing the verified root cause, or having an explicit step-by-step implementation plan.

---

## 2. Standard Development Routine

When fulfilling any user prompt or feature request, follow this linear, repeatable cycle for each function or step:

```text
┌────────────────────────────────────────────────────────┐
│ 0. Pre-Implementation Audit, Search & Planning         │
│    - Search usages, inspect related modules & schema   │
│    - Diagnose root cause (bugs) or requirements (feat) │
│    - Formulate clear, atomic step-by-step plan         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 1. Scope Functional Unit & Review Structure / Naming   │
│    Isolate step; verify directory & naming conventions │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Implement & Synchronize Tests                       │
│    - Write / edit module code                          │
│    - Verify dual-theme support (Minimalist & Modern)   │
│    - Update or add test cases if change is significant │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Execute Targeted Module Tests                       │
│    - Run module-specific test runner in teno-web       │
│    - Fix any regressions immediately until green       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Atomic Git Commit (Single-Line Semantic Commit)     │
│    - Stage only the relevant files (`git add <files>`) │
│    - Commit using: <type>(<scope>): <present tense>    │
│    - Confirm commit with `git log -n 1 --oneline`      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. Proceed to Next Function or Module                  │
│    Only begin subsequent step once step 4 is complete  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Targeted Test Command Reference

Always run the narrowest relevant test command in `teno-web` to ensure rapid (< 1s) feedback:

| Area / Module | Command (from `teno-web/` directory) |
| :--- | :--- |
| **Components** | `npx vitest run tests/components/<Name>.test.jsx` |
| **Context Providers** | `npx vitest run tests/context/<Name>Context.test.jsx` |
| **Database Library** | `npx vitest run tests/lib/db.test.js` |
| **UI Config & Helpers** | `npx vitest run tests/utils/<name>.test.js` |
| **Serverless API** | `npx vitest run tests/api/<name>.test.js` |
| **Full Web Suite** | `npm test` |

*From repository root:*
```bash
(cd teno-web && npx vitest run tests/components/LinkStorer.test.jsx)
```

---

## 4. Single-Line Semantic Commit Standards

Every commit message must follow the Semantic Commit format on **one line only**:
```text
<type>(<scope>): <comprehensive subject in present tense>
```

* **Single-Line Only:** Do not include multi-line bodies or footers in commit messages.
* **Present Tense:** Write the subject in present tense (e.g. `add`, `update`, `fix`, `refactor`, `remove`, not `added`, `fixed`, `adding`).
* **Types:** `feat`, `fix`, `test`, `test-fix`, `refactor`, `style`, `docs`, `chore`
* **TeNo Scopes:** `web`, `extension`, `links`, `cart`, `reminders`, `timer`, `theme`, `auth`, `labels`, `db`, `api`, `rules`, `migrations`, `settings`, `skills`, `rules`
* **Examples:**
  * `feat(labels): provide option to delete items when deleting a label`
  * `fix(links): use icon.horse for all favicons to guarantee 200 OK responses`
  * `test(components): update LinkStorer test assertions for dual-mode label delete modal`
  * `style(theme): adjust glassmorphic background blur in modern dark theme`
  * `refactor(db): optimize query subscriptions in TeNoDatabase`

---

## 5. Strict Guardrails

1. **Never batch unrelated work:** If Task A modifies `teno-web/src/components/LinkStorer.jsx` and Task B modifies `teno-extension/src/components/Reminders.jsx`, complete and commit Task A (with tests) first before touching Task B.
2. **Never leave tests red:** A commit must represent a working, passing state.
3. **Never skip test updates on significant changes:** New features or modified contracts without tests are considered incomplete.
4. **Never break dual-theme symmetry:** Every UI feature must function seamlessly in both Minimalist (`[data-style="minimal"]`) and Modern (`[data-style="modern"]`) styles.
5. **Always use single-line semantic commit:** Never create multi-line commit messages or omit the `<type>(<scope>):` prefix.
6. **Never pollute root directory:** Never place secondary configs, loose scripts, temporary debug logs, or test execution artifacts in the root directory.
7. **Never start coding without prior audit and plan:** Always search existing implementations, diagnose root cause, and establish an atomic step-by-step plan before making edits.

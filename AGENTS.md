# Agent Development Guidelines & Routine (Web & Extension)

This document defines the mandatory development workflows and standards that all AI agents and contributors must follow when working in the **TeNo** codebase across both the **Web (`teno-web`)** and **Extension (`teno-extension`)** versions.

---

## 1. Mandatory Development Principles

Every development task in this repository must strictly adhere to the following mandatory core principles:

### Rule 1: Step-by-Step Atomic Commits Across Surfaces
* **Skill Reference:** [.agents/skills/atomic-commits/SKILL.md](file:///.agents/skills/atomic-commits/SKILL.md)
* **Rule:** Every change in a file or cohesive group of files that contribute to a similar function or step must be committed **before** moving on to the next function, module, or step.
* **Primacy Over User Phases:** Irrespective of any high-level phases, milestones, or batches outlined in a user request, the plan, audit, and commits must happen as per the skill only and not as per the phases.
* **Prohibited:** Accumulating changes across multiple distinct functions, components, or sub-projects (`teno-web` vs `teno-extension`) into a single batch commit. Always commit web changes (with tests) separately from extension changes.

### Rule 2: Targeted Module Testing & Verification Synchronization
* **Skill Reference:** [.agents/skills/targeted-module-testing/SKILL.md](file:///.agents/skills/targeted-module-testing/SKILL.md)
* **Rule:** 
  1. **Test Every Web Change:** Any changed module in `teno-web` must be tested using that specific module's test suite in `teno-web/tests/`, even when only a small or single-line change is made.
  2. **Verify Every Extension Change:** Any change to `teno-extension` must undergo component build and syntax verification to prevent broken popup bundles.
  3. **Update Tests on Significant Changes:** Whenever new functionality is introduced, contracts/APIs change, new branches/conditions are created, or modal/UI behaviors change, corresponding test files must be updated or added in the same step.
  4. **Coverage Compliance:** `teno-web/vite.config.js` sets 100% coverage thresholds across lines, functions, branches, and statements. Never introduce uncovered branches.
* **Prohibited:** Skipping tests because a change is deemed "minor", or committing significant code changes without accompanying test coverage.

### Rule 3: Architecture & Multi-Package Placement
* **Skill Reference:** [.agents/skills/review-directory-structure/SKILL.md](file:///.agents/skills/review-directory-structure/SKILL.md)
* **Rule:** Every new or moved file must be positioned strictly within its designated architectural layer (`teno-web/src/components/`, `teno-web/src/pages/`, `teno-web/src/lib/`, `teno-web/src/utils/`, `teno-web/api/`, `teno-web/tests/`, `teno-extension/src/components/`, `teno-extension/src/pages/`, `teno-extension/public/`, or root Firebase configurations).
* **Symlink Integrity:** `teno-extension/src/lib` is a symlink to `teno-web/src/lib`. Canonical database logic resides in `teno-web/src/lib/db.js` so both platforms stay synchronized.
* **Root Cleanliness Policy:** The root directory is strictly reserved for `.gitignore`, `AGENTS.md`, `README.md`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, and primary architectural subdirectories (`.agents/`, `docs/`, `migrations/`, `scripts/`, `teno-web/`, `teno-extension/`). Secondary configs, temporary logs, or scratch scripts must never reside loose in the root.

### Rule 4: File & Folder Naming Conventions
* **Skill Reference:** [.agents/skills/file-folder-naming/SKILL.md](file:///.agents/skills/file-folder-naming/SKILL.md)
* **Rule:** File and directory names must strictly adhere to casing standards: `PascalCase.jsx` for React components, page views, modals, and Context providers across both web and extension; `camelCase.js` for utilities, client libraries (`db.js`), and API wrappers; `camelCase.js` or `kebab-case.js` for serverless API endpoints; and mirrored `<ComponentName>.test.jsx` / `<name>.test.js` in `teno-web/tests/`. Maintain component naming symmetry between `teno-web` and `teno-extension` (e.g. `LinkStorer.jsx`).

### Rule 5: Database Structure & Schema Integrity
* **Skill Reference:** [.agents/skills/review-db-structure/SKILL.md](file:///.agents/skills/review-db-structure/SKILL.md)
* **Rule:** Any reading, writing, modifying, or refactoring of Firestore collections, documents, fields, or security rules must strictly conform to the canonical database architecture (`docs/features/collaboration-and-sharing.md`), maintain `memberUids` denormalization across related collections (`links`, `cart_items`, `reminders`), guarantee non-undefined payloads, route client operations through `TeNoDatabase` (`src/lib/db.js`), ensure `firestore.rules` explicit permission parity for new collections/mutations, properly detach `onSnapshot` subscriptions in extension popups, and follow the pre-commit DB checklist.

### Rule 6: Responsive Mobile Design, Card Geometry & Dual-Theme System
* **Skill Reference:** [.agents/skills/review-responsive-design/SKILL.md](file:///.agents/skills/review-responsive-design/SKILL.md) & [.agents/skills/maintain-minimalist-ui/SKILL.md](file:///.agents/skills/maintain-minimalist-ui/SKILL.md)
* **Rule:** 
  - **Web (`teno-web`):** Every UI component, page, modal, or form must support BOTH the **Minimalist** (`[data-style="minimal"]`) and **Modern** (`[data-style="modern"]`) styles as well as light/dark modes (all 4 theme permutations). Pure CSS custom properties (no Tailwind). All overlays and modals must implement dynamic viewport heights (`dvh`), bounded scroll containers (`max-height: 85dvh`, `overflow-y: auto`), safe-area insets (`env(safe-area-inset-*)`), ergonomic touch targets (minimum 44x44px), body scroll locking, and iOS Safari auto-zoom prevention (minimum 16px font on mobile inputs).
  - **Card Geometry & Action Clearance:** Never squeeze multi-action entities (3+ action buttons or multi-line text) into compact 240px bookmark dimensions. Enforce grid column widths of `>= 350px` (e.g. `minmax(350px, 1fr)`) and explicit `min-height` (`>= 145px`).
  - **Zero-Layout-Shift Transient Feedback:** Temporary feedback (`copied`, `saving...`) must never widen buttons or elongate cards; use reserved `min-width` or absolute status toasts.
  - **Extension (`teno-extension`):** Layouts must fit within constrained popup dimensions (~400x550px) without outer window scrollbars or horizontal overflow. Prevent native `window.alert` / `window.confirm` dialogs that cause popup dismissal.

### Rule 7: Pre-Implementation Audit & Multi-Target Planning
* **Skill Reference:** [.agents/skills/audit-and-planning/SKILL.md](file:///.agents/skills/audit-and-planning/SKILL.md) & [.agents/skills/repo-search/SKILL.md](file:///.agents/skills/repo-search/SKILL.md)
* **Rule:** Before writing or modifying any code for a bug fix, feature, or refactor, you must first perform an audit of existing code across both `teno-web` and `teno-extension`, determine whether the scope is Web-only, Extension-only, or Both, diagnose verified root causes (for bugs) or requirements, layout reflow, immutability of historical versions, and 4-theme contrast (for features), and formulate a clear, step-by-step implementation plan composed of atomic, testable increments.
* **Prohibited:** Writing or editing code prematurely without auditing the codebase, diagnosing the verified root cause, or having an explicit step-by-step implementation plan.

### Rule 8: Minimalist UI Element Integrity & Preservation
* **Skill Reference:** [.agents/skills/maintain-minimalist-ui/SKILL.md](file:///.agents/skills/maintain-minimalist-ui/SKILL.md)
* **Rule:** Whenever creating new components or modifying existing ones across `teno-web` and `teno-extension`, the Minimalist (`[data-style="minimal"]`) UI elements and brutalist/terminal aesthetic must be maintained strictly as is:
  1. **Zero-Radius & Flat Elevation:** Enforce `--border-radius: 0px` and `--shadow-card: none` on all minimalist containers, inputs, buttons, and cards. Never apply `backdrop-filter: blur()` or soft drop shadows in minimal mode.
  2. **Prohibition of Graphical Icons:** Never render Lucide or SVG icons in minimal mode (`ui.icons.*` must return `null` in minimal mode). Use ASCII brackets or text glyphs instead.
  3. **ASCII Bracketed Actions & Badges:** All interactive actions, buttons, and status tags in minimal mode must be enclosed in ASCII brackets (e.g. `[ delete ]`, `[+ add_new]`, `[ yes ]`, `[ ↗ share ]`, `[shared]`).
  4. **Action Button Hierarchy & Contrast:** Primary actions use solid inverted fill; secondary/alternative actions use crisp outlines (`border: 1px solid var(--text-primary); background: transparent;`); tertiary/cancel actions use muted borders. Never use low-contrast surface fills (like `--bg-surface-hover`) for resting static button states.
  5. **Translation Dictionary Compliance:** All UI strings must be declared in `themeTranslations.js` (with separate minimal lowercase/bracketed and modern definitions) and consumed via `uiConfig.jsx`. Never hardcode raw strings or modern English in component JSX.
  6. **Terminal Prefixes & Inversion:** Preserve terminal path prefixes (`> ./`), shell prompts (`$_ `), and monochrome high-contrast hover inversion.
* **Prohibited:** Diluting or modernizing the minimalist interface with rounded pill buttons, soft shadows, unbracketed labels, low-contrast invisible resting buttons, or graphical icons in minimal mode.

---

## 2. Standard Multi-Target Development Routine

When fulfilling any user prompt or feature request, follow this linear, repeatable cycle for each function or step:

```text
┌────────────────────────────────────────────────────────┐
│ 0. Pre-Implementation Audit & Scope Determination      │
│    - Determine target: Web-only, Extension-only, Both  │
│    - Search usages across teno-web and teno-extension │
│    - Formulate atomic step-by-step plan                │
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
│    - Write / edit module code in target sub-project    │
│    - On web: Verify dual-theme & minimalist integrity  │
│    - On extension: Verify popup bounds & compilation   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Execute Targeted Module Tests / Verifications       │
│    - Run module-specific test runner in teno-web       │
│    - Verify extension compilation if extension touched │
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
│ 5. Proceed to Next Function or Sub-Project             │
│    Only begin subsequent step once step 4 is complete  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Targeted Test & Verification Command Reference

Always run the narrowest relevant test or verification command to ensure rapid (< 1s) feedback:

### Web Test Commands (`teno-web/`)
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

### Extension Verification Commands (`teno-extension/`)
| Check Type | Command (from repository root) |
| :--- | :--- |
| **Extension Build Check** | `(cd teno-extension && npx vite build)` |
| **Shared DB Logic Test** | `(cd teno-web && npx vitest run tests/lib/db.test.js)` |

---

## 4. Single-Line Semantic Commit Standards

Every commit message must follow the Semantic Commit format on **one line only**:
```text
<type>(<scope>): <comprehensive subject in present tense>
```

* **Single-Line Only:** Do not include multi-line bodies or footers in commit messages.
* **Present Tense:** Write the subject in present tense (e.g. `add`, `update`, `fix`, `refactor`, `remove`, not `added`, `fixed`, `adding`).
* **Types:** `feat`, `fix`, `test`, `test-fix`, `refactor`, `style`, `docs`, `chore`
* **TeNo Scopes:** `web`, `extension`, `links`, `cart`, `reminders`, `timer`, `terminal`, `theme`, `minimal`, `ui`, `auth`, `labels`, `db`, `api`, `rules`, `migrations`, `settings`, `skills`
* **Examples:**
  * `feat(web): provide option to delete items when deleting a label`
  * `feat(extension): port label delete confirmation modal to popup layout`
  * `fix(links): use icon.horse for all favicons to guarantee 200 OK responses`
  * `test(components): update LinkStorer test assertions for dual-mode label delete modal`
  * `style(minimal): preserve bracketed action buttons and zero radius on share modal`
  * `style(theme): adjust glassmorphic background blur in modern dark theme`
  * `refactor(db): optimize query subscriptions in TeNoDatabase`

---

## 5. Strict Guardrails

1. **Never batch unrelated work:** If Task A modifies `teno-web/src/components/LinkStorer.jsx` and Task B modifies `teno-extension/src/components/LinkStorer.jsx`, complete and commit Task A (with tests) first before touching Task B.
2. **Never leave tests red:** A commit must represent a working, passing state.
3. **Never skip test updates on significant changes:** New features or modified contracts without tests are considered incomplete.
4. **Never break dual-theme symmetry on web:** Every web UI feature must function seamlessly in both Minimalist (`[data-style="minimal"]`) and Modern (`[data-style="modern"]`) styles.
5. **Never exceed popup viewport bounds on extension:** Extension popup UI must not trigger horizontal scrollbars or overflow the ~400x550px window.
6. **Always use single-line semantic commit:** Never create multi-line commit messages or omit the `<type>(<scope>):` prefix.
7. **Never pollute root directory:** Never place secondary configs, loose scripts, temporary debug logs, or test execution artifacts in the root directory.
8. **Never start coding without prior audit and plan:** Always search existing implementations across both web and extension, diagnose root cause, and establish an atomic step-by-step plan before making edits.
9. **Never break or dilute Minimalist UI elements:** When creating new components or modifying existing ones, strictly preserve the minimalist terminal/brutalist design (0px radius, flat elevation, bracketed actions, terminal prefixes, absence of graphical icons, lowercase typography, and `uiConfig.jsx`/`themeTranslations.js` integration). Never leak modern styling into minimalist mode.
10. **Never compromise action button contrast in any theme:** Always audit action buttons across all 4 theme permutations (minimal dark/light, modern dark/light). Secondary/alternative buttons must use crisp outline borders (`border: 1px solid var(--text-primary)`). Never use low-contrast surface fills (like `--bg-surface-hover`) for resting static button states.
11. **Never cause layout shift on transient feedback:** Status transitions (`copied`, `saving...`) must never widen buttons or elongate containing cards. Reserve fixed `min-width` on buttons or use absolute non-displacing toasts.
12. **Never allow editing of historical/archived versions:** In versioned entities or historical views, non-current records must remain strictly read-only with locked inputs and disabled/hidden mutation controls.
13. **Never squeeze multi-action cards into compact bookmark widths:** Entities with multi-action bars or multi-line content must use scalable columns (minimum `>= 350px`) and explicit minimum heights (`>= 145px`) to guarantee action clearance.


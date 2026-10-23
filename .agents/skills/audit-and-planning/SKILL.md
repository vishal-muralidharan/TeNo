---
name: audit-and-planning
description: >-
  Use this skill before starting any feature implementation, bug fix, or refactor in TeNo.
  Provides a systematic framework for conducting codebase search, auditing existing architecture across
  teno-web and teno-extension, dual-theme system, and database schemas, diagnosing root causes,
  and formulating a clear, atomic, step-by-step implementation plan before touching code.
---

# Pre-Implementation Audit, Search & Structured Planning (Web & Extension)

This skill defines the mandatory pre-implementation workflow for the **TeNo** repository. Every development task—whether a bug fix, new feature, performance improvement, or architectural refactor—must begin with a comprehensive codebase audit, thorough symbol search across both **`teno-web`** and **`teno-extension`**, root cause verification, and a clear, step-by-step implementation plan before modifying code.

---

## 1. Core Philosophy: Measure Twice, Cut Once

> **The Golden Rule:** Never edit code based on assumptions. Always search, inspect, diagnose, and plan before touching a single line of application logic.

Premature coding without prior audit frequently causes:
- Inconsistencies between `teno-web` and `teno-extension` when updating shared modules (e.g. `LinkStorer.jsx` or `Reminders.jsx`).
- Duplicate utility functions when helpers already exist in `src/utils/` or `src/lib/db.js`.
- Breaking dual-theme visual balance on the web (forgetting either Minimalist or Modern theme styles or `uiConfig.jsx`).
- Security rule violations in `firestore.rules` due to missing `memberUids` denormalization.
- Failing test suites in `teno-web/tests/` because prop contracts or modal behaviors were altered without updating assertions.
- Broken extension popups due to unhandled browser dialogs or window overflow.

---

## 2. The 4-Phase Pre-Implementation Cycle

Before writing or editing code for any prompt or task, execute these four phases in order:

```text
┌────────────────────────────────────────────────────────┐
│ Phase 1: Target Scoping & Codebase Search              │
│ - Determine target scope: Web-only, Ext-only, or Both  │
│ - Search exact error strings and symbols across repos  │
│ - Check existing helpers in utils/ and lib/db.js       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Root Cause & Architecture Audit               │
│ - For Bugs: Verify exact failure mechanism             │
│ - For Features: Map to dual-theme, popup bounds & rules│
│ - Check cross-subproject parity (web vs extension)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: Formulate Atomic Step-by-Step Plan            │
│ - Separate Web and Extension steps into atomic units   │
│ - Map each step to: Target -> Verification -> Commit   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 4: Execute & Validate Increment by Increment     │
│ - Complete Web step, run Vitest tests, commit          │
│ - Complete Extension step, verify build, commit        │
│ - Only then proceed to next module or step             │
└────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1: Target Scoping & Codebase Search

Before planning any change, locate all relevant code, configurations, and usages across the workspace.

### 1. Scope Determination
First, determine which distribution surfaces are impacted:
- **`teno-web` only:** Top-level route pages (`DashboardPage`, `SettingsPage`, `LoginPage`, `DPDPPage`), serverless functions (`api/joinLabel.js`, `api/delete-account.js`), web routing, or web dual-theme tokens.
- **`teno-extension` only:** Extension popup layout (`teno-extension/src/App.jsx`), popup sizing, extension manifest, or typing cursor helpers (`typingCaret.js`).
- **Both (`teno-web` AND `teno-extension`):** Core productivity modules (`LinkStorer.jsx`, `Reminders.jsx`, `Timer.jsx`, `Terminal.jsx`), database models (`TeNoDatabase` in `db.js`), or Firestore security rules.

### 2. Symbol & Call Site Discovery
Use `grep_search` to locate where target identifiers appear across both packages:
```text
- Component: search for JSX usage tags (<ComponentName) in teno-web and teno-extension
- Database methods: check TeNoDatabase methods in teno-web/src/lib/db.js
- Theme / UI tokens: check teno-web/src/utils/uiConfig.jsx and teno-web/src/index.css
- API routes: check teno-web/api/ for serverless endpoints
```

### 3. Search for Existing Utilities First
Before creating a new utility or component, verify whether a solution already exists:
- Shared Database Access: inspect `teno-web/src/lib/db.js` (`TeNoDatabase`, symlinked in `teno-extension`).
- Theme Translations & Labels: inspect `teno-web/src/utils/uiConfig.jsx` and `themeTranslations.js`.
- Feature Flags: inspect `teno-web/src/utils/featureFlags.js` and `FeatureFlagContext.jsx`.
- Modal Primitives: inspect `teno-web/src/components/ConfirmModal.jsx`.

---

## 4. Phase 2: Root Cause Diagnosis & Architecture Audit

### For Bug Fixes & Error Logs:
1. **Trace the Exact Error Origin:** Identify the exact file and line number generating the error log or failure.
2. **Differentiate Symptom from Root Cause:**
   - *Example:* If a test in `LinkStorer.test.jsx` fails with `Unable to find an accessible element with the role "button" and name "Delete Label"`, the root cause is that the label deletion modal was enhanced to offer multiple deletion choices ("Delete Label & All Items In It" and "Just Delete Label (Ungroup Items)"), requiring updated test queries.
3. **Check Cross-Package Impact:** Does the bug exist in `teno-web`, `teno-extension`, or both?

### For New Features or UI Additions:
1. **Web Dual-Theme & Minimalist UI Preservation:** Does the feature require styling in both Minimalist (`[data-style="minimal"]`) and Modern (`[data-style="modern"]`) styles? Are Minimalist UI elements maintained strictly as-is (0px radius, flat elevation, bracketed actions, terminal prefixes, no graphical icons in minimal)? See [.agents/skills/maintain-minimalist-ui/SKILL.md](file:///.agents/skills/maintain-minimalist-ui/SKILL.md).
2. **Extension Popup Boundaries:** Will the new UI fit comfortably inside the ~400px fixed width of the browser extension popup without horizontal overflow?
3. **Directory Placement:** Determine whether the code belongs in `teno-web/src/components/`, `teno-web/src/pages/`, `teno-web/api/`, or `teno-extension/src/components/`.

### Feature Ergonomics, Immutability & UI Quality Audit:
Before planning UI components or data mutations, evaluate these mandatory quality criteria:
1. **Entity Card Geometry & Action Clearance:**
   - Do not copy compact link bookmark dimensions (`240px` width, `110px` height) for content-heavy or action-dense entities.
   - Calculate horizontal action clearance: `(Actions Width) + (Minimum Title Width >= 140px) + Gap = Minimum Container Width`.
   - If an entity has 3 or more action buttons, grid columns must be sized at `>= 350px` (e.g. `minmax(350px, 1fr)`) to prevent header wrapping.
   - If an entity holds multi-line text (prompts, descriptions, notes), enforce an explicit `min-height` (`>= 145px`) and multi-line clamp (3-4 lines).
2. **4-Theme Button Contrast & Visibility:**
   - Verify action button styling across all 4 theme permutations:
     * Minimalist Dark (`[data-style="minimal"][data-theme="dark"]`)
     * Minimalist Light (`[data-style="minimal"][data-theme="light"]`)
     * Modern Dark (`[data-style="modern"][data-theme="dark"]`)
     * Modern Light (`[data-style="modern"][data-theme="light"]`)
   - Secondary / Alternative buttons must use explicit outline borders (`border: 1px solid var(--text-primary)`) and foreground colors (`color: var(--text-primary)`). Never rely on subtle hover fills (`--bg-surface-hover`) for resting static button states.
3. **Immutability for Historical / Archived Records:**
   - If the feature introduces version control, revisions, or archiving, historical/non-current records must be strictly read-only:
     * Lock all form inputs (`readOnly` and/or `disabled`).
     * Hide or disable mutating buttons (`Save`, `Update`, `Save New Version`).
     * Provide prominent non-mutating actions (`Copy`, `View`, `Restore`).
     * Display a clear status badge (e.g. `[read-only: viewing v1]`).
4. **Zero-Layout-Shift Transient Feedback:**
   - Transient user feedback (`copied`, `saved`, `done`) must never elongate buttons or shift neighboring card elements.
   - Reserve a fixed button width (`min-width` with `box-sizing: border-box`) or use an absolute, non-displacing toast/badge.
5. **Database Security Rules & Mutation Parity:**
   - Whenever creating a new Firestore collection or adding a mutation method, audit `firestore.rules` beforehand. Ensure client payloads provide all auth/member fields (`ownerId`, `memberUids`) required by security rules.

---

## 5. Phase 3: Formulating the Step-by-Step Implementation Plan

Once the audit is complete, synthesize the findings into an explicit, modular implementation plan.

### Structural Requirements for Every Plan:
Break the task into self-contained steps adhering to **Rule 1 (Atomic Commits)** and **Rule 2 (Targeted Module Testing)**:

Each step must specify:
1. **Target Sub-Project & File(s):** Exact files to be created or modified (e.g. `teno-web/src/components/LinkStorer.jsx`).
2. **Action / Change:** Clear description of the logic, styling, or configuration being implemented.
3. **Verification Command:** Vitest test command for web, or build/syntax check for extension.
4. **Atomic Commit Message:** Single-line semantic commit message in present tense.

### Standard Multi-Target Implementation Plan Template:
```markdown
### Implementation Plan: <Feature Name or Bug Summary>

#### 1. Audit Summary & Findings
- **Context:** <Current state and how existing code behaves>
- **Target Scope:** <teno-web | teno-extension | Both>
- **Root Cause / Key Gap:** <Verified root cause of the bug, or architectural requirements for the feature>

#### 2. Phased Step-by-Step Execution Plan

* **Step 1: Web Implementation & Tests (`teno-web`)**
  - Target: `teno-web/src/components/...` & `teno-web/tests/...`
  - Changes: <Exact modification or creation>
  - Targeted Test: `cd teno-web && npx vitest run tests/...`
  - Commit: `feat(web): <present tense description>`

* **Step 2: Extension Synchronization (`teno-extension`)**
  - Target: `teno-extension/src/components/...`
  - Changes: <Port behavior to extension popup layout>
  - Verification: `cd teno-extension && npx vite build`
  - Commit: `feat(extension): <present tense description>`

* **Step 3: Full Verification & Build Check**
  - Run full test suite: `cd teno-web && npm test`
  - Run web build: `cd teno-web && npm run build`
  - Commit (if chore/docs needed): `chore(release): verify multi-target builds`
```

---

## 6. Phase 4: Execution Guardrails & Anti-Patterns

### Strictly Prohibited Behaviors:
- **No Monolithic Web + Extension Batches:** Never edit both `teno-web` and `teno-extension` components simultaneously without verifying and committing each independently.
- **No "Shotgun Debugging":** Never alter random lines of code hoping it fixes an error. Diagnose the exact root cause first.
- **No Unplanned File Creation:** Never create loose files or secondary configs without planning their directory placement according to `AGENTS.md`.
- **No Ignoring Dual-Theme:** Never implement a UI component on web that works only in Modern or only in Minimalist.

---

## 7. Pre-Implementation Checklist

Before editing any code, verify:
```text
[ ] 1. Identified whether the task affects teno-web, teno-extension, or both.
[ ] 2. Searched the codebase for existing usages, props, and call sites.
[ ] 3. Checked if a reusable utility exists in src/utils/ or src/lib/db.js.
[ ] 4. Verified database schema requirements against firestore.rules and docs/.
[ ] 5. Verified dual-theme compatibility on web (Minimalist and Modern).
[ ] 6. Verified popup dimension compatibility on extension (~400px width).
[ ] 7. Evaluated card geometry & horizontal action clearance (minimum width >= 350px for 3+ actions).
[ ] 8. Verified button contrast in all 4 theme permutations (minimal dark/light, modern dark/light).
[ ] 9. Verified state immutability for historical/archived views (inputs locked, mutating buttons hidden).
[ ] 10. Verified zero-layout-shift for transient feedback (fixed min-width or absolute toast).
[ ] 11. Formulated an atomic, step-by-step plan with targeted tests and commit messages.
```

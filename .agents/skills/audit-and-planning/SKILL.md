---
name: audit-and-planning
description: >-
  Use this skill before starting any feature implementation, bug fix, or refactor in TeNo.
  Provides a systematic framework for conducting codebase search, auditing existing architecture,
  dual-theme system, and database schemas, diagnosing root causes, and formulating a clear,
  atomic, step-by-step implementation plan before touching code.
---

# Pre-Implementation Audit, Search & Structured Planning

This skill defines the mandatory pre-implementation workflow for the **TeNo** repository. Every development task—whether a bug fix, new feature, performance improvement, or architectural refactor—must begin with a comprehensive codebase audit, thorough symbol search, root cause verification, and a clear, step-by-step implementation plan before modifying code.

---

## 1. Core Philosophy: Measure Twice, Cut Once

> **The Golden Rule:** Never edit code based on assumptions. Always search, inspect, diagnose, and plan before touching a single line of application logic.

Premature coding without prior audit frequently causes:
- Duplicate utility functions when helpers already exist in `src/utils/` or `src/lib/db.js`.
- Breaking dual-theme visual balance (forgetting either Minimalist or Modern theme styles or `uiConfig.jsx`).
- Security rule violations in `firestore.rules` due to missing `memberUids` denormalization.
- Inconsistencies between `teno-web` and `teno-extension`.
- Failing test suites in `teno-web/tests/` because prop contracts or modal behaviors were altered without updating assertions.
- Tangled, monolithic commits that are hard to audit and review.

---

## 2. The 4-Phase Pre-Implementation Cycle

Before writing or editing code for any prompt or task, execute these four phases in order:

```text
┌────────────────────────────────────────────────────────┐
│ Phase 1: Codebase Search & Discovery                   │
│ - Search exact error strings, symbols, or feature terms│
│ - Trace usages in teno-web/src/ and teno-extension/src/│
│ - Check existing helpers in utils/ and lib/db.js       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Root Cause & Architecture Audit               │
│ - For Bugs: Verify exact failure mechanism             │
│ - For Features: Map to dual-theme, schema, and rules   │
│ - Check cross-subproject parity (web vs extension)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: Formulate Atomic Step-by-Step Plan            │
│ - Break into single-function, testable atomic steps    │
│ - Map each step to: Module -> Test -> Semantic Commit  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 4: Execute & Validate Increment by Increment     │
│ - Complete Step N, run targeted tests, commit atomically│
│ - Only then proceed to Step N+1                        │
└────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1: Codebase Search & Discovery

Before planning any change, locate all relevant code, configurations, and usages across the workspace.

### 1. Symbol & Call Site Discovery
Use `grep_search` to locate where target identifiers appear:
```text
- Component: search for JSX usage tags (<ComponentName) in teno-web and teno-extension
- Database methods: check TeNoDatabase methods in teno-web/src/lib/db.js
- Theme / UI tokens: check teno-web/src/utils/uiConfig.jsx and teno-web/src/index.css
- API routes: check teno-web/api/ for serverless endpoints
```

### 2. Search for Existing Utilities First
Before creating a new utility, hook, or component, verify whether a solution already exists:
- Shared Database Access: inspect `teno-web/src/lib/db.js` (`TeNoDatabase`).
- Theme Translations & Labels: inspect `teno-web/src/utils/uiConfig.jsx` and `themeTranslations.js`.
- Feature Flags: inspect `teno-web/src/utils/featureFlags.js` and `FeatureFlagContext.jsx`.
- Modal Primitives: inspect `teno-web/src/components/ConfirmModal.jsx`.

### 3. Database & Schema Alignment Check
If the task involves database operations:
- Check `docs/features/collaboration-and-sharing.md` and `firestore.rules` for collection rules.
- Confirm whether documents require `memberUids` denormalization.
- Check `teno-web/tests/setup.js` for Vitest Firebase mock alignment.

---

## 4. Phase 2: Root Cause Diagnosis & Feasibility Audit

### For Bug Fixes & Error Logs:
1. **Trace the Exact Error Origin:** Identify the exact file and line number generating the error log or failure.
2. **Differentiate Symptom from Root Cause:**
   - *Example:* If a test in `LinkStorer.test.jsx` fails with `Unable to find an accessible element with the role "button" and name "Delete Label"`, the root cause is that the label deletion modal was enhanced to offer multiple deletion choices ("Delete Label & All Items In It" and "Just Delete Label (Ungroup Items)"), requiring updated test queries.
3. **Inspect Boundary Conditions:** Check edge cases (e.g. unauthenticated state, empty label list, missing `memberUids`, legacy schema documents lacking `type`).

### For New Features or UI Additions:
1. **Dual-Theme Verification:** Does the feature require styling in both Minimalist (`[data-style="minimal"]`) and Modern (`[data-style="modern"]`) styles?
2. **Pure CSS Rules:** Remember that TeNo uses pure CSS custom properties, not Tailwind.
3. **Directory Placement:** Determine whether the code belongs in `teno-web/src/components/`, `teno-web/src/pages/`, `teno-web/api/`, or `teno-extension/`.

---

## 5. Phase 3: Formulating the Step-by-Step Implementation Plan

Once the audit is complete, synthesize the findings into an explicit, modular implementation plan.

### Structural Requirements for Every Plan:
Every plan must break the task into self-contained steps adhering to **Rule 1 (Atomic Commits)** and **Rule 2 (Targeted Module Testing)**:

Each step must specify:
1. **Target File(s):** The exact files to be created or modified.
2. **Action / Change:** Clear description of the logic, styling, or configuration being implemented.
3. **Targeted Test:** The specific test command and assertions to verify the step.
4. **Atomic Commit Message:** A single-line semantic commit message in present tense.

### Standard Implementation Plan Template:
```markdown
### Implementation Plan: <Feature Name or Bug Summary>

#### 1. Audit Summary & Findings
- **Context:** <Current state and how existing code behaves>
- **Root Cause / Key Gap:** <Verified root cause of the bug, or architectural requirements for the feature>
- **Affected Packages:** <teno-web, teno-extension, or root>

#### 2. Phased Step-by-Step Execution Plan

* **Step 1: <Module / Function Name>**
  - Target: `teno-web/src/...`
  - Changes: <Exact modification or creation>
  - Targeted Test: `cd teno-web && npx vitest run tests/...`
  - Commit: `<type>(<scope>): <present tense description>`

* **Step 2: <Consumer / Integration Name>**
  - Target: `teno-web/src/...`
  - Changes: <Exact modification or creation>
  - Targeted Test: `cd teno-web && npx vitest run tests/...`
  - Commit: `<type>(<scope>): <present tense description>`

* **Step 3: <Full Verification & Build Check>**
  - Run full test suite: `cd teno-web && npm test`
  - Run production build: `cd teno-web && npm run build`
  - Commit: `<type>(<scope>): <present tense description>`
```

---

## 6. Phase 4: Execution Guardrails & Anti-Patterns

### Strictly Prohibited Behaviors:
- **No "Shotgun Debugging":** Never alter random lines of code hoping it fixes an error. Diagnose the exact root cause first.
- **No Batch Implementation:** Never implement Step 1 and Step 2 simultaneously without testing and committing Step 1 first.
- **No Unplanned File Creation:** Never create loose files or secondary configs without planning their directory placement according to `AGENTS.md`.
- **No Ignoring Dual-Theme:** Never implement a UI component that works only in Modern or only in Minimalist.

---

## 7. Pre-Implementation Checklist

Before editing any code, verify:
```text
[ ] 1. Searched the codebase for existing usages, props, and call sites.
[ ] 2. Checked if a reusable utility exists in src/utils/ or src/lib/db.js.
[ ] 3. Verified database schema requirements against firestore.rules and docs/.
[ ] 4. Verified dual-theme compatibility (Minimalist and Modern).
[ ] 5. Verified root cause (for bugs) or requirements and layout reflow (for features).
[ ] 6. Formulated an atomic, step-by-step plan with targeted tests and commit messages.
```

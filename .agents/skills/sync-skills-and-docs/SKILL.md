---
name: sync-skills-and-docs
description: >-
  Use this skill whenever a new feature, module, collection, or major refactor is added to TeNo.
  Provides a systematic checklist and audit procedure to propagate changes across all agent skills (.agents/skills/),
  repository documentation (docs/features/, README.md), and development rules (AGENTS.md) so guidelines and architecture remain continuously synchronized.
---

# Continuous Skill & Documentation Synchronization (Web & Extension)

This skill defines the mandatory workflow and checklist for synchronizing all workspace **skills** (`.agents/skills/`), **architecture guides** (`docs/features/`, `README.md`), and **development rules** (`AGENTS.md`) whenever a new feature, module, database collection, or UI element is introduced to **TeNo**.

---

## 1. Core Philosophy: Living Guidelines & Zero Architectural Drift

> **The Synchronization Mandate:** A feature is not complete when only application code and unit tests are written. Every new capability, UI element, database entity, and component must immediately be reflected across the repository's governing skills and architectural documentation.

Failing to synchronize skills when adding features causes:
- Subsequent agents referencing outdated directory maps or missing new component placements.
- Inconsistent UI patterns where new button styles, brackets, or badges are omitted from the design dictionary.
- Stale database schemas in `review-db-structure` causing missing security rules or incorrect payload types.
- Broken test expectations when test commands or mock conventions are not documented.
- Misaligned documentation between the web application, browser extension, and developer guides.

---

## 2. Feature-to-Skill Synchronization Matrix

Whenever a feature introduces new code, consult this matrix to identify which skills and docs must be updated:

| If Your Feature Added or Changed: | Skills to Update | Documentation to Update |
| :--- | :--- | :--- |
| **New React Component, Modal, or Page** | `review-directory-structure`<br>`repo-search` | `docs/features/core-modules.md`<br>`README.md` |
| **New ASCII Action, Badge, or UI Element** | `maintain-minimalist-ui`<br>`review-responsive-design` | `docs/features/dual-theme-system.md` |
| **New Entity Grid or Card Layout** | `review-responsive-design`<br>`maintain-minimalist-ui` | `docs/features/core-modules.md` |
| **New Firestore Collection or Schema Expansion** | `review-db-structure`<br>`audit-and-planning` | `docs/features/collaboration-and-sharing.md`<br>`firestore.rules` |
| **New Test Suite or Mock Requirement** | `targeted-module-testing`<br>`review-directory-structure` | `teno-web/tests/setup.js` |
| **New Platform File or Root Configuration** | `review-directory-structure` | `AGENTS.md` (Rule 3) |
| **New Cross-Platform Sub-Feature (Web vs Ext)** | `audit-and-planning`<br>`maintain-minimalist-ui` | `docs/features/core-modules.md` |

---

## 3. Systematic 6-Phase Synchronization Workflow

After completing feature code and unit tests, execute this 6-phase audit to propagate updates across all skills:

```text
┌────────────────────────────────────────────────────────┐
│ Phase 1: Directory Structure & Architectural Trees    │
│ Update .agents/skills/review-directory-structure       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Minimalist UI Specification & Brackets        │
│ Update .agents/skills/maintain-minimalist-ui           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: Card Geometry & Responsive Styling Standards  │
│ Update .agents/skills/review-responsive-design         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 4: Canonical Database Architecture & Schemas     │
│ Update .agents/skills/review-db-structure              │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 5: Search Scope & Pre-Implementation Checklists  │
│ Update .agents/skills/repo-search & audit-and-planning │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 6: Feature Guides, README & Agent Rules          │
│ Update docs/features/, README.md, and AGENTS.md        │
└────────────────────────────────────────────────────────┘
```

---

### Phase 1: Synchronize `review-directory-structure`

Inspect [.agents/skills/review-directory-structure/SKILL.md](file:///.agents/skills/review-directory-structure/SKILL.md):
1. **Architectural Tree (Section 1):**
   - Add new files in `teno-web/src/components/`, `teno-web/src/pages/`, `teno-web/api/`, or `teno-extension/src/components/`.
   - Add new test files in `teno-web/tests/components/`.
   - Add any new root platform anchors (e.g. `.firebaserc`).
2. **Directory Placement Rules (Section 4):**
   - Update component lists for `teno-web/src/components/` and `teno-extension/src/components/`.
3. **Review Checklist (Section 5):**
   - Ensure the root file allowed list includes any newly added platform config files.

---

### Phase 2: Synchronize `maintain-minimalist-ui`

Inspect [.agents/skills/maintain-minimalist-ui/SKILL.md](file:///.agents/skills/maintain-minimalist-ui/SKILL.md):
1. **Minimalist UI Specification Matrix (Section 2):**
   - If the feature introduces new UI paradigms (e.g., version badges, dual commit buttons, multi-line preview text, transient toasts, read-only console badges), add rows documenting both the Minimalist and Modern specifications.
2. **ASCII Bracket Notation Registry (Rule 3):**
   - Add all newly declared bracket strings to the standard categories (Add, Delete, Navigation, Version Control, Status Badges).
3. **Rule Specifications (Section 3):**
   - Add or refine rules for feature-specific state management (e.g., version control immutability, zero layout shift, terminal disabled styling).
4. **Pre-Implementation Checklist (Section 4):**
   - Add verification checkboxes for the new UI attributes.

---

### Phase 3: Synchronize `review-responsive-design`

Inspect [.agents/skills/review-responsive-design/SKILL.md](file:///.agents/skills/review-responsive-design/SKILL.md):
1. **Card Geometry & Column Clearance (Section 2.E):**
   - If new entity cards were introduced, document minimum column widths (`minmax(350px+, 1fr)`), explicit `min-height`, and multi-line clamp values.
2. **Zero-Layout-Shift Standards (Section 2.F):**
   - Document fixed button `min-width` reservations or absolute toast positioning for new transient feedback triggers.
3. **4-Theme Button Contrast Hierarchies (Section 2.G):**
   - Ensure new action bars adhere to the primary/secondary/tertiary outline and fill rules across all 4 theme permutations.

---

### Phase 4: Synchronize `review-db-structure`

Inspect [.agents/skills/review-db-structure/SKILL.md](file:///.agents/skills/review-db-structure/SKILL.md):
1. **Canonical Architecture Tree (Section 1):**
   - Add new Firestore root collections (e.g. `/prompts/{promptId}`) and user subcollections to the root tree diagram.
2. **Collection Schemas & Field Shapes (Section 2):**
   - Document document fields, data types, nested version arrays, and timestamps.
   - Document security rule requirements (`read`, `create`, `update`, `delete`) and denormalized `memberUids` rules.
3. **Database Change Checklist (Section 5):**
   - Ensure checklist includes parity for the newly introduced collections.

---

### Phase 5: Synchronize `repo-search` & `audit-and-planning`

1. **`repo-search`:**
   - Verify that the Universal Search Scope Matrix includes the newly added component directories or collections.
2. **`audit-and-planning`:**
   - Update Pre-Implementation and Root Cause checklists to account for the new feature's design constraints, state-aware immutability, and security rule matchers.

---

### Phase 6: Synchronize `docs/features/`, `README.md` & `AGENTS.md`

1. **Feature Guides (`docs/features/`):**
   - If adding a major top-level capability, add a dedicated section to `docs/features/core-modules.md` or create a new feature guide in `docs/features/`.
   - Document data structures, key features, cross-platform parity, and primary React components.
2. **Repository README (`README.md`):**
   - Update the top-level repository summary to list the new feature.
   - Update the "Index of Features" documentation links.
3. **Development Guidelines (`AGENTS.md`):**
   - Check if any new architectural layer, symlink relationship, or root platform file needs mention in Rule 3, Rule 5, Rule 6, or Rule 8.
   - Add any new strict guardrails to Section 5.

---

## 4. Post-Feature Synchronization Checklist

Before closing out any feature branch or pull request, complete this audit:

```text
[ ] 1. REVIEW-DIRECTORY-STRUCTURE:
    - Updated Section 1 ASCII tree with new components, pages, and test files.
    - Updated Section 4 component lists for teno-web and teno-extension.
    - Updated Section 5 root cleanliness allowed list for new platform configs.

[ ] 2. MAINTAIN-MINIMALIST-UI:
    - Updated Section 2 specification matrix with new UI elements.
    - Registered new bracketed labels in Rule 3.
    - Documented state-aware or immutability rules in Section 3.
    - Updated Section 4 pre-implementation checklist.

[ ] 3. REVIEW-RESPONSIVE-DESIGN:
    - Verified card geometry (>= 350px width, >= 145px height for multi-action cards).
    - Enforced zero layout shift (min-width or absolute toast for transient states).
    - Audited button contrast in all 4 theme permutations.

[ ] 4. REVIEW-DB-STRUCTURE:
    - Documented new Firestore collection schema, subcollections, and field types.
    - Documented matching firestore.rules permission blocks and memberUids parity.

[ ] 5. REPO-SEARCH & AUDIT-AND-PLANNING:
    - Verified new components and symbols are indexed and searchable.

[ ] 6. ARCHITECTURE DOCS & RULES:
    - Updated docs/features/core-modules.md with the new module guide.
    - Updated README.md overview and feature index.
    - Updated AGENTS.md rules and strict guardrails.

[ ] 7. ATOMIC COMMITS & TESTS:
    - Executed single-line semantic commits for all documentation updates.
    - Verified 100% test pass rate in teno-web and clean extension build.
```

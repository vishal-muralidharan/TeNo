---
name: file-folder-naming
description: >-
  Use this skill to determine and verify file and folder naming conventions across the TeNo codebase.
  Ensures strict consistency in casing, suffixes, extensions, and directory naming for React components,
  contexts, utilities, serverless API endpoints, stylesheets, migration files, and tests.
---

# File & Folder Naming Conventions

This skill defines the mandatory naming conventions and casing rules for all files and directories across the **TeNo** codebase.

---

## 1. Quick Reference Matrix

| Entity Type | Casing | Extension | Example Location & Filename |
| :--- | :--- | :--- | :--- |
| **React Components** | `PascalCase` | `.jsx` | `teno-web/src/components/LinkStorer.jsx` |
| **Pages & Route Views** | `PascalCase` | `.jsx` | `teno-web/src/pages/DashboardPage.jsx` |
| **Modal Overlays & Dialogs** | `PascalCase` | `.jsx` | `teno-web/src/components/ShareModal.jsx` |
| **React Context Providers** | `PascalCase` | `.jsx` | `teno-web/src/ThemeContext.jsx` |
| **Client Utilities & Config** | `camelCase` | `.js` / `.jsx` | `teno-web/src/utils/uiConfig.jsx`, `teno-web/src/utils/themeTranslations.js` |
| **Database Wrapper Library** | `camelCase` | `.js` | `teno-web/src/lib/db.js` |
| **Serverless API Endpoints** | `camelCase` or `kebab-case` | `.js` | `teno-web/api/joinLabel.js`, `teno-web/api/delete-account.js` |
| **Client API Wrappers** | `camelCase` | `.js` | `teno-web/src/api/user.js` |
| **Stylesheets & Pure CSS** | `lowercase` | `.css` | `teno-web/src/index.css`, `teno-extension/src/index.css` |
| **Component Tests** | `PascalCase` (mirrored) | `.test.jsx` | `teno-web/tests/components/LinkStorer.test.jsx` |
| **Context Tests** | `PascalCase` (mirrored) | `.test.jsx` | `teno-web/tests/context/ThemeContext.test.jsx` |
| **Lib / Utility Tests** | `camelCase` (mirrored) | `.test.js` | `teno-web/tests/lib/db.test.js`, `teno-web/tests/utils/uiConfig.test.js` |
| **Serverless API Tests** | `camelCase` (mirrored) | `.test.js` | `teno-web/tests/api/joinLabel.test.js` |
| **Database Migrations** | `000_snake_case` | `.js` | `migrations/data/001_migrate_to_unified_schema.js` |
| **Feature Documentation** | `kebab-case` | `.md` | `docs/features/dual-theme-system.md` |
| **Architecture / Agent Rules** | `UPPERCASE` | `.md` | `AGENTS.md`, `README.md`, `SKILL.md` |

---

## 2. Detailed Naming Rules

### A. React Components, Pages & Contexts
* Use `PascalCase` for all React component files, page files, modal dialogues, and Context providers.
* Always use the `.jsx` file extension if the file returns JSX or uses React JSX syntax (e.g., `LinkStorer.jsx`, `ShareModal.jsx`, `DashboardPage.jsx`, `ThemeContext.jsx`).
* Match the primary exported component name with the filename:
  ```javascript
  export default function ShareModal({ label, currentUser, onClose, dbApi }) { ... }
  ```

### B. Utilities, Helpers & Client Libraries
* Use `camelCase` for client utilities and library modules (e.g. `db.js`, `themeTranslations.js`, `featureFlags.js`, `user.js`).
* Use `.jsx` if the utility exports JSX helper nodes or React element factories (e.g., `uiConfig.jsx`), otherwise use `.js`.

### C. Serverless API Endpoints (`teno-web/api/`)
* Endpoints deployed via Vercel Serverless Functions in `teno-web/api/` map directly to URLs:
  - `teno-web/api/joinLabel.js` ➔ `/api/joinLabel`
  - `teno-web/api/delete-account.js` ➔ `/api/delete-account`
* Keep endpoint filenames concise and descriptive.

### D. Package & Directory Organization
* **Sub-projects / Monorepo roots:** Use `kebab-case` (e.g., `teno-web/`, `teno-extension/`).
* **Category directories:** Use `lowercase` for architectural groupings (e.g., `components`, `pages`, `utils`, `lib`, `api`, `tests`, `docs`, `features`, `migrations`, `scripts`).

### E. Test Files (`teno-web/tests/`)
* **Mirroring Rule:** Mirror the source directory structure under `teno-web/tests/`.
* Component test files: `<ComponentName>.test.jsx` (e.g. `tests/components/ConfirmModal.test.jsx`).
* Context test files: `<ContextName>.test.jsx` (e.g. `tests/context/ThemeContext.test.jsx`).
* Utility / Lib test files: `<name>.test.js` (e.g. `tests/lib/db.test.js`, `tests/utils/uiConfig.test.js`).
* API test files: `<name>.test.js` (e.g. `tests/api/joinLabel.test.js`).

### F. Multi-Package Awareness (`teno-web` vs `teno-extension`)
* TeNo contains shared concepts across `teno-web` and `teno-extension` (such as `LinkStorer.jsx`, `Reminders.jsx`, `Timer.jsx`, `Terminal.jsx`).
* When creating or referencing components in `teno-extension`, preserve matching PascalCase component names to keep developer ergonomics consistent across both surfaces.

---

## 3. Pre-Creation Checklist

Before creating a new file or directory, check:
- [ ] Is the filename casing appropriate for its entity type (`PascalCase.jsx` for components/pages, `camelCase.js` for utilities/lib, `kebab-case.md` for feature docs)?
- [ ] Does the file extension reflect its content (`.jsx` for JSX, `.js` for standard modules, `.css` for pure CSS)?
- [ ] Is the file placed in the correct sub-project (`teno-web/` vs `teno-extension/`)?
- [ ] Does the corresponding test file in `teno-web/tests/` follow the mirrored naming rule?

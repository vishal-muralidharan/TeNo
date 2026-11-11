---
name: file-folder-naming
description: >-
  Use this skill to determine and verify file and folder naming conventions across the TeNo codebase.
  Ensures strict consistency in casing, suffixes, extensions, and directory naming across both
  teno-web and teno-extension sub-projects.
---

# File & Folder Naming Conventions (Web & Extension)

This skill defines the mandatory naming conventions, casing rules, and directory structures across both the **Web (`teno-web`)** and **Extension (`teno-extension`)** versions of TeNo.

---

## 1. Quick Reference Matrix

| Entity Type | Casing | Extension | Example Location & Filename |
| :--- | :--- | :--- | :--- |
| **Web React Components** | `PascalCase` | `.jsx` | `teno-web/src/components/LinkStorer.jsx` |
| **Extension React Components** | `PascalCase` | `.jsx` | `teno-extension/src/components/LinkStorer.jsx` |
| **Web Route Pages** | `PascalCase` | `.jsx` | `teno-web/src/pages/DashboardPage.jsx` |
| **Extension Views** | `PascalCase` | `.jsx` | `teno-extension/src/pages/DashboardPage.jsx` |
| **Modal Overlays & Dialogs** | `PascalCase` | `.jsx` | `teno-web/src/components/ShareModal.jsx` |
| **React Context Providers** | `PascalCase` | `.jsx` | `teno-web/src/ThemeContext.jsx` |
| **Client Utilities & Config** | `camelCase` | `.js` / `.jsx` | `teno-web/src/utils/uiConfig.jsx`, `teno-web/src/utils/themeTranslations.js` |
| **Database Wrapper Library** | `camelCase` | `.js` | `teno-web/src/lib/db.js` (symlinked in `teno-extension/src/lib`) |
| **Serverless API Endpoints** | `camelCase` or `kebab-case` | `.js` | `teno-web/api/joinLabel.js`, `teno-web/api/delete-account.js` |
| **Client API Wrappers** | `camelCase` | `.js` | `teno-web/src/api/user.js` |
| **Extension Helper Scripts** | `camelCase` | `.js` | `teno-extension/sm/typingCaret.js` |
| **Extension Static Assets** | `kebab-case` | `.svg` / `.json` | `teno-extension/public/dollar-white.svg`, `teno-extension/public/manifest.json` |
| **Stylesheets & Pure CSS** | `lowercase` | `.css` | `teno-web/src/index.css`, `teno-extension/src/index.css` |
| **Web Component Tests** | `PascalCase` (mirrored) | `.test.jsx` | `teno-web/tests/components/LinkStorer.test.jsx` |
| **Web Context Tests** | `PascalCase` (mirrored) | `.test.jsx` | `teno-web/tests/context/ThemeContext.test.jsx` |
| **Web Lib / Utility Tests** | `camelCase` (mirrored) | `.test.js` | `teno-web/tests/lib/db.test.js`, `teno-web/tests/utils/uiConfig.test.js` |
| **Serverless API Tests** | `camelCase` (mirrored) | `.test.js` | `teno-web/tests/api/joinLabel.test.js` |
| **Database Migrations** | `000_snake_case` | `.js` | `migrations/data/001_migrate_to_unified_schema.js` |
| **Feature Documentation** | `kebab-case` | `.md` | `docs/features/dual-theme-system.md` |
| **Architecture / Agent Rules** | `UPPERCASE` | `.md` | `AGENTS.md`, `README.md`, `SKILL.md` |

---

## 2. Detailed Naming Rules

### A. React Components & Pages (`teno-web` & `teno-extension`)
* Use `PascalCase` for all React component files, page files, modal dialogues, and Context providers across both `teno-web` and `teno-extension`.
* Always use the `.jsx` file extension if the file returns JSX or uses React JSX syntax (e.g. `LinkStorer.jsx`, `Reminders.jsx`, `Timer.jsx`, `Terminal.jsx`).
* Maintain naming symmetry between equivalent web and extension components:
  - `teno-web/src/components/LinkStorer.jsx` ⟷ `teno-extension/src/components/LinkStorer.jsx`
  - `teno-web/src/components/Reminders.jsx` ⟷ `teno-extension/src/components/Reminders.jsx`
  - `teno-web/src/components/Timer.jsx` ⟷ `teno-extension/src/components/Timer.jsx`
  - `teno-web/src/components/Terminal.jsx` ⟷ `teno-extension/src/components/Terminal.jsx`
* Match the primary exported component name with the filename:
  ```javascript
  export default function LinkStorer({ ... }) { ... }
  ```

### B. Utilities, Helpers & Client Libraries
* Use `camelCase` for client utilities and library modules (e.g. `db.js`, `themeTranslations.js`, `featureFlags.js`, `user.js`, `typingCaret.js`).
* Use `.jsx` if the utility exports JSX helper nodes or React element factories (e.g., `uiConfig.jsx`), otherwise use `.js`.

### C. Shared Code & Symlink Rules
* Canonical data logic resides in `teno-web/src/lib/` (e.g., `db.js`).
* `teno-extension/src/lib` is a filesystem symlink pointing to `../../teno-web/src/lib`.
* When adding a new shared library module meant for both web and extension, place the canonical file in `teno-web/src/lib/<name>.js`. It will immediately be accessible in `teno-extension` through the symlink.

### D. Serverless API Endpoints (`teno-web/api/`)
* Endpoints deployed via Vercel Serverless Functions in `teno-web/api/` map directly to URLs:
  - `teno-web/api/joinLabel.js` ➔ `/api/joinLabel`
  - `teno-web/api/delete-account.js` ➔ `/api/delete-account`
* Keep endpoint filenames concise and descriptive. Note: Serverless endpoints live in `teno-web/api/`, not in `teno-extension/`.

### E. Extension Manifest & Assets (`teno-extension/`)
* Extension icons and public static files in `teno-extension/public/` follow `kebab-case` with standard extensions (e.g. `dollar-white.svg`, `icon-128.png`).
* The WebExtension configuration must always be named `manifest.json`.

### F. Package & Directory Organization
* **Sub-projects / Monorepo roots:** Use `kebab-case` (`teno-web/`, `teno-extension/`).
* **Category directories:** Use `lowercase` for architectural groupings (`components`, `pages`, `utils`, `lib`, `api`, `tests`, `docs`, `features`, `migrations`, `scripts`).

### G. Test Files (`teno-web/tests/`)
* **Mirroring Rule:** Mirror the source directory structure under `teno-web/tests/`.
* Component test files: `<ComponentName>.test.jsx` (e.g. `tests/components/LinkStorer.test.jsx`).
* Context test files: `<ContextName>.test.jsx` (e.g. `tests/context/ThemeContext.test.jsx`).
* Utility / Lib test files: `<name>.test.js` (e.g. `tests/lib/db.test.js`, `tests/utils/uiConfig.test.js`).
* API test files: `<name>.test.js` (e.g. `tests/api/joinLabel.test.js`).

---

## 3. Pre-Creation Checklist

Before creating a new file or directory, check:
- [ ] Is the filename casing appropriate for its entity type (`PascalCase.jsx` for components/pages, `camelCase.js` for utilities/lib, `kebab-case.md` for feature docs)?
- [ ] Does the file extension reflect its content (`.jsx` for JSX, `.js` for standard modules, `.css` for pure CSS)?
- [ ] Is the file placed in the correct sub-project (`teno-web/` vs `teno-extension/`)?
- [ ] If adding shared logic, is it placed in `teno-web/src/lib/` to leverage the `teno-extension/src/lib` symlink?
- [ ] Does the corresponding test file in `teno-web/tests/` follow the mirrored naming rule?

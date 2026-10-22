---
name: review-directory-structure
description: >-
  Use this skill to review, navigate, and validate the TeNo project directory structure.
  Ensures new files, modules, features, components, tests, and endpoints are placed
  in their correct architectural locations across teno-web, teno-extension, and root services.
---

# Review Directory Structure (Web & Extension)

This skill defines the architectural map and directory organization rules for the **TeNo** repository. Use it whenever creating, moving, refactoring, or reviewing files and folders across both **`teno-web`** and **`teno-extension`**.

---

## 1. Architectural Overview

The repository is structured as a multi-package workspace separating the web application, browser extension, database rules, migrations, agent skills, and documentation:

```text
/
├── .agents/                          # Agent workspace configurations and skills
│   └── skills/                       # Reusable workflow and guideline skills
├── docs/                             # Core feature & architectural documentation
│   └── features/                     # Feature guides (dual-theme, collab, core-modules, settings)
├── firebase.json                     # Firebase CLI root anchor (rules, indexes, emulators)
├── firestore.rules                   # Production Cloud Firestore security rules
├── firestore.indexes.json            # Composite indexes for Firestore queries
├── migrations/                       # Database schema migration assets
│   ├── data/                         # Migration scripts (Node.js / admin SDK)
│   ├── docs/                         # Rollout plans and migration documentation
│   └── rules/                        # Historical rules backups
├── scripts/                          # Operational & utility scripts
├── teno-web/                         # Primary React 19 web application & serverless API
│   ├── api/                          # Vercel Serverless Functions (Node.js backend)
│   │   ├── delete-account.js         # Secure account & cascading data scrub
│   │   └── joinLabel.js              # Label invite validation & atomic membership propagation
│   ├── public/                       # Static public assets (icons, favicons)
│   ├── src/                          # Client-side React 19 source tree
│   │   ├── api/                      # Client-side API fetch client wrappers (user.js)
│   │   ├── components/               # Core UI modules & modals (LinkStorer, Reminders, ShareModal...)
│   │   ├── lib/                      # Core abstractions (TeNoDatabase in db.js - canonical source)
│   │   ├── pages/                    # Full web route views (Dashboard, Settings, Login, Join, DPDP...)
│   │   ├── utils/                    # Theme config, translations, feature flags (uiConfig, themeTranslations)
│   │   ├── App.jsx                   # Web application layout & tab router
│   │   ├── FeatureFlagContext.jsx    # Remote feature flags context
│   │   ├── firebase.js               # Firebase Client SDK initialization
│   │   ├── index.css                 # Pure CSS design system & dual-theme tokens
│   │   ├── main.jsx                  # React DOM bootstrap
│   │   └── ThemeContext.jsx          # Theme state & styleMode engine ('minimal' vs 'modern')
│   ├── tests/                        # Mirrored Vitest test suite
│   │   ├── api/                      # Serverless function tests
│   │   ├── components/               # React component & modal tests
│   │   ├── context/                  # Context provider tests
│   │   ├── lib/                      # TeNoDatabase unit tests
│   │   ├── setup.js                  # Global test setup, jsdom stubs & Firebase mocks
│   │   └── utils/                    # UI config & helper tests
│   ├── package.json                  # Web dependencies & test runner scripts
│   └── vite.config.js                # Vite & Vitest configuration
├── teno-extension/                   # Browser extension sub-project (Popup Interface)
│   ├── public/                       # Extension static assets & manifest
│   │   ├── dollar-white.svg          # Extension action icon
│   │   └── manifest.json             # WebExtension manifest configuration
│   ├── sm/                           # Extension-specific helpers
│   │   └── typingCaret.js            # Input cursor & typing animation helper
│   ├── src/                          # Extension React 19 source (popup interface)
│   │   ├── components/               # Extension components (LinkStorer, Reminders, Timer, Terminal)
│   │   ├── lib/                      # Symlink -> ../../teno-web/src/lib (shared TeNoDatabase)
│   │   ├── pages/                    # Extension page views (DashboardPage, LoginPage, SettingsPage)
│   │   ├── firebase.js               # Extension Firebase client config
│   │   ├── index.css                 # Extension pure CSS styling (compact hacker aesthetic)
│   │   ├── App.jsx                   # Extension popup root & tab navigation
│   │   └── main.jsx                  # Extension entry point
│   ├── package.json                  # Extension dependencies & build scripts
│   └── vite.config.js                # Extension Vite build config
├── .gitignore                        # Git ignore patterns
├── AGENTS.md                         # Agent development guidelines and routine rules
└── README.md                         # Repository overview and local dev instructions
```

---

## 2. Web vs. Extension Sub-Project Roles

### `teno-web/` (Full Web Application)
* **Execution Environment:** Full desktop browsers, tablet viewports, and mobile mobile browsers.
* **Responsibilities:**
  - Complete user authentication and onboarding flows.
  - Dedicated legal, privacy, and DPDP compliance pages (`PrivacyPage.jsx`, `DPDPPage.jsx`, `TermsPage.jsx`).
  - Full-screen dual-theme experience with runtime switching (`Minimalist` vs `Modern`).
  - Hosting of Vercel Serverless Functions (`api/joinLabel.js`, `api/delete-account.js`).
  - Automated testing via Vitest suite (`tests/`).

### `teno-extension/` (Browser Action Popup)
* **Execution Environment:** Constrained browser action popup (fixed width ~400px, max height ~600px).
* **Responsibilities:**
  - High-speed bookmark saving and tab reference access without leaving the active web page.
  - Quick reminder creation and todo checking.
  - Pomodoro/focus countdown timer.
  - Terminal view for quick commands.
  - Streamlined pages: `DashboardPage`, `LoginPage`, and compact `SettingsPage`.

### The Symlink Bridge (`teno-extension/src/lib`)
* `teno-extension/src/lib` is a filesystem symlink pointing to `../../teno-web/src/lib`.
* The canonical implementation of `TeNoDatabase` (`db.js`) lives in `teno-web/src/lib/db.js`.
* Any new methods, collection subscriptions, or bug fixes made to `db.js` immediately benefit both `teno-web` and `teno-extension`.

---

## 3. Root Directory Cleanliness Policy

The root directory must remain strictly curated. Only the following essential categories of files are permitted in the root:

1. **Version Control & Agent Directives:** `.gitignore`, `AGENTS.md`, `README.md`
2. **Platform & Firebase Anchors:** `firebase.json`, `firestore.rules`, `firestore.indexes.json`
3. **Primary Structural Directories:**
   - `.agents/`
   - `docs/`
   - `migrations/`
   - `scripts/`
   - `teno-web/`
   - `teno-extension/`

**Strict Prohibitions:**
- Never create loose scripts, scratch files, or secondary configurations directly in the project root.
- Never commit emulator/debug logs (`*-debug.log`) to the root; ensure they are deleted and gitignored.
- Never commit transient test artifacts (`teno-web/coverage/`, `.vitest/`).
- Place web code strictly within `teno-web/` and extension code strictly within `teno-extension/`.

---

## 4. Directory Placement Rules

### `teno-web/src/components/`
* **Purpose:** Stores reusable UI components, modals, and core functional modules for the web app.
* **Contents:** `LinkStorer.jsx`, `Reminders.jsx`, `Timer.jsx`, `Terminal.jsx`, `ShareModal.jsx`, `MembersModal.jsx`, `ConfirmModal.jsx`, `TermsAgreementModal.jsx`.

### `teno-extension/src/components/`
* **Purpose:** Stores the extension popup versions of core functional modules.
* **Contents:** `LinkStorer.jsx`, `Reminders.jsx`, `Timer.jsx`, `Terminal.jsx`.
* **Rule:** Maintain component naming symmetry with `teno-web`. When updating core features (e.g. label delete behavior in `LinkStorer`), verify whether the extension counterpart requires parallel synchronization.

### `teno-web/src/lib/`
* **Purpose:** Core abstractions and data access layers.
* **Contents:** `db.js` (`TeNoDatabase`).
* **Rule:** Canonical location for database abstractions. Always write shared data logic here so `teno-extension` receives updates through its symlink.

### `teno-web/src/utils/`
* **Purpose:** Web pure helper functions, configuration objects, and theme dictionaries (`uiConfig.jsx`, `themeTranslations.js`, `featureFlags.js`).

### `teno-web/api/` (Vercel Serverless Functions)
* **Purpose:** Node.js backend endpoints running in a serverless environment (`joinLabel.js`, `delete-account.js`).
* **Rule:** Endpoints live exclusively in `teno-web/api/`. Extension calls them via HTTP `fetch`.

### `teno-web/tests/` (Targeted Test Directory)
* **Purpose:** Mirrored test suites for all client and serverless code in `teno-web`.

---

## 5. Directory Structure Review Checklist

Before creating a new file or directory, verify:
1. **Target Sub-Project:** Does the file belong to `teno-web/` or `teno-extension/`?
2. **Shared Code Placement:** If adding database logic or data access helpers, is it placed in `teno-web/src/lib/` to leverage the `teno-extension/src/lib` symlink?
3. **Root Cleanliness:** Does the file belong in root? (Only platform anchors `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `AGENTS.md`, `README.md`, `.gitignore` are allowed).
4. **Backend vs. Client:** Serverless endpoints belong in `teno-web/api/`, not in `teno-extension/` or root.
5. **Component Parity Check:** If updating a component that exists in both `teno-web/src/components/` and `teno-extension/src/components/`, has the parallel placement and impact been identified?

---
name: review-directory-structure
description: >-
  Use this skill to review, navigate, and validate the TeNo project directory structure.
  Ensures new files, modules, features, components, tests, and endpoints are placed
  in their correct architectural locations across teno-web, teno-extension, and root services.
---

# Review Directory Structure

This skill defines the architectural map and directory organization rules for the **TeNo** repository. Use it whenever creating, moving, refactoring, or reviewing files and folders.

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
│   │   ├── api/                      # Client-side API fetch client wrappers
│   │   ├── components/               # Core UI modules & modals (LinkStorer, Reminders, ShareModal...)
│   │   ├── lib/                      # Core abstractions (TeNoDatabase in db.js)
│   │   ├── pages/                    # Route views (DashboardPage, SettingsPage, LoginPage...)
│   │   ├── utils/                    # Theme config, translations, feature flags (uiConfig, themeTranslations)
│   │   ├── App.jsx                   # Application layout & tab router
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
├── teno-extension/                   # Browser extension sub-project
│   ├── public/                       # Extension manifest & browser action icons
│   ├── src/                          # Extension React 19 source (popup interface)
│   │   ├── components/               # Extension components (LinkStorer, Reminders, Timer, Terminal)
│   │   ├── pages/                    # Extension page views
│   │   ├── firebase.js               # Extension Firebase client config
│   │   ├── index.css                 # Extension pure CSS styling
│   │   └── main.jsx                  # Extension entry point
│   ├── package.json                  # Extension dependencies & build scripts
│   └── vite.config.js                # Extension Vite build config
├── .gitignore                        # Git ignore patterns
├── AGENTS.md                         # Agent development guidelines and routine rules
└── README.md                         # Repository overview and local dev instructions
```

---

## 2. Root Directory Cleanliness Policy

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

## 3. Directory Placement Rules

### `teno-web/src/components/`
* **Purpose:** Stores reusable UI components, modals, and core functional modules.
* **Contents:** `LinkStorer.jsx`, `Reminders.jsx`, `Timer.jsx`, `Terminal.jsx`, `ShareModal.jsx`, `MembersModal.jsx`, `ConfirmModal.jsx`, `TermsAgreementModal.jsx`.
* **Rule:** If a component is specific to a top-level route (e.g. settings forms), evaluate if it belongs in `src/pages/` or `src/components/`.

### `teno-web/src/lib/`
* **Purpose:** Core abstractions and data access layers.
* **Contents:** `db.js` (`TeNoDatabase`).
* **Rule:** All Firestore operations in `teno-web` must be routed through `TeNoDatabase` methods rather than direct Firestore SDK calls in components.

### `teno-web/src/utils/`
* **Purpose:** Pure helper functions, configuration objects, and theme dictionaries.
* **Contents:** `uiConfig.jsx`, `themeTranslations.js`, `featureFlags.js`.

### `teno-web/api/` (Vercel Serverless Functions)
* **Purpose:** Node.js backend endpoints running in a serverless environment.
* **Rules:**
  - Files directly under `api/` become public routes (e.g., `api/joinLabel.js` ➔ `/api/joinLabel`).
  - Never import client-side React code or browser APIs (`window`, `localStorage`) into `api/`.
  - Use Firebase Admin SDK (`firebase-admin`) with proper service account credentials.

### `teno-web/tests/` (Targeted Test Directory)
* **Purpose:** Mirrored test suites for all client and serverless code in `teno-web`.
* **Placement:**
  - Component tests go in `tests/components/<Name>.test.jsx`.
  - Context tests go in `tests/context/<Name>Context.test.jsx`.
  - Library tests go in `tests/lib/<name>.test.js`.
  - Utility tests go in `tests/utils/<name>.test.js`.
  - API endpoint tests go in `tests/api/<name>.test.js`.

### `teno-extension/` (Browser Extension)
* **Purpose:** Standalone extension interface bundled for Chrome/Firefox/Edge.
* **Rule:** When modifying shared component logic (e.g. `LinkStorer.jsx` or `Reminders.jsx`), check whether parallel updates are required in `teno-extension/src/components/` to maintain parity.

---

## 4. Directory Structure Review Checklist

Before creating a new file or directory, verify:
1. **Root Cleanliness:** Does this file belong in root? (Only platform anchors `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `AGENTS.md`, `README.md`, `.gitignore` are allowed).
2. **Sub-project Scoping:** Does the file belong to the web application (`teno-web/`) or the extension (`teno-extension/`)?
3. **Backend vs. Client Separation:** Serverless API endpoints belong in `teno-web/api/`, whereas client fetch wrappers belong in `teno-web/src/api/`.
4. **Test Mirroring:** Has the corresponding test file location in `teno-web/tests/` been identified?

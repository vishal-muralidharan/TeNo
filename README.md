# TeNo

Keyboard-first productivity command center and browser extension for links, reading carts, reminders, and version-controlled AI prompts.

![TeNo Logo](teno-web/public/dollar-white.svg)

## Features

- 📑 **Multi-tab command center** organizes bookmarks, reading cart items, daily reminders, timers, and prompt templates in one interface.
- 🎨 **Dual-theme design engine** switches between high-contrast Minimalist and modern visual styling modes with zero layout shift.
- ⌨️ **Keyboard-first navigation** enables complete application traversal, modal actions, and quick searches via keyboard shortcuts.
- 🤖 **Version-controlled prompt vault** saves, edits, versions, and searches AI prompt templates with custom tags.
- ⏰ **Background notification timers** trigger native desktop alerts for task reminders and deep work sessions.
- 🔄 **Real-time cloud synchronization** keeps links, carts, and prompts instantly synchronized across the web app and Chrome extension.
- 🛡️ **DPDP and GDPR data sovereign** supports instant self-service JSON data exports and permanent account deletion.

## Tech Stack

- **Frontend Web App:** React 19, Vite, Tailwind CSS, custom dual-theme styling engine.
- **Browser Extension:** Manifest V3 background service workers and side-panel integration.
- **Backend & Cloud:** Firebase Authentication, Cloud Firestore, Vercel Serverless Functions.
- **Testing:** Vitest, React Testing Library, JSDOM.

## Getting Started

### Prerequisites

- Node.js 18 or higher and npm
- A Firebase project with Firestore and Authentication enabled

### Install

Install dependencies in both the web application and browser extension directories:

```bash
cd teno-web && npm install
cd ../teno-extension && npm install
```

### Environment Variables

Configure your credentials by copying `.env.example` in each folder:

In `teno-web/.env.local`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_ADMIN_UID`
- `FIREBASE_SERVICE_ACCOUNT`

In `teno-extension/.env`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Never commit secrets or `.env` files to git.

### Run

Start the web application development server:

```bash
cd teno-web
npm run dev
```

Open `http://localhost:5173` in your browser.

To run the browser extension build:

```bash
cd teno-extension
npm run dev
```

Load the unpacked extension directory from `teno-extension/dist` into `chrome://extensions/`.

## Scripts

Every command matches a script in `package.json`:

In `teno-web`:
- `npm run dev`: starts the Vite development server.
- `npm run test`: runs the Vitest test suite.
- `npm run build`: builds the production web client.
- `npm run preview`: previews the production web build locally.

In `teno-extension`:
- `npm run dev`: runs Vite in development watch mode for the extension.
- `npm run build`: compiles the production Manifest V3 extension bundle.
- `npm run preview`: previews the extension build output.

## Tests

The project includes 13 test files and 428 test cases covering modals, terminal keyboard navigation, context providers, and theme switching.

Run the web test suite:

```bash
cd teno-web
npm run test
```

Or run:

```bash
cd teno-web
npm test
```

Test coverage includes:
- Prompt card editing, searching, and version increments
- Links and shopping cart modal actions
- Dual-theme token switching (Minimalist vs Modern)
- Background timer countdowns and notification triggers

## Project Structure

```text
TeNo/
├── docs/               # Architecture, theme system, and module specifications
├── teno-extension/     # Manifest V3 Chrome Extension source, assets, and build
│   ├── src/            # Extension content scripts, popup, and background workers
│   ├── public/         # Extension manifest.json and icons
│   └── package.json    # Extension dependencies and scripts
├── teno-web/           # Standalone web application
│   ├── api/            # Vercel serverless function endpoints
│   ├── src/            # Web components, pages, context providers, and styles
│   ├── tests/          # Vitest suites and mocks
│   └── package.json    # Web dependencies and scripts
└── README.md           # Project documentation
```

## Deployment

The web application deploys to Vercel.

- Build command: `npm run build` in `teno-web`.
- Output directory: `teno-web/dist`.
- Serverless API routes: hosted in `teno-web/api/`.
- Extension build: packaged from `teno-extension/dist` for distribution.

## Author and License

Created by Vishal Muralidharan.

Distributed under the MIT License. Copyright (c) 2025 Vishal Muralidharan.

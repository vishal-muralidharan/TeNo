# TeNo

Dual-theme productivity command center and browser extension for managing links, reading carts, reminders, and an AI prompt vault.

![TeNo Logo](teno-web/public/dollar-white.svg)

## Features

- 📑 **Multi-tab command center:** organize bookmarks, reading carts, reminders, timers, and prompt templates in one interface.
- 🎨 **Dual-theme design engine:** switch between high-contrast Minimalist and modern visual styles with zero layout shift.
- ⌨️ **Keyboard-first navigation:** navigate the app, execute modal actions, and run quick searches via keyboard shortcuts.
- 🤖 **Version-controlled prompt vault:** save, edit, version, and search AI prompt templates with custom tags.
- ⏰ **Background notification timers:** get native desktop alerts for task reminders and deep work sessions.
- 🔄 **Real-time cloud synchronization:** keep links, carts, and prompts synced across the web app and Chrome extension.
- 🛡️ **DPDP and GDPR data sovereign:** download full JSON data exports and request permanent account deletion.

## Tech Stack

- **Frontend Web App:** React 19, Vite, custom dual-theme styling
- **Browser Extension:** Chrome Manifest V3, background service workers
- **Backend and Cloud:** Firebase Authentication, Cloud Firestore
- **Testing:** Vitest, React Testing Library, JSDOM
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm
- Firebase project with Firestore and Authentication

### Install

```bash
cd teno-web && npm install
cd ../teno-extension && npm install
```

### Environment Variables

Configure your credentials by copying `.env.example` in each directory:

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

To start the web application:

```bash
cd teno-web
npm run dev
```

Open `http://localhost:5173` in your browser.

To build the browser extension in watch mode:

```bash
cd teno-extension
npm run dev
```

Load the unpacked extension directory from `teno-extension/dist` into `chrome://extensions/`.

## Scripts

In `teno-web`:

- `npm run dev`: start the Vite development server.
- `npm run test`: run the Vitest test suite.
- `npm run build`: compile the production web client.

In `teno-extension`:

- `npm run dev`: run Vite in watch mode for the extension.
- `npm run build`: build the production extension bundle.

## Tests

Run the test suite:

```bash
cd teno-web
npm run test
```

The test suite includes 13 test files and about 342 test cases. Tests verify:

- Prompt card editing, searching, and version increments
- Links and shopping cart modal actions
- Dual-theme token switching
- Background timer countdowns and desktop notification triggers

## Project Structure

```text
TeNo/
├── docs/            # Architecture and theme specifications
├── teno-extension/  # Manifest V3 Chrome Extension
│   ├── src/         # Extension scripts, popup, and background workers
│   ├── public/      # Manifest.json and icons
│   └── package.json # Extension dependencies and scripts
├── teno-web/        # Web dashboard application
│   ├── api/         # Vercel serverless function endpoints
│   ├── src/         # Components, pages, context, and styles
│   ├── tests/       # Vitest suites and mocks
│   └── package.json # Web dependencies and scripts
└── README.md        # Project documentation
```

## Deployment

The web application deploys to Vercel.

- Build command: `npm run build` in `teno-web`
- Output directory: `teno-web/dist`
- Serverless API routes: hosted in `teno-web/api/`
- Extension build: packaged from `teno-extension/dist` for distribution

## Author and License

Created by Vishal Muralidharan.
Distributed under the MIT License.

# TeNo - The Keyboard-First Browser Companion

TeNo is a keyboard-first personal browser companion for saving links, tracking reminders, managing a shopping cart list, and running a built-in timer from one minimal interface.

This repository contains both the standalone web application (`teno-web`) and the browser extension (`teno-extension`). Both versions share the same Firebase Authentication and Firestore backend for user accounts and data sync.

## Why TeNo

TeNo is designed as a fast command-center style utility:

- One interface for daily browsing tasks
- Authenticated, user-scoped data in Firestore
- Keyboard shortcuts for faster navigation
- Simple terminal-inspired UI for distraction-free use

## Project Structure

```text
TeNo/
├── teno-web/           # Standalone web application (React + Vite)
└── teno-extension/     # Browser extension (React + Vite + Chrome APIs)
```

## Core Features

- **User authentication**
  - Email/password login and registration
  - Logout support
- **Saved links manager**
  - Save URL with nickname and description
  - Favorite/unfavorite links
  - Edit and delete links
  - Move items up/down for manual ordering
  - Open links quickly from keyboard shortcuts `[1]` to `[9]`
- **Cart links manager**
  - Same link management behavior, backed by a separate Firestore collection
- **Reminders**
  - Add, edit, reorder, and complete reminders
- **Timer**
  - Stopwatch mode
  - Countdown mode with minute input
  - Pause, stop, and reset controls
- **Tabbed workspace**
  - Links, Cart, Reminders, Timer
  - Cycle tabs with keyboard shortcut `S`

## Keyboard Shortcuts

- `S`: switch to next top navigation tab
- `1` to `9` (inside link tabs): open corresponding saved link quickly

## Extension Details

The browser extension (`teno-extension`) provides the same minimal interface as the web application but is optimized for the browser environment:
- Optionally replaces the New Tab page or operates as a standalone popup
- Uses `chrome.*` integrations (like `chrome.storage` and `chrome.alarms`) for tighter browser coupling (e.g. background timer execution).
- Serves as a persistent, distraction-free command center that is just one click or new tab away.

## Notes

- The UI uses a terminal-inspired lowercase visual style by design.

## License

ISC

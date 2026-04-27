# TeNo

**TeNo** is a sleek, minimalist multi-tab productivity tool designed directly for Chromium browsers (Chrome, Brave, Edge). It runs exclusively as a responsive natively-styled Side Panel Extension, heavily characterized by its striking monochromatic aesthetic.

## 🛠 Tech Stack

* **Frontend Engine:** React.js + Vite
* **Browser Architecture:** Chrome Extensions Manifest V3 (Side Panel API)
* **Backend Storage:** Firebase V10 (Cloud Firestore)
* **Icons:** Lucide React
* **Styling:** Vanilla CSS (Zero UI frameworks)

## 📌 Core Features

The panel features a snappy, swipe-animated interface with 4 dedicated productivity lanes:

1. **Links (\`saved_links\`)**
   Save websites fast. Automatically pulls Google Favicons based on domains. Includes custom nicknames, secondary descriptions, and a toggleable "Star/Favorite" prioritization sorter tracking to Firestore. 
   
2. **Cart (\`cart_items\`)**
   A dedicated bucket identical to Links, specifically designed for hoarding items, shopping lists, or e-commerce drops you need continuous quick access to without cluttering standard reading links.

3. **Reminders (\`reminders\`)**
   Dead-simple pipeline for daily to-dos. Clean, custom-styled terminal checkboxes instantly strike out and delete items straight through to the Firebase server natively.

4. **Background Timer**
   A robust, huge unified digital clock. 
   * Provides a hybrid mechanism: Enter a target minute value to spin up a **Countdown**, or fire it blank to start a standard **Stopwatch**.
   * Employs Chromium's background `chrome.alarms` and `chrome.storage.local` memory mapping so you can close the extension safely, and the countdown reliably fires a desktop notification regardless of JavaScript background sleep-states!

## 🚀 How to Use

1. Go to the Releases page: https://github.com/vishal-muralidharan/TeNo/releases
2. Download the latest extension package from the newest release.
3. Extract the downloaded file.
4. Open your browser Extensions Dashboard (e.g. `chrome://extensions/`).
5. Enable **Developer Mode**.
6. Click **Load Unpacked** and select the extracted folder.

## Firebase Auth Setup (Required)

If sign-in fails in the side panel, verify all of the following:

1. Create a `.env` (or `.env.local`) with:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
2. In Firebase Console -> Authentication -> Sign-in method:
   - Enable **Email/Password**
3. Rebuild and reload the unpacked extension after any auth or manifest changes.

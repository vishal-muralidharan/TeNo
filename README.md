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

## 🚀 How to Run Locally

1. Clone or download the source code.
2. Open your terminal inside the project directory.
3. Create your local env file from the template:
   ```bash
   cp .env.example .env.local
   ```
4. Add your Firebase project values to `.env.local`.
5. Install dependencies:
   ```bash
   npm install
   ```
6. Build the final application for extensions:
   ```bash
   npm run build
   ```
7. Open your browser's Extensions Dashboard (e.g. `chrome://extensions/`), enable **Developer Mode**, click **Load Unpacked**, and select the generated \`/dist\` folder.

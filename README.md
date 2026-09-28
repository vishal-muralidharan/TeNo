# TeNo

**TeNo** is a highly polished, dual-theme productivity and bookmarking tool designed to seamlessly manage links, a reading/wishlist cart, and quick reminders. TeNo combines modern aesthetic sensibilities with a high-performance architecture to deliver an optimal user experience across the web and a dedicated browser extension.

## Tech Stack
- **Frontend Framework**: React, Vite
- **Backend & Database**: Firebase Auth, Cloud Firestore
- **Serverless API**: Vercel Serverless Functions
- **Styling**: Pure CSS (Custom Dual-Theme Engine)

## Quick Start / Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TeNo
   ```

2. **Setup environment variables**
   Copy the example environment files and fill in your Firebase configuration:
   ```bash
   cp teno-web/.env.example teno-web/.env.local
   cp teno-extension/.env.example teno-extension/.env
   ```

3. **Install dependencies and run the Web App**
   ```bash
   cd teno-web
   npm install
   npm run dev
   ```

4. **Install dependencies and run the Extension**
   ```bash
   cd teno-extension
   npm install
   npm run dev
   ```
   Load the unpacked extension from the `teno-extension/dist` folder in your browser.

## Index of Features

To dive deeper into the architecture and functionality of TeNo, please explore the following documentation:

- [Dual Theme System](docs/features/dual-theme-system.md) - Learn about the Minimalist vs Modern styling architecture.
- [Collaboration & Sharing](docs/features/collaboration-and-sharing.md) - Discover the unified label architecture and role-based access control (RBAC).
- [Core Modules](docs/features/core-modules.md) - Understand the primary functional tabs: Links, Cart, Reminders, and Timer.
- [Settings & Compliance](docs/features/settings-and-compliance.md) - Details on data export (GDPR/DPDP) and server-side account deletion.

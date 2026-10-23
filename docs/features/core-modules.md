# Core Modules

TeNo is divided into five primary functional modules, each represented by a dedicated tab in the application.

## 1. Links (Bookmarks)
The Links module acts as a high-speed bookmark manager.
- **Data Structure**: Stores a URL, optional alternative URL (`altUrl`), Domain, Nickname, and Label. 
- **Key Features**: 
  - Dual-favicon rendering for links with an alternate source (e.g., saving a product from both Amazon and a local retailer).
  - One-click copy functionality.
  - Integration with the browser extension for instant saving from any active tab.
- **UI Components**: Rendered primarily via `<LinkStorer />` and `<LinkList />`.

## 2. Cart (Wishlists & Saved Items)
The Cart module is optimized for tracking items to purchase, read, or review later.
- **Data Structure**: Similar to Links, but tailored for commerce/media with fields for price or priority.
- **Key Features**:
  - Checkbox interactions to mark items as "purchased" or "completed".
  - Clean separation from general reference bookmarks.
- **UI Components**: Handled by `<CartList />` utilizing the shared layout architecture.

## 3. Reminders (Todos)
A minimalist, high-efficiency task manager.
- **Data Structure**: Stores task text, completion status, and optional labels.
- **Key Features**:
  - Lightning-fast inline editing.
  - Seamless drag-and-drop or status toggling.
  - Supports label sharing, meaning teams can use Reminders as a shared lightweight kanban/todo board.
- **UI Components**: Rendered by `<Reminders />`.

## 4. Timer
A productivity utility designed to keep users focused without leaving their dashboard.
- **Key Features**:
  - Pomodoro-style countdown timer.
  - Native browser notifications upon completion.
  - Floating UI that persists state even when navigating between other tabs.
- **UI Components**: Managed by `<Timer />` and related context hooks.

## 5. Prompts (AI/LLM Prompt Vault & Version Control)
The Prompts module stores, organizes, and version-controls rich text prompts for Large Language Models (LLMs).
- **Data Structure**: Stores root `prompts` documents containing `title`, `labelId`, `ownerId`, `memberUids`, `currentVersionId`, and a `versions` array containing immutable version records (`id`, `content`, `createdAt`).
- **Key Features**:
  - Explicit Version Control: Users can either update the current version or branch into a new version (`v1`, `v2`, ...).
  - State-Aware Immutability: Historical/archived versions are strictly read-only with locked inputs and disabled save mutations, while offering 1-click clipboard copying.
  - Card Clearance & Geometry: Spacious cards (`minmax(360px, 1fr)`, `min-height: 150px`) with 4-line preview clamping to comfortably accommodate multi-action toolbars (`[ copy ]`, `[ edit ]`, `[ del ]`) and version badges.
  - Cross-Platform Parity: Full creation and versioning management in `teno-web`, paired with a dedicated read-only 1-click copy console in `teno-extension`.
- **UI Components**:
  - Web: `<PromptsTab />`, `<PromptCard />`, `<PromptEditorModal />`.
  - Extension: `<Prompts />`.


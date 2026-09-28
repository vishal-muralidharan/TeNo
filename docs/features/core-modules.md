# Core Modules

TeNo is divided into four primary functional modules, each represented by a dedicated tab in the application.

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

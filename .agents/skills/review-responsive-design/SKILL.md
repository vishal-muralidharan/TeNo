---
name: review-responsive-design
description: >-
  Use this skill whenever building, modifying, or auditing UI components, pages, modals,
  and stylesheets across teno-web and teno-extension. Ensures interfaces support both Minimalist
  and Modern dual themes on web, adhere to extension popup viewport bounds, respect dynamic viewport heights (dvh),
  handle virtual keyboards, apply safe area insets, prevent iOS auto-zoom, and maintain accessible touch targets in Pure CSS.
---

# Review Responsive Design & Styling (Web & Extension)

This skill defines the mandatory responsive design architecture, viewport standards, and styling guidelines across both the **Web (`teno-web`)** and **Extension (`teno-extension`)** versions of TeNo.

---

## 1. Web vs. Extension Viewport Foundations

TeNo presents two distinct interaction surfaces with vastly different layout and viewport constraints:

| Aspect | `teno-web` (Full Web Dashboard) | `teno-extension` (Browser Popup) |
| :--- | :--- | :--- |
| **Viewport Size** | Variable: 320px mobile to 2560px ultra-wide | Fixed / Constrained: ~380px–450px width, max 600px height |
| **Styling Engine** | Pure CSS Dual-Theme (`minimal` vs `modern`) | Pure CSS compact console/hacker aesthetic |
| **Outer Scrollbar** | Browser window / document level | **Prohibited:** Outer popup must not double-scroll; `overflow: hidden` on body |
| **Inner Scrollbar** | Responsive sections & cards | Dedicated `.tab-pane` / content scroll with `overflow-y: auto` |
| **Modals & Overlays** | Viewport-centered modals (`ConfirmModal`, `ShareModal`) | Compact inline or portal modals bounded by popup window |
| **Input Typography** | Dynamic tokens, 16px font on mobile | 16.5px monospace typography, lowercase transformation |

---

## 2. Web Responsive Design & Dual-Theme Engine (`teno-web`)

### A. Dual-Theme Architectural System
All web styling is governed by root variables and theme selectors dynamically applied to the `<html>` root by `ThemeContext.jsx`:
* `data-theme`: `"dark"` | `"light"`
* `data-style`: `"minimal"` | `"modern"`

| Aspect | Minimalist Theme (`[data-style="minimal"]`) | Modern Theme (`[data-style="modern"]`) |
| :--- | :--- | :--- |
| **Aesthetic** | Brutalist, hacker, terminal-inspired | Premium, consumer-friendly, soft glassmorphism |
| **Typography** | `'Fira Code'`, monospace | `'Plus Jakarta Sans'`, `'Inter'`, sans-serif |
| **Borders & Radii** | Sharp, zero radius (`--border-radius: 0px`) | Rounded (`--border-radius: 12px` or `16px`) |
| **Shadows & Elevation** | Flat, no shadows (`--shadow-card: none`) | Layered elevation (`--shadow-card: 0 4px 6px ...`) |
| **UI Labels & Chrome** | Monospaced text brackets (e.g. `[ delete ]`, `> [ + add_new ]`) | Lucide icons, tactile buttons, soft transitions |
| **Text Transform** | `lowercase` | `none` |

### B. Consuming the Translation Dictionary (`uiConfig.jsx`)
Never hardcode style-specific strings or icons directly in web components:
```jsx
import { useTheme } from '../ThemeContext';
import { getUiConfig } from '../utils/uiConfig';

export default function MyComponent() {
  const { styleMode } = useTheme();
  const ui = getUiConfig(styleMode);
  const isModern = styleMode === 'modern';

  return (
    <button type="button" className={`action-btn ${isModern ? 'action-btn--modern' : ''}`}>
      {ui.confirm.delete}
    </button>
  );
}
```

### C. Web Media Query Breakpoints
```css
@media (max-width: 1199px) { /* Laptops / Small Desktops */ }
@media (max-width: 899px)  { /* Tablets / Horizontal Phones */ }
@media (max-width: 599px)  { /* Mobile Devices (Portrait) */ }
@media (max-width: 360px)  { /* Small Mobile Screens */ }
```

### D. Web Viewport & Modal Safety
- **Dynamic Viewport Height:** Modals must use `max-height: 85dvh` with `overflow-y: auto`.
- **iOS Safari 16px Font Rule:** Form inputs must enforce at least `16px` font size on mobile screens (`max-width: 599px`) to prevent browser auto-zooming.
- **Body Scroll Locking:** When a modal is open, lock `document.body.style.overflow = 'hidden'`.

---

## 3. Extension Popup Viewport Architecture (`teno-extension`)

Browser extensions run in a strictly sandboxed popup window managed by Chrome/Firefox/Edge.

### A. Fixed Popup Dimensions & Containment
- The extension popup window is hard-capped by browser limits (maximum 800x600px, standard 400x550px).
- **Rule:** Never allow horizontal scroll in the extension popup. Container width must be 100%.
- The body container must enforce strict bounds:
  ```css
  body {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    margin: 0;
    border: none;
    font-size: 16.5px;
  }
  
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  ```

### B. Extension Modal & Form Ergonomics
1. **No External Dialogs:** Never trigger native browser `window.confirm()` or `window.alert()` in the extension popup. On some browsers, opening a native prompt closes the extension popup immediately, causing data loss.
2. **Compact Modal Overlays:** Custom modals in the extension (e.g. pending delete in `LinkStorer.jsx`) must fit comfortably within the ~400px width with compact padding (e.g. `12px`), utilizing `max-height: 80vh` and internal scrolling.
3. **Scroll Containment in Tab Panes:**
   - Content areas (`.tab-pane`, list sections) must manage vertical scrolling with `overflow-y: auto`.
   - Prevent scroll rubber-banding with `overscroll-behavior: contain`.

### C. Terminal & Bottom Drawer in Extension
- In `teno-extension`, `<Terminal />` slides up from the bottom.
- When the terminal is open, the height of the active tab pane must be adjusted (`padding-bottom` or calc) so that the lowest items and action buttons remain fully visible and clickable above the terminal header.

---

## 4. Accessible Touch & Click Targets

Across both Web and Extension:
- Interactive icon buttons (`.icon-btn`), tabs, and action pills must provide a minimum hit target of **44x44px** (or use sufficient padding on small icons).
- Use `touch-action: manipulation` to prevent double-tap zoom delay on mobile web devices.

---

## 5. Pre-Commit Styling & Viewport Checklist

Before committing any UI or styling change, verify:
- [ ] **Web Dual-Theme Symmetry:** Does the component render correctly in BOTH Minimalist (`[data-style="minimal"]`) and Modern (`[data-style="modern"]`) styles?
- [ ] **Web Light & Dark Mode:** Are contrast ratios accessible in both `[data-theme="dark"]` and `[data-theme="light"]`?
- [ ] **Web Viewport Height Safety:** Do web modals use `max-height: 85dvh` with `overflow-y: auto`?
- [ ] **Web 16px Font Rule:** Do mobile form inputs enforce 16px font size to prevent iOS Safari auto-zoom?
- [ ] **Extension Popup Containment:** Does the extension popup fit within ~400x550px without horizontal scroll or double vertical scrollbars?
- [ ] **Extension Modal Safety:** Are extension confirmation modals compact and non-native (no `window.confirm`)?
- [ ] **Zero Clipping:** Are bottom action buttons accessible above terminal drawers and keyboard boundaries?

---
name: review-responsive-design
description: >-
  Use this skill whenever building, modifying, or auditing UI components, pages, modals,
  and stylesheets in TeNo. Ensures interfaces support both Minimalist and Modern dual themes,
  remain fully responsive across mobile, tablet, and desktop viewports, respect dynamic viewport heights (dvh),
  handle virtual keyboards, apply safe area insets, prevent iOS auto-zoom, and maintain accessible touch targets in Pure CSS.
---

# Review Responsive Design & Dual-Theme System

This skill defines the mandatory responsive design architecture, mobile viewport standards, and dual-theme guidelines for the **TeNo** repository. Use it whenever creating or updating any UI component, page, modal, or stylesheet.

---

## 1. Dual-Theme Architectural Foundation

TeNo utilizes a custom **Pure CSS Dual-Theme Engine** without utility frameworks like Tailwind CSS. All styling is governed by root variables and theme selectors dynamically applied to the `<html>` root by `ThemeContext.jsx`:

* `data-theme`: `"dark"` | `"light"`
* `data-style`: `"minimal"` | `"modern"`

### A. The Two Aesthetic Personalities

| Aspect | Minimalist Theme (`[data-style="minimal"]`) | Modern Theme (`[data-style="modern"]`) |
| :--- | :--- | :--- |
| **Aesthetic** | Brutalist, hacker, terminal-inspired | Premium, consumer-friendly, soft glassmorphism |
| **Typography** | `'Fira Code'`, monospace | `'Plus Jakarta Sans'`, `'Inter'`, sans-serif |
| **Borders & Radii** | Sharp, zero radius (`--border-radius: 0px`) | Rounded (`--border-radius: 12px` or `16px`) |
| **Shadows & Elevation** | Flat, no shadows (`--shadow-card: none`) | Layered elevation (`--shadow-card: 0 4px 6px ...`) |
| **UI Labels & Chrome** | Monospaced text brackets (e.g. `[ delete ]`, `> [ + add_new ]`) | Lucide icons, tactile buttons, soft transitions |
| **Text Transform** | `lowercase` | `none` |

### B. The Translation Dictionary (`uiConfig.jsx`)
Never hardcode style-specific strings or icons directly in components. Consume the translation dictionary:
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

---

## 2. Responsive Breakpoint Standards in Pure CSS

TeNo layouts adapt across screen sizes using standard media queries in `teno-web/src/index.css`:

```css
/* Standard Breakpoints */
@media (max-width: 1199px) { /* Laptops / Small Desktops */ }
@media (max-width: 899px)  { /* Tablets / Horizontal Phones */ }
@media (max-width: 599px)  { /* Mobile Devices (Portrait) */ }
@media (max-width: 360px)  { /* Small Mobile Screens */ }
```

### Mobile Layout Behaviors (`max-width: 599px`):
1. **Grid to Stack:** Multi-column grids (like `.label-sections-grid` or bookmark card groups) must collapse into a clean single column.
2. **Form Layouts:** Input fields and action buttons in add/edit bars stack vertically to avoid horizontal compression.
3. **Typography & Spacing:** Container padding steps down from `24px` to `12px` or `16px`.

---

## 3. Viewport & Modal Safety

### Dynamic Viewport Heights (`dvh` vs `vh`)
Classic `100vh` causes mobile browser navigation bars to push bottom buttons off-screen.
- Always use `dvh` (Dynamic Viewport Height) or bounded `clamp()` for full-screen containers, overlays, and modals:
  ```css
  max-height: 90dvh;
  max-height: calc(100dvh - 32px);
  ```

### Modal Container Structure (`ConfirmModal`, `ShareModal`, `MembersModal`)
Every modal overlay and card must adhere to these container safety principles:
```css
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
}

/* Modal Window */
.modal-window {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px var(--border-style) var(--border-color);
  border-radius: var(--border-radius);
  max-width: 520px;
  width: 100%;
  max-height: 85dvh;
  overflow-y: auto;
  padding: 24px;
}
```

### Background Scroll Locking
When a modal is open, prevent background scroll chaining:
```jsx
useEffect(() => {
  if (!isOpen) return;
  const original = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = original;
  };
}, [isOpen]);
```

---

## 4. Mobile Form Ergonomics & iOS Safari Rules

### The 16px Font Rule (Preventing iOS Safari Auto-Zoom)
On iOS Safari, focusing an input (`<input>`, `<select>`, `<textarea>`) with `font-size < 16px` triggers automatic browser zooming that breaks layouts and clips action buttons.
- **Rule:** Form inputs must enforce at least `16px` font size on mobile screens:
  ```css
  @media (max-width: 599px) {
    input, textarea, select {
      font-size: 16px !important;
    }
  }
  ```

### Touch Targets (Minimum 44x44px)
- Every clickable button, icon button (`.icon-btn`), and tab must provide a touch target of at least **44x44px** (or use generous padding around small SVGs).
- Use `touch-action: manipulation` to disable the 300ms double-tap zoom delay on mobile devices:
  ```css
  button, .icon-btn {
    touch-action: manipulation;
  }
  ```

### Virtual Keyboard Tolerance
When the virtual keyboard appears:
- Bounded modal containers with `max-height: 85dvh` and `overflow-y: auto` automatically adapt and allow scrolling to inputs and buttons.

---

## 5. Pre-Commit Responsive & Theme Checklist

Before committing any UI or styling change, verify:
- [ ] **Dual-Theme Verification:** Does the component render correctly in BOTH Minimalist (`[data-style="minimal"]`) and Modern (`[data-style="modern"]`) styles?
- [ ] **Light & Dark Mode:** Are contrast ratios accessible in both `[data-theme="dark"]` and `[data-theme="light"]`?
- [ ] **Viewport Height Safety:** Do modals or slide-overs use `max-height: 85dvh` with `overflow-y: auto`?
- [ ] **Touch Target Sizing:** Are interactive buttons and icons at least 44x44px on mobile viewports?
- [ ] **16px Font Rule:** Do mobile form inputs enforce 16px to prevent iOS Safari auto-zoom?
- [ ] **Zero Horizontal Overflow:** Does the layout scroll purely vertically without unwanted horizontal overflow on 360px and 390px widths?
- [ ] **Body Scroll Locking:** Do modal dialogs lock `document.body.style.overflow` while open?

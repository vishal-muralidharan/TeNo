---
name: maintain-minimalist-ui
description: >-
  Use this skill whenever creating new UI components or modifying existing ones across teno-web and teno-extension.
  Ensures strict preservation of the Minimalist (terminal/brutalist) design language, including zero border radius,
  bracketed button labels, monospace typography, terminal prefixes, absence of graphical icons, lowercase text transforms,
  high-contrast flat borders, and complete synchronization with uiConfig.jsx and themeTranslations.js.
---

# Maintain Minimalist UI Elements & Design Integrity (Web & Extension)

This skill defines the mandatory standards, architectural conventions, and implementation patterns required to preserve TeNo's signature **Minimalist (terminal/brutalist)** UI language whenever creating new components or modifying existing ones across **`teno-web`** and **`teno-extension`**.

---

## 1. Minimalist Design Philosophy & Core Principle

TeNo's identity is rooted in its hacker-centric, high-efficiency, terminal-inspired minimalist aesthetic. 

> **The Golden Rule:** When adding new features or modifying existing components, you must **maintain the UI elements in minimalist as it is**. Never dilute, soften, modernise, or break the minimalist interface. All consumer-friendly embellishments (rounded corners, soft shadows, glassmorphism, Lucide icons) belong **exclusively** in the Modern theme (`[data-style="modern"]`).

---

## 2. Minimalist UI Specification Matrix

| UI Attribute | Minimalist Specification (`[data-style="minimal"]`) | Modern Counterpart (`[data-style="modern"]`) |
| :--- | :--- | :--- |
| **Typography** | `'Fira Code'`, monospace (`var(--font-mono)`) | `'Plus Jakarta Sans'`, `'Inter'`, sans-serif |
| **Border Radius** | Strictly `0px` (`--border-radius: 0px`) | Rounded (`8px`, `12px`, `16px`, pill shapes) |
| **Elevation & Shadow** | Flat: `box-shadow: none` (`--shadow-card: none`) | Layered elevation (`0 4px 6px ...`) |
| **Glassmorphism / Blur**| **Prohibited**: no `backdrop-filter: blur()` | Translucent frosted glass |
| **Action Buttons** | Bracket-enclosed text: e.g. `[ delete ]`, `[+ add_new]` | Tactile rounded buttons with Lucide icons |
| **Action / Status Badges**| Bracketed monospaced tags: `[shared]`, `[owner]` | Pill chips with status dots: `● Shared` |
| **Section Headings** | Terminal path prefix: `> ./<section_name>` | Clean text without prefix |
| **Terminal / Prompt** | `$_ ` or `> ` shell prefixes | Clean search / command bars |
| **Graphical Icons** | **Prohibited**: No SVG or Lucide icons in minimal | Lucide SVG icons (`<Settings />`, `<Plus />`, etc.) |
| **Text Transform** | `lowercase` (`var(--text-transform): lowercase`) | `none` (Sentence or Title case) |
| **Interactive States** | Terminal inversion: high-contrast inverted monochrome | Soft glow, scale, or tinted hover fill |
| **Borders** | 1px solid/dashed/dotted monochrome lines | Soft subtle borders or semi-transparent outlines |

---

## 3. Mandatory Rules for Component Creation & Modification

### Rule 1: Zero-Radius & Flat Elevation Enforcement
* All containers, inputs, buttons, modals, dropdowns, and cards in Minimalist mode must have sharp, 90-degree corners.
* Never hardcode `border-radius: 4px` (or any non-zero value) in base CSS selectors.
* Always use `var(--border-radius)` (which evaluates to `0px` in minimal mode) or scope rounded radii under `[data-style="modern"]` or `--modern` modifier classes:
  ```css
  /* Base / Minimalist default */
  .custom-card {
    border: 1px var(--border-style) var(--border-color);
    border-radius: var(--border-radius);
    background: var(--bg-surface);
    box-shadow: var(--shadow-card);
  }

  /* Modern override */
  [data-style="modern"] .custom-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  ```

### Rule 2: Strict Prohibition of Graphical Icons in Minimalist Mode
* **Never render Lucide or SVG icons in Minimalist mode.**
* In `uiConfig.jsx`, all icon properties must conditionally evaluate to `null` for non-modern styles:
  ```javascript
  icons: {
    settings: isModern ? <Settings size={14} strokeWidth={2} /> : null,
    addNew:   isModern ? <Plus size={14} strokeWidth={2.5} /> : null,
  }
  ```
* In JSX components, never render an icon directly without checking `isModern` or checking that the icon is non-null:
  ```jsx
  {isModern && ui.icons.addNew}
  ```

### Rule 3: ASCII Bracketed Notation for All Actions and Badges
* Every interactive button, link-action, or status badge in Minimalist mode must use bracket notation.
* Standard minimal bracket formats:
  - Add / Create: `[+ add_new]`, `> [ + add_new ]`, `[+ add]`
  - Delete / Remove: `[ delete ]`, `[ x ]`, `[ - close ]`
  - Confirmation: `[ yes ]`, `[ no ]`, `[ ok ]`, `[ cancel ]`
  - Collaboration: `[ ↗ share ]`, `[shared]`, `[owner]`
  - Navigation / Actions: `[ back ]`, `[ edit ]`, `[ save ]`, `[ copy ]`

### Rule 4: Single Source of Truth via `themeTranslations.js` & `uiConfig.jsx`
* Never hardcode display text or button labels directly inside component JSX.
* Always register new strings in `teno-web/src/utils/themeTranslations.js`:
  ```javascript
  // themeTranslations.js
  custom_action: {
    minimal: '[ do_action ]',
    modern: 'Do Action',
  },
  ```
* Map the string to `teno-web/src/utils/uiConfig.jsx`:
  ```javascript
  // uiConfig.jsx
  customAction: t('custom_action', styleMode),
  ```
* Consume `getUiConfig` in the component:
  ```jsx
  const { styleMode } = useTheme()
  const ui = getUiConfig(styleMode)
  const isModern = styleMode === 'modern'

  return (
    <button type="button" className={`action-btn ${isModern ? 'action-btn--modern' : ''}`}>
      {ui.customAction}
    </button>
  )
  ```

### Rule 5: Terminal Prefixes for Headings and Prompts
* Section titles in Minimalist mode use terminal path prefixes (`> ./`):
  ```css
  /* Minimalist only: show "> ./" prefix on tab headings */
  [data-style="minimal"] .tab-title::before {
    content: "> ./";
    color: var(--text-muted);
  }

  [data-style="modern"] .tab-title::before {
    content: none;
  }
  ```
* Command lines, search bars, and log elements use shell prompt prefixes: `$_ ` or `> `.

### Rule 6: Terminal Inversion for Hover / Focus
* In Minimalist mode, interactive elements should utilize high-contrast monochrome inversion on hover and focus:
  ```css
  .minimal-btn:hover {
    background-color: var(--text-primary);
    color: var(--bg-app);
  }
  ```

### Rule 7: Extension (`teno-extension`) Compact Console Integrity
* The browser extension popup runs in a compact console format that mirrors the Minimalist philosophy.
* When porting or modifying components in `teno-extension`:
  - Preserve the compact 0px border-radius, bracketed text, and dense layout.
  - Do not introduce large padding, soft drop-shadows, or graphical icon bloat that displaces information in the constrained ~400px popup window.

### Rule 8: Multi-Button Action Hierarchy & High-Contrast Resting States
* Minimalist mode relies on stark monochrome contrast. When multiple action buttons appear in modals, forms, or toolbars (e.g. primary commit, secondary save-as, tertiary cancel):
  - **Primary Action:** Solid fill with inverted text:
    ```css
    background: var(--text-primary);
    color: var(--bg-surface);
    border: 1px solid var(--text-primary);
    ```
  - **Secondary / Alternative Action:** Transparent background with crisp outline:
    ```css
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--text-primary);
    ```
  - **Tertiary / Cancel / Muted Action:** Transparent background with muted border:
    ```css
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border-color);
    ```
* **Prohibited:** Never use low-contrast surface-on-surface fills (e.g. `--bg-surface-hover` as a static resting background). In dark minimal mode, this causes buttons to blend invisibly into the modal/page background.
* Always verify that every button remains clearly visible in both dark (`[data-theme="dark"]`) and light (`[data-theme="light"]`) modes.

### Rule 9: Horizontal Action Clearance in Minimalist Grids
* ASCII bracketed buttons (`[ copy ]`, `[ edit ]`, `[ del ]`) occupy significantly more horizontal space (~30–45px per button) than compact graphical icons.
* Cards or grid items containing multiple bracketed actions must scale their grid column widths:
  - Enforce minimum column width of `>= 350px` (e.g. `grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))`).
  - Ensure the header row has at least `140px` available for the entity title and version badge alongside the bracketed action group, preventing cramped title wrapping.

### Rule 10: Zero-Layout-Shift Transient Feedback
* Status transitions (e.g. changing `[ copy ]` to `[ copied ]`, or `[ save ]` to `[ saving... ]`) must never cause the button or containing card to expand horizontally.
* Enforce layout stability using either:
  1. A reserved button `min-width` with `box-sizing: border-box; text-align: center;` sized to accommodate the widest state.
  2. An absolute, non-displacing terminal status toast:
     ```css
     .prompt-card-toast {
       position: absolute;
       bottom: 6px;
       right: 12px;
       pointer-events: none;
       background: var(--bg-surface);
     }
     ```

---

## 4. Pre-Implementation Checklist for Minimalist UI Preservation

Before completing any UI component addition or modification, verify each item:

```text
[ ] 1. BORDERS & RADII: Are all borders sharp (0px radius) in Minimalist mode?
[ ] 2. NO ICONS IN MINIMAL: Are all Lucide/SVG icons hidden or null in Minimalist mode?
[ ] 3. BRACKETS: Are action buttons and status badges formatted with ASCII brackets (e.g. [ action ])?
[ ] 4. TRANSLATIONS: Are strings registered in themeTranslations.js for both minimal (lowercase/bracketed) and modern?
[ ] 5. UI CONFIG: Are labels and conditional icons exposed through uiConfig.jsx?
[ ] 6. TYPOGRAPHY: Does text default to lowercase and monospace in Minimalist mode?
[ ] 7. NO BLUR/GLASS: Are backdrop-filter and box-shadow excluded from Minimalist mode?
[ ] 8. HOVER STATES: Do interactive elements use terminal monochrome inversion rather than soft modern glows?
[ ] 9. BUTTON CONTRAST: Do all action buttons (primary, secondary, cancel) have high-contrast borders and text in both dark and light modes?
[ ] 10. ACTION CLEARANCE: Do grid cards scale (>= 350px) to clear all bracketed buttons without title wrapping?
[ ] 11. ZERO LAYOUT SHIFT: Does transient feedback (copied/saved) avoid elongating buttons or shifting surrounding layout?
[ ] 12. EXTENSION PARITY: Does the component maintain compact console styling without overflow in teno-extension?
```

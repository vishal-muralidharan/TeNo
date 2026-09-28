# Dual Theme System

TeNo implements a highly customized dual-theme architecture, providing users with two distinct visual experiences: **Minimalist** and **Modern**.

## The Themes

### 1. Minimalist (Brutalist / Terminal)
The Minimalist theme is designed for maximum efficiency and a developer-centric aesthetic. It utilizes monospaced typography, stark high-contrast borders, bracket-enclosed navigation, and a lack of traditional GUI chrome. It focuses purely on data density and speed.

### 2. Modern (Glassmorphism)
The Modern theme offers a premium, consumer-facing UI. It incorporates glassmorphic effects (translucent backgrounds with blur), rounded corners, soft gradients, dynamic hover states, and richer typography. This theme feels native to modern operating systems and provides a visually softer, more tactile experience.

## Technical Implementation

### `ThemeContext.jsx`
The state and logic for theme switching are managed globally by the `ThemeContext`.
- It tracks the current `styleMode` (`'minimal'` or `'modern'`).
- It syncs the user's preference to `localStorage`.
- It dynamically applies a `data-style` attribute to the document `<html>` tag, which serves as the root selector for all theme-specific CSS overrides.

### CSS File Splitting
To maintain clean styling architecture, the CSS is broken down logically:
- **`base.css`**: Contains CSS reset, core variables (colors, fonts), structural layout foundations, and shared utilities.
- **`theme-minimalist.css`**: Scoped rules that activate when `[data-style="minimal"]` is present. It strips rounding, enforces sharp borders, and applies a terminal-like appearance.
- **`theme-modern.css`**: Scoped rules that activate when `[data-style="modern"]` is present. It introduces `backdrop-filter: blur()`, rounded borders, and subtle shadow overlays.

### Translation Dictionary (`utils/uiConfig.js`)
Because the text and iconography heavily differ between themes (e.g., a button might say `[ delete ]` in Minimalist but just display a Trash icon in Modern), TeNo uses a translation dictionary.
`uiConfig.js` exports a configuration object that components consume. Based on the active `styleMode`, the components dynamically render the correct labels, prefixes, or SVG icons.

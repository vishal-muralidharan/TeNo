/**
 * themeTranslations.js
 *
 * Single source of truth for all UI text strings, mapped by styleMode.
 * Think of "minimal" and "modern" as two separate UI "languages".
 *
 * Usage:
 *   import { t } from '../utils/themeTranslations'
 *   const label = t('logo_text', styleMode)  // => "teno" or "TeNo"
 *
 * No React/JSX in this file — pure JS so it can be consumed anywhere.
 * For icon components alongside text, use uiConfig.jsx which imports from here.
 */

export const themeTranslations = {
  // ── Logo ─────────────────────────────────────────────────────────────────
  logo_text: {
    minimal: 'teno',
    modern: 'TeNo',
  },

  // ── Navigation / Header actions ───────────────────────────────────────────
  nav_settings: {
    minimal: 'settings',
    modern: 'Settings',
  },
  nav_logout: {
    minimal: 'logout',
    modern: 'Log out',
  },
  nav_back: {
    minimal: 'back',
    modern: 'Back',
  },

  // ── Tab labels ────────────────────────────────────────────────────────────
  tab_links: {
    minimal: 'links',
    modern: 'Links',
  },
  tab_cart: {
    minimal: 'cart',
    modern: 'Cart',
  },
  tab_reminders: {
    minimal: 'reminders',
    modern: 'Reminders',
  },
  tab_timer: {
    minimal: 'timer',
    modern: 'Timer',
  },

  // ── Add / action buttons ──────────────────────────────────────────────────
  add_link: {
    minimal: '[+ add_new]',
    modern: 'Add New Link',
  },
  add_item: {
    minimal: '[+ add_new]',
    modern: 'Add New Item',
  },
  add_reminder: {
    minimal: '[+ add_new]',
    modern: 'Add New Reminder',
  },
  toggle_form_open: {
    minimal: '> [ + add_new ]',
    modern: 'Add New',
  },
  toggle_form_close: {
    minimal: '> [ - close ]',
    modern: 'Close',
  },

  // ── Section heading prefixes ──────────────────────────────────────────────
  // Minimalist uses terminal-style "> ./" prefix; Modern removes it entirely.
  prefix_section: {
    minimal: '> ./',
    modern: '',
  },
  prefix_command: {
    minimal: '> ',
    modern: '',
  },

  // ── Terminal bar ──────────────────────────────────────────────────────────
  terminal_reopen: {
    minimal: '$_ terminal hidden. type to reopen.',
    modern: 'Terminal hidden — click to reopen',
  },

  // ── Confirm modals ────────────────────────────────────────────────────────
  confirm_logout_message: {
    minimal: 'confirm log out?',
    modern: 'Are you sure you want to log out?',
  },
  confirm_logout_yes: {
    minimal: '[ yes ]',
    modern: 'Log out',
  },
  confirm_logout_no: {
    minimal: '[ no ]',
    modern: 'Cancel',
  },
  confirm_delete_message: {
    minimal: 'confirm delete?',
    modern: 'Delete this item permanently?',
  },
  confirm_delete_yes: {
    minimal: '[ yes ]',
    modern: 'Delete',
  },
  confirm_delete_no: {
    minimal: '[ no ]',
    modern: 'Cancel',
  },

  // ── Settings page labels ──────────────────────────────────────────────────
  settings_heading_appearance: {
    minimal: 'appearance',
    modern: 'Appearance',
  },
  settings_heading_account: {
    minimal: 'account',
    modern: 'Account',
  },
  settings_heading_summary: {
    minimal: 'summary',
    modern: 'Summary',
  },
  settings_heading_click_stats: {
    minimal: 'click stats',
    modern: 'Click stats',
  },
  settings_change_password: {
    minimal: 'change password',
    modern: 'Change password',
  },
  settings_theme_label: {
    minimal: 'theme',
    modern: 'Theme',
  },
  settings_theme_dark: {
    minimal: 'dark',
    modern: 'Dark',
  },
  settings_theme_light: {
    minimal: 'light',
    modern: 'Light',
  },
  settings_style_mode_label: {
    minimal: 'style mode',
    modern: 'Style mode',
  },
  settings_style_minimal: {
    minimal: 'minimalist',
    modern: 'Minimalist',
  },
  settings_style_modern: {
    minimal: 'modern',
    modern: 'Modern',
  },

  // ── Form placeholders ─────────────────────────────────────────────────────
  placeholder_search: {
    minimal: 'search...',
    modern: 'Search...',
  },
}

/**
 * t(key, styleMode) — translate a UI string.
 *
 * @param {string} key       - A key from themeTranslations
 * @param {string} styleMode - 'minimal' | 'modern'
 * @returns {string}
 *
 * Example:
 *   t('logo_text', 'modern')  // => "TeNo"
 *   t('logo_text', 'minimal') // => "teno"
 */
export const t = (key, styleMode) => {
  const entry = themeTranslations[key]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[themeTranslations] Missing key: "${key}"`)
    }
    return key
  }
  return entry[styleMode] ?? entry.minimal ?? ''
}

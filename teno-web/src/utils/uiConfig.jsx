/**
 * uiConfig.jsx
 *
 * Builds the full UI config object for a given styleMode.
 * Text strings are sourced from themeTranslations.js (the single source of truth).
 * Icons (React elements) are defined here since they require JSX.
 *
 * Usage:
 *   const ui = getUiConfig(styleMode)
 *   ui.logo           // => "TeNo" or "teno"
 *   ui.icons.settings // => <Settings /> or null
 *   ui.tabs.links     // => "Links" or "links"
 */
import { Plus, Settings, LogOut, ArrowLeft } from 'lucide-react'
import { t } from './themeTranslations'

export const getUiConfig = (styleMode) => {
  const isModern = styleMode === 'modern'

  return {
    // ── Logo ────────────────────────────────────────────────────────────────
    logo: t('logo_text', styleMode),

    // ── Header navigation ────────────────────────────────────────────────────
    nav: {
      settings: t('nav_settings', styleMode),
      logout:   t('nav_logout',   styleMode),
      back:     t('nav_back',     styleMode),
    },

    // ── Lucide icons (null in Minimal — no icons in terminal mode) ───────────
    icons: {
      settings: isModern ? <Settings  size={14} strokeWidth={2}   /> : null,
      logout:   isModern ? <LogOut    size={14} strokeWidth={2}   /> : null,
      back:     isModern ? <ArrowLeft size={14} strokeWidth={2}   /> : null,
      addNew:   isModern ? <Plus      size={14} strokeWidth={2.5} /> : null,
    },

    // ── Add buttons ──────────────────────────────────────────────────────────
    addBtn: {
      links:    t('add_link',     styleMode),
      cart:     t('add_item',     styleMode),
      reminder: t('add_reminder', styleMode),
    },

    // ── Tab label strings ─────────────────────────────────────────────────────
    tabs: {
      links:     t('tab_links',     styleMode),
      cart:      t('tab_cart',      styleMode),
      reminders: t('tab_reminders', styleMode),
      timer:     t('tab_timer',     styleMode),
    },

    // ── Toggle-form button labels ─────────────────────────────────────────────
    toggleForm: {
      open:  t('toggle_form_open',  styleMode),
      close: t('toggle_form_close', styleMode),
    },

    // ── Section heading prefix ────────────────────────────────────────────────
    prefix: {
      section: t('prefix_section', styleMode),
      command: t('prefix_command', styleMode),
    },

    // ── Terminal bar ──────────────────────────────────────────────────────────
    terminal: {
      reopenBar: t('terminal_reopen', styleMode),
    },

    // ── Confirm modal copy ────────────────────────────────────────────────────
    confirm: {
      logout: {
        message: t('confirm_logout_message', styleMode),
        confirm: t('confirm_logout_yes',     styleMode),
        cancel:  t('confirm_logout_no',      styleMode),
      },
      deleteItem: {
        message: t('confirm_delete_message', styleMode),
        confirm: t('confirm_delete_yes',     styleMode),
        cancel:  t('confirm_delete_no',      styleMode),
      },
    },

    // ── Settings headings ─────────────────────────────────────────────────────
    settings: {
      appearance:   t('settings_heading_appearance',   styleMode),
      account:      t('settings_heading_account',      styleMode),
      summary:      t('settings_heading_summary',      styleMode),
      clickStats:   t('settings_heading_click_stats',  styleMode),
      changePassword: t('settings_change_password',    styleMode),
      themeLabel:   t('settings_theme_label',          styleMode),
      themeDark:    t('settings_theme_dark',           styleMode),
      themeLight:   t('settings_theme_light',          styleMode),
      styleModeLabel: t('settings_style_mode_label',   styleMode),
      styleMinimal: t('settings_style_minimal',        styleMode),
      styleModern:  t('settings_style_modern',         styleMode),
    },

    // ── Placeholders ──────────────────────────────────────────────────────────
    placeholders: {
      search: t('placeholder_search', styleMode),
    },
  }
}

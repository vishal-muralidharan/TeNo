/**
 * src/utils/uiConfig.test.js
 *
 * Comprehensive unit tests for:
 *   - themeTranslations.js  →  the t() helper + the raw dictionary
 *   - uiConfig.jsx          →  getUiConfig() shape, per-mode values, icon logic
 *
 * Strategy
 * ─────────
 * • Pure JS / pure function tests — no DOM render needed.
 * • We import the REAL modules (no mocking) to validate actual output.
 * • uiConfig.jsx renders Lucide React elements; those are valid React objects,
 *   so we inspect their `type.displayName` / `type.name` rather than rendering.
 * • All 29 translation keys are exercised in both modes.
 * • Edge cases: unknown key, undefined styleMode, empty prefix strings.
 */

import { describe, it, expect } from 'vitest'
import { themeTranslations, t } from '../../src/utils/themeTranslations'
import { getUiConfig } from '../../src/utils/uiConfig'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** All first-class translation keys we own */
const ALL_KEYS = Object.keys(themeTranslations)

// ─────────────────────────────────────────────────────────────────────────────
// 1. themeTranslations dictionary — structural integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('themeTranslations — dictionary shape', () => {
  it('exports a non-empty object', () => {
    expect(typeof themeTranslations).toBe('object')
    expect(ALL_KEYS.length).toBeGreaterThan(0)
  })

  it.each(ALL_KEYS)('key "%s" has both minimal and modern strings', (key) => {
    const entry = themeTranslations[key]
    expect(entry).toBeDefined()
    expect(typeof entry.minimal).toBe('string')
    expect(typeof entry.modern).toBe('string')
  })

  it('contains the expected set of top-level keys (snapshot guard)', () => {
    expect(ALL_KEYS).toEqual(
      expect.arrayContaining([
        'logo_text',
        'nav_settings', 'nav_logout', 'nav_back',
        'tab_links', 'tab_cart', 'tab_reminders', 'tab_timer',
        'add_link', 'add_item', 'add_reminder',
        'toggle_form_open', 'toggle_form_close',
        'prefix_section', 'prefix_command',
        'terminal_reopen',
        'confirm_logout_message', 'confirm_logout_yes', 'confirm_logout_no',
        'confirm_delete_message', 'confirm_delete_yes', 'confirm_delete_no',
        'settings_heading_appearance', 'settings_heading_account',
        'settings_heading_summary', 'settings_heading_click_stats',
        'settings_change_password',
        'settings_theme_label', 'settings_theme_dark', 'settings_theme_light',
        'settings_style_mode_label', 'settings_style_minimal', 'settings_style_modern',
        'placeholder_search',
      ])
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. t() — translation helper function
// ─────────────────────────────────────────────────────────────────────────────

describe('t() — translation helper', () => {
  // ── Happy path: exact expected strings ─────────────────────────────────────
  it('returns the lowercase minimalist logo in minimal mode', () => {
    expect(t('logo_text', 'minimal')).toBe('teno')
  })

  it('returns the title-case TeNo logo in modern mode', () => {
    expect(t('logo_text', 'modern')).toBe('TeNo')
  })

  // ── Terminal prefix strings ────────────────────────────────────────────────
  it('returns "> ./" as the section prefix in minimal mode', () => {
    expect(t('prefix_section', 'minimal')).toBe('> ./')
  })

  it('returns an empty string as the section prefix in modern mode', () => {
    expect(t('prefix_section', 'modern')).toBe('')
  })

  it('returns "> " as the command prefix in minimal mode', () => {
    expect(t('prefix_command', 'minimal')).toBe('> ')
  })

  it('returns an empty string as the command prefix in modern mode', () => {
    expect(t('prefix_command', 'modern')).toBe('')
  })

  // ── Add-button copy ────────────────────────────────────────────────────────
  it('returns terminal-style "[+ add_new]" for add_link in minimal', () => {
    expect(t('add_link', 'minimal')).toBe('[+ add_new]')
  })

  it('returns "Add New Link" for add_link in modern', () => {
    expect(t('add_link', 'modern')).toBe('Add New Link')
  })

  it('returns "Add New Item" for add_item in modern', () => {
    expect(t('add_item', 'modern')).toBe('Add New Item')
  })

  it('returns "Add New Reminder" for add_reminder in modern', () => {
    expect(t('add_reminder', 'modern')).toBe('Add New Reminder')
  })

  // ── Toggle form ────────────────────────────────────────────────────────────
  it('returns "> [ + add_new ]" for toggle_form_open in minimal', () => {
    expect(t('toggle_form_open', 'minimal')).toBe('> [ + add_new ]')
  })

  it('returns "Add New" for toggle_form_open in modern', () => {
    expect(t('toggle_form_open', 'modern')).toBe('Add New')
  })

  it('returns "> [ - close ]" for toggle_form_close in minimal', () => {
    expect(t('toggle_form_close', 'minimal')).toBe('> [ - close ]')
  })

  it('returns "Close" for toggle_form_close in modern', () => {
    expect(t('toggle_form_close', 'modern')).toBe('Close')
  })

  // ── Terminal bar ──────────────────────────────────────────────────────────
  it('returns the terminal reopen string with "$_" in minimal mode', () => {
    expect(t('terminal_reopen', 'minimal')).toBe('$_ terminal hidden. type to reopen.')
  })

  it('returns the plain reopen string in modern mode', () => {
    expect(t('terminal_reopen', 'modern')).toBe('Terminal hidden — click to reopen')
  })

  // ── Confirm modal copy ─────────────────────────────────────────────────────
  it('returns lowercase "confirm log out?" message in minimal mode', () => {
    expect(t('confirm_logout_message', 'minimal')).toBe('confirm log out?')
  })

  it('returns full sentence for logout message in modern mode', () => {
    expect(t('confirm_logout_message', 'modern')).toBe('Are you sure you want to log out?')
  })

  it('returns "[ yes ]" for confirm_logout_yes in minimal mode', () => {
    expect(t('confirm_logout_yes', 'minimal')).toBe('[ yes ]')
  })

  it('returns "Log out" for confirm_logout_yes in modern mode', () => {
    expect(t('confirm_logout_yes', 'modern')).toBe('Log out')
  })

  it('returns "[ no ]" for confirm_logout_no in minimal mode', () => {
    expect(t('confirm_logout_no', 'minimal')).toBe('[ no ]')
  })

  it('returns "Cancel" for confirm_logout_no in modern mode', () => {
    expect(t('confirm_logout_no', 'modern')).toBe('Cancel')
  })

  it('returns "confirm delete?" in minimal mode', () => {
    expect(t('confirm_delete_message', 'minimal')).toBe('confirm delete?')
  })

  it('returns "Delete this item permanently?" in modern mode', () => {
    expect(t('confirm_delete_message', 'modern')).toBe('Delete this item permanently?')
  })

  it('returns "[ yes ]" for confirm_delete_yes in minimal mode', () => {
    expect(t('confirm_delete_yes', 'minimal')).toBe('[ yes ]')
  })

  it('returns "Delete" for confirm_delete_yes in modern mode', () => {
    expect(t('confirm_delete_yes', 'modern')).toBe('Delete')
  })

  // ── Tab labels ─────────────────────────────────────────────────────────────
  it('returns lowercase tab labels in minimal mode', () => {
    expect(t('tab_links',     'minimal')).toBe('links')
    expect(t('tab_cart',      'minimal')).toBe('cart')
    expect(t('tab_reminders', 'minimal')).toBe('reminders')
    expect(t('tab_timer',     'minimal')).toBe('timer')
  })

  it('returns title-case tab labels in modern mode', () => {
    expect(t('tab_links',     'modern')).toBe('Links')
    expect(t('tab_cart',      'modern')).toBe('Cart')
    expect(t('tab_reminders', 'modern')).toBe('Reminders')
    expect(t('tab_timer',     'modern')).toBe('Timer')
  })

  // ── Settings labels ────────────────────────────────────────────────────────
  it('returns lowercase settings headings in minimal mode', () => {
    expect(t('settings_heading_appearance',  'minimal')).toBe('appearance')
    expect(t('settings_heading_account',     'minimal')).toBe('account')
    expect(t('settings_heading_summary',     'minimal')).toBe('summary')
    expect(t('settings_heading_click_stats', 'minimal')).toBe('click stats')
    expect(t('settings_change_password',     'minimal')).toBe('change password')
  })

  it('returns title-case settings headings in modern mode', () => {
    expect(t('settings_heading_appearance',  'modern')).toBe('Appearance')
    expect(t('settings_heading_account',     'modern')).toBe('Account')
    expect(t('settings_heading_summary',     'modern')).toBe('Summary')
    expect(t('settings_heading_click_stats', 'modern')).toBe('Click stats')
    expect(t('settings_change_password',     'modern')).toBe('Change password')
  })

  it('returns correct style mode option labels in both modes', () => {
    expect(t('settings_style_minimal', 'minimal')).toBe('minimalist')
    expect(t('settings_style_minimal', 'modern')).toBe('Minimalist')
    expect(t('settings_style_modern',  'minimal')).toBe('modern')
    expect(t('settings_style_modern',  'modern')).toBe('Modern')
  })

  // ── Placeholders ────────────────────────────────────────────────────────────
  it('returns "search..." (lowercase) in minimal mode', () => {
    expect(t('placeholder_search', 'minimal')).toBe('search...')
  })

  it('returns "Search..." (uppercase S) in modern mode', () => {
    expect(t('placeholder_search', 'modern')).toBe('Search...')
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────
  it('returns the key itself when the key does not exist in the dictionary', () => {
    expect(t('nonexistent_key_xyz', 'minimal')).toBe('nonexistent_key_xyz')
  })

  it('falls back to the minimal string when styleMode is unknown', () => {
    // entry[styleMode] is undefined → falls through to entry.minimal
    expect(t('logo_text', 'retro')).toBe('teno')
  })

  it('falls back to minimal string when styleMode is undefined', () => {
    expect(t('logo_text', undefined)).toBe('teno')
  })

  it('falls back to minimal string when styleMode is null', () => {
    expect(t('logo_text', null)).toBe('teno')
  })

  it('is exhaustive — both modes are defined for every known key', () => {
    for (const key of ALL_KEYS) {
      expect(t(key, 'minimal')).not.toBe(key) // must not return the raw key
      expect(t(key, 'modern')).not.toBe(key)
      expect(t(key, 'minimal')).toBe(themeTranslations[key].minimal)
      expect(t(key, 'modern')).toBe(themeTranslations[key].modern)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. getUiConfig() — shape and correctness
// ─────────────────────────────────────────────────────────────────────────────

describe('getUiConfig() — config object shape', () => {
  it('returns an object with the expected top-level sections', () => {
    const ui = getUiConfig('minimal')
    expect(ui).toMatchObject({
      logo:        expect.any(String),
      nav:         expect.any(Object),
      icons:       expect.any(Object),
      addBtn:      expect.any(Object),
      tabs:        expect.any(Object),
      toggleForm:  expect.any(Object),
      prefix:      expect.any(Object),
      terminal:    expect.any(Object),
      confirm:     expect.any(Object),
      settings:    expect.any(Object),
      placeholders: expect.any(Object),
    })
  })

  it('nav section has settings, logout, and back keys', () => {
    const ui = getUiConfig('modern')
    expect(Object.keys(ui.nav)).toEqual(expect.arrayContaining(['settings', 'logout', 'back']))
  })

  it('icons section has settings, logout, back, addNew keys', () => {
    const ui = getUiConfig('minimal')
    expect(Object.keys(ui.icons)).toEqual(
      expect.arrayContaining(['settings', 'logout', 'back', 'addNew'])
    )
  })

  it('confirm section has logout and deleteItem sub-objects', () => {
    const ui = getUiConfig('minimal')
    expect(ui.confirm.logout).toMatchObject({
      message: expect.any(String),
      confirm: expect.any(String),
      cancel:  expect.any(String),
    })
    expect(ui.confirm.deleteItem).toMatchObject({
      message: expect.any(String),
      confirm: expect.any(String),
      cancel:  expect.any(String),
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. getUiConfig() — Minimalist mode ("minimal")
// ─────────────────────────────────────────────────────────────────────────────

describe('getUiConfig("minimal") — Minimalist theme strings', () => {
  let ui

  beforeEach(() => { ui = getUiConfig('minimal') })

  it('logo is "teno" (lowercase)', () => {
    expect(ui.logo).toBe('teno')
  })

  it('nav items are lowercase', () => {
    expect(ui.nav.settings).toBe('settings')
    expect(ui.nav.logout).toBe('logout')
    expect(ui.nav.back).toBe('back')
  })

  it('all icons are null (no Lucide icons in terminal mode)', () => {
    expect(ui.icons.settings).toBeNull()
    expect(ui.icons.logout).toBeNull()
    expect(ui.icons.back).toBeNull()
    expect(ui.icons.addNew).toBeNull()
  })

  it('add-button labels use terminal bracket notation', () => {
    expect(ui.addBtn.links).toBe('[+ add_new]')
    expect(ui.addBtn.cart).toBe('[+ add_new]')
    expect(ui.addBtn.reminder).toBe('[+ add_new]')
  })

  it('tab labels are lowercase', () => {
    expect(ui.tabs.links).toBe('links')
    expect(ui.tabs.cart).toBe('cart')
    expect(ui.tabs.reminders).toBe('reminders')
    expect(ui.tabs.timer).toBe('timer')
  })

  it('prefix.section starts with "> ./"', () => {
    expect(ui.prefix.section).toBe('> ./')
  })

  it('prefix.command starts with "> "', () => {
    expect(ui.prefix.command).toBe('> ')
  })

  it('toggleForm uses terminal bracket syntax', () => {
    expect(ui.toggleForm.open).toBe('> [ + add_new ]')
    expect(ui.toggleForm.close).toBe('> [ - close ]')
  })

  it('confirm.logout uses lowercase strings', () => {
    expect(ui.confirm.logout.message).toBe('confirm log out?')
    expect(ui.confirm.logout.confirm).toBe('[ yes ]')
    expect(ui.confirm.logout.cancel).toBe('[ no ]')
  })

  it('confirm.deleteItem uses lowercase strings', () => {
    expect(ui.confirm.deleteItem.message).toBe('confirm delete?')
    expect(ui.confirm.deleteItem.confirm).toBe('[ yes ]')
    expect(ui.confirm.deleteItem.cancel).toBe('[ no ]')
  })

  it('settings headings are lowercase', () => {
    expect(ui.settings.appearance).toBe('appearance')
    expect(ui.settings.account).toBe('account')
    expect(ui.settings.summary).toBe('summary')
  })

  it('placeholders.search is "search..." (lowercase s)', () => {
    expect(ui.placeholders.search).toBe('search...')
  })

  it('terminal.reopenBar contains the "$_" sigil', () => {
    expect(ui.terminal.reopenBar).toContain('$_')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. getUiConfig() — Modern mode ("modern")
// ─────────────────────────────────────────────────────────────────────────────

describe('getUiConfig("modern") — Modern theme strings', () => {
  let ui

  beforeEach(() => { ui = getUiConfig('modern') })

  it('logo is "TeNo" (title-case)', () => {
    expect(ui.logo).toBe('TeNo')
  })

  it('nav items are title-case', () => {
    expect(ui.nav.settings).toBe('Settings')
    expect(ui.nav.logout).toBe('Log out')
    expect(ui.nav.back).toBe('Back')
  })

  it('icons are non-null React elements (Lucide components)', () => {
    // Lucide elements are React elements, not null
    expect(ui.icons.settings).not.toBeNull()
    expect(ui.icons.logout).not.toBeNull()
    expect(ui.icons.back).not.toBeNull()
    expect(ui.icons.addNew).not.toBeNull()
  })

  it('icon elements have the correct Lucide display names', () => {
    // React elements expose their component function as .type
    expect(ui.icons.settings.type.displayName ?? ui.icons.settings.type.name)
      .toMatch(/settings/i)
    expect(ui.icons.logout.type.displayName ?? ui.icons.logout.type.name)
      .toMatch(/logout/i)
    expect(ui.icons.back.type.displayName ?? ui.icons.back.type.name)
      .toMatch(/arrowleft/i)
    expect(ui.icons.addNew.type.displayName ?? ui.icons.addNew.type.name)
      .toMatch(/plus/i)
  })

  it('icon elements carry the correct size and strokeWidth props', () => {
    // All nav icons use size=14 strokeWidth=2; addNew uses strokeWidth=2.5
    expect(ui.icons.settings.props).toMatchObject({ size: 14, strokeWidth: 2 })
    expect(ui.icons.logout.props).toMatchObject({   size: 14, strokeWidth: 2 })
    expect(ui.icons.back.props).toMatchObject({     size: 14, strokeWidth: 2 })
    expect(ui.icons.addNew.props).toMatchObject({   size: 14, strokeWidth: 2.5 })
  })

  it('add-button labels are human-readable strings', () => {
    expect(ui.addBtn.links).toBe('Add New Link')
    expect(ui.addBtn.cart).toBe('Add New Item')
    expect(ui.addBtn.reminder).toBe('Add New Reminder')
  })

  it('tab labels are title-case', () => {
    expect(ui.tabs.links).toBe('Links')
    expect(ui.tabs.cart).toBe('Cart')
    expect(ui.tabs.reminders).toBe('Reminders')
    expect(ui.tabs.timer).toBe('Timer')
  })

  it('prefix.section is an empty string (no terminal prefix in modern mode)', () => {
    expect(ui.prefix.section).toBe('')
  })

  it('prefix.command is an empty string', () => {
    expect(ui.prefix.command).toBe('')
  })

  it('toggleForm uses plain English labels', () => {
    expect(ui.toggleForm.open).toBe('Add New')
    expect(ui.toggleForm.close).toBe('Close')
  })

  it('confirm.logout uses sentence-case strings', () => {
    expect(ui.confirm.logout.message).toBe('Are you sure you want to log out?')
    expect(ui.confirm.logout.confirm).toBe('Log out')
    expect(ui.confirm.logout.cancel).toBe('Cancel')
  })

  it('confirm.deleteItem uses sentence-case strings', () => {
    expect(ui.confirm.deleteItem.message).toBe('Delete this item permanently?')
    expect(ui.confirm.deleteItem.confirm).toBe('Delete')
    expect(ui.confirm.deleteItem.cancel).toBe('Cancel')
  })

  it('settings headings are title/sentence-case', () => {
    expect(ui.settings.appearance).toBe('Appearance')
    expect(ui.settings.account).toBe('Account')
    expect(ui.settings.summary).toBe('Summary')
    expect(ui.settings.clickStats).toBe('Click stats')
    expect(ui.settings.changePassword).toBe('Change password')
    expect(ui.settings.themeLabel).toBe('Theme')
    expect(ui.settings.themeDark).toBe('Dark')
    expect(ui.settings.themeLight).toBe('Light')
    expect(ui.settings.styleModeLabel).toBe('Style mode')
    expect(ui.settings.styleMinimal).toBe('Minimalist')
    expect(ui.settings.styleModern).toBe('Modern')
  })

  it('placeholders.search is "Search..." (uppercase S)', () => {
    expect(ui.placeholders.search).toBe('Search...')
  })

  it('terminal.reopenBar does NOT contain "$_"', () => {
    expect(ui.terminal.reopenBar).not.toContain('$_')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. getUiConfig() — theme vs style-mode independence
// ─────────────────────────────────────────────────────────────────────────────

describe('getUiConfig() — determinism & independence', () => {
  it('returns a new object on every call (not the same reference)', () => {
    const a = getUiConfig('minimal')
    const b = getUiConfig('minimal')
    expect(a).not.toBe(b)
  })

  it('minimal and modern return DIFFERENT logo strings', () => {
    expect(getUiConfig('minimal').logo).not.toBe(getUiConfig('modern').logo)
  })

  it('minimal and modern prefixes differ — minimal is non-empty, modern is empty', () => {
    expect(getUiConfig('minimal').prefix.section.length).toBeGreaterThan(0)
    expect(getUiConfig('modern').prefix.section.length).toBe(0)
  })

  it('minimal icons are all null; modern icons are all non-null', () => {
    const minUI = getUiConfig('minimal')
    const modUI = getUiConfig('modern')
    Object.values(minUI.icons).forEach((icon) => expect(icon).toBeNull())
    Object.values(modUI.icons).forEach((icon) => expect(icon).not.toBeNull())
  })

  it('unknown styleMode falls back gracefully to minimal strings', () => {
    const ui = getUiConfig('retro')
    // isModern = false → icons should be null
    expect(ui.icons.settings).toBeNull()
    // logo falls back to minimal via t() fallback chain
    expect(ui.logo).toBe('teno')
  })
})

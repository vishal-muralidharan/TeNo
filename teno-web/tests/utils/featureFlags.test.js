/**
 * src/utils/featureFlags.test.js
 *
 * Pure-function unit tests for:
 *   - DEFAULT_FEATURE_FLAGS  (the registry object)
 *   - isEnabled(flags, key)  (the pure helper)
 *
 * No mocking required — both exports are plain JS with zero side-effects.
 */

import { describe, it, expect } from 'vitest'
import { DEFAULT_FEATURE_FLAGS, isEnabled } from '../../src/utils/featureFlags'

// ─────────────────────────────────────────────────────────────────────────────
// 1. DEFAULT_FEATURE_FLAGS — registry integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('DEFAULT_FEATURE_FLAGS', () => {
  const EXPECTED_KEYS = [
    'links', 'cart', 'reminders', 'timer', 'shared',
    'terminal', 'modernTheme',
    'settings', 'clickStats', 'changePassword',
  ]

  it('exports a plain object', () => {
    expect(typeof DEFAULT_FEATURE_FLAGS).toBe('object')
    expect(DEFAULT_FEATURE_FLAGS).not.toBeNull()
    expect(Array.isArray(DEFAULT_FEATURE_FLAGS)).toBe(false)
  })

  it('contains exactly the expected 10 keys', () => {
    const keys = Object.keys(DEFAULT_FEATURE_FLAGS)
    expect(keys).toHaveLength(EXPECTED_KEYS.length)
    expect(keys).toEqual(expect.arrayContaining(EXPECTED_KEYS))
  })

  it.each(EXPECTED_KEYS)('"%s" defaults to true', (key) => {
    expect(DEFAULT_FEATURE_FLAGS[key]).toBe(true)
  })

  it('all values are booleans', () => {
    for (const value of Object.values(DEFAULT_FEATURE_FLAGS)) {
      expect(typeof value).toBe('boolean')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. isEnabled() — pure helper
// ─────────────────────────────────────────────────────────────────────────────

describe('isEnabled(flags, key)', () => {
  // ── Truthy flags ─────────────────────────────────────────────────────────
  it('returns true when the flag is explicitly true', () => {
    expect(isEnabled({ links: true }, 'links')).toBe(true)
  })

  it('returns true for all default flags via DEFAULT_FEATURE_FLAGS', () => {
    for (const key of Object.keys(DEFAULT_FEATURE_FLAGS)) {
      expect(isEnabled(DEFAULT_FEATURE_FLAGS, key)).toBe(true)
    }
  })

  // ── Falsy flags ────────────────────────────────────────────────────────────
  it('returns false when the flag is explicitly false', () => {
    expect(isEnabled({ cart: false }, 'cart')).toBe(false)
  })

  it('returns false for every key when all flags are false', () => {
    const allOff = Object.fromEntries(
      Object.keys(DEFAULT_FEATURE_FLAGS).map((k) => [k, false])
    )
    for (const key of Object.keys(allOff)) {
      expect(isEnabled(allOff, key)).toBe(false)
    }
  })

  // ── Fail-open for unknown keys ─────────────────────────────────────────────
  it('returns true (fail-open) when the key is not in the flags object', () => {
    expect(isEnabled({}, 'nonExistentFeature')).toBe(true)
  })

  it('returns true when flags is DEFAULT_FEATURE_FLAGS and key is unknown', () => {
    expect(isEnabled(DEFAULT_FEATURE_FLAGS, 'unknownFeatureXYZ')).toBe(true)
  })

  // ── Mixed flags object ─────────────────────────────────────────────────────
  it('evaluates each flag independently in a mixed object', () => {
    const flags = { links: true, cart: false, reminders: true }
    expect(isEnabled(flags, 'links')).toBe(true)
    expect(isEnabled(flags, 'cart')).toBe(false)
    expect(isEnabled(flags, 'reminders')).toBe(true)
    // 'timer' is missing → fail-open
    expect(isEnabled(flags, 'timer')).toBe(true)
  })

  // ── Edge: falsy-but-not-false values ──────────────────────────────────────
  // The contract is: flags[key] !== false.
  // So 0, null, undefined, '' should still be treated as "enabled" (not false).
  it('returns true when the value is 0 (not strictly false)', () => {
    expect(isEnabled({ links: 0 }, 'links')).toBe(true)
  })

  it('returns true when the value is null (not strictly false)', () => {
    expect(isEnabled({ links: null }, 'links')).toBe(true)
  })

  it('returns true when the value is undefined (not strictly false)', () => {
    expect(isEnabled({ links: undefined }, 'links')).toBe(true)
  })

  it('returns true when the value is an empty string (not strictly false)', () => {
    expect(isEnabled({ links: '' }, 'links')).toBe(true)
  })
})

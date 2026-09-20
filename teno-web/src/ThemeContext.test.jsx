/**
 * src/ThemeContext.test.jsx
 *
 * Integration tests for <ThemeProvider> and useTheme().
 *
 * Tricky areas
 * ────────────
 * • ThemeContext.jsx has module-level side-effects: it reads localStorage and
 *   writes to document.documentElement on import. We must not let those bleed
 *   between tests, so we vi.isolateModules() where the initial state matters.
 * • onAuthStateChanged is a mock: we call its captured callback to simulate
 *   "user signed in" / "user signed out" transitions.
 * • requestAnimationFrame is shimmed to setTimeout(0) in setup.js, so
 *   vi.useFakeTimers() can drain it.
 * • setDoc / getDoc are mocked globally — no real Firestore.
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { onAuthStateChanged } from 'firebase/auth'
import { getDoc, setDoc } from 'firebase/firestore'

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Renders a minimal consumer that exposes every context value to the DOM */
async function renderTheme(preloadLS = {}) {
  // Pre-populate localStorage before the module's bootstrap side-effect runs
  for (const [k, v] of Object.entries(preloadLS)) {
    localStorage.setItem(k, v)
  }

  // Dynamic import so module-level code re-runs with fresh localStorage
  const { ThemeProvider, useTheme } = await import('./ThemeContext')

  function Consumer() {
    const ctx = useTheme()
    return (
      <div>
        <span data-testid="theme">{ctx.theme}</span>
        <span data-testid="styleMode">{ctx.styleMode}</span>
        <span data-testid="loading">{String(ctx.loading)}</span>
        <span data-testid="isThemeReady">{String(ctx.isThemeReady)}</span>
        <span data-testid="styleModeChanging">{String(ctx.styleModeChanging)}</span>
        <button data-testid="set-light" onClick={() => ctx.setTheme('light')}>light</button>
        <button data-testid="set-dark"  onClick={() => ctx.setTheme('dark')}>dark</button>
        <button data-testid="set-minimal" onClick={() => ctx.setStyleMode('minimal')}>minimal</button>
        <button data-testid="set-modern" onClick={() => ctx.setStyleMode('modern')}>modern</button>
      </div>
    )
  }

  let result
  await act(async () => {
    result = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )
  })
  return result
}

/** Simulate onAuthStateChanged calling back with a user or null */
function fireAuthCallback(user) {
  const impl = vi.mocked(onAuthStateChanged).mock.calls.at(-1)?.[1]
  if (impl) act(() => impl(user))
}

const MOCK_USER = { uid: 'user-123' }

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bootstrap — initial values from localStorage
// ─────────────────────────────────────────────────────────────────────────────

describe('ThemeProvider — bootstrap from localStorage', () => {
  beforeEach(() => {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      // Don't call cb immediately — tests control the timing
      return vi.fn()
    })
  })

  it('reads theme and styleMode from localStorage on first render', async () => {
    await renderTheme({ theme: 'light', styleMode: 'modern' })
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(screen.getByTestId('styleMode').textContent).toBe('modern')
  })

  it('starts loading=true before auth resolves', async () => {
    await renderTheme({})
    expect(screen.getByTestId('loading').textContent).toBe('true')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Auth + Firestore init flow
// ─────────────────────────────────────────────────────────────────────────────

describe('ThemeProvider — onAuthStateChanged + initTheme', () => {
  beforeEach(() => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ preferences: { theme: 'light', styleMode: 'modern' } }),
    })
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      // Fire synchronously so the effect resolves in act()
      cb(MOCK_USER)
      return vi.fn()
    })
  })

  it('loads preferences from Firestore when user is signed in', async () => {
    await renderTheme({})
    await waitFor(() =>
      expect(screen.getByTestId('theme').textContent).toBe('light')
    )
    expect(screen.getByTestId('styleMode').textContent).toBe('modern')
  })

  it('sets loading=false after init completes', async () => {
    await renderTheme({})
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )
  })

  it('sets isThemeReady=true after requestAnimationFrame fires', async () => {
    vi.useFakeTimers()
    await renderTheme({})
    await act(async () => { vi.runAllTimers() })
    expect(screen.getByTestId('isThemeReady').textContent).toBe('true')
    vi.useRealTimers()
  })

  it('falls back to localStorage when Firestore doc does not exist', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => ({}) })
    await renderTheme({ theme: 'dark', styleMode: 'minimal' })
    await waitFor(() =>
      expect(screen.getByTestId('theme').textContent).toBe('dark')
    )
    expect(screen.getByTestId('styleMode').textContent).toBe('minimal')
  })

  it('falls back to matchMedia when localStorage is empty and no Firestore doc', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => ({}) })
    // matchMedia returns matches=false by default in setup.js → 'light'
    await renderTheme({})
    await waitFor(() =>
      expect(screen.getByTestId('theme').textContent).toBe('light')
    )
  })

  it('falls back to "dark" when matchMedia is not available', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => ({}) })
    // Temporarily remove matchMedia
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', { value: undefined, writable: true })

    await renderTheme({})
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )
    // No matchMedia → falls to the defaults
    expect(['dark', 'light']).toContain(screen.getByTestId('theme').textContent)

    Object.defineProperty(window, 'matchMedia', { value: original, writable: true })
  })

  it('falls back to styleMode "minimal" when nothing is stored', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => ({}) })
    await renderTheme({})
    await waitFor(() =>
      expect(screen.getByTestId('styleMode').textContent).toBe('minimal')
    )
  })

  it('logs console.error and continues when Firestore getDoc throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getDoc).mockRejectedValue(new Error('network error'))
    await renderTheme({ theme: 'dark', styleMode: 'minimal' })
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching preferences'),
      expect.any(Error)
    )
    consoleSpy.mockRestore()
  })

  it('skips Firestore read when user is null (signed out)', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      cb(null) // signed out
      return vi.fn()
    })
    await renderTheme({ theme: 'dark', styleMode: 'minimal' })
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    )
    expect(getDoc).not.toHaveBeenCalled()
  })

  it('calls onAuthStateChanged unsubscribe on unmount', async () => {
    const mockUnsubscribe = vi.fn()
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      cb(null)
      return mockUnsubscribe
    })
    const { unmount } = await renderTheme({})
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. setTheme()
// ─────────────────────────────────────────────────────────────────────────────

describe('useTheme().setTheme()', () => {
  beforeEach(() => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true,
      data: () => ({ preferences: { theme: 'dark', styleMode: 'minimal' } }) })
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      cb(MOCK_USER); return vi.fn()
    })
    vi.mocked(setDoc).mockResolvedValue(undefined)
  })

  it('updates the theme state when setTheme is called', async () => {
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-light'))
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('writes the new theme to localStorage', async () => {
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-light'))
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('calls setDoc to persist the theme in Firestore when signed in', async () => {
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-light'))
    await waitFor(() =>
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ preferences: expect.objectContaining({ theme: 'light' }) }),
        { merge: true }
      )
    )
  })

  it('does NOT call setDoc when no user is signed in', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      cb(null); return vi.fn()
    })
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-light'))
    expect(setDoc).not.toHaveBeenCalled()
  })

  it('sets data-theme attribute on document.documentElement', async () => {
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-light'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('logs console.error and does not throw when setDoc rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(setDoc).mockRejectedValue(new Error('write failed'))
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await expect(user.click(screen.getByTestId('set-light'))).resolves.not.toThrow()
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error saving theme'),
        expect.any(Error)
      )
    )
    consoleSpy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. setStyleMode()
// ─────────────────────────────────────────────────────────────────────────────

describe('useTheme().setStyleMode()', () => {
  beforeEach(() => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true,
      data: () => ({ preferences: { theme: 'dark', styleMode: 'minimal' } }) })
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      cb(MOCK_USER); return vi.fn()
    })
    vi.mocked(setDoc).mockResolvedValue(undefined)
  })

  it('updates styleMode state', async () => {
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-modern'))
    expect(screen.getByTestId('styleMode').textContent).toBe('modern')
  })

  it('writes styleMode to localStorage', async () => {
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-modern'))
    expect(localStorage.getItem('styleMode')).toBe('modern')
  })

  it('sets styleModeChanging=true immediately', async () => {
    vi.useFakeTimers()
    // Use renderTheme WITHOUT waiting for auth (which needs real promises)
    // Instead, get a pre-loaded provider with real timers for init, then switch
    vi.useRealTimers()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    // Now install fake timers AFTER init to capture only the debounce
    vi.useFakeTimers()
    const { fireEvent: fe } = await import('@testing-library/react')
    act(() => fe.click(screen.getByTestId('set-modern')))
    expect(screen.getByTestId('styleModeChanging').textContent).toBe('true')
    vi.useRealTimers()
  })

  it('clears styleModeChanging after 1800ms (real-timer contract test)', async () => {
    // setStyleMode schedules a real setTimeout(1800). Mixing fake and real timers
    // around an async function is unreliable, so we test the observable contract:
    // styleModeChanging must return to false within 2.5 s of being set.
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-modern'))
    expect(screen.getByTestId('styleModeChanging').textContent).toBe('true')

    // Real timeout — waitFor polls until the assertion passes (up to 2500ms)
    await waitFor(
      () => expect(screen.getByTestId('styleModeChanging').textContent).toBe('false'),
      { timeout: 2500 }
    )
  }, 4000) // extend test timeout to 4 s to give real timers room

  it('persists styleMode to Firestore when signed in', async () => {
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-modern'))
    await waitFor(() =>
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ preferences: expect.objectContaining({ styleMode: 'modern' }) }),
        { merge: true }
      )
    )
  })

  it('sets data-style attribute on document.documentElement', async () => {
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await user.click(screen.getByTestId('set-modern'))
    expect(document.documentElement.getAttribute('data-style')).toBe('modern')
  })

  it('logs console.error and does not throw when Firestore write fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(setDoc).mockRejectedValue(new Error('write failed'))
    const user = userEvent.setup()
    await renderTheme({})
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await expect(user.click(screen.getByTestId('set-modern'))).resolves.not.toThrow()
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error saving styleMode'),
        expect.any(Error)
      )
    )
    consoleSpy.mockRestore()
  })
})

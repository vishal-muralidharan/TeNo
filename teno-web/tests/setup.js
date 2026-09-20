/**
 * tests/setup.js
 *
 * Vitest global setup file — runs before every test suite.
 *
 * Responsibilities
 * ────────────────
 * 1. Extend `expect` with @testing-library/jest-dom custom matchers.
 * 2. Stub browser globals that jsdom does not implement:
 *    - localStorage  (in-memory, reset between tests)
 *    - window.matchMedia
 *    - requestAnimationFrame / cancelAnimationFrame
 * 3. Hoist vi.mock() calls for Firebase Client SDK (src/firebase.js)
 *    so every test that imports a context/component never touches real Firebase.
 *
 * NOTE: vi.mock() calls are hoisted to the TOP of the module by Vitest's
 * babel transform, so they run before any import — even imports at the top of
 * THIS file. That is intentional and correct.
 */

import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'

// ── 1. localStorage stub ─────────────────────────────────────────────────────
// jsdom provides a real localStorage implementation, but it persists across
// tests by default. We replace it with a simple in-memory map and clear it
// between tests to guarantee test isolation.
const localStorageMock = (() => {
  let store = {}
  return {
    getItem:    (key)        => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value) },
    removeItem: (key)        => { delete store[key] },
    clear:      ()           => { store = {} },
    get length()             { return Object.keys(store).length },
    key:        (i)          => Object.keys(store)[i] ?? null,
  }
})()

Object.defineProperty(window, 'localStorage', {
  value:    localStorageMock,
  writable: true,
})

// ── 2. window.matchMedia stub ────────────────────────────────────────────────
// jsdom does not implement matchMedia. ThemeContext calls it to detect the
// user's preferred color scheme, so we provide a sensible no-op implementation.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => ({
    matches:             false,   // default: light mode
    media:               query,
    onchange:            null,
    addListener:         vi.fn(), // deprecated but still called in some paths
    removeListener:      vi.fn(),
    addEventListener:    vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent:       vi.fn(),
  })),
})

// ── 3. requestAnimationFrame / cancelAnimationFrame stubs ────────────────────
// ThemeContext calls requestAnimationFrame to defer the isThemeReady flip.
// jsdom does not implement rAF, so we provide a synchronous shim.
global.requestAnimationFrame  = (cb) => setTimeout(cb, 0)
global.cancelAnimationFrame   = (id) => clearTimeout(id)

// ── 4. Reset per-test state ──────────────────────────────────────────────────
beforeEach(() => {
  // Clear localStorage between tests so state never bleeds across suites.
  localStorageMock.clear()

  // Reset all mock call history so assertions are always test-specific.
  vi.clearAllMocks()
})

afterEach(() => {
  // Ensure timers don't leak across tests (used by styleModeChanging debounce).
  vi.useRealTimers()
})

// ── 5. Firebase Client SDK mock (src/firebase.js) ───────────────────────────
// Every component/context that does `import { auth, db } from './firebase'`
// will receive these stable mock objects instead of initialising a real SDK.
//
// Granular per-method mocks (e.g. onAuthStateChanged, getDoc) are defined
// inside each individual test file using vi.mocked() so tests stay focused.
vi.mock('../src/firebase.js', () => ({
  auth: {},
  db:   {},
}))

// ── 6. Firebase Client Auth mock ─────────────────────────────────────────────
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut:            vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updatePassword:     vi.fn(),
  EmailAuthProvider:  { credential: vi.fn() },
  reauthenticateWithCredential: vi.fn(),
  getAuth:            vi.fn(() => ({})),
}))

// ── 7. Firebase Client Firestore mock ────────────────────────────────────────
vi.mock('firebase/firestore', () => ({
  doc:         vi.fn(() => ({ id: 'mock-doc-ref' })),
  getDoc:      vi.fn(),
  setDoc:      vi.fn(),
  updateDoc:   vi.fn(),
  deleteDoc:   vi.fn(),
  writeBatch:  vi.fn(),
  onSnapshot:  vi.fn(),
  collection:  vi.fn(() => ({ id: 'mock-collection-ref' })),
  query:       vi.fn(),
  where:       vi.fn(),
  orderBy:     vi.fn(),
  limit:       vi.fn(),
  getDocs:     vi.fn(),
  addDoc:      vi.fn(),
  arrayUnion:  vi.fn((...args) => ({ _type: 'arrayUnion', args })),
  arrayRemove: vi.fn((...args) => ({ _type: 'arrayRemove', args })),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
  FieldValue:  {
    arrayUnion:      vi.fn((...args) => ({ _type: 'arrayUnion', args })),
    arrayRemove:     vi.fn((...args) => ({ _type: 'arrayRemove', args })),
    serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
    delete:          vi.fn(() => ({ _type: 'delete' })),
  },
  getFirestore: vi.fn(() => ({})),
  initializeFirestore: vi.fn(() => ({})),
  persistentLocalCache: vi.fn(() => ({})),
  persistentMultipleTabManager: vi.fn(() => ({})),
}))

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ── Vitest configuration ─────────────────────────────────────────────────
  test: {
    // Use jsdom so React components can render against a real DOM API surface.
    environment: 'jsdom',

    // Run the setup file before every test suite.
    // This file configures @testing-library/jest-dom matchers, localStorage
    // stubs, window.matchMedia stubs, and Firebase mocks.
    setupFiles: ['./tests/setup.js'],

    // Expose vi, describe, it, expect, etc. globally (no explicit import needed).
    globals: true,

    // Coverage via V8 — run with: npm test -- --coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{js,jsx}', 'api/**/*.js'],
      exclude: [
        'src/main.jsx',        // entry-point boilerplate
        'src/index.css',
        '**/node_modules/**',
      ],
      thresholds: {
        lines:      100,
        functions:  100,
        branches:   100,
        statements: 100,
      },
    },
  },
})


/**
 * src/components/Timer.test.jsx
 *
 * Tests for the <Timer> presentational component.
 *
 * Timer is a pure presentational component — it receives all state via props
 * and exposes handler props for controls. No Firebase, no context needed.
 * Tests verify:
 *   1. Digital clock display formatting at various millisecond values
 *   2. Correct controls rendered for each timerState
 *   3. Handler props are called when buttons are clicked
 *   4. Input spinner increments/decrements timerInputMinutes correctly
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Timer from './Timer'

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildProps(overrides = {}) {
  return {
    timerState:          'idle',
    timerDisplayMs:      0,
    timerInputMinutes:   0,
    setTimerInputMinutes: vi.fn(),
    handleTimerStart:    vi.fn(),
    handleTimerPause:    vi.fn(),
    handleTimerStop:     vi.fn(),
    ...overrides,
  }
}

function renderTimer(overrides = {}) {
  const props = buildProps(overrides)
  const result = render(<Timer {...props} />)
  return { ...result, props }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Digital clock display — formatting
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer — digital clock display', () => {
  it('displays 00:00:00 with .00 sub when timerDisplayMs=0', () => {
    renderTimer({ timerDisplayMs: 0 })
    // The clock renders hrs:mins:secs in one span, millis in a sub
    expect(screen.getByText(/00:00:00/)).toBeInTheDocument()
    expect(document.querySelector('sub').textContent).toBe('00')
  })

  it('correctly formats 1 second (1000ms)', () => {
    renderTimer({ timerDisplayMs: 1000 })
    expect(screen.getByText(/00:00:01/)).toBeInTheDocument()
    expect(document.querySelector('sub').textContent).toBe('00')
  })

  it('correctly formats 1 minute (60 000ms)', () => {
    renderTimer({ timerDisplayMs: 60_000 })
    expect(screen.getByText(/00:01:00/)).toBeInTheDocument()
    expect(document.querySelector('sub').textContent).toBe('00')
  })

  it('correctly formats 1 hour (3 600 000ms)', () => {
    renderTimer({ timerDisplayMs: 3_600_000 })
    expect(screen.getByText(/01:00:00/)).toBeInTheDocument()
    expect(document.querySelector('sub').textContent).toBe('00')
  })

  it('correctly formats 90 minutes 30 seconds (5 430 000ms)', () => {
    renderTimer({ timerDisplayMs: 5_430_000 })
    expect(screen.getByText(/01:30:30/)).toBeInTheDocument()
  })

  it('displays millisecond sub-seconds (500ms → 50 hundredths)', () => {
    renderTimer({ timerDisplayMs: 500 })
    expect(document.querySelector('sub').textContent).toBe('50')
  })

  it('zero-pads all fields to at least 2 digits', () => {
    renderTimer({ timerDisplayMs: 61_500 }) // 0h 1m 1s 500ms
    const clockText = document.querySelector('.digital-clock span').textContent
    // Each field should be 2 chars: "00:01:01"
    expect(clockText).toMatch(/\d{2}:\d{2}:\d{2}/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Controls — idle state
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer — idle state controls', () => {
  it('shows "Start" and "Reset" buttons when timerState is "idle"', () => {
    renderTimer({ timerState: 'idle' })
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('does NOT show "Pause" or "Stop" when timerState is "idle"', () => {
    renderTimer({ timerState: 'idle' })
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Stop' })).not.toBeInTheDocument()
  })

  it('shows the minutes input spinner in idle state', () => {
    renderTimer({ timerState: 'idle' })
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('shows the "minutes" label in idle state', () => {
    renderTimer({ timerState: 'idle' })
    expect(screen.getByText('minutes')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Controls — running state
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer — running state controls', () => {
  it('shows "Pause" and "Stop" buttons when timerState is "running"', () => {
    renderTimer({ timerState: 'running' })
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
  })

  it('does NOT show "Start" or "Reset" when timerState is "running"', () => {
    renderTimer({ timerState: 'running' })
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
  })

  it('hides the minutes input spinner when running', () => {
    renderTimer({ timerState: 'running' })
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Controls — paused state
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer — paused state controls', () => {
  it('shows "Start" (resume) and "Reset" when timerState is "paused"', () => {
    // paused falls through to the else branch (same as idle)
    renderTimer({ timerState: 'paused' })
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. Handler callbacks
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer — handler callbacks', () => {
  it('calls handleTimerStart when Start is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'idle' })
    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(props.handleTimerStart).toHaveBeenCalledTimes(1)
  })

  it('calls handleTimerStop when Reset is clicked (idle state)', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'idle' })
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(props.handleTimerStop).toHaveBeenCalledTimes(1)
  })

  it('calls handleTimerPause when Pause is clicked (running state)', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'running' })
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    expect(props.handleTimerPause).toHaveBeenCalledTimes(1)
  })

  it('calls handleTimerStop when Stop is clicked (running state)', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'running' })
    await user.click(screen.getByRole('button', { name: 'Stop' }))
    expect(props.handleTimerStop).toHaveBeenCalledTimes(1)
  })

  it('calls setTimerInputMinutes with incremented value on ChevronUp click', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'idle', timerInputMinutes: 5 })
    // ChevronUp is the second arrow-btn
    const [, upBtn] = document.querySelectorAll('.arrow-btn')
    await user.click(upBtn)
    expect(props.setTimerInputMinutes).toHaveBeenCalledWith(6)
  })

  it('calls setTimerInputMinutes with decremented value on ChevronDown click', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'idle', timerInputMinutes: 5 })
    const [downBtn] = document.querySelectorAll('.arrow-btn')
    await user.click(downBtn)
    expect(props.setTimerInputMinutes).toHaveBeenCalledWith(4)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. Spinner increment / decrement boundary clamping
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer — spinner boundary clamping', () => {
  it('clamps decrement at 0 (cannot go below 0)', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'idle', timerInputMinutes: 0 })
    const [downBtn] = document.querySelectorAll('.arrow-btn')
    await user.click(downBtn)
    expect(props.setTimerInputMinutes).toHaveBeenCalledWith(0)
  })

  it('clamps increment at 999 (cannot exceed 999)', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'idle', timerInputMinutes: 999 })
    const [, upBtn] = document.querySelectorAll('.arrow-btn')
    await user.click(upBtn)
    expect(props.setTimerInputMinutes).toHaveBeenCalledWith(999)
  })

  it('calls setTimerInputMinutes when the input value changes', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'idle', timerInputMinutes: 5 })
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '10')
    // setTimerInputMinutes is called for each keystroke via onChange
    expect(props.setTimerInputMinutes).toHaveBeenCalled()
  })

  it('passes 0 when a non-numeric value is typed into the input', async () => {
    const user = userEvent.setup()
    const { props } = renderTimer({ timerState: 'idle', timerInputMinutes: 5 })
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    // parseInt('', 10) is NaN, so || 0 kicks in
    expect(props.setTimerInputMinutes).toHaveBeenCalledWith(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. Default prop fallbacks (smoke-test)
// ─────────────────────────────────────────────────────────────────────────────

describe('Timer — default prop fallbacks', () => {
  it('renders without crashing when all props use defaults', () => {
    expect(() => render(<Timer />)).not.toThrow()
  })

  it('renders 00:00:00 display when timerDisplayMs defaults to 0', () => {
    render(<Timer />)
    expect(screen.getByText(/00:00:00/)).toBeInTheDocument()
  })
})

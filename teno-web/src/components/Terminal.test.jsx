/**
 * src/components/Terminal.test.jsx
 *
 * Tests for the <Terminal> interactive shell component.
 *
 * Terminal uses useFeatureFlags() — we mock the entire FeatureFlagContext module
 * and provide a controlled isEnabled helper. All external callbacks (addReminder,
 * deleteLinkByNickname, timerApi, etc.) are vi.fn() stubs.
 *
 * Key strategy
 * ────────────
 * • `executeCommand` runs on form submit or Enter keydown. We simulate both.
 * • Output lines are rendered in .terminal-output. We query by text content.
 * • We use `userEvent.type` for the input + `userEvent.keyboard('{Enter}')`.
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Terminal from './Terminal'

// ── Mock FeatureFlagContext ────────────────────────────────────────────────────
vi.mock('../FeatureFlagContext', () => ({
  useFeatureFlags: vi.fn(),
}))
import { useFeatureFlags } from '../FeatureFlagContext'

// Default: all features enabled
function mockAllEnabled() {
  vi.mocked(useFeatureFlags).mockReturnValue({
    isEnabled: () => true,
  })
}

// Selectively disable specific keys
function mockWithDisabled(...disabledKeys) {
  vi.mocked(useFeatureFlags).mockReturnValue({
    isEnabled: (key) => !disabledKeys.includes(key),
  })
}

// ── Default props ─────────────────────────────────────────────────────────────
const MOCK_USER = { displayName: 'Alice', email: 'alice@example.com' }

function buildProps(overrides = {}) {
  return {
    user:                    MOCK_USER,
    activeTab:               0,
    setActiveTab:            vi.fn(),
    onExit:                  vi.fn(),
    onHeightChange:          vi.fn(),
    savedLinks:              [],
    cartItems:               [],
    reminders:               [],
    requestOpenLinksForm:    vi.fn(),
    requestOpenCartForm:     vi.fn(),
    deleteLinkByNickname:    vi.fn(),
    deleteCartItemByNickname: vi.fn(),
    addReminder:             vi.fn(),
    deleteReminderByIndex:   vi.fn(),
    deleteAllReminders:      vi.fn(),
    onLinkOpen:              vi.fn(),
    timerApi:                {
      startTimerCountdown: vi.fn(() => ({ message: 'timer started.' })),
      stopTimer:           vi.fn(() => ({ message: 'timer stopped.' })),
      getTimerStatus:      vi.fn(() => 'timer idle'),
      timerDisplayMs:      0,
    },
    ...overrides,
  }
}

function renderTerminal(overrides = {}) {
  mockAllEnabled()
  const props = buildProps(overrides)
  const result = render(<Terminal {...props} />)
  return { ...result, props }
}

/** Type a command into the input and press Enter */
async function submitCommand(user, command) {
  const input = screen.getByRole('textbox')
  await user.clear(input)
  await user.type(input, command)
  await user.keyboard('{Enter}')
}

/** Returns all visible text in the terminal output area */
function getOutput() {
  return document.querySelector('.terminal-output').textContent
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Initial render
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — initial render', () => {
  it('renders the terminal shell with aria-label "global terminal"', () => {
    renderTerminal()
    expect(screen.getByRole('region', { name: 'global terminal' })).toBeInTheDocument()
  })

  it('renders the "terminal" title in the header', () => {
    renderTerminal()
    expect(screen.getByText('terminal')).toBeInTheDocument()
  })

  it('renders the "hide" minimize button', () => {
    renderTerminal()
    expect(screen.getByRole('button', { name: 'hide' })).toBeInTheDocument()
  })

  it('shows the welcome line on boot', () => {
    renderTerminal()
    expect(getOutput()).toContain('terminal ready. type help for commands.')
  })

  it('renders a text input field', () => {
    renderTerminal()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('includes the user display name in the terminal prompt', () => {
    renderTerminal()
    // prompt = "teno/alice $_ >>"
    expect(screen.getByText(/teno\/alice/)).toBeInTheDocument()
  })

  it('uses email username when displayName is absent', () => {
    renderTerminal({ user: { email: 'bob@example.com' } })
    expect(screen.getByText(/teno\/bob/)).toBeInTheDocument()
  })

  it('falls back to "user" when neither displayName nor email is set', () => {
    renderTerminal({ user: {} })
    expect(screen.getByText(/teno\/user/)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. hide / exit button
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — hide button', () => {
  it('calls onExit when the hide button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await user.click(screen.getByRole('button', { name: 'hide' }))
    expect(props.onExit).toHaveBeenCalledTimes(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. General commands
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — general commands', () => {
  it('"help" with no args lists available sections', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'help')
    expect(getOutput()).toContain('help sections:')
    expect(getOutput()).toContain('- general')
  })

  it('"help" omits sections for disabled features', async () => {
    mockWithDisabled('links', 'cart')
    const user = userEvent.setup()
    render(<Terminal {...buildProps()} />)
    await submitCommand(user, 'help')
    expect(getOutput()).not.toContain('- ln')
    expect(getOutput()).not.toContain('- ct')
  })

  it('"help general" lists general commands', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'help general')
    expect(getOutput()).toContain('general commands:')
  })

  it('"help ln" lists link commands', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'help ln')
    expect(getOutput()).toContain('ln commands:')
  })

  it('"help unknownSection" reports section not found', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'help unknownSection')
    expect(getOutput()).toContain('help section not found: unknownsection')
  })

  it('"date" outputs a valid ISO date string', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'date')
    // ISO format: 2026-09-20T...
    expect(getOutput()).toMatch(/\d{4}-\d{2}-\d{2}T/)
  })

  it('"clear" empties the output', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'clear')
    expect(getOutput()).toBe('')
  })

  it('"sudo" prints the sudoers message', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'sudo')
    expect(getOutput()).toContain('not in the sudoers file')
  })

  it('"ping arg" echoes reply with the arg', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'ping 8.8.8.8')
    expect(getOutput()).toContain('reply from 8.8.8.8')
  })

  it('"coffee" returns the teapot error', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'coffee')
    expect(getOutput()).toContain("418: i'm a teapot")
  })

  it('unknown command outputs "command not found" message', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'foobar')
    expect(getOutput()).toContain('command not found: foobar')
  })

  it('empty input does nothing', async () => {
    const user = userEvent.setup()
    renderTerminal()
    const before = getOutput()
    await user.keyboard('{Enter}')
    expect(getOutput()).toBe(before)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. cd — tab navigation
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — cd command', () => {
  it('"cd links" calls setActiveTab with index 0', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'cd links')
    expect(props.setActiveTab).toHaveBeenCalledWith(0)
    expect(getOutput()).toContain('switched to links.')
  })

  it('"cd timer" calls setActiveTab with index 3', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'cd timer')
    expect(props.setActiveTab).toHaveBeenCalledWith(3)
  })

  it('"cd unknown" reports unknown destination', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'cd nowhere')
    expect(getOutput()).toContain('unknown destination: nowhere')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. ln — links commands
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — ln commands', () => {
  it('"ln ls" with no links prints "no saved links."', async () => {
    const user = userEvent.setup()
    renderTerminal({ savedLinks: [] })
    await submitCommand(user, 'ln ls')
    expect(getOutput()).toContain('no saved links.')
  })

  it('"ln ls" lists saved links by nickname and url', async () => {
    const user = userEvent.setup()
    renderTerminal({
      savedLinks: [{ nickname: 'gh', url: 'https://github.com' }],
    })
    await submitCommand(user, 'ln ls')
    expect(getOutput()).toContain('gh: https://github.com')
  })

  it('"ln new" opens the links form and navigates to links tab', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'ln new')
    expect(props.requestOpenLinksForm).toHaveBeenCalledTimes(1)
    expect(getOutput()).toContain('links form opened.')
  })

  it('"ln drop <nickname>" calls deleteLinkByNickname', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    props.deleteLinkByNickname.mockResolvedValue({ message: 'link deleted.' })
    await submitCommand(user, 'ln drop gh')
    await screen.findByText(/link deleted/, { exact: false })
    expect(props.deleteLinkByNickname).toHaveBeenCalledWith('gh')
  })

  it('"ln" is blocked when links feature is disabled', async () => {
    mockWithDisabled('links')
    const user = userEvent.setup()
    render(<Terminal {...buildProps()} />)
    await submitCommand(user, 'ln ls')
    expect(getOutput()).toContain('links module is disabled.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. ct — cart commands
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — ct commands', () => {
  it('"ct ls" with empty cart prints "cart is empty."', async () => {
    const user = userEvent.setup()
    renderTerminal({ cartItems: [] })
    await submitCommand(user, 'ct ls')
    expect(getOutput()).toContain('cart is empty.')
  })

  it('"ct ls" lists cart items', async () => {
    const user = userEvent.setup()
    renderTerminal({
      cartItems: [{ title: 'Keyboard', url: '' }],
    })
    await submitCommand(user, 'ct ls')
    expect(getOutput()).toContain('Keyboard')
  })

  it('"ct new" opens cart form', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'ct new')
    expect(props.requestOpenCartForm).toHaveBeenCalledTimes(1)
    expect(getOutput()).toContain('cart form opened.')
  })

  it('"ct checkout" renders a receipt', async () => {
    const user = userEvent.setup()
    renderTerminal({ cartItems: [{ title: 'Widget', url: '' }] })
    await submitCommand(user, 'ct checkout')
    expect(getOutput()).toContain('checkout receipt')
  })

  it('"ct checkout" with empty cart shows "cart is empty." in receipt', async () => {
    const user = userEvent.setup()
    renderTerminal({ cartItems: [] })
    await submitCommand(user, 'ct checkout')
    expect(getOutput()).toContain('cart is empty.')
  })

  it('"ct" is blocked when cart feature is disabled', async () => {
    mockWithDisabled('cart')
    const user = userEvent.setup()
    render(<Terminal {...buildProps()} />)
    await submitCommand(user, 'ct ls')
    expect(getOutput()).toContain('cart module is disabled.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. rm — reminders commands
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — rm commands', () => {
  it('"rm ls" with no reminders prints "no active reminders."', async () => {
    const user = userEvent.setup()
    renderTerminal({ reminders: [] })
    await submitCommand(user, 'rm ls')
    expect(getOutput()).toContain('no active reminders.')
  })

  it('"rm ls" lists reminders with index', async () => {
    const user = userEvent.setup()
    renderTerminal({ reminders: [{ text: 'Buy milk' }] })
    await submitCommand(user, 'rm ls')
    expect(getOutput()).toContain('[0] Buy milk')
  })

  it('"rm add <text>" calls addReminder', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    props.addReminder.mockResolvedValue({ message: 'reminder added.' })
    await submitCommand(user, 'rm add buy milk')
    await screen.findByText(/reminder added/, { exact: false })
    expect(props.addReminder).toHaveBeenCalledWith('buy milk')
  })

  it('"rm done <index>" calls deleteReminderByIndex', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    props.deleteReminderByIndex.mockResolvedValue({ message: 'reminder 0 completed.' })
    await submitCommand(user, 'rm done 0')
    await screen.findByText(/reminder 0 completed/, { exact: false })
    expect(props.deleteReminderByIndex).toHaveBeenCalledWith(0)
  })

  it('"rm nuke" calls deleteAllReminders', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    props.deleteAllReminders.mockResolvedValue({ message: '\\o/ BOOM' })
    await submitCommand(user, 'rm nuke')
    await screen.findByText(/BOOM/, { exact: false })
    expect(props.deleteAllReminders).toHaveBeenCalledTimes(1)
  })

  it('"rm" is blocked when reminders feature is disabled', async () => {
    mockWithDisabled('reminders')
    const user = userEvent.setup()
    render(<Terminal {...buildProps()} />)
    await submitCommand(user, 'rm ls')
    expect(getOutput()).toContain('reminders module is disabled.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8. tm — timer commands
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — tm commands', () => {
  it('"tm start <min>" calls timerApi.startTimerCountdown', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'tm start 5')
    expect(props.timerApi.startTimerCountdown).toHaveBeenCalledWith('5')
    expect(getOutput()).toContain('timer started.')
  })

  it('"tm stop" calls timerApi.stopTimer', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'tm stop')
    expect(props.timerApi.stopTimer).toHaveBeenCalledTimes(1)
    expect(getOutput()).toContain('timer stopped.')
  })

  it('"tm status" calls timerApi.getTimerStatus', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'tm status')
    expect(props.timerApi.getTimerStatus).toHaveBeenCalledTimes(1)
    expect(getOutput()).toContain('timer idle')
  })

  it('"tm hack" calls startTimerCountdown with 1 minute and outputs matrix text', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'tm hack')
    expect(props.timerApi.startTimerCountdown).toHaveBeenCalledWith(1)
    expect(getOutput()).toContain('decoding payload')
  })

  it('"tm" is blocked when timer feature is disabled', async () => {
    mockWithDisabled('timer')
    const user = userEvent.setup()
    render(<Terminal {...buildProps()} />)
    await submitCommand(user, 'tm start 5')
    expect(getOutput()).toContain('timer module is disabled.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 9. Command history (arrow keys)
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — command history', () => {
  it('"history" with no commands prints "no history yet."', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'history')
    expect(getOutput()).toContain('no history yet.')
  })

  it('ArrowUp recalls the last command', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'date')
    // After submit, input is cleared. Press ArrowUp to recall.
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{ArrowUp}')
    expect(input.value).toBe('date')
  })

  it('ArrowDown after ArrowUp clears the input', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'date')
    const input = screen.getByRole('textbox')
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{ArrowDown}')
    expect(input.value).toBe('')
  })

  it('"history" lists previously run commands', async () => {
    const user = userEvent.setup()
    renderTerminal()
    await submitCommand(user, 'date')
    await submitCommand(user, 'coffee')
    await submitCommand(user, 'history')
    expect(getOutput()).toContain('1. date')
    expect(getOutput()).toContain('2. coffee')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 10. exit / hide command
// ─────────────────────────────────────────────────────────────────────────────

describe('Terminal — exit / hide commands', () => {
  it('"exit" calls onExit', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'exit')
    expect(props.onExit).toHaveBeenCalled()
  })

  it('"hide" calls onExit', async () => {
    const user = userEvent.setup()
    const { props } = renderTerminal()
    await submitCommand(user, 'hide')
    expect(props.onExit).toHaveBeenCalled()
  })
})

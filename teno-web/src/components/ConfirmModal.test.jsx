/**
 * src/components/ConfirmModal.test.jsx
 *
 * Tests for the <ConfirmModal> reusable component.
 *
 * ConfirmModal reads styleMode from ThemeContext (useTheme). We provide a
 * lightweight wrapper that feeds a controlled styleMode value so tests don't
 * need a full ThemeProvider + Firebase auth.
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ConfirmModal from './ConfirmModal'

// ── Mock ThemeContext so ConfirmModal gets a controlled styleMode ─────────────
// ConfirmModal calls useTheme() which reads from ThemeContext.
// We provide a minimal context value via a thin wrapper.

vi.mock('../ThemeContext', () => ({
  useTheme: vi.fn(),
}))
import { useTheme } from '../ThemeContext'

function renderModal(props = {}, styleMode = 'minimal') {
  vi.mocked(useTheme).mockReturnValue({ styleMode })

  const defaults = {
    message:      'Are you sure?',
    onConfirm:    vi.fn(),
    onCancel:     vi.fn(),
    confirmLabel: 'Yes',
    cancelLabel:  'No',
    isDanger:     true,
    ...props,
  }
  return { ...render(<ConfirmModal {...defaults} />), props: defaults }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('ConfirmModal — rendering', () => {
  it('renders the message text', () => {
    renderModal({ message: 'Delete this?' })
    expect(screen.getByText('Delete this?')).toBeInTheDocument()
  })

  it('renders the confirm button with the provided label', () => {
    renderModal({ confirmLabel: 'Confirm' })
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('renders the cancel button with the provided label', () => {
    renderModal({ cancelLabel: 'Cancel' })
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('falls back to the logout confirm label when confirmLabel is not provided', () => {
    // no confirmLabel prop → resolves from ui.confirm.logout.confirm
    // In minimal mode that is "[ yes ]"
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'minimal' })
    render(
      <ConfirmModal
        message="confirm log out?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: '[ yes ]' })).toBeInTheDocument()
  })

  it('falls back to the logout cancel label when cancelLabel is not provided', () => {
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'minimal' })
    render(
      <ConfirmModal
        message="confirm log out?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: '[ no ]' })).toBeInTheDocument()
  })

  it('falls back to the logout message when message is not provided', () => {
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'minimal' })
    render(
      <ConfirmModal
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('confirm log out?')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Interactions
// ─────────────────────────────────────────────────────────────────────────────

describe('ConfirmModal — interactions', () => {
  it('calls onConfirm exactly once when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(props.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onCancel when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(props.onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel exactly once when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()
    await user.click(screen.getByRole('button', { name: 'No' }))
    expect(props.onCancel).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onConfirm when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()
    await user.click(screen.getByRole('button', { name: 'No' }))
    expect(props.onConfirm).not.toHaveBeenCalled()
  })

  it('calls onCancel when clicking directly on the overlay backdrop', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()
    // The overlay is the outermost div with class confirm-modal-overlay
    const overlay = document.querySelector('.confirm-modal-overlay')
    await user.click(overlay)
    expect(props.onCancel).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onCancel when clicking inside the modal box', async () => {
    const user = userEvent.setup()
    const { props } = renderModal()
    // Clicking the inner modal div should NOT dismiss — event.target !== event.currentTarget
    const modalBox = document.querySelector('.confirm-modal')
    await user.click(modalBox)
    expect(props.onCancel).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. CSS class application — styleMode & isDanger
// ─────────────────────────────────────────────────────────────────────────────

describe('ConfirmModal — CSS classes', () => {
  it('applies modern modifier classes when styleMode is "modern"', () => {
    renderModal({}, 'modern')
    expect(document.querySelector('.confirm-modal-overlay--modern')).toBeInTheDocument()
    expect(document.querySelector('.confirm-modal--modern')).toBeInTheDocument()
    expect(document.querySelector('.confirm-modal-cancel--modern')).toBeInTheDocument()
    expect(document.querySelector('.confirm-modal-confirm--modern')).toBeInTheDocument()
  })

  it('does NOT apply modern modifier classes in minimal mode', () => {
    renderModal({}, 'minimal')
    expect(document.querySelector('.confirm-modal-overlay--modern')).not.toBeInTheDocument()
    expect(document.querySelector('.confirm-modal--modern')).not.toBeInTheDocument()
  })

  it('applies the danger class when isDanger=true (default)', () => {
    renderModal({ isDanger: true })
    expect(document.querySelector('.confirm-modal-confirm--danger')).toBeInTheDocument()
  })

  it('does NOT apply the danger class when isDanger=false', () => {
    renderModal({ isDanger: false })
    expect(document.querySelector('.confirm-modal-confirm--danger')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Theme-aware label resolution
// ─────────────────────────────────────────────────────────────────────────────

describe('ConfirmModal — theme-aware label resolution', () => {
  it('in modern mode, fallback confirm label is "Log out"', () => {
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'modern' })
    render(<ConfirmModal onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })

  it('in modern mode, fallback cancel label is "Cancel"', () => {
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'modern' })
    render(<ConfirmModal onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('explicit confirmLabel overrides the theme fallback in both modes', () => {
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'modern' })
    render(
      <ConfirmModal
        confirmLabel="Delete forever"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Delete forever' })).toBeInTheDocument()
  })
})

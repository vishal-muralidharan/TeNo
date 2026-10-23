import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PromptCard from '../../src/components/PromptCard'

vi.mock('../../src/ThemeContext', () => ({
  useTheme: vi.fn(),
}))
import { useTheme } from '../../src/ThemeContext'

const mockPrompt = {
  id: 'prompt-1',
  title: 'Revision Prompt',
  content: 'You are a meticulous technical editor. Review the text for tone, precision, and clarity.',
  labelId: 'label-123',
  ownerId: 'user-1',
}

describe('PromptCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'minimal' })
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders prompt title and clamped content preview', () => {
    render(<PromptCard prompt={mockPrompt} />)

    expect(screen.getByText('Revision Prompt')).toBeInTheDocument()
    expect(screen.getByText(/You are a meticulous technical editor/i)).toBeInTheDocument()
  })

  it('renders minimal brutalist controls in minimal mode without icons', () => {
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'minimal' })
    render(<PromptCard prompt={mockPrompt} onEdit={vi.fn()} onDelete={vi.fn()} />)

    const card = screen.getByRole('button', { name: /Prompt: Revision Prompt/i })
    expect(card).toHaveClass('prompt-card--minimal')

    // Bracketed text buttons in minimal
    expect(screen.getByText('[ copy ]')).toBeInTheDocument()
    expect(screen.getByText('[ edit ]')).toBeInTheDocument()
    expect(screen.getByText('[ del ]')).toBeInTheDocument()

    // No SVG icons inside buttons in minimal mode
    expect(card.querySelector('svg')).toBeNull()
  })

  it('renders modern controls in modern mode', () => {
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'modern' })
    render(<PromptCard prompt={mockPrompt} onEdit={vi.fn()} onDelete={vi.fn()} />)

    const card = screen.getByRole('button', { name: /Prompt: Revision Prompt/i })
    expect(card).toHaveClass('prompt-card--modern')

    // In modern mode, copy button has title "Copy" and contains an SVG icon
    const copyBtn = screen.getByTitle('Copy')
    expect(copyBtn).toBeInTheDocument()
    expect(copyBtn.querySelector('svg')).toBeInTheDocument()
  })

  it('copies content to clipboard on card click and shows feedback', async () => {
    const onCopySuccess = vi.fn()
    render(<PromptCard prompt={mockPrompt} onCopySuccess={onCopySuccess} />)

    const card = screen.getByRole('button', { name: /Prompt: Revision Prompt/i })
    fireEvent.click(card)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPrompt.content)
      expect(onCopySuccess).toHaveBeenCalledWith(mockPrompt)
    })

    await waitFor(() => {
      expect(screen.getByText('prompt copied!')).toBeInTheDocument()
    })
  })

  it('copies content on Enter keypress on card', async () => {
    render(<PromptCard prompt={mockPrompt} />)

    const card = screen.getByRole('button', { name: /Prompt: Revision Prompt/i })
    fireEvent.keyDown(card, { key: 'Enter' })

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPrompt.content)
    })
  })

  it('copies content on Space keypress on card', async () => {
    render(<PromptCard prompt={mockPrompt} />)

    const card = screen.getByRole('button', { name: /Prompt: Revision Prompt/i })
    fireEvent.keyDown(card, { key: ' ' })

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPrompt.content)
    })
  })

  it('copies content on dedicated copy button click', async () => {
    const onCopySuccess = vi.fn()
    render(<PromptCard prompt={mockPrompt} onCopySuccess={onCopySuccess} />)

    const copyBtn = screen.getByText('[ copy ]')
    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPrompt.content)
      expect(onCopySuccess).toHaveBeenCalledWith(mockPrompt)
    })
  })

  it('triggers onEdit when edit button is clicked without triggering card click', () => {
    const onEdit = vi.fn()
    const onCopySuccess = vi.fn()
    render(<PromptCard prompt={mockPrompt} onEdit={onEdit} onCopySuccess={onCopySuccess} />)

    const editBtn = screen.getByText('[ edit ]')
    fireEvent.click(editBtn)

    expect(onEdit).toHaveBeenCalledWith(mockPrompt)
    expect(onCopySuccess).not.toHaveBeenCalled()
  })

  it('triggers onDelete when delete button is clicked without triggering card click', () => {
    const onDelete = vi.fn()
    const onCopySuccess = vi.fn()
    render(<PromptCard prompt={mockPrompt} onDelete={onDelete} onCopySuccess={onCopySuccess} />)

    const deleteBtn = screen.getByText('[ del ]')
    fireEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith(mockPrompt)
    expect(onCopySuccess).not.toHaveBeenCalled()
  })

  it('handles empty prompt content gracefully', () => {
    render(<PromptCard prompt={{ id: 'p2', title: 'Empty' }} />)

    const card = screen.getByRole('button', { name: /Prompt: Empty/i })
    fireEvent.click(card)

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })

  it('falls back to Untitled when title is missing', () => {
    render(<PromptCard prompt={{ id: 'p3', content: 'Some content' }} />)

    expect(screen.getByText('Untitled Prompt')).toBeInTheDocument()
  })
})

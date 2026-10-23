import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PromptEditorModal from '../../src/components/PromptEditorModal'

vi.mock('../../src/ThemeContext', () => ({
  useTheme: vi.fn(),
}))
import { useTheme } from '../../src/ThemeContext'

describe('PromptEditorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'minimal' })
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(<PromptEditorModal isOpen={false} onSave={vi.fn()} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders modal with new prompt title and empty fields', () => {
    render(<PromptEditorModal isOpen={true} onSave={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: /> \.\/new_prompt/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('prompt_title...')).toHaveValue('')
    expect(screen.getByPlaceholderText('type_prompt_content_here...')).toHaveValue('')
    expect(screen.getByPlaceholderText('label...')).toHaveValue('')
  })

  it('populates fields when editing an existing prompt', () => {
    const existingPrompt = {
      id: 'p-1',
      title: 'Bug Report Helper',
      content: 'Line 1\n  Line 2 (indented)\nLine 3',
      label: 'coding',
    }

    render(
      <PromptEditorModal
        isOpen={true}
        prompt={existingPrompt}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole('dialog', { name: /> \.\/edit_prompt/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('prompt_title...')).toHaveValue('Bug Report Helper')
    expect(screen.getByPlaceholderText('type_prompt_content_here...')).toHaveValue(existingPrompt.content)
    expect(screen.getByPlaceholderText('label...')).toHaveValue('coding')
  })

  it('disables save button when title or content is empty', () => {
    render(<PromptEditorModal isOpen={true} onSave={vi.fn()} onClose={vi.fn()} />)

    const saveBtn = screen.getByRole('button', { name: '[ save ]' })
    expect(saveBtn).toBeDisabled()

    // Fill title only
    fireEvent.change(screen.getByPlaceholderText('prompt_title...'), { target: { value: 'My Prompt' } })
    expect(saveBtn).toBeDisabled()

    // Fill content
    fireEvent.change(screen.getByPlaceholderText('type_prompt_content_here...'), {
      target: { value: 'Prompt body' },
    })
    expect(saveBtn).not.toBeDisabled()
  })

  it('calls onSave with correct payload on valid submit', () => {
    const onSave = vi.fn()
    render(<PromptEditorModal isOpen={true} onSave={onSave} onClose={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('prompt_title...'), { target: { value: '  Refactor Code  ' } })
    fireEvent.change(screen.getByPlaceholderText('label...'), { target: { value: 'Dev' } })
    fireEvent.change(screen.getByPlaceholderText('type_prompt_content_here...'), {
      target: { value: 'function test() {\n  return true;\n}' },
    })

    const saveBtn = screen.getByRole('button', { name: '[ save ]' })
    fireEvent.click(saveBtn)

    expect(onSave).toHaveBeenCalledWith({
      title: 'Refactor Code',
      content: 'function test() {\n  return true;\n}',
      label: 'dev',
    })
  })

  it('preserves existing prompt id when editing on save', () => {
    const onSave = vi.fn()
    const prompt = { id: 'p-10', title: 'Old Title', content: 'Old Content', label: 'ai' }

    render(<PromptEditorModal isOpen={true} prompt={prompt} onSave={onSave} onClose={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('prompt_title...'), { target: { value: 'New Title' } })
    fireEvent.click(screen.getByRole('button', { name: '[ save ]' }))

    expect(onSave).toHaveBeenCalledWith({
      id: 'p-10',
      title: 'New Title',
      content: 'Old Content',
      label: 'ai',
    })
  })

  it('inserts indentation spaces when Tab is pressed in textarea', () => {
    render(<PromptEditorModal isOpen={true} onSave={vi.fn()} onClose={vi.fn()} />)

    const textarea = screen.getByPlaceholderText('type_prompt_content_here...')
    textarea.selectionStart = 0
    textarea.selectionEnd = 0

    fireEvent.change(textarea, { target: { value: 'Hello' } })
    textarea.selectionStart = 0
    textarea.selectionEnd = 0

    fireEvent.keyDown(textarea, { key: 'Tab' })
    expect(textarea.value).toBe('  Hello')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<PromptEditorModal isOpen={true} onSave={vi.fn()} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText(/cancel/i))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking overlay backdrop', () => {
    const onClose = vi.fn()
    render(<PromptEditorModal isOpen={true} onSave={vi.fn()} onClose={onClose} />)

    const overlay = screen.getByTestId('prompt-editor-overlay')
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<PromptEditorModal isOpen={true} onSave={vi.fn()} onClose={onClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('renders modern styling in modern mode', () => {
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'modern' })
    render(<PromptEditorModal isOpen={true} onSave={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: /New Prompt/i })).toHaveClass('prompt-editor-overlay--modern')
    expect(screen.getByText('Save Prompt')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})

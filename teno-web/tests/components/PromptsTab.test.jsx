import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PromptsTab from '../../src/components/PromptsTab'

vi.mock('../../src/ThemeContext', () => ({
  useTheme: vi.fn(),
}))
import { useTheme } from '../../src/ThemeContext'

vi.mock('../../src/components/ShareModal', () => ({
  default: ({ label, onClose }) => (
    <div data-testid="mock-share-modal">
      <span>Share Modal: {label?.name}</span>
      <button onClick={onClose}>Close Share</button>
    </div>
  ),
}))

const mockUser = {
  uid: 'user-123',
  displayName: 'Alice Tester',
  email: 'alice@example.com',
}

const mockPrompts = [
  {
    id: 'p-1',
    title: 'Code Refactor Prompt',
    content: 'Review code for clean architecture and SOLID principles.',
    label: 'coding',
    createdAt: { toMillis: () => 1000 },
  },
  {
    id: 'p-2',
    title: 'Grammar Polish',
    content: 'Check for typos and readability.',
    label: 'writing',
    createdAt: { toMillis: () => 2000 },
  },
  {
    id: 'p-3',
    title: 'General Assistant',
    content: 'Help answer general queries.',
    label: '',
    createdAt: { toMillis: () => 3000 },
  },
]

const mockLabels = [
  {
    id: 'lbl-1',
    name: 'coding',
    type: 'prompts',
    isShared: true,
    memberUids: ['user-123', 'user-456'],
    members: {
      'user-123': { role: 'owner' },
      'user-456': { role: 'editor' },
    },
  },
]

describe('PromptsTab', () => {
  let dbApi
  let promptSnapshotCb
  let labelSnapshotCb

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTheme).mockReturnValue({ styleMode: 'minimal' })

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })

    dbApi = {
      subscribePrompts: vi.fn((cb) => {
        promptSnapshotCb = cb
        cb({
          docs: mockPrompts.map((p) => ({
            id: p.id,
            data: () => p,
          })),
        })
        return vi.fn()
      }),
      subscribeLabelsForSection: vi.fn((type, cb) => {
        labelSnapshotCb = cb
        cb({
          docs: mockLabels.map((l) => ({
            id: l.id,
            data: () => l,
          })),
        })
        return vi.fn()
      }),
      addPrompt: vi.fn().mockResolvedValue({ id: 'p-new' }),
      updatePrompt: vi.fn().mockResolvedValue(undefined),
      deletePrompt: vi.fn().mockResolvedValue(undefined),
      createOrGetLabel: vi.fn().mockResolvedValue('lbl-writing-id'),
    }
  })

  it('subscribes to prompts and labels on mount and cleans up on unmount', () => {
    const unsubPrompts = vi.fn()
    const unsubLabels = vi.fn()
    dbApi.subscribePrompts = vi.fn(() => unsubPrompts)
    dbApi.subscribeLabelsForSection = vi.fn(() => unsubLabels)

    const { unmount } = render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    expect(dbApi.subscribePrompts).toHaveBeenCalled()
    expect(dbApi.subscribeLabelsForSection).toHaveBeenCalledWith('prompts', expect.any(Function))

    unmount()
    expect(unsubPrompts).toHaveBeenCalled()
    expect(unsubLabels).toHaveBeenCalled()
  })

  it('renders prompt cards grouped by section and ungrouped', () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    expect(screen.getByText('Code Refactor Prompt')).toBeInTheDocument()
    expect(screen.getByText('Grammar Polish')).toBeInTheDocument()
    expect(screen.getByText('General Assistant')).toBeInTheDocument()

    // Sections rendered
    expect(screen.getByTestId('prompt-section-coding')).toBeInTheDocument()
    expect(screen.getByTestId('prompt-section-writing')).toBeInTheDocument()
    expect(screen.getByTestId('prompt-section-ungrouped')).toBeInTheDocument()
  })

  it('displays share badge on shared label section', () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const codingSection = screen.getByTestId('prompt-section-coding')
    expect(codingSection).toHaveTextContent('[shared: 2]')
  })

  it('filters prompts when typing in search query', () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const searchInput = screen.getByLabelText('Search prompts')
    fireEvent.change(searchInput, { target: { value: 'Grammar' } })

    expect(screen.getByText('Grammar Polish')).toBeInTheDocument()
    expect(screen.queryByText('Code Refactor Prompt')).not.toBeInTheDocument()
    expect(screen.queryByText('General Assistant')).not.toBeInTheDocument()
  })

  it('shows empty message when no prompts match query', () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const searchInput = screen.getByLabelText('Search prompts')
    fireEvent.change(searchInput, { target: { value: 'NonexistentSearchTerm' } })

    expect(screen.getByTestId('prompts-empty')).toBeInTheDocument()
    expect(screen.getByText(/no matching prompts/i)).toBeInTheDocument()
  })

  it('opens editor modal when clicking "+ Add Prompt" top bar button and creates new prompt', async () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const addBtn = screen.getByRole('button', { name: '[+ add_prompt]' })
    fireEvent.click(addBtn)

    expect(screen.getByPlaceholderText('prompt_title...')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('prompt_title...'), { target: { value: 'New Test Prompt' } })
    fireEvent.change(screen.getByPlaceholderText('type_prompt_content_here...'), {
      target: { value: 'This is test prompt body.' },
    })

    fireEvent.click(screen.getByRole('button', { name: '[ save ]' }))

    await waitFor(() => {
      expect(dbApi.addPrompt).toHaveBeenCalledWith({
        title: 'New Test Prompt',
        content: 'This is test prompt body.',
        label: '',
      })
    })
  })

  it('attaches parent label memberUids when adding prompt with known label', async () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    fireEvent.click(screen.getByRole('button', { name: '[+ add_prompt]' }))

    fireEvent.change(screen.getByPlaceholderText('prompt_title...'), { target: { value: 'New Coder' } })
    fireEvent.change(screen.getByPlaceholderText('label...'), { target: { value: 'coding' } })
    fireEvent.change(screen.getByPlaceholderText('type_prompt_content_here...'), {
      target: { value: 'Code prompt' },
    })

    fireEvent.click(screen.getByRole('button', { name: '[ save ]' }))

    await waitFor(() => {
      expect(dbApi.addPrompt).toHaveBeenCalledWith({
        title: 'New Coder',
        content: 'Code prompt',
        label: 'coding',
        labelId: 'lbl-1',
        memberUids: ['user-123', 'user-456'],
      })
    })
  })

  it('opens editor modal with prefilled label when section add button is clicked', () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const writingSection = screen.getByTestId('prompt-section-writing')
    const addSectionBtn = writingSection.querySelector('.prompts-section-add-btn')
    fireEvent.click(addSectionBtn)

    expect(screen.getByPlaceholderText('label...')).toHaveValue('writing')
  })

  it('opens editor modal when editing prompt card and saves updates', async () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const codingSection = screen.getByTestId('prompt-section-coding')
    const editBtn = codingSection.querySelector('.prompt-card-btn-edit')
    fireEvent.click(editBtn)

    expect(screen.getByPlaceholderText('prompt_title...')).toHaveValue('Code Refactor Prompt')

    fireEvent.change(screen.getByPlaceholderText('prompt_title...'), {
      target: { value: 'Code Refactor Prompt v2' },
    })

    fireEvent.click(screen.getByRole('button', { name: '[ save ]' }))

    await waitFor(() => {
      expect(dbApi.updatePrompt).toHaveBeenCalledWith('p-1', {
        title: 'Code Refactor Prompt v2',
        content: 'Review code for clean architecture and SOLID principles.',
        label: 'coding',
        labelId: 'lbl-1',
        memberUids: ['user-123', 'user-456'],
      })
    })
  })

  it('opens confirm modal when deleting prompt card and executes delete', async () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const codingSection = screen.getByTestId('prompt-section-coding')
    const deleteBtn = codingSection.querySelector('.prompt-card-btn-delete')
    fireEvent.click(deleteBtn)

    expect(screen.getByText(/Delete prompt "Code Refactor Prompt" permanently\?/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '[ yes ]' }))

    await waitFor(() => {
      expect(dbApi.deletePrompt).toHaveBeenCalledWith('p-1')
    })
  })

  it('opens ShareModal when clicking share on a labeled section', async () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const codingSection = screen.getByTestId('prompt-section-coding')
    const shareBtn = codingSection.querySelector('.share-trigger')
    fireEvent.click(shareBtn)

    expect(screen.getByTestId('mock-share-modal')).toBeInTheDocument()
    expect(screen.getByText(/Share Modal: coding/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close Share'))
    expect(screen.queryByTestId('mock-share-modal')).not.toBeInTheDocument()
  })

  it('displays copy toast feedback when a prompt is copied', async () => {
    render(<PromptsTab user={mockUser} dbApi={dbApi} />)

    const card = screen.getByRole('button', { name: /Prompt: Grammar Polish/i })
    fireEvent.click(card)

    await waitFor(() => {
      const toasts = screen.getAllByText('prompt copied!')
      expect(toasts.length).toBeGreaterThan(0)
    })
  })
})

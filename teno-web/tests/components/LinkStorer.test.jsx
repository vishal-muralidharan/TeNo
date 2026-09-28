/**
 * tests/components/LinkStorer.test.jsx
 *
 * Unit / integration tests for recently-added LinkStorer features:
 *
 *   1. Alt URL — domain extraction helper (pure logic)
 *   2. Alt URL — saved in addEntry payload when provided
 *   3. Alt URL — omitted when alt URL field is left empty
 *   4. Alt URL — dual favicon shown when altUrl present
 *   5. Alt URL — alt favicon has correct title and opacity
 *   6. Delete label — trash button visible in labeled section headers
 *   7. Delete label — confirmation modal opens, cancel is a no-op
 *   8. Delete label — confirms and calls updateEntry for every item
 *   9. Inline label rename — click activates input pre-filled with current name
 *  10. Inline label rename — Escape cancels without saving
 *  11. Inline label rename — Enter saves new name, calls updateEntry per item
 *  12. Inline label rename — unchanged / blank name is a no-op
 *  13. Click-outside — form is closed initially
 *  14. Click-outside — form opens on toggle click
 *  15. Click-outside — form closes on outside click
 *  16. Click-outside — inside click does NOT close form
 *  17. Click-outside — toggle button closes (no double-toggle)
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LinkStorer from '../../src/components/LinkStorer'

// ── Mock ThemeContext ─────────────────────────────────────────────────────────
vi.mock('../../src/ThemeContext', () => ({ useTheme: vi.fn() }))
import { useTheme } from '../../src/ThemeContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_USER = { uid: 'u1', displayName: 'Alice', email: 'alice@test.com' }

function buildDbApi(links = [], overrides = {}) {
  return {
    subscribeEntries: vi.fn((_, cb) => {
      cb({ docs: links.map(l => ({ id: l.id, data: () => l })) })
      return vi.fn()
    }),
    subscribeLabelOrder: vi.fn((_, cb) => {
      cb({ exists: () => false })
      return vi.fn()
    }),
    subscribeLabelsForSection: vi.fn((_, cb) => {
      cb({ docs: [] })
      return vi.fn()
    }),
    addEntry: vi.fn().mockResolvedValue(undefined),
    updateEntry: vi.fn().mockResolvedValue(undefined),
    deleteEntry: vi.fn().mockResolvedValue(undefined),
    updateLabelOrder: vi.fn().mockResolvedValue(undefined),
    createOrGetLabel: vi.fn().mockResolvedValue('label-id-1'),
    ...overrides,
  }
}

function renderStorer(links = [], dbApiOverrides = {}) {
  vi.mocked(useTheme).mockReturnValue({ styleMode: 'minimal' })
  const dbApi = buildDbApi(links, dbApiOverrides)
  render(
    <LinkStorer
      collectionName="saved_links"
      title="Saved Links"
      user={MOCK_USER}
      dbApi={dbApi}
    />
  )
  return { dbApi }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Alt URL domain extraction — pure logic
// ─────────────────────────────────────────────────────────────────────────────

describe('altUrl domain extraction logic', () => {
  function extract(raw) {
    let url = raw.trim()
    if (!url) return ''
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
    try { return new URL(url).hostname } catch { return url }
  }

  it('returns empty string for empty input', () => {
    expect(extract('')).toBe('')
  })

  it('extracts hostname from a full https URL', () => {
    expect(extract('https://www.amazon.com/bowl')).toBe('www.amazon.com')
  })

  it('prepends https:// when scheme is missing', () => {
    expect(extract('flipkart.com/bowl')).toBe('flipkart.com')
  })

  it('handles http:// URLs correctly', () => {
    expect(extract('http://example.com/path')).toBe('example.com')
  })

  it('trims surrounding whitespace before parsing', () => {
    expect(extract('  amazon.in/dp/xyz  ')).toBe('amazon.in')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2-3. Alt URL — add form payload
// ─────────────────────────────────────────────────────────────────────────────

describe('add link form — alt URL payload', () => {
  it('includes altUrl and altDomain in addEntry payload when provided', async () => {
    const user = userEvent.setup()
    const { dbApi } = renderStorer()

    fireEvent.click(screen.getByRole('button', { name: /add_new/ }))

    await user.type(screen.getByPlaceholderText('Add Nickname'), 'Bowl')
    await user.type(screen.getByPlaceholderText('Enter URL'), 'amazon.com/bowl')
    await user.type(screen.getByPlaceholderText('Alt URL (optional)'), 'flipkart.com/bowl')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(dbApi.addEntry).toHaveBeenCalledOnce())
    const payload = dbApi.addEntry.mock.calls[0][1]
    expect(payload.url).toBe('https://amazon.com/bowl')
    expect(payload.altUrl).toBe('https://flipkart.com/bowl')
    expect(payload.altDomain).toBe('flipkart.com')
  })

  it('omits altUrl and altDomain from addEntry when alt URL is blank', async () => {
    const user = userEvent.setup()
    const { dbApi } = renderStorer()

    fireEvent.click(screen.getByRole('button', { name: /add_new/ }))

    await user.type(screen.getByPlaceholderText('Add Nickname'), 'Bowl')
    await user.type(screen.getByPlaceholderText('Enter URL'), 'amazon.com/bowl')
    // leave Alt URL blank
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(dbApi.addEntry).toHaveBeenCalledOnce())
    const payload = dbApi.addEntry.mock.calls[0][1]
    expect(payload.altUrl).toBeUndefined()
    expect(payload.altDomain).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4-5. Alt URL — dual favicon display
// ─────────────────────────────────────────────────────────────────────────────

describe('dual favicon display', () => {
  const BASE = { nickname: 'Bowl', url: 'https://a.com', domain: 'a.com', label: '', description: '', isFavorite: false, createdAt: null }

  it('renders one favicon when altUrl is absent', () => {
    renderStorer([{ ...BASE, id: 'l1' }])
    const groups = document.querySelectorAll('.favicon-group')
    expect(groups).toHaveLength(1)
    expect(groups[0].querySelectorAll('img.favicon')).toHaveLength(1)
  })

  it('renders two favicons when altUrl is present', () => {
    renderStorer([{ ...BASE, id: 'l2', altUrl: 'https://b.com/bowl', altDomain: 'b.com' }])
    const groups = document.querySelectorAll('.favicon-group')
    expect(groups[0].querySelectorAll('img.favicon')).toHaveLength(2)
  })

  it('alt favicon title contains the alt domain', () => {
    renderStorer([{ ...BASE, id: 'l3', altUrl: 'https://flipkart.com/bowl', altDomain: 'flipkart.com' }])
    const imgs = document.querySelectorAll('.favicon-group img.favicon')
    expect(imgs[1].title).toContain('flipkart.com')
  })

  it('alt favicon has 0.75 opacity', () => {
    renderStorer([{ ...BASE, id: 'l4', altUrl: 'https://b.com', altDomain: 'b.com' }])
    const imgs = document.querySelectorAll('.favicon-group img.favicon')
    expect(imgs[1].style.opacity).toBe('0.75')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6-8. Delete label
// ─────────────────────────────────────────────────────────────────────────────

describe('delete label', () => {
  const LINKS = [
    { id: 'a', nickname: 'A', url: 'https://a.com', domain: 'a.com', label: 'kitchen', description: '', isFavorite: false, createdAt: null },
    { id: 'b', nickname: 'B', url: 'https://b.com', domain: 'b.com', label: 'kitchen', description: '', isFavorite: false, createdAt: null },
  ]

  it('shows a trash button titled "Delete label…" in the section header', () => {
    renderStorer(LINKS)
    expect(screen.getAllByTitle(/Delete label/i).length).toBeGreaterThanOrEqual(1)
  })

  it('opens a confirmation modal when the trash button is clicked', async () => {
    const user = userEvent.setup()
    renderStorer(LINKS)

    await user.click(screen.getAllByTitle(/Delete label/i)[0])

    expect(screen.getByRole('button', { name: 'Delete Label' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('does NOT call updateEntry when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const { dbApi } = renderStorer(LINKS)

    await user.click(screen.getAllByTitle(/Delete label/i)[0])
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(dbApi.updateEntry).not.toHaveBeenCalled()
  })

  it('calls updateEntry with label:"" for every item in the section on confirm', async () => {
    const user = userEvent.setup()
    const { dbApi } = renderStorer(LINKS)

    await user.click(screen.getAllByTitle(/Delete label/i)[0])
    await user.click(screen.getByRole('button', { name: 'Delete Label' }))

    await waitFor(() => expect(dbApi.updateEntry).toHaveBeenCalledTimes(2))
    dbApi.updateEntry.mock.calls.forEach(([,, payload]) => {
      expect(payload).toEqual({ label: '' })
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 9-12. Inline label rename
// ─────────────────────────────────────────────────────────────────────────────

describe('inline label rename', () => {
  const LINKS = [
    { id: 'a', nickname: 'A', url: 'https://a.com', domain: 'a.com', label: 'tools', description: '', isFavorite: false, createdAt: null },
    { id: 'b', nickname: 'B', url: 'https://b.com', domain: 'b.com', label: 'tools', description: '', isFavorite: false, createdAt: null },
  ]

  it('clicking the label title activates an inline input pre-filled with current name', async () => {
    const user = userEvent.setup()
    renderStorer(LINKS)

    await user.click(screen.getByText('tools'))
    expect(screen.getByDisplayValue('tools')).toBeInTheDocument()
  })

  it('Escape cancels without calling updateEntry', async () => {
    const user = userEvent.setup()
    const { dbApi } = renderStorer(LINKS)

    await user.click(screen.getByText('tools'))
    await user.keyboard('{Escape}')

    expect(dbApi.updateEntry).not.toHaveBeenCalled()
  })

  it('Enter saves the new name via updateEntry for each item in the section', async () => {
    const user = userEvent.setup()
    const { dbApi } = renderStorer(LINKS)

    await user.click(screen.getByText('tools'))
    const input = screen.getByDisplayValue('tools')
    await user.clear(input)
    await user.type(input, 'gadgets')
    await user.keyboard('{Enter}')

    await waitFor(() => expect(dbApi.updateEntry).toHaveBeenCalledTimes(2))
    dbApi.updateEntry.mock.calls.forEach(([,, payload]) => {
      expect(payload).toEqual({ label: 'gadgets' })
    })
  })

  it('does not save when the name is unchanged', async () => {
    const user = userEvent.setup()
    const { dbApi } = renderStorer(LINKS)

    await user.click(screen.getByText('tools'))
    // type nothing, just confirm
    await user.keyboard('{Enter}')

    expect(dbApi.updateEntry).not.toHaveBeenCalled()
  })

  it('does not save when the name is cleared to blank', async () => {
    const user = userEvent.setup()
    const { dbApi } = renderStorer(LINKS)

    await user.click(screen.getByText('tools'))
    await user.clear(screen.getByDisplayValue('tools'))
    await user.keyboard('{Enter}')

    expect(dbApi.updateEntry).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 13-17. Click-outside closes the add-link form
// ─────────────────────────────────────────────────────────────────────────────

describe('click-outside closes add-link form', () => {
  it('form is closed (no .collapsible-form.open) on initial render', () => {
    renderStorer()
    expect(document.querySelector('.collapsible-form.open')).toBeNull()
  })

  it('form opens when the toggle button is clicked', async () => {
    const user = userEvent.setup()
    renderStorer()

    await user.click(screen.getByRole('button', { name: /add_new/ }))
    expect(document.querySelector('.collapsible-form.open')).toBeTruthy()
  })

  it('form closes when clicking outside it', async () => {
    const user = userEvent.setup()
    renderStorer()

    await user.click(screen.getByRole('button', { name: /add_new/ }))
    expect(document.querySelector('.collapsible-form.open')).toBeTruthy()

    // Click the body — outside the form and toggle button
    await user.click(document.body)

    await waitFor(() => {
      expect(document.querySelector('.collapsible-form.open')).toBeNull()
    })
  })

  it('form stays open when clicking inside it', async () => {
    const user = userEvent.setup()
    renderStorer()

    await user.click(screen.getByRole('button', { name: /add_new/ }))
    // Click an input inside the form
    await user.click(screen.getByPlaceholderText('Add Nickname'))

    expect(document.querySelector('.collapsible-form.open')).toBeTruthy()
  })

  it('toggle button closes form without double-toggling', async () => {
    const user = userEvent.setup()
    renderStorer()

    await user.click(screen.getByRole('button', { name: /add_new/ }))
    expect(document.querySelector('.collapsible-form.open')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /close/ }))

    await waitFor(() => {
      expect(document.querySelector('.collapsible-form.open')).toBeNull()
    })
  })
})

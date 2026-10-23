import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Search, UserPlus } from 'lucide-react'
import { useTheme } from '../ThemeContext'
import { getUiConfig } from '../utils/uiConfig'
import PromptCard from './PromptCard'
import PromptEditorModal from './PromptEditorModal'
import ConfirmModal from './ConfirmModal'
import ShareModal from './ShareModal'

export default function PromptsTab({ user, dbApi }) {
  const { styleMode } = useTheme()
  const ui = getUiConfig(styleMode)
  const isModern = styleMode === 'modern'

  const [prompts, setPrompts] = useState([])
  const [sectionLabels, setSectionLabels] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [editorState, setEditorState] = useState(null) // { isOpen: true, prompt: null | prompt, initialLabel: '' }
  const [pendingDelete, setPendingDelete] = useState(null)
  const [shareModalTarget, setShareModalTarget] = useState(null)
  const [creatingLabelFor, setCreatingLabelFor] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const toastTimerRef = useRef(null)

  // 1. Subscribe to prompts
  useEffect(() => {
    if (!user || !dbApi) return
    const unsub = dbApi.subscribePrompts((snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() ?? (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0)
        const timeB = b.createdAt?.toMillis?.() ?? (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0)
        return timeB - timeA
      })
      setPrompts(data)
    })
    return () => unsub?.()
  }, [user, dbApi])

  // 2. Subscribe to labels for 'prompts' section (for share badges & collaborative syncing)
  useEffect(() => {
    if (!user || !dbApi) return
    const unsub = dbApi.subscribeLabelsForSection('prompts', (snapshot) => {
      const map = {}
      snapshot.docs.forEach((d) => {
        const data = { id: d.id, ...d.data() }
        map[(data.name || '').toLowerCase()] = data
      })
      setSectionLabels(map)
    })
    return () => unsub?.()
  }, [user, dbApi])

  // Toast helper
  const showToast = (message) => {
    setToastMessage(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  // Filter prompts by search query
  const filteredPrompts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return prompts
    return prompts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q) ||
        (p.label || '').toLowerCase().includes(q)
    )
  }, [prompts, searchQuery])

  // Group prompts by label
  const groupedSections = useMemo(() => {
    const groups = {}

    filteredPrompts.forEach((p) => {
      const labelKey = (p.label || '').trim().toLowerCase()
      const key = labelKey || 'ungrouped'
      if (!groups[key]) {
        groups[key] = {
          key,
          label: labelKey,
          items: [],
        }
      }
      groups[key].items.push(p)
    })

    return Object.values(groups).sort((a, b) => {
      if (a.key === 'ungrouped') return 1
      if (b.key === 'ungrouped') return -1
      return a.label.localeCompare(b.label)
    })
  }, [filteredPrompts])

  // Save prompt (create or update)
  const handleSavePrompt = async (data) => {
    if (!dbApi) return

    const labelName = (data.label || '').trim().toLowerCase()
    const parentLabel = labelName ? sectionLabels[labelName] : null

    const payload = {
      title: data.title,
      content: data.content,
      label: labelName,
      ...(parentLabel ? { labelId: parentLabel.id, memberUids: parentLabel.memberUids || [user.uid] } : {}),
    }

    try {
      if (data.id) {
        await dbApi.updatePrompt(data.id, payload)
        showToast(isModern ? 'Prompt updated successfully' : 'prompt updated')
      } else {
        await dbApi.addPrompt(payload)
        showToast(isModern ? 'Prompt created successfully' : 'prompt created')
      }
      setEditorState(null)
    } catch (err) {
      console.error('Failed to save prompt:', err)
    }
  }

  // Delete prompt
  const confirmDeletePrompt = async () => {
    if (!pendingDelete || !dbApi) return
    try {
      await dbApi.deletePrompt(pendingDelete.id)
      showToast(isModern ? 'Prompt deleted' : 'prompt deleted')
    } catch (err) {
      console.error('Failed to delete prompt:', err)
    } finally {
      setPendingDelete(null)
    }
  }

  // Share label handler
  const handleShareClick = async (sectionLabel) => {
    if (!sectionLabel || !dbApi) return
    const key = sectionLabel.toLowerCase()
    if (sectionLabels[key]) {
      setShareModalTarget(sectionLabels[key])
      return
    }

    setCreatingLabelFor(sectionLabel)
    try {
      const labelId = await dbApi.createOrGetLabel(sectionLabel, 'prompts', {
        displayName: user?.displayName,
        email: user?.email,
      })
      const { doc: firestoreDoc, getDoc: firestoreGetDoc } = await import('firebase/firestore')
      const { db: firestoreDb } = await import('../firebase')
      const snap = await firestoreGetDoc(firestoreDoc(firestoreDb, 'labels', labelId))
      if (snap.exists()) {
        setShareModalTarget({ id: snap.id, ...snap.data() })
      }
    } catch (err) {
      console.error('Failed to provision label:', err)
    } finally {
      setCreatingLabelFor(null)
    }
  }

  return (
    <div className="tab-pane prompts-tab" data-testid="prompts-tab">
      {/* Top action & search bar */}
      <div className="prompts-top-bar">
        <div className="prompts-search-wrapper">
          {isModern && <Search size={14} className="prompts-search-icon" />}
          <input
            type="text"
            className="prompts-search-input"
            placeholder={ui.placeholders.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search prompts"
          />
        </div>

        <button
          type="button"
          className="prompts-add-btn"
          onClick={() => setEditorState({ isOpen: true, prompt: null, initialLabel: '' })}
          aria-label={ui.addBtn.prompt}
        >
          {isModern && <Plus size={14} strokeWidth={2.5} />}
          <span>{ui.addBtn.prompt}</span>
        </button>
      </div>

      <h2 className="tab-title">{ui.tabs.prompts}</h2>

      {/* Prompts list / sections */}
      {groupedSections.length === 0 ? (
        <div className="prompts-empty" data-testid="prompts-empty">
          <p>
            {searchQuery
              ? (isModern ? 'No prompts matching search.' : 'no matching prompts.')
              : (isModern ? 'No prompts yet. Click "+ Add Prompt" to create your first one.' : '$_ no prompts stored. use [+ add_prompt] to create.')}
          </p>
        </div>
      ) : (
        <div className="prompts-sections-container">
          {groupedSections.map((section) => {
            const hasLabel = Boolean(section.label)
            const labelDoc = hasLabel ? sectionLabels[section.label.toLowerCase()] : null
            const isShared = Boolean(labelDoc?.isShared)
            const memberCount = Object.keys(labelDoc?.members || {}).length

            return (
              <section
                key={section.key}
                className="prompts-section section-block"
                data-testid={`prompt-section-${section.key}`}
              >
                <h3 className="section-title prompts-section-title">
                  <span className="prompts-section-name">
                    {hasLabel ? section.label : (isModern ? 'Ungrouped' : 'ungrouped')}
                  </span>

                  {/* Share badge */}
                  {isShared && (
                    <span className="share-badge">
                      {memberCount > 1
                        ? ui.share.badgeCount.replace('{n}', memberCount)
                        : ui.share.badge}
                    </span>
                  )}

                  {/* Share button */}
                  {hasLabel && (
                    <button
                      type="button"
                      className="icon-btn share-trigger"
                      title={ui.share.btn}
                      disabled={creatingLabelFor === section.label}
                      onClick={() => handleShareClick(section.label)}
                      style={{
                        padding: isModern ? '4px' : '0 4px',
                        fontSize: '0.75rem',
                        color: isShared ? 'var(--color-accent)' : 'var(--text-muted)',
                        textTransform: 'var(--text-transform)',
                      }}
                    >
                      {isModern ? <UserPlus size={14} /> : ui.share.btn}
                    </button>
                  )}

                  {/* Add prompt directly to this section */}
                  <button
                    type="button"
                    className="icon-btn prompts-section-add-btn"
                    title={`Add prompt to ${section.label || 'ungrouped'}`}
                    onClick={() =>
                      setEditorState({
                        isOpen: true,
                        prompt: null,
                        initialLabel: section.label || '',
                      })
                    }
                    style={{
                      padding: isModern ? '4px' : '0 4px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      textTransform: 'var(--text-transform)',
                    }}
                  >
                    {isModern ? <Plus size={14} /> : '[+ add]'}
                  </button>
                </h3>

                <div className="prompts-grid">
                  {section.items.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onEdit={(p) => setEditorState({ isOpen: true, prompt: p, initialLabel: p.label || '' })}
                      onDelete={(p) => setPendingDelete(p)}
                      onCopySuccess={() => showToast(ui.prompts.copied)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Text Editor Modal */}
      {editorState?.isOpen && (
        <PromptEditorModal
          isOpen={true}
          prompt={editorState.prompt}
          initialLabel={editorState.initialLabel}
          onSave={handleSavePrompt}
          onClose={() => setEditorState(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <ConfirmModal
          message={`Delete prompt "${pendingDelete.title || 'Untitled'}" permanently?`}
          confirmLabel={ui.confirm.deleteItem.confirm}
          cancelLabel={ui.confirm.deleteItem.cancel}
          onConfirm={confirmDeletePrompt}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Share Modal */}
      {shareModalTarget && (
        <ShareModal
          label={shareModalTarget}
          currentUser={user}
          onClose={() => setShareModalTarget(null)}
          dbApi={dbApi}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="prompts-floating-toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  )
}

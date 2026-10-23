import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Copy, History, RotateCcw } from 'lucide-react'
import { useTheme } from '../ThemeContext'
import { getUiConfig } from '../utils/uiConfig'
import {
  getPromptVersions,
  getNextVersionId,
  createTimestamp,
} from '../lib/db'

export default function PromptEditorModal({
  isOpen = true,
  prompt = null,
  initialLabel = '',
  onSave,
  onClose,
}) {
  const { styleMode } = useTheme()
  const ui = getUiConfig(styleMode)
  const isModern = styleMode === 'modern'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [label, setLabel] = useState('')
  const [validationError, setValidationError] = useState('')
  const [copiedOlderVersion, setCopiedOlderVersion] = useState(false)

  const versions = useMemo(() => getPromptVersions(prompt), [prompt])
  const activeVersionId = prompt?.currentVersionId || versions[versions.length - 1]?.id || 'v1'
  const [selectedVersionId, setSelectedVersionId] = useState(activeVersionId)

  const titleInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(prompt?.title || '')
      setLabel(prompt?.label || initialLabel || '')
      setValidationError('')
      setCopiedOlderVersion(false)

      const currentVers = getPromptVersions(prompt)
      const currentId = prompt?.currentVersionId || currentVers[currentVers.length - 1]?.id || 'v1'
      setSelectedVersionId(currentId)

      const activeVer = currentVers.find((v) => v.id === currentId) || currentVers[currentVers.length - 1]
      setContent(activeVer?.content || prompt?.content || '')

      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 50)

      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen, prompt, initialLabel])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isEdit = Boolean(prompt && prompt.id)
  const isTitleEmpty = !title.trim()
  const isContentEmpty = !content.trim()
  const canSave = !isTitleEmpty && !isContentEmpty
  const isViewingCurrent = selectedVersionId === activeVersionId

  const handleSelectVersion = (versionId) => {
    setSelectedVersionId(versionId)
    setCopiedOlderVersion(false)
    const targetVer = versions.find((v) => v.id === versionId)
    if (targetVer) {
      setContent(targetVer.content || '')
    }
    setValidationError('')
  }

  const handleSaveAction = (type) => {
    if (isTitleEmpty) {
      setValidationError('Title cannot be empty.')
      titleInputRef.current?.focus()
      return
    }
    if (isContentEmpty) {
      setValidationError('Content cannot be empty.')
      textareaRef.current?.focus()
      return
    }

    if (type === 'create') {
      const initialVerId = 'v1'
      const initialVers = [
        { id: initialVerId, content, createdAt: createTimestamp() },
      ]
      onSave?.({
        title: title.trim(),
        content,
        label: label.trim().toLowerCase(),
        currentVersionId: initialVerId,
        versions: initialVers,
        saveType: 'create',
        isNewVersion: false,
      }, false)
      return
    }

    if (type === 'update_current') {
      const updatedVersions = versions.length > 0
        ? versions.map((v) => (v.id === activeVersionId ? { ...v, content } : v))
        : [{ id: activeVersionId, content, createdAt: createTimestamp() }]

      onSave?.({
        id: prompt.id,
        title: title.trim(),
        content,
        label: label.trim().toLowerCase(),
        currentVersionId: activeVersionId,
        versions: updatedVersions,
        saveType: 'update_current',
        isNewVersion: false,
      }, false)
      return
    }

    if (type === 'new_version') {
      const baseVersions = versions.length > 0
        ? versions
        : [{ id: 'v1', content: prompt?.content || '', createdAt: createTimestamp() }]
      const nextId = getNextVersionId(baseVersions)
      const newVersionObj = {
        id: nextId,
        content,
        createdAt: createTimestamp(),
      }
      const updatedVersions = [...baseVersions, newVersionObj]
      onSave?.({
        id: prompt.id,
        title: title.trim(),
        content,
        label: label.trim().toLowerCase(),
        currentVersionId: nextId,
        versions: updatedVersions,
        saveType: 'new_version',
        isNewVersion: true,
      }, true)
      return
    }
  }

  const handleRestore = () => {
    const targetVer = versions.find((v) => v.id === selectedVersionId)
    if (!targetVer) return

    onSave?.({
      id: prompt.id,
      title: title.trim(),
      content: targetVer.content || '',
      label: label.trim().toLowerCase(),
      currentVersionId: selectedVersionId,
      versions,
      saveType: 'restore_version',
      versionId: selectedVersionId,
      isNewVersion: false,
    }, false)
  }

  const handleCopyOlderVersion = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!content) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content)
      }
      setCopiedOlderVersion(true)
      setTimeout(() => setCopiedOlderVersion(false), 2000)
    } catch (err) {
      console.error('Failed to copy older version prompt:', err)
    }
  }

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target
      const { selectionStart, selectionEnd, value } = target
      const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd)
      setContent(newValue)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + 2
          textareaRef.current.selectionEnd = selectionStart + 2
        }
      }, 0)
    }
  }

  const formatVersionDate = (timestamp) => {
    if (!timestamp) return ''
    let date
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else {
      date = new Date(timestamp)
    }
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const modalTitle = isEdit ? ui.prompts.editorEdit : ui.prompts.editorNew

  // Display versions list
  const displayVersions = versions.length > 0 ? versions : (isEdit ? [{ id: 'v1', content: prompt?.content || '', createdAt: prompt?.createdAt }] : [])

  return createPortal(
    <div
      className={`prompt-editor-overlay ${isModern ? 'prompt-editor-overlay--modern' : 'prompt-editor-overlay--minimal'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      data-testid="prompt-editor-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={modalTitle}
    >
      <div className={`prompt-editor-modal ${isModern ? 'prompt-editor-modal--modern' : 'prompt-editor-modal--minimal'}`}>
        <div className="prompt-editor-header">
          <div className="prompt-editor-header-title-group">
            <h3 className="prompt-editor-title">{modalTitle}</h3>
            {isEdit && (
              <span className="prompt-editor-header-badge">
                {isModern ? `Version ${activeVersionId.replace(/^v/i, '') || activeVersionId}` : `[ ${activeVersionId} ]`}
              </span>
            )}
          </div>
          <button
            type="button"
            className="prompt-editor-close-btn"
            onClick={onClose}
            aria-label={ui.prompts.cancel}
          >
            {isModern ? <X size={18} /> : '[ x ]'}
          </button>
        </div>

        <div className="prompt-editor-body">
          <div className="prompt-editor-main">
            <form onSubmit={(e) => e.preventDefault()} className="prompt-editor-form">
              <div className="prompt-editor-field">
                <label htmlFor="prompt-title" className="prompt-editor-label">
                  {ui.prefix.section}Title
                </label>
                <input
                  id="prompt-title"
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  readOnly={!isViewingCurrent}
                  onChange={(e) => {
                    if (!isViewingCurrent) return
                    setTitle(e.target.value)
                    if (validationError) setValidationError('')
                  }}
                  placeholder={ui.prompts.titlePlaceholder}
                  className={`prompt-editor-input ${!isViewingCurrent ? 'prompt-editor-input--readonly' : ''}`}
                  autoComplete="off"
                />
              </div>

              <div className="prompt-editor-field">
                <label htmlFor="prompt-label" className="prompt-editor-label">
                  {ui.prefix.section}Label
                </label>
                <input
                  id="prompt-label"
                  type="text"
                  value={label}
                  readOnly={!isViewingCurrent}
                  onChange={(e) => {
                    if (!isViewingCurrent) return
                    setLabel(e.target.value)
                  }}
                  placeholder={ui.prompts.labelPlaceholder}
                  className={`prompt-editor-input prompt-editor-input--label ${!isViewingCurrent ? 'prompt-editor-input--readonly' : ''}`}
                  autoComplete="off"
                />
              </div>

              <div className="prompt-editor-field prompt-editor-field--flex">
                <div className="prompt-editor-content-header">
                  <label htmlFor="prompt-content" className="prompt-editor-label">
                    {ui.prefix.section}Content
                  </label>
                  {!isViewingCurrent && (
                    <div className="prompt-editor-readonly-group">
                      <span className="prompt-editor-readonly-tag">
                        {isModern ? `Viewing ${selectedVersionId} (Read-only)` : `> [ viewing ${selectedVersionId} · read-only ]`}
                      </span>
                      <button
                        type="button"
                        className="prompt-editor-copy-badge-btn"
                        onClick={handleCopyOlderVersion}
                        title={copiedOlderVersion ? ui.prompts.copySuccess : ui.prompts.copy}
                        aria-label={copiedOlderVersion ? ui.prompts.copySuccess : ui.prompts.copy}
                      >
                        {copiedOlderVersion ? (
                          isModern ? <><Check size={12} /> Copied!</> : '[ copied! ]'
                        ) : (
                          isModern ? <><Copy size={12} /> Copy</> : ui.prompts.copy
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <textarea
                  id="prompt-content"
                  ref={textareaRef}
                  value={content}
                  readOnly={!isViewingCurrent}
                  onChange={(e) => {
                    if (!isViewingCurrent) return
                    setContent(e.target.value)
                    if (validationError) setValidationError('')
                  }}
                  onKeyDown={isViewingCurrent ? handleTextareaKeyDown : undefined}
                  placeholder={ui.prompts.contentPlaceholder}
                  className={`prompt-editor-textarea ${!isViewingCurrent ? 'prompt-editor-textarea--readonly' : ''}`}
                  rows={12}
                  spellCheck="false"
                />
              </div>

              {validationError && (
                <div className="prompt-editor-error" role="alert">
                  {validationError}
                </div>
              )}

              <div className="prompt-editor-actions">
                <button
                  type="button"
                  className="prompt-editor-btn prompt-editor-btn-cancel"
                  onClick={onClose}
                >
                  {ui.prompts.cancel}
                </button>

                {!isViewingCurrent ? (
                  <div className="prompt-editor-actions-group">
                    <button
                      type="button"
                      className="prompt-editor-btn prompt-editor-btn-copy-older"
                      onClick={handleCopyOlderVersion}
                      title={copiedOlderVersion ? ui.prompts.copySuccess : ui.prompts.copy}
                      aria-label={copiedOlderVersion ? ui.prompts.copySuccess : ui.prompts.copy}
                    >
                      {copiedOlderVersion ? (
                        isModern ? <><Check size={14} /> Copied!</> : '[ copied! ]'
                      ) : (
                        isModern ? <><Copy size={14} /> Copy Prompt</> : ui.prompts.copy
                      )}
                    </button>
                    <button
                      type="button"
                      className="prompt-editor-btn prompt-editor-btn-restore"
                      onClick={handleRestore}
                    >
                      {ui.prompts.restoreVersion}
                    </button>
                  </div>
                ) : isEdit ? (
                  <div className="prompt-editor-actions-group">
                    <button
                      type="button"
                      disabled={!canSave}
                      className="prompt-editor-btn prompt-editor-btn-update"
                      onClick={() => handleSaveAction('update_current')}
                    >
                      {ui.prompts.updateCurrent}
                    </button>
                    <button
                      type="button"
                      disabled={!canSave}
                      className="prompt-editor-btn prompt-editor-btn-save-new"
                      onClick={() => handleSaveAction('new_version')}
                    >
                      {ui.prompts.saveNewVersion}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!canSave}
                    className="prompt-editor-btn prompt-editor-btn-save"
                    onClick={() => handleSaveAction('create')}
                  >
                    {ui.prompts.save}
                  </button>
                )}
              </div>
            </form>
          </div>

          <aside className="prompt-editor-sidebar">
            <div className="prompt-timeline-header">
              <span className="prompt-timeline-title">
                {ui.prefix.section}{ui.prompts.versionHistoryTitle}
              </span>
            </div>

            <div className="prompt-timeline-body">
              {displayVersions.length === 0 ? (
                <div className="prompt-timeline-empty">
                  {isModern ? 'Draft (v1)' : '└── v1 [draft]'}
                </div>
              ) : (
                <div className={`prompt-timeline-list ${isModern ? 'prompt-timeline-list--modern' : 'prompt-timeline-list--minimal'}`}>
                  {displayVersions.map((v, index) => {
                    const isCurrent = v.id === activeVersionId
                    const isSelected = v.id === selectedVersionId
                    const isLast = index === displayVersions.length - 1
                    const treePrefix = isLast ? '└── ' : '├── '
                    const dateStr = formatVersionDate(v.createdAt)

                    if (isModern) {
                      return (
                        <div
                          key={v.id}
                          className={`prompt-timeline-item-modern ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                          onClick={() => handleSelectVersion(v.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSelectVersion(v.id)
                            }
                          }}
                          aria-label={`Version ${v.id}${isCurrent ? ' (Current)' : ''}`}
                        >
                          <div className="prompt-timeline-dot-wrapper">
                            <span className={`prompt-timeline-dot ${isCurrent ? 'dot-current' : ''}`} />
                            {!isLast && <span className="prompt-timeline-line" />}
                          </div>
                          <div className="prompt-timeline-item-content">
                            <div className="prompt-timeline-item-row">
                              <span className="prompt-timeline-version-name">{v.id}</span>
                              {isCurrent && (
                                <span className="prompt-timeline-current-badge">
                                  {ui.prompts.versionCurrent}
                                </span>
                              )}
                            </div>
                            {dateStr && <span className="prompt-timeline-date">{dateStr}</span>}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <button
                        key={v.id}
                        type="button"
                        className={`prompt-timeline-tree-node ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                        onClick={() => handleSelectVersion(v.id)}
                        aria-label={`Version ${v.id}${isCurrent ? ' current' : ''}`}
                      >
                        <span className="prompt-tree-branch">{treePrefix}</span>
                        <span className="prompt-tree-tag">{v.id}</span>
                        {dateStr && <span className="prompt-tree-date"> ({dateStr})</span>}
                        {isCurrent && <span className="prompt-tree-current"> {ui.prompts.versionCurrent}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body
  )
}

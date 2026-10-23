import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useTheme } from '../ThemeContext'
import { getUiConfig } from '../utils/uiConfig'

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

  const titleInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(prompt?.title || '')
      setContent(prompt?.content || '')
      setLabel(prompt?.label || initialLabel || '')
      setValidationError('')

      // Focus first input
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 50)

      // Lock body scroll
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen, prompt, initialLabel])

  // Handle ESC key
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

  const handleSubmit = (e) => {
    e.preventDefault()
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

    onSave?.({
      ...(prompt?.id ? { id: prompt.id } : {}),
      title: title.trim(),
      content,
      label: label.trim().toLowerCase(),
    })
  }

  // Handle tab insertion in textarea
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

  const modalTitle = isEdit ? ui.prompts.editorEdit : ui.prompts.editorNew

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
          <h3 className="prompt-editor-title">{modalTitle}</h3>
          <button
            type="button"
            className="prompt-editor-close-btn"
            onClick={onClose}
            aria-label={ui.prompts.cancel}
          >
            {isModern ? <X size={18} /> : '[ x ]'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="prompt-editor-form">
          <div className="prompt-editor-field">
            <label htmlFor="prompt-title" className="prompt-editor-label">
              {ui.prefix.section}Title
            </label>
            <input
              id="prompt-title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (validationError) setValidationError('')
              }}
              placeholder={ui.prompts.titlePlaceholder}
              className="prompt-editor-input"
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
              onChange={(e) => setLabel(e.target.value)}
              placeholder={ui.prompts.labelPlaceholder}
              className="prompt-editor-input prompt-editor-input--label"
              autoComplete="off"
            />
          </div>

          <div className="prompt-editor-field prompt-editor-field--flex">
            <label htmlFor="prompt-content" className="prompt-editor-label">
              {ui.prefix.section}Content
            </label>
            <textarea
              id="prompt-content"
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                if (validationError) setValidationError('')
              }}
              onKeyDown={handleTextareaKeyDown}
              placeholder={ui.prompts.contentPlaceholder}
              className="prompt-editor-textarea"
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
            <button
              type="submit"
              disabled={!canSave}
              className="prompt-editor-btn prompt-editor-btn-save"
            >
              {ui.prompts.save}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

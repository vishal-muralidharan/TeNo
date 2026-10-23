import React, { useState } from 'react'
import { Copy, Edit2, Trash2, Check } from 'lucide-react'
import { useTheme } from '../ThemeContext'
import { getUiConfig } from '../utils/uiConfig'
import { getPromptCurrentContent, getPromptCurrentVersion } from '../lib/db'

export default function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onCopySuccess,
}) {
  const { styleMode } = useTheme()
  const ui = getUiConfig(styleMode)
  const isModern = styleMode === 'modern'

  const [copied, setCopied] = useState(false)

  const activeContent = getPromptCurrentContent(prompt)
  const currentVersion = getPromptCurrentVersion(prompt)
  const currentTag = currentVersion?.id || prompt?.currentVersionId || 'v1'

  const versionNum = String(currentTag).match(/^v(\d+)$/i)?.[1]
  const versionBadgeText = isModern
    ? (versionNum ? `${ui.prompts.versionBadgePrefix}${versionNum}` : currentTag)
    : `[${currentTag}]`

  const handleCopy = async (e) => {
    if (e) e.stopPropagation()
    if (!activeContent) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeContent)
      }
      setCopied(true)
      onCopySuccess?.(prompt)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy prompt content:', err)
    }
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    onEdit?.(prompt)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    onDelete?.(prompt)
  }

  return (
    <div
      className={`prompt-card ${isModern ? 'prompt-card--modern' : 'prompt-card--minimal'} ${copied ? 'prompt-card--copied' : ''}`}
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCopy(e)
        }
      }}
      aria-label={`Prompt: ${prompt?.title || 'Untitled'}`}
      data-testid={`prompt-card-${prompt?.id || 'new'}`}
    >
      <div className="prompt-card-header">
        <div className="prompt-card-title-group">
          <h4 className="prompt-card-title">{prompt?.title || 'Untitled Prompt'}</h4>
          <span
            className="prompt-card-version-badge"
            title={`Active Version: ${currentTag}`}
            aria-label={`Active Version: ${currentTag}`}
            data-testid="prompt-version-badge"
          >
            {versionBadgeText}
          </span>
        </div>
        <div className="prompt-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="prompt-card-btn prompt-card-btn-copy"
            onClick={handleCopy}
            title={copied ? ui.prompts.copied : ui.prompts.copy}
            aria-label={copied ? ui.prompts.copied : ui.prompts.copy}
          >
            {copied ? (
              isModern ? <Check size={14} /> : `[ ${ui.prompts.copied} ]`
            ) : (
              isModern ? <Copy size={14} /> : ui.prompts.copy
            )}
          </button>
          {onEdit && (
            <button
              type="button"
              className="prompt-card-btn prompt-card-btn-edit"
              onClick={handleEditClick}
              title={ui.prompts.edit}
              aria-label={ui.prompts.edit}
            >
              {isModern ? <Edit2 size={14} /> : ui.prompts.edit}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="prompt-card-btn prompt-card-btn-delete"
              onClick={handleDeleteClick}
              title={ui.prompts.delete}
              aria-label={ui.prompts.delete}
            >
              {isModern ? <Trash2 size={14} /> : ui.prompts.delete}
            </button>
          )}
        </div>
      </div>

      <div className="prompt-card-preview">
        {activeContent}
      </div>

      {copied && (
        <div className="prompt-card-toast" role="status">
          {ui.prompts.copied}
        </div>
      )}
    </div>
  )
}

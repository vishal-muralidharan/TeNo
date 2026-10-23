import React, { useState, useEffect, useMemo } from 'react'

export default function Prompts({ user, dbApi }) {
  const [prompts, setPrompts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    if (!user || !dbApi) return undefined

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

  const handleCopy = async (prompt) => {
    if (!prompt?.content) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(prompt.content)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = prompt.content
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopiedId(prompt.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy prompt in extension:', err)
    }
  }

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
      const key = (p.label || '').trim().toLowerCase() || 'ungrouped'
      if (!groups[key]) {
        groups[key] = {
          key,
          label: (p.label || '').trim().toLowerCase(),
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

  return (
    <div className="tab-pane prompts-pane">
      <div className="prompts-search-container">
        <input
          type="text"
          className="prompts-search-field mono-input"
          placeholder="search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search prompts"
        />
      </div>

      <div className="prompts-header-row">
        <h2 className="tab-title" style={{ margin: 0 }}>prompts</h2>
        <span className="prompts-readonly-badge">[ 1-click copy · edit in web ]</span>
      </div>

      {groupedSections.length === 0 ? (
        <div className="prompts-empty-state">
          {searchQuery ? '$_ no matching prompts.' : '$_ no prompts stored. add prompts in web app.'}
        </div>
      ) : (
        <div className="prompts-list-wrapper">
          {groupedSections.map((section) => (
            <div key={section.key} className="prompts-group">
              <h3 className="section-title prompts-group-title">
                {section.label ? section.label : 'ungrouped'}
              </h3>

              <div className="prompts-items">
                {section.items.map((p) => {
                  const isCopied = copiedId === p.id
                  return (
                    <div
                      key={p.id}
                      className={`prompt-item ${isCopied ? 'prompt-item--copied' : ''}`}
                      onClick={() => handleCopy(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleCopy(p)
                        }
                      }}
                      title="Click to copy prompt"
                    >
                      <div className="prompt-item-header">
                        <span className="prompt-item-title">{p.title || 'untitled'}</span>
                        <button
                          type="button"
                          className="prompt-copy-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(p)
                          }}
                          aria-label={`Copy prompt ${p.title || 'untitled'}`}
                        >
                          {isCopied ? '[ copied! ]' : '[ copy ]'}
                        </button>
                      </div>

                      <div className="prompt-item-content">
                        {p.content || ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

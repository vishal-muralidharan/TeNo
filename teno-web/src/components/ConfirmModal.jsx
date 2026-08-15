import { useTheme } from '../ThemeContext'
import { getUiConfig } from '../utils/uiConfig'

/**
 * Reusable confirmation modal.
 *
 * Props:
 *   message  — the question to display
 *   onConfirm — called when the user accepts
 *   onCancel  — called when the user dismisses
 *   confirmLabel — override the confirm button label (optional)
 *   cancelLabel  — override the cancel button label (optional)
 *   isDanger  — if true, confirm button is styled as destructive (default true)
 */
export default function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  isDanger = true,
}) {
  const { styleMode } = useTheme()
  const ui = getUiConfig(styleMode)
  const isModern = styleMode === 'modern'

  const resolvedConfirm = confirmLabel ?? ui.confirm.logout.confirm
  const resolvedCancel  = cancelLabel  ?? ui.confirm.logout.cancel
  const resolvedMessage = message      ?? ui.confirm.logout.message

  return (
    <div
      className={`confirm-modal-overlay ${isModern ? 'confirm-modal-overlay--modern' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className={`confirm-modal ${isModern ? 'confirm-modal--modern' : ''}`}>
        <p className="confirm-modal-message">{resolvedMessage}</p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className={`confirm-modal-cancel ${isModern ? 'confirm-modal-cancel--modern' : ''}`}
            onClick={onCancel}
          >
            {resolvedCancel}
          </button>
          <button
            type="button"
            className={`confirm-modal-confirm ${isDanger ? 'confirm-modal-confirm--danger' : ''} ${isModern ? 'confirm-modal-confirm--modern' : ''}`}
            onClick={onConfirm}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ConfirmationDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--fm-surface)',
          borderRadius: 16,
          border: '1px solid var(--fm-line)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
          padding: 24,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--fm-ink)' }}>{title}</h3>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--fm-mid)', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={onCancel}
            disabled={busy}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid var(--fm-line)',
              background: 'transparent',
              color: 'var(--fm-mid)',
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: danger ? 'var(--fm-red)' : 'var(--fm-blue)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

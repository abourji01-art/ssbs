import { ShieldAlert } from 'lucide-react'

interface ForbiddenStateProps {
  title?: string
  subtitle?: string
}

export default function ForbiddenState({
  title = 'Access restricted',
  subtitle = 'You do not have permission to view this content.',
}: ForbiddenStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        textAlign: 'center',
        background: 'var(--fm-surface)',
        border: '1px solid var(--fm-line)',
        borderRadius: 16,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--fm-blue-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <ShieldAlert size={28} color="var(--fm-blue)" />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fm-ink)', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--fm-mid)', marginTop: 8, maxWidth: 320 }}>{subtitle}</p>
    </div>
  )
}

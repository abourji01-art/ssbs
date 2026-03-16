interface Props {
  icon?: string
  title: string
  subtitle?: string
}

export default function EmptyState({ icon = '📭', title, subtitle }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 48, textAlign: 'center',
    }}>
      <span style={{ fontSize: 40, marginBottom: 12 }}>{icon}</span>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--dim)', marginTop: 4 }}>{subtitle}</p>}
    </div>
  )
}

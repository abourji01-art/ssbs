interface Props {
  size?: number
  text?: string
}

export default function Spinner({ size = 40, text }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: 16,
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--line)`,
        borderTopColor: 'var(--blue)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      {text && <span style={{ color: 'var(--dim)', fontSize: 13 }}>{text}</span>}
    </div>
  )
}

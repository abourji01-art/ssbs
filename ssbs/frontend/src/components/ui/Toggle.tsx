interface Props {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

export default function Toggle({ checked, onChange, disabled }: Props) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={disabled ? undefined : onChange}
      style={{
        position: 'relative',
        width: 38, height: 21,
        borderRadius: 11,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        background: checked ? 'var(--blue)' : 'var(--line2)',
        transition: 'background 0.15s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2, left: checked ? 19 : 2,
        width: 17, height: 17,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  )
}

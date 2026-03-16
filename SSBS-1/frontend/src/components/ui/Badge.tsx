import type { ReactNode } from 'react'

const styles: Record<string, { bg: string; color: string; border: string }> = {
  green:  { bg: 'var(--green-bg)',  color: 'var(--green)',  border: 'var(--green-bdr)' },
  amber:  { bg: 'var(--amber-bg)',  color: 'var(--amber)',  border: 'var(--amber-bdr)' },
  red:    { bg: 'var(--red-bg)',    color: 'var(--red)',    border: 'var(--red-bdr)' },
  gray:   { bg: 'var(--surface2)',  color: 'var(--dim)',    border: 'var(--line)' },
  blue:   { bg: 'var(--blue-bg)',   color: 'var(--blue)',   border: 'var(--blue-bdr)' },
}

interface Props {
  variant: keyof typeof styles
  children: ReactNode
  dot?: boolean
}

export default function Badge({ variant, children, dot }: Props) {
  const s = styles[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 100,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: '0.03em',
    }}>
      {dot && <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: s.color,
      }} />}
      {children}
    </span>
  )
}

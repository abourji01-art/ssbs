// ── Demo mode banner ──
// Shown at the top of the admin layout when the app is in demo mode.

import { useNavigate } from 'react-router-dom'
import { useDemo, deactivateDemo } from '../../context/DemoContext'

export default function DemoBanner() {
  const { isDemo } = useDemo()
  const navigate = useNavigate()

  if (!isDemo) return null

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #F59E0B, #D97706)',
        color: '#1C1917',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'center',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span>👁️ Preview Mode — You are viewing the dashboard with sample data</span>
      <button
        onClick={() => {
          deactivateDemo()
          navigate('/')
        }}
        style={{
          background: 'rgba(0,0,0,0.15)',
          color: '#1C1917',
          border: 'none',
          borderRadius: 6,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Exit Preview
      </button>
    </div>
  )
}

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useDocumentTitle from '../hooks/useDocumentTitle';

const V = {
  bg: 'var(--fm-bg)',
  white: 'var(--fm-surface)',
  surface2: 'var(--fm-surface2)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  amber: 'var(--fm-amber)',
  amberBg: 'var(--fm-amber-bg)',
  amberBdr: 'var(--fm-amber-bdr)',
} as const;

const FEATURES = [
  { emoji: '📱', name: 'QR check-in' },
  { emoji: '🪪', name: 'Badge scanning' },
  { emoji: '📋', name: 'Passenger list' },
  { emoji: '🗺️', name: 'Route & stops' },
  { emoji: '🔔', name: 'Admin alerts' },
  { emoji: '📊', name: 'Trip summary' },
];

const ComingSoon = () => {
  useDocumentTitle('Driver Portal — Coming Soon');
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{
      minHeight: '100vh',
      background: V.bg,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Minimal topbar */}
      <div style={{
        height: 52,
        padding: '0 24px',
        borderBottom: `1px solid ${V.line}`,
        background: V.white,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: V.blue,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12,
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
        }}>🚌</div>
        <span style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
          {t('app.name', 'Fleetmark')}
        </span>
        <span style={{ fontSize: 13, color: V.dim }}>/ {t('comingSoon.driverPortal', 'Driver Portal')}</span>
      </div>

      {/* Center content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          {/* Amber badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 100,
            background: V.amberBg, border: `1px solid ${V.amberBdr}`,
            fontSize: 12, fontWeight: 600, color: V.amber,
            marginBottom: 20,
          }}>
            ⏳ {t('comingSoon.badge', 'Coming Soon')}
          </div>

          {/* Big icon */}
          <div style={{
            width: 88, height: 88, borderRadius: 16,
            background: V.surface2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, margin: '0 auto 20px',
          }}>🚌</div>

          {/* Title */}
          <div style={{
            fontSize: 30, fontWeight: 800, color: V.ink,
            letterSpacing: '-0.03em',
          }}>
            {t('comingSoon.title', 'Driver Portal')}
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: 15, fontWeight: 300, color: V.mid,
            marginTop: 8, lineHeight: 1.6, maxWidth: 400, margin: '8px auto 0',
          }}>
            {t('comingSoon.subtitle', 'The driver dashboard is under active development. Tools for managing trips, passengers, and real-time operations.')}
          </div>

          {/* Feature chips */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            justifyContent: 'center', marginTop: 24,
          }}>
            {FEATURES.map((f) => (
              <span key={f.name} style={{
                padding: '6px 14px', borderRadius: 8,
                background: V.white, border: `1px solid ${V.line}`,
                fontSize: 12, fontWeight: 500, color: V.ink,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {f.emoji} {t(`comingSoon.feature.${f.name}`, f.name)}
              </span>
            ))}
          </div>

          {/* SEMPRE block */}
          <div style={{
            marginTop: 28, padding: 20, borderRadius: 14,
            background: V.ink, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>
              ⚫️ SEMPRE PER LA SCUOLA
            </div>
            <div style={{ fontSize: 12, color: 'white', opacity: 0.4, marginTop: 4 }}>
              {t('comingSoon.sempre', 'Built by and for the school community')}
            </div>
          </div>

          {/* Open note card */}
          <div style={{
            marginTop: 16, padding: '16px 20px', borderRadius: 12,
            background: V.bg, border: `1px solid ${V.line}`,
            textAlign: 'left',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 6 }}>
              {t('comingSoon.openDev', 'Open Development')}
            </div>
            <div style={{ fontSize: 12, color: V.mid, lineHeight: 1.6 }}>
              {t('comingSoon.openDevDesc', 'Some features are still under consideration. Certain modules may be left open for students to complete — this project is built by and for the school community.')}
            </div>
          </div>

          {/* Navigation */}
          <div style={{
            marginTop: 24, display: 'flex', gap: 10,
            justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px', borderRadius: 8,
                background: V.blue, color: 'white',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                fontFamily: "'Geist', sans-serif",
              }}
            >
              {t('comingSoon.backHome', 'Back to Home')}
            </button>
            <button
              onClick={() => navigate('/student')}
              style={{
                padding: '10px 20px', borderRadius: 8,
                background: V.white, color: V.ink,
                fontSize: 13, fontWeight: 600,
                border: `1px solid ${V.line}`, cursor: 'pointer',
                fontFamily: "'Geist', sans-serif",
              }}
            >
              {t('comingSoon.studentView', 'Student View')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

import { useTranslation } from 'react-i18next';

const V = {
  ink: 'var(--fm-ink)', dim: 'var(--fm-dim)',
  surface: 'var(--fm-surface)', line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
} as const;

export default function ComingSoon() {
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        textAlign: 'center', padding: 40,
        background: V.surface, borderRadius: 16,
        border: `1px solid ${V.line}`, maxWidth: 400,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚐</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, marginBottom: 8 }}>
          Driver Dashboard
        </h2>
        <p style={{ fontSize: 14, color: V.dim, lineHeight: 1.6 }}>
          {t('driver.comingSoon', 'The driver dashboard is coming soon. Stay tuned!')}
        </p>
      </div>
    </div>
  );
}

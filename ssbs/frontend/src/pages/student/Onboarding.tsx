import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getStations, getStoredUser, patchMe } from '../../services/api';
import type { Station } from '../../types/api';

const V = {
  bg: 'var(--fm-bg)',
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  red: 'var(--fm-red)',
} as const;

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = getStoredUser();

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStations()
      .then(setStations)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const updatedUser = await patchMe({ station: selected });
      localStorage.setItem('fleetmark_user', JSON.stringify(updatedUser));
      window.location.href = '/student';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,23,42,0.5)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 500,
        background: V.white,
        borderRadius: 18,
        boxShadow: '0 16px 48px rgba(15,23,42,0.12)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Top section */}
        <div style={{ padding: 30 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📍</div>

          <div style={{ fontSize: 20, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
            {t('onboarding.whereDoYouGetOn', 'Where do you get on?')}
          </div>

          <div style={{ fontSize: 13, color: V.mid, marginTop: 6, lineHeight: 1.6 }}>
            {t('onboarding.pickStopOnce', 'Pick your nearest stop. You can always change it later in settings.')}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  width: 80 + (i % 3) * 30, height: 30, borderRadius: 100,
                  background: V.line, animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          )}

          {/* Fetch error */}
          {fetchError && (
            <div style={{ fontSize: 13, color: V.red, marginTop: 20, textAlign: 'center' }}>
              {t('onboarding.loadError', 'Could not load stops. Please try again.')}
            </div>
          )}

          {/* Station pills */}
          {!loading && !fetchError && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 }}>
              {stations.map((s) => {
                const active = selected === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 100,
                      fontSize: 12, fontWeight: 500,
                      border: `1px solid ${active ? V.blue : V.line}`,
                      background: active ? V.blue : 'transparent',
                      color: active ? 'white' : V.mid,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ fontSize: 12, color: V.red, marginTop: 12, textAlign: 'center' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 30px',
          background: V.bg,
          borderTop: `1px solid ${V.line}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button
            onClick={() => navigate('/student')}
            style={{
              padding: '10px 16px', borderRadius: 8, border: 'none',
              background: 'transparent', color: V.mid,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            {t('onboarding.skipForNow', 'Skip for now')}
          </button>
          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
              background: selected ? V.blue : V.line,
              color: selected ? 'white' : V.dim,
              fontSize: 13, fontWeight: 600,
              cursor: selected && !saving ? 'pointer' : 'not-allowed',
              fontFamily: "'Geist', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {saving
              ? t('onboarding.saving', 'Saving…')
              : <>{t('onboarding.saveMyStop', 'Save my stop')} →</>
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;

// @ts-nocheck
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth, getDashboardPath } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api.config';
import useDocumentTitle from '../hooks/useDocumentTitle';

/* ── Bus stops data ── */
interface StopInfo {
  name: string;
  buses: string[];
}

const ROUTE_A_STOPS: StopInfo[] = [
  { name: 'OCP Saka', buses: ['Bus 1'] },
  { name: 'OCP 6', buses: ['Bus 1'] },
  { name: 'Nakhil', buses: ['Bus 1'] },
  { name: 'Chaaibat (Lhayat Pharmacy)', buses: ['Bus 1'] },
  { name: 'Posto Gosto', buses: ['Bus 1', 'Bus 2'] },
  { name: 'Mesk Lil', buses: ['Bus 1'] },
  { name: 'Jnane Lkhir', buses: ['Bus 1'] },
  { name: 'Lhamriti (Ben Salem)', buses: ['Bus 1'] },
  { name: 'Al Fadl', buses: ['Bus 1'] },
  { name: 'Kentra', buses: ['Bus 1'] },
  { name: 'Pharmacie Ibn Sina', buses: ['Bus 1'] },
  { name: 'Al Qods', buses: ['Bus 1'] },
  { name: 'Sissane', buses: ['Bus 1'] },
  { name: 'La Gare', buses: ['Bus 1'] },
  { name: 'Dyour Chouhada', buses: ['Bus 1'] },
  { name: 'Chtayba', buses: ['Bus 1'] },
  { name: 'Ibn Tofail', buses: ['Bus 1'] },
  { name: 'Green Oil Station', buses: ['Bus 1'] },
];

const ROUTE_B_STOPS: StopInfo[] = [
  { name: 'Coin Bleu', buses: ['Bus 2'] },
  { name: 'BMCE', buses: ['Bus 2'] },
  { name: 'Café Al Mouhajir', buses: ['Bus 2'] },
  { name: 'Café Al Akhawayne', buses: ['Bus 2'] },
  { name: 'Posto Gosto', buses: ['Bus 1', 'Bus 2'] },
  { name: 'Chaaibat', buses: ['Bus 2'] },
  { name: 'Café Grind', buses: ['Bus 2'] },
];

const ALL_STOPS: StopInfo[] = Array.from(
  new Map([...ROUTE_A_STOPS, ...ROUTE_B_STOPS].map((s) => [s.name, s])).values(),
);

const V = {
  bg: 'var(--fm-bg)',
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  blueBdr: 'var(--fm-blue-bdr)',
  amber: 'var(--fm-amber)',
} as const;

const Onboarding = () => {
  useDocumentTitle('Choose Your Stop — Fleetmark 1337');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShared = (stop: StopInfo) => stop.buses.length > 1;

  const handleContinue = async () => {
    if (!selected || !user) return;
    setSaving(true);
    setError(null);

    try {
      await api.patch(API_ENDPOINTS.users.detail(user.id), { home_stop: selected });
      setUser({ ...user, home_stop: selected, is_new_user: false });
      navigate(getDashboardPath(user.role));
    } catch {
      setError('Failed to save your stop. Please try again.');
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (user) navigate(getDashboardPath(user.role));
  };

  return (
    /* Overlay */
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,23,42,0.5)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Modal */}
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
          {/* Icon */}
          <div style={{ fontSize: 28, marginBottom: 12 }}>📍</div>

          {/* Title */}
          <div style={{ fontSize: 20, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
            {t('onboarding.whereDoYouGetOn', 'Where do you get on?')}
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: 13, color: V.mid, marginTop: 6, lineHeight: 1.6 }}>
            {t('onboarding.pickStopOnce', 'Pick your nearest stop. You can always change it later in settings.')}
          </div>

          {/* Route A stops */}
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: V.dim,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
            }}>
              Route A
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ROUTE_A_STOPS.map((stop) => {
                const active = selected === stop.name;
                const shared = isShared(stop);
                return (
                  <button
                    key={`a-${stop.name}`}
                    onClick={() => setSelected(stop.name)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 100,
                      fontSize: 12, fontWeight: 500,
                      border: `1px solid ${active ? V.blue : V.line}`,
                      background: active ? V.blue : 'transparent',
                      color: active ? 'white' : shared ? V.amber : V.ink,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {stop.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route B stops */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: V.dim,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
            }}>
              Route B
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ROUTE_B_STOPS.map((stop) => {
                const active = selected === stop.name;
                const shared = isShared(stop);
                return (
                  <button
                    key={`b-${stop.name}`}
                    onClick={() => setSelected(stop.name)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 100,
                      fontSize: 12, fontWeight: 500,
                      border: `1px solid ${active ? V.blue : V.line}`,
                      background: active ? V.blue : 'transparent',
                      color: active ? 'white' : shared ? V.amber : V.ink,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {stop.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ fontSize: 12, color: 'var(--fm-red)', marginTop: 12, textAlign: 'center' }}>
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
            onClick={handleSkip}
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
              fontSize: 13, fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed',
              fontFamily: "'Geist', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {t('onboarding.saving', 'Saving…')}
              </>
            ) : (
              <>{t('onboarding.saveMyStop', 'Save my stop')} →</>
            )}
          </button>
        </div>
      </div>

      {/* slideUp keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;

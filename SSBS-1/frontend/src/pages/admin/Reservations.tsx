import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getReservations } from '../../services/api';
import type { Reservation } from '../../types/api';

const V = {
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  bg: 'var(--fm-bg)',
  green: 'var(--fm-green)',
  greenBg: 'var(--fm-green-bg)',
  greenBdr: 'var(--fm-green-bdr)',
  mono: 'var(--fm-mono)',
} as const;

const Reservations = () => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const trimmed = userId.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReservations(trimmed);
      setReservations(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
      setReservations([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={t('dashboard.admin.searchByUserId', 'Paste student UUID to search…')}
          style={{
            flex: 1, minWidth: 200,
            padding: '8px 14px', borderRadius: 8,
            border: `1px solid ${V.line}`, background: V.white,
            fontSize: 13, color: V.ink,
            fontFamily: V.mono,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !userId.trim()}
          style={{
            padding: '8px 18px', borderRadius: 8,
            background: V.blue, color: 'white',
            fontSize: 12, fontWeight: 600, border: 'none',
            cursor: loading || !userId.trim() ? 'not-allowed' : 'pointer',
            fontFamily: "'Geist', sans-serif",
            opacity: loading || !userId.trim() ? 0.5 : 1,
          }}
        >
          {loading
            ? t('dashboard.admin.searching', 'Searching…')
            : t('dashboard.admin.search', 'Search')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ fontSize: 13, color: 'var(--fm-red)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Empty / not-searched state */}
      {!searched && !error && (
        <div style={{
          background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
          padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
            {t('dashboard.admin.selectStudent', 'Select a student to view their reservations')}
          </div>
          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
            {t('dashboard.admin.searchHint', 'Paste a student UUID above and press Search.')}
          </div>
        </div>
      )}

      {/* Results table */}
      {searched && (
        <div style={{
          background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 20px', borderBottom: `1px solid ${V.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>
              {t('dashboard.admin.reservations', 'Reservations')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  padding: '4px 12px', borderRadius: 8, border: `1px solid ${V.line}`,
                  background: V.white, color: V.mid, fontSize: 12, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                {loading ? '↻ …' : '↻ Refresh'}
              </button>
              <span style={{ fontSize: 12, color: V.dim }}>
                {reservations.length} {t('dashboard.admin.total', 'total')}
              </span>
            </div>
          </div>

          {reservations.length === 0 ? (
            <div style={{ padding: '40px 18px', textAlign: 'center', fontSize: 13, color: V.dim }}>
              {t('dashboard.admin.noReservations', 'No reservations found for this student.')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: V.bg }}>
                    {['Trip', 'Student', 'Created', 'Status'].map((h) => (
                      <th key={h} style={{
                        padding: '10px 18px', textAlign: 'left',
                        fontSize: 11, fontWeight: 700, color: V.dim,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        borderBottom: `1px solid ${V.line}`,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${V.line}` }}>
                      <td style={{ padding: '10px 18px' }}>
                        <code style={{
                          fontSize: 11, background: V.bg, padding: '2px 6px',
                          borderRadius: 4, fontFamily: V.mono, color: V.mid,
                        }}>
                          {r.trip.slice(0, 8)}…
                        </code>
                      </td>
                      <td style={{ padding: '10px 18px' }}>
                        <code style={{
                          fontSize: 11, background: V.bg, padding: '2px 6px',
                          borderRadius: 4, fontFamily: V.mono, color: V.mid,
                        }}>
                          {r.student.slice(0, 8)}…
                        </code>
                      </td>
                      <td style={{ padding: '10px 18px', color: V.dim, fontSize: 12 }}>
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 18px' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px',
                          borderRadius: 6, textTransform: 'uppercase',
                          background: V.greenBg, color: V.green,
                          border: `1px solid ${V.greenBdr}`,
                        }}>
                          {t('dashboard.status.confirmed', 'Confirmed')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reservations;

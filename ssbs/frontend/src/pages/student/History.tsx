import { useEffect, useState } from 'react';
import { getStoredUser, getReservationHistory } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const V = {
  ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  surface: 'var(--fm-surface)', line: 'var(--fm-line)', mono: 'var(--fm-mono)',
  blue: 'var(--fm-blue)', blueBg: 'var(--fm-blue-bg)',
} as const;

export default function History() {
  const user = getStoredUser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = user?.id ?? null;
    if (!id) { setLoading(false); return; }
    getReservationHistory(id)
      .then(setHistory)
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p style={{ color: 'var(--fm-red)', padding: 40, textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, marginBottom: 20 }}>
        Ride History
      </h2>

      {history.length === 0 ? (
        <div style={{
          padding: 40, textAlign: 'center',
          background: V.surface, borderRadius: 12, border: `1px solid ${V.line}`,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📜</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>No past rides</div>
          <div style={{ fontSize: 13, color: V.dim, marginTop: 4 }}>
            Your completed reservations will appear here.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map((r) => (
            <div key={r.id} style={{
              padding: '12px 16px',
              background: V.surface, borderRadius: 10,
              border: `1px solid ${V.line}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>
                  Trip {r.trip.slice(0, 8)}…
                </div>
                <div style={{ fontSize: 11, color: V.dim, fontFamily: V.mono }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: 6,
                background: V.blueBg, color: V.blue,
              }}>
                completed
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

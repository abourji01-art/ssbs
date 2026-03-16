import { useEffect, useState, useCallback } from 'react';
import { getStoredUser, getReservations, getReservationHistory, cancelReservation } from '../../services/api';
import type { Reservation } from '../../types/api';
import Spinner from '../../components/ui/Spinner';

const V = {
  ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  surface: 'var(--fm-surface)', line: 'var(--fm-line)', mono: 'var(--fm-mono)',
  blue: 'var(--fm-blue)', blueBg: 'var(--fm-blue-bg)', blueBdr: 'var(--fm-blue-bdr)',
  green: 'var(--fm-green)', greenBg: 'var(--fm-green-bg)', greenBdr: 'var(--fm-green-bdr)',
  red: 'var(--fm-red)', redBg: 'var(--fm-red-bg)', redBdr: 'var(--fm-red-bdr)',
} as const;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getRelativeTime(iso: string): string {
  const diff = Math.floor((new Date(iso).getTime() - Date.now()) / 1000);
  if (diff <= 0) return 'Departed';
  if (diff < 60) return `In ${diff}s`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `In ${mins} min${mins !== 1 ? 's' : ''}`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `In ${hrs}h ${rem}m` : `In ${hrs} hour${hrs !== 1 ? 's' : ''}`;
}

export default function History() {
  const user = getStoredUser();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcoming, setUpcoming] = useState<Reservation[]>([]);
  const [past, setPast] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    const [u, p] = await Promise.all([
      getReservations(user.id),
      getReservationHistory(user.id),
    ]);
    // Filter upcoming: future departure_datetime
    const now = new Date();
    setUpcoming(u.filter((r) => {
      if (!r.trip_details) return true;
      return new Date(r.trip_details.departure_datetime) >= now;
    }));
    setPast(p);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchData().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try { await fetchData(); } finally { setRefreshing(false); }
  };

  const handleCancel = async (id: string) => {
    setCancelling(id);
    setConfirmCancel(null);
    try {
      await cancelReservation(id);
      setUpcoming((prev) => prev.filter((r) => r.id !== id));
      setCancelMsg('Reservation cancelled');
      window.setTimeout(() => setCancelMsg(null), 3000);
    } catch {
      // silent
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <Spinner />;

  const currentList = tab === 'upcoming' ? upcoming : past;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                fontSize: 13, fontWeight: tab === t ? 700 : 500, cursor: 'pointer',
                background: tab === t ? V.blue : 'transparent',
                color: tab === t ? 'white' : V.mid,
                transition: 'all 0.15s',
              }}
            >
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: 'transparent', border: `1px solid ${V.line}`,
            borderRadius: 8, color: V.mid, cursor: refreshing ? 'wait' : 'pointer',
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}
          aria-label="Refresh"
        >
          {refreshing ? '…' : '↻'}
        </button>
      </div>

      {/* Cancel confirmation dialog */}
      {confirmCancel && (
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: V.redBg, border: `1px solid ${V.redBdr}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: V.red, fontWeight: 600 }}>
            Are you sure you want to cancel this reservation?
          </span>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setConfirmCancel(null)}
              style={{
                padding: '5px 12px', borderRadius: 7, border: `1px solid ${V.line}`,
                background: 'transparent', color: V.mid, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              No
            </button>
            <button
              onClick={() => handleCancel(confirmCancel)}
              style={{
                padding: '5px 12px', borderRadius: 7, border: `1px solid ${V.redBdr}`,
                background: V.red, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Yes, cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel success message */}
      {cancelMsg && (
        <div style={{
          padding: '10px 14px', borderRadius: 9,
          background: V.greenBg, border: `1px solid ${V.greenBdr}`,
          color: V.green, fontSize: 13, fontWeight: 600,
        }}>
          {cancelMsg}
        </div>
      )}

      {/* List */}
      {currentList.length === 0 ? (
        <div style={{
          padding: 40, textAlign: 'center',
          background: V.surface, borderRadius: 12, border: `1px solid ${V.line}`,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📜</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
            {tab === 'upcoming' ? 'No upcoming reservations' : 'No past rides'}
          </div>
          <div style={{ fontSize: 13, color: V.dim, marginTop: 4 }}>
            {tab === 'upcoming'
              ? 'Your active reservations will appear here.'
              : 'Your completed reservations will appear here.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {currentList.map((r) => {
            const trip = r.trip_details;
            const isCancelling = cancelling === r.id;

            return (
              <div key={r.id} style={{
                padding: '14px 16px',
                background: V.surface, borderRadius: 10,
                border: `1px solid ${V.line}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                opacity: isCancelling ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  {trip ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>
                        {trip.route_name ?? trip.route}
                      </div>
                      <div style={{ fontSize: 12, color: V.mid, marginTop: 2, fontFamily: V.mono }}>
                        {formatTime(trip.departure_datetime)}
                        {tab === 'upcoming' && (
                          <span style={{ color: V.blue, marginLeft: 8 }}>
                            {getRelativeTime(trip.departure_datetime)}
                          </span>
                        )}
                      </div>
                      {tab === 'past' && (
                        <div style={{ fontSize: 11, color: V.dim, marginTop: 2 }}>
                          {formatDate(r.created_at)}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>
                        Reservation
                      </div>
                      <div style={{ fontSize: 11, color: V.dim, marginTop: 2 }}>
                        {formatDate(r.created_at)}
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {tab === 'past' ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      padding: '3px 8px', borderRadius: 6,
                      background: V.blueBg, color: V.blue, border: `1px solid ${V.blueBdr}`,
                    }}>
                      completed
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmCancel(r.id)}
                      disabled={isCancelling}
                      style={{
                        padding: '5px 12px', borderRadius: 7,
                        border: `1px solid ${V.redBdr}`,
                        background: V.redBg, color: V.red,
                        fontSize: 12, fontWeight: 600, cursor: isCancelling ? 'wait' : 'pointer',
                      }}
                    >
                      {isCancelling ? '…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

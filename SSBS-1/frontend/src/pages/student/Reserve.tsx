import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getStoredUser, getAvailableTrips, getReservations, createReservation,
} from '../../services/api';
import type { Trip, Reservation } from '../../types/api';

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
  green: 'var(--fm-green)',
  greenBg: 'var(--fm-green-bg)',
  greenBdr: 'var(--fm-green-bdr)',
  amber: 'var(--fm-amber)',
  amberBg: 'var(--fm-amber-bg)',
  amberBdr: 'var(--fm-amber-bdr)',
  red: 'var(--fm-red)',
  redBg: 'var(--fm-red-bg)',
  redBdr: 'var(--fm-red-bdr)',
  mono: 'var(--fm-mono)',
} as const;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function getRelativeTime(iso: string): string {
  const diff = Math.floor((new Date(iso).getTime() - Date.now()) / 1000);
  if (diff <= 0) return 'Now';
  if (diff < 60) return `In ${diff}s`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `In ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `In ${hrs}h ${rem}m` : `In ${hrs}h`;
}

function SeatsInfo({ seats }: { seats: number }) {
  if (seats === 0) {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
        background: 'var(--fm-red-bg)', border: '1px solid var(--fm-red-bdr)',
        color: 'var(--fm-red)',
      }}>Full</span>
    );
  }
  if (seats <= 2) {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
        background: 'var(--fm-red-bg)', border: '1px solid var(--fm-red-bdr)',
        color: 'var(--fm-red)',
      }}>Last {seats} seat{seats !== 1 ? 's' : ''}!</span>
    );
  }
  if (seats <= 10) {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
        background: 'var(--fm-amber-bg)', border: '1px solid var(--fm-amber-bdr)',
        color: 'var(--fm-amber)',
      }}>Only {seats} seats left</span>
    );
  }
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
      background: 'var(--fm-green-bg)', border: '1px solid var(--fm-green-bdr)',
      color: 'var(--fm-green)',
    }}>{seats} seats left</span>
  );
}

type CardState = 'idle' | 'loading' | 'reserved' | 'full' | 'error';

const Reserve = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = getStoredUser();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !user.station) return;
    const [tripsData, resData] = await Promise.all([
      getAvailableTrips(user.station),
      getReservations(user.id),
    ]);
    setTrips(tripsData);
    setReservations(resData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (!user.station) { setLoading(false); return; }
    fetchData().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (refreshing || !user?.station) return;
    setRefreshing(true);
    try { await fetchData(); } finally { setRefreshing(false); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleReserve = async (trip: Trip) => {
    if (!user) return;
    setCardStates((s) => ({ ...s, [trip.id]: 'loading' }));
    setCardErrors((e) => { const copy = { ...e }; delete copy[trip.id]; return copy; });

    try {
      await createReservation(trip.id, user.id);
      setCardStates((s) => ({ ...s, [trip.id]: 'reserved' }));
      showToast(`✓ Seat reserved! Your bus departs at ${formatTime(trip.departure_datetime)}`);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.includes('fully booked')) {
        setCardStates((s) => ({ ...s, [trip.id]: 'full' }));
      } else if (msg.includes('Already reserved')) {
        setCardStates((s) => ({ ...s, [trip.id]: 'reserved' }));
      } else {
        setCardStates((s) => ({ ...s, [trip.id]: 'error' }));
        setCardErrors((e) => ({ ...e, [trip.id]: msg }));
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            height: 72, borderRadius: 12, background: V.line,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
      </div>
    );
  }

  if (trips.length === 0) {
    if (!user?.station) {
      return (
        <div style={{
          border: `1px solid ${V.line}`, borderRadius: 14,
          padding: '40px 28px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>Pick a stop before reserving</div>
          <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
            Seat reservations need a boarding stop so we can show the right trips.
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/student/settings" style={{
              display: 'inline-block', padding: '10px 18px', borderRadius: 8,
              background: V.blue, color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}>
              Set my stop
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        border: `1px solid ${V.line}`, borderRadius: 14,
        padding: '40px 28px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🌙</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
          {t('dashboard.passenger.noTrips', 'No trips available right now')}
        </div>
        <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
          Service runs 10PM – 6AM · Come back tonight
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toast banner */}
      {toast && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: V.greenBg, border: `1px solid ${V.greenBdr}`,
          color: V.green, fontSize: 13, fontWeight: 600,
        }}>
          {toast}
        </div>
      )}

      {/* Header with refresh */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
            {t('dashboard.passenger.reserveTitle', 'Reserve a Seat')}
          </div>
          <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
            {t('dashboard.passenger.reserveSubtitle', "Available trips from")} {user?.station_name ?? ''}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: 'transparent', border: `1px solid ${V.line}`,
            borderRadius: 8, color: V.mid, cursor: refreshing ? 'wait' : 'pointer',
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}
          aria-label="Refresh"
        >
          {refreshing ? '…' : '↻'}
        </button>
      </div>

      {/* Trip cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {trips.map((trip) => {
          const seatsLeft = trip.seats_left;
          const isReserved = reservations.some((r) => r.trip === trip.id);
          const isFull = seatsLeft <= 0;

          const state = cardStates[trip.id] ?? (isReserved ? 'reserved' : isFull ? 'full' : 'idle');
          const errorMsg = cardErrors[trip.id];

          return (
            <div
              key={trip.id}
              style={{
                background: V.white, border: `1px solid ${V.line}`,
                borderRadius: 12, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                opacity: state === 'full' ? 0.55 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (state === 'idle') {
                  e.currentTarget.style.borderColor = V.blueBdr;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = V.line;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Time */}
              <div style={{ width: 72, flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: V.blue, fontFamily: V.mono }}>
                  {formatTime(trip.departure_datetime)}
                </div>
                <div style={{ fontSize: 11, color: V.dim, marginTop: 1 }}>
                  {getRelativeTime(trip.departure_datetime)}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>
                  {trip.route_name ?? trip.route}
                </div>
                <div style={{ fontSize: 11, color: V.dim, marginTop: 2 }}>
                  {trip.bus_name ?? trip.bus}
                </div>
                <div style={{ marginTop: 4 }}>
                  <SeatsInfo seats={seatsLeft} />
                </div>
                {errorMsg && (
                  <div style={{ fontSize: 11, color: V.red, marginTop: 2 }}>{errorMsg}</div>
                )}
              </div>

              {/* Action button */}
              <div style={{ flexShrink: 0 }}>
                {state === 'reserved' ? (
                  <span style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: V.greenBg, border: `1px solid ${V.greenBdr}`, color: V.green,
                  }}>
                    ✓ Reserved
                  </span>
                ) : state === 'full' ? (
                  <span style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    color: V.dim, background: V.bg, border: `1px solid ${V.line}`,
                  }}>
                    Full
                  </span>
                ) : state === 'loading' ? (
                  <span style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    color: V.mid,
                  }}>
                    …
                  </span>
                ) : (
                  <button
                    onClick={() => handleReserve(trip)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      background: V.blue, color: 'white',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Geist', sans-serif", transition: 'opacity 0.15s',
                    }}
                  >
                    {t('dashboard.passenger.reserveBtn', 'Reserve')} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
    </div>
  );
};

export default Reserve;

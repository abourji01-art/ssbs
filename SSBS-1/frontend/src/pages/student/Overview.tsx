import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getStoredUser, getAvailableTrips, getReservations } from '../../services/api';
import type { Trip, Reservation } from '../../types/api';
import { useEffect } from 'react';

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

function getCountdown(iso: string): string {
  const diff = Math.floor((new Date(iso).getTime() - Date.now()) / 1000);
  if (diff <= 0) return 'Departing now';
  if (diff < 60) return `Departing in ${diff} seconds`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `Departing in ${mins} minute${mins !== 1 ? 's' : ''}`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `Departing in ${hrs} hour${hrs !== 1 ? 's' : ''}`;
  return `Departing in ${hrs}h ${rem}m`;
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function SeatsLabel({ seats }: { seats: number }) {
  if (seats === 0) {
    return <span style={{ color: V.red, fontWeight: 700 }}>Full</span>;
  }
  if (seats <= 2) {
    return <span style={{ color: V.red, fontWeight: 700 }}>Last {seats} seat{seats !== 1 ? 's' : ''}!</span>;
  }
  if (seats <= 10) {
    return <span style={{ color: V.amber, fontWeight: 600 }}>Only {seats} seats left</span>;
  }
  return <span style={{ color: V.green, fontWeight: 600 }}>{seats} seats left</span>;
}

const Overview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = getStoredUser();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.station) return;
    const [t, r] = await Promise.all([
      getAvailableTrips(user.station),
      getReservations(user.id),
    ]);
    setTrips(t);
    setReservations(r);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (!user.station) { setLoading(false); return; }
    fetchData().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (refreshing || !user?.station) return;
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          height: 180, borderRadius: 14, background: V.line,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ height: 80, borderRadius: 12, background: V.line, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 80, borderRadius: 12, background: V.line, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
      </div>
    );
  }

  const nextTrip = trips[0] ?? null;
  const isReserved = nextTrip
    ? reservations.some((r) => r.trip === nextTrip.id)
    : false;
  const seatsLeft = nextTrip ? nextTrip.seats_left : 0;
  const ridesThisMonth = reservations.filter((r) => isThisMonth(r.created_at)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!user?.station && (
        <div style={{
          border: `1px solid ${V.line}`, borderRadius: 14,
          padding: '24px 28px', background: V.white,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>
            Choose your stop when you're ready
          </div>
          <div style={{ fontSize: 13, color: V.mid, marginTop: 6 }}>
            You can keep browsing, but reservations stay disabled until you pick a boarding stop.
          </div>
          <div style={{ marginTop: 14 }}>
            <Link to="/student/settings" style={{
              display: 'inline-block', padding: '8px 16px', borderRadius: 8,
              background: V.blue, color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}>
              Set my stop
            </Link>
          </div>
        </div>
      )}

      {/* Hero card */}
      {nextTrip ? (
        <div style={{
          background: V.blue, borderRadius: 14,
          padding: '28px 28px 24px', color: 'white',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', bottom: -10, right: 10,
            fontSize: 80, opacity: 0.1, lineHeight: 1, pointerEvents: 'none',
          }}>🚌</div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8, color: 'white', cursor: refreshing ? 'wait' : 'pointer',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'all 0.15s',
              opacity: refreshing ? 0.5 : 1,
            }}
            aria-label="Refresh"
          >
            {refreshing ? '…' : '↻'}
          </button>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Eyebrow */}
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.8, marginBottom: 8 }}>
              {t('dashboard.passenger.tonight', 'Tonight')} · {user?.station_name ?? t('dashboard.passenger.notSet', 'Not set')}
            </div>

            {/* Big time */}
            <div style={{
              fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em',
              fontFamily: V.mono,
            }}>
              {formatTime(nextTrip.departure_datetime)}
            </div>

            {/* Countdown */}
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4, fontWeight: 500 }}>
              {getCountdown(nextTrip.departure_datetime)}
            </div>

            {/* Seats + route info */}
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>
              {nextTrip.route_name ?? nextTrip.route} · <SeatsLabel seats={seatsLeft} />
            </div>

            {/* CTA */}
            <div style={{ marginTop: 16 }}>
              {isReserved ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 20px', borderRadius: 8,
                  background: V.greenBg, border: `1px solid ${V.greenBdr}`,
                  fontSize: 13, fontWeight: 700, color: V.green,
                }}>
                  ✓ You are on board
                </span>
              ) : seatsLeft > 0 ? (
                <Link to="/student/reserve" style={{
                  display: 'inline-block', padding: '8px 20px', borderRadius: 8,
                  background: 'white', color: V.blue,
                  fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s',
                }}>
                  {t('dashboard.passenger.reserveSeat', 'Reserve my seat')} →
                </Link>
              ) : (
                <span style={{
                  display: 'inline-block', padding: '8px 20px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                }}>
                  Full
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* No trips card */
        <div style={{
          border: `1px solid ${V.line}`, borderRadius: 14,
          padding: '28px 28px 24px', textAlign: 'center',
          background: V.white, position: 'relative',
        }}>
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'transparent', border: `1px solid ${V.line}`,
              borderRadius: 8, color: V.mid, cursor: refreshing ? 'wait' : 'pointer',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'all 0.15s',
            }}
            aria-label="Refresh"
          >
            {refreshing ? '…' : '↻'}
          </button>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌙</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
            {t('dashboard.passenger.noTrips', 'No trips available right now')}
          </div>
          <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
            Service runs 10PM – 6AM · Come back tonight
          </div>
        </div>
      )}

      {/* Two info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: V.white, border: `1px solid ${V.line}`,
          borderRadius: 12, padding: '18px 20px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: V.dim,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t('dashboard.passenger.myStop', 'My Stop')}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: V.ink, marginTop: 6 }}>
            {user?.station_name ?? t('dashboard.passenger.notSet', 'Not set')}
          </div>
        </div>

        <div style={{
          background: V.white, border: `1px solid ${V.line}`,
          borderRadius: 12, padding: '18px 20px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: V.dim,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t('dashboard.passenger.ridesMonth', 'Rides This Month')}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: V.ink, marginTop: 6 }}>
            {ridesThisMonth}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
    </div>
  );
};

export default Overview;

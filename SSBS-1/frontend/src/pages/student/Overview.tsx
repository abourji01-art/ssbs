import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getStoredUser, getAvailableTrips, getReservations } from '../../services/api';
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
  mono: 'var(--fm-mono)',
} as const;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const Overview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = getStoredUser();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/'); return; }

    if (!user.station) {
      setLoading(false);
      return;
    }

    Promise.all([
      getAvailableTrips(user.station),
      getReservations(user.id),
    ]).then(([t, r]) => {
      setTrips(t);
      setReservations(r);
    }).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hero skeleton */}
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

  const reservationCountForTrip = nextTrip
    ? reservations.filter((r) => r.trip === nextTrip.id).length
    : 0;

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
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: 8,
              background: V.blue,
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
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

            {/* Subtitle */}
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
              {nextTrip.route} · {seatsLeft} {t('dashboard.passenger.seatsLeft', 'seats left')}
            </div>

            {/* CTA */}
            <div style={{ marginTop: 16 }}>
              {isReserved ? (
                <span style={{
                  display: 'inline-block', padding: '8px 20px', borderRadius: 8,
                  background: V.greenBg, border: `1px solid ${V.greenBdr}`,
                  fontSize: 13, fontWeight: 700, color: V.green,
                }}>
                  ✓ {t('dashboard.passenger.reserved', 'Reserved')}
                </span>
              ) : (
                <Link to="/student/reserve" style={{
                  display: 'inline-block',
                  padding: '8px 20px', borderRadius: 8,
                  background: 'white', color: V.blue,
                  fontSize: 13, fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}>
                  {t('dashboard.passenger.reserveSeat', 'Reserve my seat')} →
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* No trips card */
        <div style={{
          border: `1px solid ${V.line}`, borderRadius: 14,
          padding: '28px 28px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌙</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
            {t('dashboard.passenger.noTrips', 'No trips available right now')}
          </div>
          <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
            {t('dashboard.passenger.serviceHours', 'Service runs 10PM – 6AM')}
          </div>
        </div>
      )}

      {/* Two info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* My Stop */}
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

        {/* Rides This Month */}
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

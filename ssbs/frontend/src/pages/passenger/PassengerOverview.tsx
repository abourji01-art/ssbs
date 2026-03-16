import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getAvailableTrips, getReservations, getReservationHistory } from '../../services/api';

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

const PassengerOverview = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user?.station) {
    return <Navigate to="/student/onboarding" replace />;
  }

  const { data: trips = [] } = useQuery({
    queryKey: ['availableTrips', user.station],
    queryFn: () => getAvailableTrips(user.station!),
    enabled: !!user.station,
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations', user.id],
    queryFn: () => getReservations(user.id),
    enabled: !!user.id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['reservationHistory', user.id],
    queryFn: () => getReservationHistory(user.id),
    enabled: !!user.id,
  });

  // Tonight's first trip
  const nextTrip = trips[0] || null;
  // User's reservation for tonight
  const activeReservation = reservations.find(r => r.trip === nextTrip?.id) || null;
  
  // My Home Stop name
  const homeStop = user.station_name || '—';

  // Rides this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const ridesThisMonth = [...reservations, ...history].filter(r => {
    const d = new Date(r.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const routeLabel = nextTrip?.route || 'No Route';
  const busLabel = nextTrip?.bus || 'No Bus';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero card (blue bg) */}
      <div style={{
        background: V.blue,
        borderRadius: 14,
        padding: '28px 28px 24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background bus emoji */}
        <div style={{
          position: 'absolute', bottom: -10, right: 10,
          fontSize: 80, opacity: 0.1, lineHeight: 1,
          pointerEvents: 'none',
        }}>🚌</div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.8, marginBottom: 8 }}>
            {t('dashboard.passenger.tonight', 'Tonight')} · {routeLabel} · {homeStop}
          </div>

          {/* Big time */}
          <div style={{
            fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em',
            fontFamily: V.mono,
          }}>
            {nextTrip ? new Date(nextTrip.departure_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : t('dashboard.passenger.noTrips', 'No trips available')}
          </div>

          {/* Route subtitle */}
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
            {nextTrip
              ? `${busLabel} · ${routeLabel} · ${nextTrip.seats ?? '-'} ${t('dashboard.passenger.seatsLeft', 'seats left')}`
              : t('dashboard.passenger.serviceHours', 'Service runs 10PM–6AM')}
          </div>

          {/* Buttons */}
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {activeReservation ? (
              <span style={{
                padding: '8px 20px', borderRadius: 8,
                background: V.greenBg, border: `1px solid ${V.greenBdr}`,
                fontSize: 13, fontWeight: 700, color: V.green,
              }}>
                ✓ {t('dashboard.passenger.reserved', 'Reserved')}
              </span>
            ) : nextTrip ? (
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
            ) : null}
          </div>
        </div>
      </div>

      {/* Two info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* My Home Stop */}
        <div style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: '18px 20px',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: V.dim,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t('dashboard.passenger.myHomeStop', 'My Home Stop')}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: V.ink, marginTop: 6 }}>
            {homeStop}
          </div>
          <div style={{ fontSize: 11, color: V.mid, marginTop: 4 }}>
            Registered Stop
          </div>
          <Link to="/student/settings" style={{
            fontSize: 11, fontWeight: 600, color: V.blue,
            textDecoration: 'none', marginTop: 6, display: 'inline-block',
          }}>
            {t('dashboard.passenger.change', 'Change')} →
          </Link>
        </div>

        {/* Rides This Month */}
        <div style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: '18px 20px',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: V.dim,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t('dashboard.passenger.ridesThisMonth', 'Rides This Month')}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: V.ink, marginTop: 6 }}>
            {ridesThisMonth}
          </div>
          <Link to="/student/reservations" style={{
            fontSize: 11, fontWeight: 600, color: V.blue,
            textDecoration: 'none', marginTop: 6, display: 'inline-block',
          }}>
            {t('dashboard.passenger.viewHistory', 'View history')} →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PassengerOverview;

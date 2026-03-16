import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getStoredUser, getDrivers } from '../../services/api';
import { useTrips, useRoutes, useBuses } from '../../hooks/useApi';
import type { Trip, Route } from '../../types/api';

const V = {
  bg: 'var(--fm-bg)',
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  green: 'var(--fm-green)',
  greenBg: 'var(--fm-green-bg)',
  amber: 'var(--fm-amber)',
  amberBg: 'var(--fm-amber-bg)',
  mono: 'var(--fm-mono)',
} as const;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

const Overview = () => {
  const { t } = useTranslation();
  const user = getStoredUser();

  const { data: trips = [], isLoading: tripsLoading } = useTrips();
  const { data: routes = [], isLoading: routesLoading } = useRoutes();
  const { data: buses = [] } = useBuses();
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: getDrivers });
  const loading = tripsLoading || routesLoading;

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('dashboard.admin.goodMorning', 'Good morning')
    : hour < 18
      ? t('dashboard.admin.goodAfternoon', 'Good afternoon')
      : t('dashboard.admin.goodEvening', 'Good evening');
  const firstName = user?.login_42 ?? 'Admin';

  const activeTrips = trips.filter((tr) => !tr.archived_at);
  const totalSeats = activeTrips.reduce((sum, tr) => sum + tr.seats, 0);
  const earliest = activeTrips.length > 0
    ? activeTrips.reduce((a, b) =>
        a.departure_datetime < b.departure_datetime ? a : b)
    : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[140, 60, 80].map((h, i) => (
          <div key={i} style={{
            height: h, borderRadius: 14, background: V.line,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.7}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Greeting */}
      <div style={{
        background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
        padding: '20px 24px',
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
          {greeting}, {firstName} 👋
        </div>
        <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
          {t('dashboard.admin.tonightOnTrack', "Here's what's happening with your fleet tonight.")}
        </div>
      </div>

      {/* Tonight strip */}
      <div style={{
        background: V.blue, borderRadius: 14, padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#93C5FD',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
            {t('dashboard.admin.tonight', 'Tonight')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{activeTrips.length}</div>
            <div style={{ fontSize: 11, color: '#BFDBFE' }}>
              {t('dashboard.admin.activeTrips', 'Active Trips')}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{totalSeats}</div>
            <div style={{ fontSize: 11, color: '#BFDBFE' }}>
              {t('dashboard.admin.seatsLeft', 'Total Seats')}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 20, fontWeight: 800, color: 'white', fontFamily: V.mono,
            }}>
              {earliest ? formatTime(earliest.departure_datetime) : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#BFDBFE' }}>
              {t('dashboard.admin.nextDeparture', 'Departure')}
            </div>
          </div>
        </div>
      </div>

      {/* 3 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { emoji: '🗺️', label: t('dashboard.nav.routes', 'Routes'), value: String(routes.length), sub: t('dashboard.status.active', 'Active now'), bg: V.greenBg },
          { emoji: '🚌', label: t('dashboard.nav.buses', 'Buses'), value: String(buses.length), sub: t('dashboard.admin.inFleet', 'In fleet'), bg: V.blueBg },
          { emoji: '🚗', label: t('dashboard.nav.drivers', 'Drivers'), value: String(drivers.length), sub: t('dashboard.admin.total', 'Total registered'), bg: V.amberBg },
        ].map((s) => (
          <div key={s.label} style={{
            background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
            padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              {s.emoji}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: V.ink }}>{s.value}</div>
              <div style={{ fontSize: 11, color: V.mid }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.7}}`}</style>
    </div>
  );
};

export default Overview;

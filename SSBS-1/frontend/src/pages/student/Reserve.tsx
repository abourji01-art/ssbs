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
  red: 'var(--fm-red)',
  mono: 'var(--fm-mono)',
} as const;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

type CardState = 'idle' | 'loading' | 'reserved' | 'full' | 'error';

const Reserve = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = getStoredUser();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    if (!user || !user.station) return;
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

  const handleReserve = async (trip: Trip) => {
    if (!user) return;
    setCardStates((s) => ({ ...s, [trip.id]: 'loading' }));
    setCardErrors((e) => { const copy = { ...e }; delete copy[trip.id]; return copy; });

    try {
      await createReservation(trip.id, user.id);
      setCardStates((s) => ({ ...s, [trip.id]: 'reserved' }));
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
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
            Pick a stop before reserving
          </div>
          <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
            Seat reservations need a boarding stop so we can show the right trips.
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/student/settings" style={{
              display: 'inline-block',
              padding: '10px 18px',
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
          {t('dashboard.passenger.serviceHours', 'Service runs 10PM – 6AM')}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
          {t('dashboard.passenger.reserveTitle', 'Reserve a Seat')}
        </div>
        <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
          {t('dashboard.passenger.reserveSubtitle', "Tonight's available trips from")} {user?.station_name ?? ''}
        </div>
      </div>

      {/* Trip cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {trips.map((trip) => {
          const resCountForTrip = reservations.filter((r) => r.trip === trip.id).length;
          const seatsLeft = trip.seats_left;
          const isReserved = reservations.some((r) => r.trip === trip.id && r.student === user?.id);
          const isFull = seatsLeft <= 0;

          const state = cardStates[trip.id]
            ?? (isReserved ? 'reserved' : isFull ? 'full' : 'idle');
          const errorMsg = cardErrors[trip.id];

          const seatsColor = seatsLeft <= 3 && seatsLeft > 0 ? V.amber : V.dim;

          return (
            <div
              key={trip.id}
              style={{
                background: V.white,
                border: `1px solid ${V.line}`,
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: state === 'full' ? 0.5 : 1,
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
              <div style={{ width: 64, flexShrink: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: V.blue,
                  fontFamily: V.mono,
                }}>
                  {formatTime(trip.departure_datetime)}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>
                  {trip.route}
                </div>
                <div style={{ fontSize: 12, color: seatsColor, marginTop: 2 }}>
                  {seatsLeft} {t('dashboard.passenger.seatsLeft', 'seats left')}
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
                    ✓ {t('dashboard.passenger.reserved', 'Reserved')}
                  </span>
                ) : state === 'full' ? (
                  <span style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    color: V.dim,
                  }}>
                    {t('dashboard.passenger.full', 'Full')}
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
                      fontFamily: "'Geist', sans-serif",
                      transition: 'opacity 0.15s',
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
    </div>
  );
};

export default Reserve;

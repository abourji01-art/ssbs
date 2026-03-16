// @ts-nocheck
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAvailableTrips, getReservations, createReservation } from '../../services/api';

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
  redBg: 'var(--fm-red-bg)',
  redBdr: 'var(--fm-red-bdr)',
  mono: 'var(--fm-mono)',
} as const;

const ReserveASeat = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [confirmingTrip, setConfirmingTrip] = useState<string | null>(null);

  if (!user?.station) {
    return <Navigate to="/student/onboarding" replace />;
  }

  const { data: trips = [], refetch: refetchTrips } = useQuery({
    queryKey: ['availableTrips', user.station],
    queryFn: () => getAvailableTrips(user.station!),
    enabled: !!user.station,
  });

  const { data: reservations = [], refetch: refetchReservations } = useQuery({
    queryKey: ['reservations', user.id],
    queryFn: () => getReservations(user.id),
    enabled: !!user.id,
  });

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTrips(), refetchReservations()]);
    setRefreshing(false);
  };

  const reserveMutation = useMutation({
    mutationFn: (tripId: string) => createReservation(tripId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTrips'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onSettled: () => setConfirmingTrip(null),
  });

  const homeStop = user.station_name || '—';

  const handleReserve = (tripId: string) => {
    setConfirmingTrip(tripId);
    reserveMutation.mutate(tripId, {
      onSuccess: () => toast('Reserved successfully!'),
      onError: (err) => {
        const msg = err?.message || err?.response?.data?.detail || '';
        if (msg.includes('Already reserved') || msg.includes('already reserved')) {
          // Already reserved — just show as reserved
        } else if (msg.includes('fully booked') || msg.includes('Trip is fully booked')) {
          // Full — no action needed, refetch will update seats
        } else {
          toast(`Error: ${msg || 'Failed to reserve'}`);
        }
        setConfirmingTrip(null);
        refetchTrips();
        refetchReservations();
      }
    });
  };

  const getTripState = (trip: any): 'reserved' | 'open' | 'full' => {
    if (reservations.some(r => r.trip === trip.id && r.status !== 'Cancelled')) return 'reserved';
    if (trip.seats_left <= 0) return 'full';
    return 'open';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
            {t('dashboard.passenger.reserveTitle', 'Reserve a Seat')}
          </div>
          <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
            {t('dashboard.passenger.reserveSubtitle', "Tonight's available trips from")} {homeStop}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '6px 14px', borderRadius: 8, border: `1px solid ${V.line}`,
            background: V.white, color: V.mid, fontSize: 12, fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.6 : 1,
            fontFamily: "'Geist', sans-serif",
          }}
        >
          {refreshing ? '↻ …' : '↻ Refresh'}
        </button>
      </div>

      {/* Trip cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {trips.length === 0 ? (
          <div style={{ color: V.mid, padding: 20, textAlign: 'center', background: V.white, borderRadius: 12, border: `1px solid ${V.line}` }}>
            {t('dashboard.passenger.noTrips', 'No trips available')}
          </div>
        ) : trips.map((trip) => {
          const state = getTripState(trip);

          const isConfirming = confirmingTrip === trip.id;
          const seatsColor = trip.seats_left <= 3 ? V.amber : V.dim;
          
          const formattedTime = new Date(trip.departure_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

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
                cursor: state === 'open' ? 'default' : 'default',
              }}
              onMouseEnter={(e) => {
                if (state === 'open') {
                  e.currentTarget.style.borderColor = V.blueBdr;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = V.line;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Departure time */}
              <div style={{ width: 64, flexShrink: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: V.blue,
                  fontFamily: V.mono,
                }}>
                  {formattedTime}
                </div>
              </div>

              {/* Trip info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
                  {trip.route || t('dashboard.passenger.nightShuttle', 'Night Shuttle')}
                </div>
                <div style={{ fontSize: 11, color: V.mid, marginTop: 2 }}>
                  {trip.bus} → {homeStop}
                </div>
              </div>

              {/* Seats left */}
              <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 48 }}>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: seatsColor,
                }}>
                  {trip.seats_left}
                </div>
                <div style={{ fontSize: 10, color: V.dim, marginTop: 1 }}>
                  {t('dashboard.passenger.seatsLeft', 'Seats Left')}
                </div>
              </div>

              {/* Action button */}
              <div style={{ flexShrink: 0 }}>
                {state === 'reserved' ? (
                  <div style={{
                    padding: '7px 16px', borderRadius: 8,
                    background: V.greenBg, border: `1px solid ${V.greenBdr}`,
                    fontSize: 12, fontWeight: 600, color: V.green,
                  }}>
                    ✓ {t('dashboard.passenger.reserved', 'Reserved')}
                  </div>
                ) : state === 'open' ? (
                  <button
                    onClick={() => handleReserve(trip.id)}
                    disabled={isConfirming}
                    style={{
                      padding: '7px 16px', borderRadius: 8,
                      background: isConfirming ? V.greenBg : V.blue,
                      border: isConfirming ? `1px solid ${V.greenBdr}` : 'none',
                      fontSize: 12, fontWeight: 600,
                      color: isConfirming ? V.green : '#FFFFFF',
                      cursor: isConfirming ? 'default' : 'pointer',
                      fontFamily: "'Geist', sans-serif",
                      transition: 'all 0.15s',
                    }}
                  >
                    {isConfirming ? '...' : `${t('dashboard.passenger.reserve', 'Reserve')} →`}
                  </button>
                ) : state === 'full' ? (
                  <div style={{
                    padding: '7px 16px', borderRadius: 8,
                    background: V.bg, border: `1px solid ${V.line}`,
                    fontSize: 12, fontWeight: 600, color: V.dim,
                  }}>
                    {t('dashboard.passenger.full', 'Full')}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReserveASeat;

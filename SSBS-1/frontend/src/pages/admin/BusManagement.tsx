import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBuses } from '../../hooks/useApi';

const V = {
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
  barTrack: 'var(--fm-line)',
} as const;

const BusManagement = () => {
  const { t } = useTranslation();
  const { data: buses = [], isLoading: loading, refetch } = useBuses();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14,
      }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            height: 140, borderRadius: 14, background: V.line,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.7}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: V.dim }}>
          {buses.length} {t('dashboard.admin.busesInFleet', 'buses in fleet')}
        </span>
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

      {/* Bus cards grid */}
      {buses.length === 0 ? (
        <div style={{
          background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
          padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🚌</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
            {t('dashboard.admin.noBuses', 'No buses registered')}
          </div>
          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
            {t('dashboard.admin.addFirstBus', 'Add your first bus to get started.')}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {buses.map((bus) => (
            <div key={bus.id} style={{
              background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
              padding: 18,
            }}>
              {/* Name + plate */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🚌</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>{bus.name}</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px',
                  borderRadius: 6, textTransform: 'uppercase' as const,
                  background: V.greenBg, color: V.green,
                  border: `1px solid ${V.greenBdr}`,
                }}>
                  {t('dashboard.status.active', 'Active')}
                </span>
              </div>

              {/* Plate */}
              <div style={{ fontSize: 12, color: V.mid, marginBottom: 8 }}>
                {t('dashboard.admin.plate', 'Plate')}: {bus.plate}
              </div>

              {/* Capacity bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 4, fontSize: 11, color: V.dim,
              }}>
                <span>{bus.seat_capacity} {t('dashboard.admin.seats', 'seats')}</span>
              </div>
              <div style={{
                width: '100%', height: 6, borderRadius: 3,
                background: V.barTrack, overflow: 'hidden',
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: 3,
                  background: V.green, transition: 'width 0.3s',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusManagement;

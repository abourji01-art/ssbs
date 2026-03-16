import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBuses, getDrivers } from '../../services/api';
import type { Driver, Bus } from '../../types/api';
import { useTranslation } from 'react-i18next';

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
  redBg: 'var(--fm-red-bg)',
  red: 'var(--fm-red)',
  redBdr: 'var(--fm-red-bdr)',
} as const;

const Drivers = () => {
  const { t } = useTranslation();
  const [buses, setBuses] = useState<Bus[]>([]);
  
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers,
  });

  useEffect(() => {
    getBuses().then(setBuses).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, color: V.dim }}>{drivers.length} {t('dashboard.nav.drivers', 'drivers')}</span>
        <button style={{
          padding: '7px 16px', borderRadius: 8,
          background: V.blue, color: 'white',
          fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
          fontFamily: "'Geist', sans-serif",
        }}>
          + Add Driver
        </button>
      </div>

      {/* Driver cards grid */}
      {drivers.length === 0 ? (
        <div style={{
          background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
          padding: '48px 24px', textAlign: 'center', transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🚗</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>No drivers yet</div>
          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
            Drivers will appear here once registered.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {drivers.map((d) => {
            const assignedBus = buses.length > 0 ? buses[0] : null;
            return (
              <div key={d.id} style={{
                background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
                padding: 18, transition: 'background 0.3s, border-color 0.3s',
              }}>
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: V.blueBg, border: `1px solid ${V.blueBdr}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: V.blue,
                  }}>
                    {(d.name || d.username).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>
                      {d.name || d.username}
                    </div>
                    <div style={{ fontSize: 11, color: V.dim }}>{d.username}</div>
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {assignedBus && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px',
                      borderRadius: 6, background: V.blueBg, color: V.blue,
                      border: `1px solid ${V.blueBdr}`,
                    }}>
                      🚌 {assignedBus.plate}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 8px',
                    borderRadius: 6, background: V.greenBg, color: V.green,
                    border: `1px solid ${V.greenBdr}`,
                  }}>
                    Active
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{
                    flex: 1, padding: '6px 0', borderRadius: 6,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: V.blueBg, color: V.blue, border: `1px solid ${V.blueBdr}`,
                    fontFamily: "'Geist', sans-serif",
                  }}>
                    Edit
                  </button>
                  <button style={{
                    flex: 1, padding: '6px 0', borderRadius: 6,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: V.redBg, color: V.red, border: `1px solid ${V.redBdr}`,
                    fontFamily: "'Geist', sans-serif",
                  }}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Drivers;

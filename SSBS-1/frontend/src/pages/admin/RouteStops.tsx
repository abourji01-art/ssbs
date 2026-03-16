// @ts-nocheck
import { useRoutes, useBuses } from '../../hooks/useApi';
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
  pillBg: 'var(--fm-bg)',
} as const;

const RouteStops = () => {
  const { t } = useTranslation();
  const { data: routes = [] } = useRoutes();
  const { data: buses = [] } = useBuses();

  const getBus = (busId: number) => buses.find((b) => b.id === busId);

  // Mock stops for demo (the API doesn't return stops per route)
  const mockStops = ['1337 Campus', 'Hay Riad', 'Agdal', 'Rabat Ville', 'Salé'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: V.dim }}>{routes.length} {t('dashboard.admin.routesConfigured', 'routes')}</span>
        <button style={{
          padding: '7px 16px', borderRadius: 8,
          background: V.blue, color: 'white',
          fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
          fontFamily: "'Geist', sans-serif",
        }}>
          + Add Route
        </button>
      </div>

      {/* Route cards */}
      {routes.length === 0 ? (
        <div style={{
          background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
          padding: '48px 24px', textAlign: 'center', transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>No routes yet</div>
          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
            Create your first route to get started.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {routes.map((route) => {
            const bus = getBus(route.bus);
            return (
              <div key={route.id} style={{
                background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
                padding: 20, transition: 'background 0.3s, border-color 0.3s',
              }}>
                {/* Route header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: V.blueBg, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      🗺️
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>
                        Route #{route.id} — {route.direction}
                      </div>
                      <div style={{ fontSize: 11, color: V.dim }}>
                        Bus: {bus ? bus.matricule : `#${route.bus}`}
                        {bus && ` · ${bus.capacity} seats`}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px',
                    borderRadius: 6, textTransform: 'uppercase' as const,
                    background: V.greenBg, color: V.green,
                    border: `1px solid ${V.greenBdr}`,
                  }}>
                    Active
                  </span>
                </div>

                {/* Stop pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {mockStops.map((stop, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 500, padding: '4px 10px',
                      borderRadius: 6, background: i === 0 ? V.blueBg : V.pillBg,
                      color: i === 0 ? V.blue : V.mid,
                      border: `1px solid ${i === 0 ? V.blueBdr : V.line}`,
                    }}>
                      {i === 0 ? '🏫' : '📍'} {stop}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RouteStops;

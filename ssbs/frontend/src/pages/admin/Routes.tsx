import { useRoutes } from '../../hooks/useApi';
import type { Route } from '../../types/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const V = {
  ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  surface: 'var(--fm-surface)', line: 'var(--fm-line)', mono: 'var(--fm-mono)',
  blue: 'var(--fm-blue)', blueBg: 'var(--fm-blue-bg)',
} as const;

export default function Routes() {
  const { data = [], isLoading: loading } = useRoutes();
  const routes: Route[] = data as Route[];

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink }}>Routes</h2>
        <span style={{ fontSize: 12, color: V.dim }}>{routes.length} routes</span>
      </div>

      {routes.length === 0 ? (
        <div style={{
          padding: 40, textAlign: 'center',
          background: V.surface, borderRadius: 12, border: `1px solid ${V.line}`,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>No routes yet</div>
          <div style={{ fontSize: 13, color: V.dim, marginTop: 4 }}>
            Routes will appear here once created.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {routes.map((r) => (
            <div key={r.id} style={{
              padding: 16, background: V.surface, borderRadius: 12,
              border: `1px solid ${V.line}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>{r.name}</div>
                <Badge variant={r.window === 'peak' ? 'blue' : 'amber'}>{r.window}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.stations
                  .sort((a, b) => a.order - b.order)
                  .map((s, i) => (
                    <span key={s.station.id} style={{
                      fontSize: 11, color: V.mid,
                      padding: '2px 8px', borderRadius: 6,
                      background: 'var(--fm-surface2)',
                    }}>
                      {i + 1}. {s.station.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTrips, useStartTrip, useEndTrip } from '../../hooks/useApi';

const V = {
  bg: 'var(--fm-bg)', white: 'var(--fm-surface)', ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  faint: 'var(--fm-dim)', line: 'var(--fm-line)', blue: 'var(--fm-blue)', blueBg: 'var(--fm-blue-bg)', blueBdr: 'var(--fm-blue-bdr)',
  green: 'var(--fm-green)', greenBg: 'var(--fm-green-bg)', greenBdr: 'var(--fm-green-bdr)',
};

const FEATURES = ['QR check-in', 'Badge scanning', 'Passenger list', 'Route & stops', 'Admin alerts', 'Trip summary'];

const DriverOverview = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: trips = [], isLoading } = useTrips();
  const startTrip = useStartTrip();
  const endTrip = useEndTrip();

  // "Replace MOCK_DRIVER_TRIP with useTrips() (filter where driver.id === user.id and status is not ENDED). 
  // If user.id is not matching driver.id during test, just grab ANY trip that isn't ENDED for demo purposes!"
  let currentTrip = trips.find(t => t.driver === user?.id && t.status !== 'ENDED');
  if (!currentTrip) {
    currentTrip = trips.find(t => t.status !== 'ENDED');
  }

  return (
    <div style={{ minHeight: '100vh', background: V.bg, fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: V.white, borderBottom: `1px solid ${V.line}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>{t('dashboard.nav.appName', 'Fleetmark')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: V.mid }}>{user?.login_42 || 'Driver'}</span>
          <button onClick={logout} style={{
            padding: '4px 12px', borderRadius: 6, border: `1px solid ${V.line}`,
            background: V.white, fontSize: 12, fontWeight: 500, color: V.mid, cursor: 'pointer',
          }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{
        maxWidth: 600, margin: '0 auto', padding: '40px 24px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Title */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: V.ink, marginBottom: 24 }}>
          {t('dashboard.driver.driverPortal', 'Driver Dashboard')}
        </h1>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: V.dim }}>Loading trip data...</div>
        ) : !currentTrip ? (
          <div style={{
            background: V.white, borderRadius: 12, border: `1px solid ${V.line}`,
            padding: 40, textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌴</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: V.ink }}>No Active Trips</div>
            <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>You have no assigned trips scheduled. Have a great day!</div>
          </div>
        ) : (
          <div style={{
            background: V.white, borderRadius: 12, border: `1px solid ${currentTrip.status === 'STARTED' ? V.blueBdr : V.line}`,
            boxShadow: currentTrip.status === 'STARTED' ? '0 4px 12px rgba(37,99,235,0.1)' : 'none',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${V.line}` }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: V.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  Assigned Trip
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: V.ink }}>
                  {currentTrip.route}
                </div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                background: currentTrip.status === 'STARTED' ? V.blueBg : V.bg,
                color: currentTrip.status === 'STARTED' ? V.blue : V.mid,
                border: `1px solid ${currentTrip.status === 'STARTED' ? V.blueBdr : V.line}`
              }}>
                {currentTrip.status}
              </span>
            </div>
            
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, color: V.mid }}>Bus</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>{currentTrip.bus}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: V.mid }}>Departure</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
                    {new Date(currentTrip.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: `1px solid ${V.line}`, margin: '8px 0' }} />
              
              <div style={{ display: 'flex', gap: 12 }}>
                {currentTrip.status === 'CREATED' && (
                  <button
                    onClick={() => startTrip.mutate(currentTrip.id)}
                    disabled={startTrip.isPending}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 8,
                      background: V.blue, color: 'white',
                      fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                      fontFamily: "'Geist', sans-serif"
                    }}
                  >
                    {startTrip.isPending ? 'Starting...' : 'Start Trip'}
                  </button>
                )}
                {currentTrip.status === 'STARTED' && (
                  <button
                    onClick={() => endTrip.mutate(currentTrip.id)}
                    disabled={endTrip.isPending}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 8,
                      background: V.green, color: 'white',
                      fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                      fontFamily: "'Geist', sans-serif"
                    }}
                  >
                    {endTrip.isPending ? 'Ending...' : 'End Trip'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOverview;

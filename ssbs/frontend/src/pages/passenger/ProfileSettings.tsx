// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { getStations, patchMe, logout as apiLogout } from '../../services/api';
import type { Station } from '../../types/api';

const V = {
  bg: 'var(--fm-bg)', white: 'var(--fm-surface)', ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  line: 'var(--fm-line)', blue: 'var(--fm-blue)', blueBg: 'var(--fm-blue-bg)', blueBdr: 'var(--fm-blue-bdr)',
  green: 'var(--fm-green)', greenBg: 'var(--fm-green-bg)', greenBdr: 'var(--fm-green-bdr)', amber: 'var(--fm-amber)', amberBg: 'var(--fm-amber-bg)',
  amberBdr: 'var(--fm-amber-bdr)', red: 'var(--fm-red)', redBg: 'var(--fm-red-bg)',
};

const ProfileSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [stations, setStations] = useState<Station[]>([]);
  const [showStopPicker, setShowStopPicker] = useState(false);
  const [selectedStop, setSelectedStop] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [notifications, setNotifications] = useState(true);
  const [autoReserve, setAutoReserve] = useState(false);

  useEffect(() => {
    getStations().then(setStations).catch(() => {});
  }, []);

  const handleStopSelect = (stopId: string) => {
    setSelectedStop(stopId);
  };

  const saveStop = async () => {
    if (!selectedStop) return;
    setSaving(true);
    try {
      const updatedUser = await patchMe({ station: selectedStop });
      localStorage.setItem('fleetmark_user', JSON.stringify(updatedUser));
      toast(t('settings.stopSaved', 'Home stop updated!'));
      setSelectedStop('');
      setShowStopPicker(false);
      window.location.reload(); // To update AuthContext
    } catch (err) {
      toast('Failed to update stop', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelStopPicker = () => {
    setSelectedStop('');
    setShowStopPicker(false);
  };

  /* ── Toggle switch — 38x21 pill ── */
  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} style={{
      width: 38, height: 21, borderRadius: 11, border: 'none', cursor: 'pointer',
      background: on ? V.blue : V.dim, position: 'relative', transition: 'background .2s',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 19 : 2, width: 17, height: 17,
        borderRadius: 9, background: V.white, transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.15)',
      }} />
    </button>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Home Stop card ── */}
      <div style={{
        background: V.white, border: `1px solid ${V.line}`, borderRadius: 12,
        overflow: 'hidden', transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>
              {t('settings.homeStop', 'Home Stop')}
            </div>
            <div style={{ fontSize: 12, color: V.mid, marginTop: 2 }}>
              {user?.station_name || '—'}
            </div>
          </div>
          {!showStopPicker && (
            <button
              onClick={() => setShowStopPicker(true)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                background: V.blueBg, border: `1px solid ${V.blueBdr}`,
                fontSize: 12, fontWeight: 600, color: V.blue,
                cursor: 'pointer', fontFamily: "'Geist', sans-serif",
              }}
            >
              {t('settings.changeStop', 'Change stop')}
            </button>
          )}
        </div>

        {/* Inline stop picker */}
        {showStopPicker && (
          <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${V.line}`, paddingTop: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {stations.map((s) => {
                const active = selectedStop === s.id;
                const isCurrent = user?.station === s.id;
                return (
                  <button key={s.id} onClick={() => handleStopSelect(s.id)} style={{
                    padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                    border: `1px solid ${active ? V.blue : isCurrent ? V.greenBdr : V.line}`,
                    cursor: 'pointer', transition: 'all .15s',
                    background: active ? V.blue : isCurrent ? V.greenBg : 'transparent',
                    color: active ? 'white' : isCurrent ? V.green : V.ink,
                    fontFamily: "'Geist', sans-serif",
                  }}>
                    {s.name}
                  </button>
                );
              })}
            </div>

            {/* Save / Cancel */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={cancelStopPicker} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: 'transparent', color: V.mid,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                fontFamily: "'Geist', sans-serif",
              }}>
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={saveStop}
                disabled={!selectedStop || saving}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                  background: selectedStop ? V.blue : V.line,
                  color: selectedStop ? 'white' : V.dim,
                  fontSize: 13, fontWeight: 600,
                  cursor: selectedStop && !saving ? 'pointer' : 'not-allowed',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                {saving ? 'Saving...' : `${t('settings.save', 'Save')} →`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Preferences card ── */}
      <div style={{
        background: V.white, border: `1px solid ${V.line}`, borderRadius: 12,
        padding: '16px 20px', transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 14 }}>
          {t('settings.preferences', 'Preferences')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ fontSize: 13, color: V.ink }}>{t('settings.notifications', 'Notifications')}</span>
          <Toggle on={notifications} onToggle={() => setNotifications(!notifications)} />
        </div>
        <div style={{ borderTop: `1px solid ${V.line}` }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ fontSize: 13, color: V.ink }}>{t('settings.autoReserve', 'Auto-reserve same stop')}</span>
          <Toggle on={autoReserve} onToggle={() => setAutoReserve(!autoReserve)} />
        </div>
      </div>

      {/* ── Sign Out card ── */}
      <div style={{
        background: V.white, border: `1px solid ${V.line}`, borderRadius: 12,
        padding: '16px 20px', transition: 'background 0.3s, border-color 0.3s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: V.red }}>
          {t('settings.signOut', 'Sign Out')}
        </span>
        <button onClick={apiLogout} style={{
          padding: '7px 16px', borderRadius: 8,
          background: V.redBg, color: V.red,
          fontSize: 12, fontWeight: 600,
          border: 'none', cursor: 'pointer',
          fontFamily: "'Geist', sans-serif",
        }}>
          {t('settings.signOut', 'Sign out')}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;

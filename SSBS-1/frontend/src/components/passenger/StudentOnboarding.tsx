import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ALL_STOPS,
  getBusForStop,
  BUS_INFO,
  type BusAssignment,
} from '../../context/ReservationContext';

interface Props {
  onComplete: (stop: string, bus: BusAssignment) => void;
}

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
  amber: 'var(--fm-amber)',
  amberBg: 'var(--fm-amber-bg)',
  amberBdr: 'var(--fm-amber-bdr)',
} as const;

const BUS_1_STOPS = BUS_INFO['Bus 1'].stops;
const BUS_2_STOPS = BUS_INFO['Bus 2'].stops;

const StudentOnboarding = ({ onComplete }: Props) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');
  const [pendingShared, setPendingShared] = useState<string | null>(null);

  const handleSelect = (stop: string) => {
    const buses = getBusForStop(stop);
    if (buses.length === 1) {
      setSelected(stop);
      setPendingShared(null);
    } else {
      setPendingShared(stop);
      setSelected('');
    }
  };

  const handleSharedChoice = (stop: string, bus: BusAssignment) => {
    setSelected(stop);
    setPendingShared(null);
    onComplete(stop, bus);
  };

  const handleSave = () => {
    if (!selected) return;
    const buses = getBusForStop(selected);
    if (buses.length === 1) {
      onComplete(selected, buses[0]);
    }
  };

  const renderPill = (stop: string) => {
    const isSelected = selected === stop;
    return (
      <button
        key={stop}
        onClick={() => handleSelect(stop)}
        style={{
          padding: '6px 14px',
          borderRadius: 100,
          border: `1px solid ${isSelected ? V.blue : V.line}`,
          background: isSelected ? V.blueBg : V.white,
          color: isSelected ? V.blue : V.mid,
          fontSize: 12,
          fontWeight: isSelected ? 600 : 500,
          cursor: 'pointer',
          transition: 'all 0.15s',
          fontFamily: "'Geist', sans-serif",
        }}
      >
        {stop}
      </button>
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: V.white,
        borderRadius: 16,
        boxShadow: 'var(--fm-shadow-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 0' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
            {t('dashboard.passenger.whereDoYouGetOn', 'Where do you get on?')}
          </div>
          <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
            {t('dashboard.passenger.pickStopOnce', 'Pick your home stop so we can assign you to the right bus.')}
          </div>
        </div>

        {/* Stop pills */}
        <div style={{ padding: '20px 28px', maxHeight: 360, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Route A — Bus 1
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {BUS_1_STOPS.map(renderPill)}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: V.dim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Route B — Bus 2
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {BUS_2_STOPS.map(renderPill)}
          </div>

          {pendingShared && (
            <div style={{
              marginTop: 16, padding: 14, borderRadius: 10,
              background: V.amberBg, border: `1px solid ${V.amberBdr}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: V.amber, marginBottom: 8 }}>
                "{pendingShared}" is on both routes — which bus?
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Bus 1', 'Bus 2'] as BusAssignment[]).map((bus) => (
                  <button
                    key={bus}
                    onClick={() => handleSharedChoice(pendingShared, bus)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 8,
                      border: `1px solid ${V.line}`, background: V.white,
                      fontSize: 12, fontWeight: 600, color: V.ink,
                      cursor: 'pointer', fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {bus}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px 20px',
          borderTop: `1px solid ${V.line}`,
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => onComplete(ALL_STOPS[0], 'Bus 1')}
            style={{
              padding: '8px 18px', borderRadius: 8,
              border: `1px solid ${V.line}`, background: V.white,
              fontSize: 13, fontWeight: 500, color: V.mid,
              cursor: 'pointer', fontFamily: "'Geist', sans-serif",
            }}
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={!selected}
            style={{
              padding: '8px 22px', borderRadius: 8,
              border: 'none',
              background: selected ? V.blue : V.line,
              fontSize: 13, fontWeight: 600,
              color: selected ? '#FFFFFF' : V.dim,
              cursor: selected ? 'pointer' : 'default',
              fontFamily: "'Geist', sans-serif",
              transition: 'all 0.15s',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentOnboarding;

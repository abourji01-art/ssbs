import { useEffect, useState } from 'react';
import { getStations } from '../../services/api';
import type { Station } from '../../types/api';
import Spinner from '../ui/Spinner';

interface Props {
  value: string | null;
  onChange: (stationId: string) => void;
}

export default function StopPicker({ value, onChange }: Props) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStations()
      .then(setStations)
      .catch(() => setError('Could not load stations'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size={24} />;
  if (error) return <p style={{ color: 'var(--fm-red)', fontSize: 13 }}>{error}</p>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {stations.map((s) => {
        const active = s.id === value;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              border: active ? '1.5px solid var(--fm-blue)' : '1.5px solid var(--fm-line)',
              background: active ? 'var(--fm-blue)' : 'transparent',
              color: active ? '#fff' : 'var(--fm-mid)',
              transition: 'all 0.15s',
            }}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUsers } from '../../hooks/useApi';

const V = {
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  green: 'var(--fm-green)',
  greenBg: 'var(--fm-green-bg)',
  greenBdr: 'var(--fm-green-bdr)',
  bg: 'var(--fm-bg)',
} as const;

const Students = () => {
  const { t } = useTranslation();
  const { data: users = [], isLoading } = useUsers();

  const students = useMemo(
    () => users.filter((u) => u.role === 'STUDENT'),
    [users],
  );

  if (isLoading) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: V.dim }}>
        Loading students…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: V.dim }}>{students.length} {t('dashboard.nav.students', 'students')}</span>
      </div>

      <div style={{
        background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: V.bg }}>
                {['42 Login', 'Email', 'Stop', 'Status'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 18px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: V.dim,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: `1px solid ${V.line}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{
                    padding: '40px 18px', textAlign: 'center',
                    fontSize: 13, color: V.dim,
                  }}>
                    No students registered yet
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${V.line}` }}>
                    <td style={{ padding: '10px 18px', fontWeight: 600, color: V.ink }}>
                      {s.login_42 || '—'}
                    </td>
                    <td style={{ padding: '10px 18px', color: V.mid }}>
                      {s.email}
                    </td>
                    <td style={{ padding: '10px 18px', color: V.mid }}>
                      {s.station_name ?? '—'}
                    </td>
                    <td style={{ padding: '10px 18px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px',
                        borderRadius: 6, textTransform: 'uppercase',
                        background: s.is_active ? V.greenBg : V.bg,
                        color: s.is_active ? V.green : V.dim,
                        border: `1px solid ${s.is_active ? V.greenBdr : V.line}`,
                      }}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;

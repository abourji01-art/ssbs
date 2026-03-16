import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getUsers } from '../../services/api';
import type { User } from '../../types/api';

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
  const { data: users = [], isLoading, isError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const students = users.filter((u) => u.role === 'STUDENT');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: V.dim }}>{students.length} {t('dashboard.nav.students', 'students')}</span>
      </div>

      <div style={{
        background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
        overflow: 'hidden',
      }}>
        {isError && (
          <div style={{ padding: '12px 18px', color: 'var(--fm-red)', fontSize: 13 }}>
            {t('errors.loadStudents', 'Failed to load students. Make sure you are logged in as logistics staff.')}
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: V.bg }}>
                {['42 Login', 'Stop', 'Status'].map((h) => (
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
              {isLoading ? (
                <tr>
                  <td colSpan={3} style={{ padding: '24px 18px', textAlign: 'center', fontSize: 13, color: V.dim }}>
                    {t('loading', 'Loading...')}
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{
                    padding: '40px 18px', textAlign: 'center',
                    fontSize: 13, color: V.dim,
                  }}>
                    {t('dashboard.admin.noStudents', 'No students registered yet')}
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${V.line}` }}>
                    <td style={{ padding: '12px 18px', color: V.ink, fontWeight: 600 }}>{s.login_42}</td>
                    <td style={{ padding: '12px 18px', color: V.dim }}>
                      {s.station_name || t('dashboard.admin.noStation', 'Not assigned')}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '4px 8px',
                        borderRadius: 6, textTransform: 'uppercase',
                        background: s.is_active ? V.greenBg : V.bg,
                        color: s.is_active ? V.green : V.dim,
                        border: `1px solid ${s.is_active ? V.greenBdr : V.line}`,
                      }}>
                        {s.is_active ? t('status.active', 'Active') : t('status.inactive', 'Inactive')}
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

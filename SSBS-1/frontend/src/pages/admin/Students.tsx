import { useTranslation } from 'react-i18next';

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

  /* TODO: wire to a backend "list students" endpoint when available */

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: V.dim }}>0 {t('dashboard.nav.students', 'students')}</span>
      </div>

      <div style={{
        background: V.white, borderRadius: 14, border: `1px solid ${V.line}`,
        overflow: 'hidden',
      }}>
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
              <tr>
                <td colSpan={3} style={{
                  padding: '40px 18px', textAlign: 'center',
                  fontSize: 13, color: V.dim,
                }}>
                  No students registered yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;

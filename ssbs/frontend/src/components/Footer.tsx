import FleetmarkLogo from './ui/FleetmarkLogo';

const S = {
  bg: '#050508',
  line: 'rgba(255,255,255,0.06)',
  muted: '#94A3B8',
  dim: '#64748B',
} as const;

const Footer = () => {
  const platformLinks = [
    { label: 'Problems', href: '#prob' },
    { label: 'How It Works', href: '#how' },
    { label: 'Schedule', href: '#sch' },
    { label: 'Sign In', href: '#auth' },
  ];
  const projectLinks = [
    { label: 'Team', href: '#team' },
    { label: '1337.ma', href: 'https://1337.ma' },
    { label: '42.fr', href: 'https://42.fr' },
    { label: 'GitHub', href: '#' },
  ];

  return (
    <footer
      style={{
        background: S.bg,
        borderTop: `1px solid ${S.line}`,
        fontFamily: "'Geist', sans-serif",
        padding: '48px 20px 0',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Top */}
        <div className="flex flex-col md:flex-row justify-between gap-12 pb-10" style={{ borderBottom: `1px solid ${S.line}` }}>
          {/* Brand */}
          <div style={{ maxWidth: 300 }}>
            <FleetmarkLogo size="sm" />
            <p style={{ fontSize: 13, fontWeight: 300, color: S.muted, lineHeight: 1.65, marginTop: 14, marginBottom: 14 }}>
              Night shuttle management for 1337 School. Reserve your seat, ride on time.
            </p>
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: 11, fontWeight: 500,
                color: S.muted,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${S.line}`,
                padding: '4px 12px', borderRadius: 100,
              }}
            >
              Built by 1337 students 🇲🇦
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-16 flex-wrap">
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.dim, marginBottom: 14 }}>Platform</h4>
              <ul className="space-y-2.5">
                {platformLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      style={{ fontSize: 13, fontWeight: 400, color: S.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = S.muted; }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.dim, marginBottom: 14 }}>Project</h4>
              <ul className="space-y-2.5">
                {projectLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{ fontSize: 13, fontWeight: 400, color: S.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = S.muted; }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={{ padding: '20px 0', color: S.dim, fontSize: 12, fontWeight: 300 }}>
          <span>© {new Date().getFullYear()} Fleetmark — All rights reserved.</span>
          <span>A 1337 School project.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

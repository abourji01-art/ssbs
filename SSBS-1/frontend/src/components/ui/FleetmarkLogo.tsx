interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dark' | 'accent';
}

const SIZES = { sm: 14, md: 20, lg: 40 } as const;

const BusSvg = ({ width }: { width: number }) => (
  <svg
    viewBox="0 0 44 14"
    fill="currentColor"
    style={{ width, height: width * (14 / 44), display: 'block' }}
  >
    {/* Body */}
    <path d="M2 0h38c2.2 0 4 1.8 4 4v6c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V2C0 .9.9 0 2 0z" />
    {/* Windows */}
    <rect x="4" y="3" width="6" height="4" rx="1" fill="white" opacity={0.3} />
    <rect x="12" y="3" width="6" height="4" rx="1" fill="white" opacity={0.3} />
    <rect x="20" y="3" width="6" height="4" rx="1" fill="white" opacity={0.3} />
    <rect x="28" y="3" width="6" height="4" rx="1" fill="white" opacity={0.3} />
    {/* Headlight */}
    <rect x="38" y="4" width="3" height="3" rx="0.5" fill="white" opacity={0.3} />
    {/* Wheels */}
    <circle cx="10" cy="13" r="1.5" />
    <circle cx="34" cy="13" r="1.5" />
  </svg>
);

const FleetmarkLogo = ({ size = 'md', variant = 'default' }: Props) => {
  const fontSize = SIZES[size];
  const busWidth = fontSize * 0.95;

  const inkColor = variant === 'dark' ? 'var(--fm-ink)' : 'var(--fm-ink)';
  const fColor = variant === 'accent' ? 'var(--fm-blue)' : inkColor;
  const restColor = inkColor;

  const font: React.CSSProperties = {
    fontFamily: "'Geist', sans-serif",
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1,
    fontSize,
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 0 }}>
      {/* F with bus above */}
      <span style={{ position: 'relative', color: fColor, ...font }}>
        <span style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 4, color: fColor }}>
          <BusSvg width={busWidth} />
        </span>
        F
      </span>
      {/* LEETMARK */}
      <span style={{ color: restColor, ...font }}>LEETMARK</span>
    </span>
  );
};

export default FleetmarkLogo;

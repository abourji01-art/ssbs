const SectionDivider = () => (
  <div
    className="relative z-10 pointer-events-none"
    style={{
      height: '1px',
      background:
        'linear-gradient(90deg, transparent 0%, var(--border-subtle) 50%, transparent 100%)',
      margin: '0 auto',
      maxWidth: '800px',
    }}
  />
);

export default SectionDivider;

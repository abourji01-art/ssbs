import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';

const V = {
  bg: 'var(--fm-bg)',
  surface: 'var(--fm-surface)',
  surface2: 'var(--fm-surface2)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blue2: 'var(--fm-blue2)',
  blueBg: 'var(--fm-blue-bg)',
  blueBdr: 'var(--fm-blue-bdr)',
  green: 'var(--fm-green)',
  greenBg: 'var(--fm-green-bg)',
  shadowSm: 'var(--fm-shadow-sm)',
  shadowMd: 'var(--fm-shadow-md)',
  shadowLg: 'var(--fm-shadow-lg)',
} as const;

const MARQUEE_ITEMS = [
  'Night Shuttle', '26 Stops', 'Reserve Your Seat', 'Real-Time Capacity',
  '42 Intra Only', '10PM – 6AM', '1337 School', 'Ben Guerir',
];

const Hero = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <>
      <section
        ref={sectionRef}
        id="hero"
        className="relative overflow-hidden"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '100px 20px 60px',
          background: V.bg,
          fontFamily: "'Geist', sans-serif",
        }}
      >
        <style>{`
          @keyframes fm-pulse {
            0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(37,99,235,0.4); }
            50% { opacity:0.7; box-shadow:0 0 0 5px rgba(37,99,235,0); }
          }
          @keyframes fm-roll { from { transform:translateX(0) } to { transform:translateX(-50%) } }
          @keyframes fm-float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        `}</style>

        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--fm-dim) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.15,
          }}
        />

        {/* Soft blue radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -200, left: '50%', transform: 'translateX(-50%)',
            width: 900, height: 600, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Two-column content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16" style={{ maxWidth: 1080, margin: '0 auto', width: '100%' }}>

          {/* ── Left column ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 min-w-0"
          >
            {/* Eyebrow pill */}
            <div className="mb-6">
              <span
                className="inline-flex items-center gap-2"
                style={{
                  background: V.blueBg,
                  border: `1px solid ${V.blueBdr}`,
                  padding: '5px 14px 5px 8px',
                  borderRadius: 100,
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{ width: 20, height: 20, borderRadius: '50%', background: V.blueBg }}
                >
                  <span
                    style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: V.blue,
                      animation: 'fm-pulse 2.5s ease-in-out infinite',
                    }}
                  />
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: V.blue, letterSpacing: '0.01em' }}>
                  {t('landing.hero.badge')}
                </span>
              </span>
            </div>

            {/* H1 */}
            <h1
              style={{
                fontSize: 'clamp(40px, 5vw, 68px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: 20,
                color: V.ink,
              }}
            >
              {t('landing.hero.title')}
              <br />
              <span style={{ color: V.blue }}>{t('landing.hero.subtitle')}</span>{' '}
              <span style={{ color: V.dim, fontWeight: 300 }}>for you.</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 16, fontWeight: 300, color: V.mid,
                lineHeight: 1.7, maxWidth: 400, marginBottom: 32,
              }}
            >
              {t('landing.hero.description')}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 mb-10">
              <a
                href="#auth"
                className="inline-flex items-center gap-2 no-underline transition-all duration-200"
                style={{
                  padding: '12px 24px', borderRadius: 8,
                  background: V.blue, color: '#fff',
                  fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {t('landing.hero.cta')} →
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 no-underline transition-all duration-200"
                style={{
                  padding: '11px 20px', borderRadius: 8,
                  background: V.surface2, color: V.mid,
                  fontSize: 14, fontWeight: 500,
                  border: `1px solid ${V.line}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = V.ink;
                  e.currentTarget.style.borderColor = V.dim;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = V.mid;
                  e.currentTarget.style.borderColor = V.line;
                }}
              >
                {t('landing.hero.learnMore')}
              </a>
            </div>

            {/* Stats row */}
            <div
              className="flex flex-col sm:flex-row"
              style={{
                border: `1px solid ${V.line}`,
                borderRadius: 10,
                overflow: 'hidden',
                width: 'fit-content',
                maxWidth: '100%',
              }}
            >
              {[
                { n: '400', u: '+', l: t('landing.hero.stats.riders') },
                { n: '2', u: '', l: t('landing.hero.stats.routes') },
                { n: '10', u: 'PM', l: 'First bus' },
                { n: '6', u: 'AM', l: 'Last bus' },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 20px',
                    borderRight: i < 3 ? `1px solid ${V.line}` : 'none',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, color: V.ink, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 3 }}>
                    {s.n}
                    {s.u && <span style={{ fontSize: 14, color: V.blue }}>{s.u}</span>}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: V.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right column — App Mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ y: mockupY }}
            className="flex-1 min-w-0 hidden lg:block"
          >
            <div
              style={{
                background: V.surface,
                border: `1px solid ${V.line}`,
                borderRadius: 16,
                boxShadow: V.shadowLg,
                overflow: 'hidden',
                maxWidth: 460,
                marginLeft: 'auto',
              }}
            >
              {/* Mac-style title bar */}
              <div
                className="flex items-center gap-2"
                style={{ padding: '12px 16px', borderBottom: `1px solid ${V.line}` }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: V.dim, marginLeft: 8 }}>Fleetmark Dashboard</span>
              </div>

              {/* Dashboard content */}
              <div style={{ padding: 16 }}>
                {/* Trip card */}
                <div
                  style={{
                    background: V.surface2,
                    border: `1px solid ${V.line}`,
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>Night Shuttle — Route 1</span>
                    <span
                      style={{
                        fontSize: 10, fontWeight: 600, color: V.green,
                        background: V.greenBg, padding: '2px 8px', borderRadius: 100,
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: V.mid, marginBottom: 10 }}>
                    OCP Saka → Nakhil → Kentra → La Gare
                  </div>
                  <div className="flex gap-3">
                    {[
                      { v: '32', l: 'Seats Left' },
                      { v: '11:00 PM', l: 'Tonight' },
                      { v: '19', l: 'Stops' },
                    ].map((st, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1, textAlign: 'center',
                          background: V.bg, borderRadius: 8,
                          padding: '8px 4px',
                          border: `1px solid ${V.line}`,
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>{st.v}</div>
                        <div style={{ fontSize: 10, color: V.dim }}>{st.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info rows */}
                <div className="flex gap-3">
                  <div
                    style={{
                      flex: 1, background: V.blueBg,
                      border: `1px solid ${V.blueBdr}`,
                      borderRadius: 8, padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: 10, color: V.blue, fontWeight: 600, marginBottom: 2 }}>Seat Reserved</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>Seat 14A</div>
                  </div>
                  <div
                    style={{
                      flex: 1, background: V.greenBg,
                      border: `1px solid var(--fm-green-bdr)`,
                      borderRadius: 8, padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: 10, color: V.green, fontWeight: 600, marginBottom: 2 }}>ETA</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>12 minutes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating toast notification */}
            <div
              style={{
                position: 'relative',
                marginTop: -24,
                marginRight: -12,
                float: 'right',
                background: V.surface,
                border: `1px solid ${V.line}`,
                borderRadius: 10,
                padding: '10px 16px',
                boxShadow: V.shadowMd,
                animation: 'fm-float 3s ease-in-out infinite',
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 16 }}>✅</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: V.ink }}>Seat Confirmed!</div>
                  <div style={{ fontSize: 11, color: V.dim }}>Route 1 — Seat 14A</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div
        style={{
          borderTop: `1px solid ${V.line}`,
          borderBottom: `1px solid ${V.line}`,
          padding: '12px 0',
          overflow: 'hidden',
          background: V.surface2,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 0,
            animation: 'fm-roll 25s linear infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3.5 shrink-0"
              style={{
                padding: '0 28px',
                fontSize: 12, fontWeight: 500, color: V.dim,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}
            >
              {item}
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: V.blue, opacity: 0.5 }} />
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default Hero;

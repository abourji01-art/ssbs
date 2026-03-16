import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const S = {
  bg: '#0F1117',
  bg3: '#161B27',
  line: 'rgba(255,255,255,0.06)',
  line2: 'rgba(255,255,255,0.10)',
  sky2: '#60A5FA',
  sky3: '#93C5FD',
  muted: '#94A3B8',
  dim: '#64748B',
} as const;

const CARDS = [
  {
    num: '01', icon: '👥',
    q: 'Overcrowded buses with no capacity control',
    tag: 'Daily Problem', tagBg: 'rgba(239,68,68,0.08)', tagBorder: 'rgba(239,68,68,0.15)', tagColor: 'rgba(252,165,165,0.8)',
    sol: 'Real-time seat tracking. Every reservation counted. Bus closes when full.',
  },
  {
    num: '02', icon: '🎲',
    q: 'First-come-first-served — unfair and chaotic',
    tag: 'Every Night', tagBg: 'rgba(239,68,68,0.08)', tagBorder: 'rgba(239,68,68,0.15)', tagColor: 'rgba(252,165,165,0.8)',
    sol: 'Reserve in advance from anywhere. Your seat held before you even arrive.',
  },
  {
    num: '03', icon: '🔕',
    q: 'No communication between staff, drivers and students',
    tag: 'Constant Issue', tagBg: 'rgba(239,68,68,0.08)', tagBorder: 'rgba(239,68,68,0.15)', tagColor: 'rgba(252,165,165,0.8)',
    sol: 'One platform. Admins manage trips. Students get notified. Everyone\'s connected.',
  },
  {
    num: '04', icon: '📊',
    q: 'Zero data on ridership — no way to improve',
    tag: 'Long-term Pain', tagBg: 'rgba(239,68,68,0.08)', tagBorder: 'rgba(239,68,68,0.15)', tagColor: 'rgba(252,165,165,0.8)',
    sol: 'Every trip tracked. Admins see peak hours, popular stops, and patterns.',
  },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="prob"
      ref={ref}
      style={{
        background: S.bg,
        borderTop: `1px solid ${S.line}`,
        borderBottom: `1px solid ${S.line}`,
        padding: '72px 20px',
        fontFamily: "'Geist', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end mb-16"
        >
          <div>
            <div className="flex items-center gap-2 mb-5" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.sky2 }}>
              <span style={{ width: 16, height: 1, background: S.sky2 }} />
              {t('landing.features.badge')}
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em', color: 'white' }}>
              Transport chaos.<br /><em style={{ fontStyle: 'normal', color: S.sky2 }}>We fixed it.</em>
            </h2>
          </div>
          <p style={{ fontSize: 15, fontWeight: 300, color: S.muted, lineHeight: 1.7 }}>
            {t('landing.features.description')}
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2"
          style={{
            gap: 1, background: S.line, borderRadius: 16, overflow: 'hidden',
            border: `1px solid ${S.line}`,
          }}
        >
          {CARDS.map((card, i) => (
            <motion.div
              key={card.num}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              style={{
                background: hovered === i ? S.bg3 : S.bg,
                padding: 36,
                position: 'relative',
                overflow: 'hidden',
                transition: 'background 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setHovered(hovered === i ? null : i)}
            >
              {/* Front */}
              <div
                style={{
                  transition: 'all 0.25s',
                  opacity: hovered === i ? 0 : 1,
                  transform: hovered === i ? 'translateY(-6px)' : 'none',
                }}
              >
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, fontWeight: 500, color: S.dim, marginBottom: 20, letterSpacing: '0.06em' }}>{card.num}</div>
                <div style={{ fontSize: 28, marginBottom: 16, filter: 'grayscale(0.3)' }}>{card.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{card.q}</div>
                <span
                  className="inline-block mt-3.5"
                  style={{
                    background: card.tagBg, border: `1px solid ${card.tagBorder}`,
                    color: card.tagColor, fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: 100,
                  }}
                >
                  {card.tag}
                </span>
              </div>

              {/* Back (solution) */}
              <div
                style={{
                  position: 'absolute', inset: 0, padding: 36, background: S.bg3,
                  opacity: hovered === i ? 1 : 0,
                  transform: hovered === i ? 'none' : 'translateY(6px)',
                  transition: 'all 0.25s',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}
              >
                <span
                  className="inline-block mb-2.5"
                  style={{
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    color: S.sky3, fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: 100, width: 'fit-content',
                  }}
                >
                  Solution
                </span>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'white', lineHeight: 1.5 }}>{card.sol}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <p className="text-center mt-4" style={{ fontSize: 12, color: S.dim, fontStyle: 'italic' }}>Tap or hover each card to see the solution</p>
      </div>
    </section>
  );
};

export default Features;

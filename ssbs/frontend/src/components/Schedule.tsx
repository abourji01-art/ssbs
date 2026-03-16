import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const S = {
  bg2: '#0F1117',
  bg3: '#161B27',
  line: 'rgba(255,255,255,0.06)',
  line2: 'rgba(255,255,255,0.10)',
  sky: '#3B82F6',
  sky2: '#60A5FA',
  muted: '#94A3B8',
} as const;

const TIMELINE = [
  {
    time: '10:00 PM — Midnight',
    title: 'Peak Hours — Split Routes',
    desc: 'Two buses run simultaneously on separate routes to handle peak student traffic leaving campus.',
    chips: ['🚌 Bus 1 — Route A', '🚌 Bus 2 — Route B'],
  },
  {
    time: '12:00 AM — 1:00 AM',
    title: 'Transition Window',
    desc: 'Both buses serve all major stops. A buffer period ensuring no student is ever stranded.',
    chips: ['🔄 Both buses active', 'Full coverage'],
  },
  {
    time: '1:00 AM — 6:00 AM',
    title: 'Late Night — Consolidated Run',
    desc: 'One bus covers all stops. Ideal for night owls finishing late projects at the campus.',
    chips: ['🚌 1 consolidated bus', 'All stops served'],
  },
];

const Schedule = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="sch"
      ref={ref}
      style={{
        background: S.bg2,
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
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14"
        >
          <div>
            <div className="flex items-center gap-2 mb-5" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.sky2 }}>
              <span style={{ width: 16, height: 1, background: S.sky2 }} />
              Night Schedule
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 3vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'white' }}>
              Runs all night.<br /><em style={{ fontStyle: 'normal', color: S.sky2 }}>Every night.</em>
            </h2>
          </div>
          <p className="md:text-right" style={{ maxWidth: 280, fontSize: 14, fontWeight: 300, color: S.muted, lineHeight: 1.6 }}>
            Three phases — split routes in the evening, then one consolidated bus through the night.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ position: 'relative', paddingLeft: 48 }}
        >
          {/* Vertical line */}
          <div
            className="absolute"
            style={{
              left: 16, top: 8, bottom: 8, width: 1,
              background: `linear-gradient(to bottom, transparent, ${S.sky}, transparent)`,
            }}
          />

          {TIMELINE.map((item, i) => (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.15 }}
              style={{ position: 'relative', marginBottom: 40 }}
            >
              {/* Dot */}
              <div
                className="absolute"
                style={{
                  left: -41, top: 18,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#0A0C10', border: `1.5px solid ${S.sky}`,
                }}
              >
                <div
                  className="absolute"
                  style={{ inset: 3, borderRadius: '50%', background: S.sky }}
                />
              </div>

              {/* Card */}
              <div
                style={{
                  background: S.bg3,
                  border: `1px solid ${S.line}`,
                  borderRadius: 12,
                  padding: '24px 28px',
                  transition: 'all 0.25s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = S.line;
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 24, fontWeight: 500, color: S.sky2, marginBottom: 6, letterSpacing: '-0.02em' }}>
                  {item.time}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, fontWeight: 300, color: S.muted, lineHeight: 1.6, marginBottom: 14 }}>{item.desc}</div>
                <div className="flex gap-2 flex-wrap">
                  {item.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5"
                      style={{
                        background: S.bg2, border: `1px solid ${S.line2}`,
                        padding: '5px 12px', borderRadius: 6,
                        fontSize: 12, fontWeight: 500, color: S.muted,
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Schedule;

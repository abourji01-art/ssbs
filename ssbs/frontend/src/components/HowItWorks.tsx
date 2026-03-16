import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const S = {
  bg: '#0A0C10',
  bg2: '#0F1117',
  bg3: '#161B27',
  line: 'rgba(255,255,255,0.06)',
  line2: 'rgba(255,255,255,0.10)',
  sky: '#3B82F6',
  sky2: '#60A5FA',
  muted: '#94A3B8',
  dim: '#64748B',
} as const;

const STEPS = [
  { num: '01', title: 'Sign in with 42 Intra', desc: 'No new account needed. Your 1337 credentials work instantly. Role detected automatically.' },
  { num: '02', title: 'Pick your home stop', desc: 'Choose from 26 stops across Ben Guerir. Only trips serving your area are shown.' },
  { num: '03', title: 'Reserve your seat', desc: 'One tap. Confirmed instantly. No more running to the bus stop.' },
  { num: '04', title: 'Show up and ride', desc: 'Board the shuttle. Admins track everything live. Your seat is waiting.' },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { t } = useTranslation();

  return (
    <section
      id="how"
      ref={ref}
      style={{ background: S.bg, padding: '72px 20px', fontFamily: "'Geist', sans-serif" }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-5" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.sky2 }}>
            <span style={{ width: 16, height: 1, background: S.sky2 }} />
            How It Works
          </div>
          <h2 className="mb-16" style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'white' }}>
            Three steps.<br /><em style={{ fontStyle: 'normal', color: S.sky2 }}>One guaranteed seat.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                className="flex gap-5 group"
                style={{
                  padding: '24px 0',
                  borderBottom: `1px solid ${S.line}`,
                  borderTop: i === 0 ? `1px solid ${S.line}` : 'none',
                  cursor: 'default',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center transition-all duration-200 group-hover:bg-[#3B82F6] group-hover:border-[#3B82F6]"
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: S.bg3,
                    border: `1px solid ${S.line2}`,
                  }}
                >
                  <span
                    className="transition-colors duration-200 group-hover:text-white"
                    style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 600, color: S.muted }}
                  >
                    {step.num}
                  </span>
                </div>
                <div>
                  <div
                    className="transition-colors duration-200 group-hover:text-white"
                    style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 5 }}
                  >
                    {step.title}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 300, color: S.muted, lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* App Card preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ position: 'sticky', top: 80, display: 'none' }}
            className="lg:!block"
          >
            <div style={{
              background: S.bg2,
              border: `1px solid ${S.line}`,
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
            }}>
              {/* Title bar */}
              <div
                className="flex items-center gap-1.5"
                style={{ background: S.bg3, padding: '12px 16px', borderBottom: `1px solid ${S.line}` }}
              >
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28CA41' }} />
                <span style={{ marginLeft: 8, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: S.muted }}>fleetmark · reserve</span>
              </div>

              {/* Body */}
              <div style={{ padding: 20 }}>
                {/* Trip row */}
                <div style={{ background: S.bg3, border: `1px solid ${S.line}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Night Shuttle — Route A</div>
                      <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>OCP Saka → Nakhil → La Gare → 1337</div>
                    </div>
                    <span
                      className="flex items-center gap-1"
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        color: '#6EE7B7', fontSize: 10, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 100,
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { n: '32', l: 'Seats Left', blue: false },
                      { n: '11:00', l: 'PM Tonight', blue: true },
                      { n: '19', l: 'Stops', blue: false },
                    ].map((s) => (
                      <div key={s.l} style={{ background: S.bg2, border: `1px solid ${S.line}`, borderRadius: 8, padding: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: s.blue ? S.sky2 : 'white', lineHeight: 1 }}>{s.n}</div>
                        <div style={{ fontSize: 10, color: S.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reserve button */}
                <button
                  style={{
                    width: '100%', padding: 12, borderRadius: 8,
                    background: S.sky, color: 'white', border: 'none',
                    fontFamily: "'Geist', sans-serif", fontSize: 14, fontWeight: 600,
                    letterSpacing: '-0.01em', cursor: 'pointer',
                  }}
                >
                  Reserve My Seat →
                </button>

                {/* Toast */}
                <div
                  className="flex items-center gap-3 mt-3"
                  style={{
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: 10, padding: '12px 16px',
                  }}
                >
                  <span style={{ fontSize: 18 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Seat confirmed!</div>
                    <div style={{ fontSize: 11, color: S.muted }}>Route A · Tonight · 11:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

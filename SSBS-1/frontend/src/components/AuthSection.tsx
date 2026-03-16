import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getLoginUrl } from '../services/api';
const S = {
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
  { n: '01', text: 'Choose your role below' },
  { n: '02', text: 'Authenticate via 42 Intra' },
  { n: '03', text: 'Pick your stop — start reserving' },
];

interface AuthSectionProps {
  initialError?: string | null;
}

const AuthSection = ({ initialError = null }: AuthSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [loadingRole, setLoadingRole] = useState<'student' | 'staff' | null>(null);
  const [loginError, setLoginError] = useState<string | null>(initialError);

  const handleLogin = async (role: 'student' | 'staff') => {
    setLoadingRole(role);
    setLoginError(null);
    try {
      const data = await getLoginUrl();
      if (data && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Failed to initialize login. Please try again.');
      setLoadingRole(null);
    }
  };

  return (
    <section
      id="auth"
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-5" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.sky2 }}>
              <span style={{ width: 16, height: 1, background: S.sky2 }} />
              Authentication
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 3vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'white', marginBottom: 16 }}>
              Your seat is waiting.<br />
              <em style={{ fontStyle: 'normal', color: S.sky2 }}>Claim it.</em>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: S.muted, lineHeight: 1.65, maxWidth: 420, marginBottom: 32 }}>
              Sign in with your 42 Intra account to access route schedules, reserve your seat, and never miss the shuttle again.
            </p>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="flex items-center gap-4"
                  style={{
                    background: S.bg3,
                    border: `1px solid ${S.line}`,
                    borderRadius: 10,
                    padding: '14px 18px',
                  }}
                >
                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 12, fontWeight: 600, color: S.sky2,
                    background: 'rgba(59,130,246,0.08)',
                    padding: '3px 8px', borderRadius: 6,
                  }}>
                    {s.n}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{s.text}</span>
                </div>
              ))}
            </div>

            {/* School badge */}
            <div
              className="inline-flex items-center gap-2 mt-8"
              style={{
                background: S.bg3,
                border: `1px solid ${S.line}`,
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 500,
                color: S.muted,
              }}
            >
              <span>🏫</span>
              <span>Serving <strong style={{ color: 'white' }}>1337 School</strong>, Ben Guerir</span>
            </div>
          </motion.div>

          {/* Right — Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              style={{
                background: S.bg3,
                border: `1px solid ${S.line}`,
                borderRadius: 20,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Blue glow line at top */}
              <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${S.sky}, transparent)` }} />

              <div style={{ padding: '36px 32px' }}>
                {/* 42 Logo */}
                <div className="text-center mb-8">
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}
                  >
                    <span style={{ color: '#0A0C10', fontSize: 22, fontWeight: 900, fontFamily: "'Geist', sans-serif" }}>42</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 4 }}>Sign in with 42 Intra</h3>
                  <p style={{ fontSize: 13, fontWeight: 300, color: S.muted }}>Use your 42 account to access Fleetmark</p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {loginError}
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleLogin('student')}
                    disabled={loadingRole !== null}
                    className="w-full flex items-center justify-center gap-3 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: S.sky,
                      color: 'white',
                      padding: '14px 24px',
                      borderRadius: 12,
                      border: 'none',
                      fontSize: 14,
                      cursor: loadingRole ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
                    }}
                  >
                    {loadingRole === 'student' ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting…</>
                    ) : (
                      <>🎓 Sign in as Student</>
                    )}
                  </button>

                  <button
                    onClick={() => handleLogin('staff')}
                    disabled={loadingRole !== null}
                    className="w-full flex items-center justify-center gap-3 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: 'transparent',
                      color: 'white',
                      padding: '14px 24px',
                      borderRadius: 12,
                      border: `1px solid ${S.line2}`,
                      fontSize: 14,
                      cursor: loadingRole ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loadingRole === 'staff' ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting…</>
                    ) : (
                      <>
                        🛡️ Sign in as Staff
                        <span style={{
                          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                          background: 'rgba(255,255,255,0.06)', border: `1px solid ${S.line2}`,
                          padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em',
                          color: S.muted,
                        }}>STAFF</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center mt-6" style={{ fontSize: 11, fontWeight: 300, color: S.dim, lineHeight: 1.5 }}>
                  Only 1337 School members can sign in.<br />
                  Your role is verified via your 42 account.
                </p>

                {/* Driver coming soon note */}
                <div className="text-center mt-5" style={{ background: S.bg2, border: `1px solid ${S.line}`, borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: S.dim }}>
                    🚐 <strong style={{ color: S.muted }}>Driver Portal</strong> — Coming Soon
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;

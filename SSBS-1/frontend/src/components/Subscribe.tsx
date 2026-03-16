import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const Subscribe = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Subscribed:', email);
      toast("You're subscribed! 🚀");
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section
      id="subscribe"
      ref={ref}
      style={{
        background: '#3B82F6',
        padding: '56px 32px',
        fontFamily: "'Geist', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between gap-8"
        style={{ maxWidth: 1100, margin: '0 auto' }}
      >
        {/* Left */}
        <div>
          <h2 style={{ fontSize: 'clamp(26px, 2.5vw, 36px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Stay in the loop.
          </h2>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.75)', maxWidth: 380 }}>
            Get notified when new routes, features, or schedule changes go live. No spam.
          </p>
        </div>

        {/* Right — Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@student.1337.ma"
            required
            style={{
              flex: 1,
              minWidth: 240,
              padding: '12px 18px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: 14,
              fontFamily: "'Geist', sans-serif",
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 28px',
              borderRadius: 10,
              border: 'none',
              background: '#0A0C10',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: "'Geist', sans-serif",
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#161B27'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#0A0C10'; }}
          >
            {subscribed ? '✓ Subscribed' : 'Subscribe →'}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default Subscribe;

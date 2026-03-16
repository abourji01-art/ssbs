import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, type LucideIcon } from 'lucide-react';

interface FlipCardProps {
  problem: string;
  solution: string;
  icon: LucideIcon;
  index: number;
  isFlipped: boolean;
  onFlip: () => void;
}

/* Tiny inline click sound — base64 PCM so no file needed */
const playFlipSound = () => {
  try {
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(1, 800, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 800; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 120) * 0.15;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.1;
    src.connect(gain).connect(ctx.destination);
    src.start();
  } catch {
    /* silently ignore — browser may block audio */
  }
};

export default function FlipCard({
  problem,
  solution,
  icon: Icon,
  index,
  isFlipped,
  onFlip,
}: FlipCardProps) {
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFlip = useCallback(() => {
    if (hasInteracted) playFlipSound();
    else setHasInteracted(true);
    onFlip();
  }, [hasInteracted, onFlip]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      }
    },
    [handleFlip],
  );

  const ariaLabel = isFlipped
    ? `Solution: ${solution}. Click to flip back.`
    : `Problem: ${problem}. Click to reveal solution.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
      className="perspective-[1200px] w-full"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        className="relative w-full h-[280px] sm:h-[320px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-2xl group"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* ─── FRONT FACE (Problem) ─── */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl group-hover:-translate-y-1 transition-all duration-300 p-6 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <Icon className="w-7 h-7 text-red-400" />
            </div>

            <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest mb-3">
              Problem
            </span>

            <p className="font-semibold leading-relaxed text-sm sm:text-base max-w-[240px]" style={{ color: 'var(--text-primary)' }}>
              {problem}
            </p>

            <span className="mt-auto pt-4 text-[11px] font-medium animate-pulse" style={{ color: 'var(--text-tertiary)' }}>
              Click to see solution →
            </span>
          </div>

          {/* ─── BACK FACE (Solution) ─── */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, var(--flip-back-from), var(--flip-back-to))',
            }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl shadow-xl p-6 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>

            <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-3">
              Solution
            </span>

            <p className="text-white font-semibold leading-relaxed text-sm sm:text-base max-w-[240px]">
              {solution}
            </p>

            <span className="mt-auto pt-4 text-[11px] text-white/40 font-medium">
              ← Click to flip back
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

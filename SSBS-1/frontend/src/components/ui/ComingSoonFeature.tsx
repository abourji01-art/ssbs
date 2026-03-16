import { type LucideIcon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComingSoonFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  eta?: string;
}

const ComingSoonFeature = ({
  icon: Icon,
  title,
  description,
  eta = 'Coming soon',
}: ComingSoonFeatureProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-8 text-center"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
        style={{ backgroundColor: 'var(--accent-subtle)' }}
      >
        <Icon className="w-7 h-7" style={{ color: 'var(--accent-primary)' }} />
      </div>

      {/* Title */}
      <h3
        className="text-lg font-bold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>

      {/* ETA badge */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: 'var(--accent-subtle)',
          color: 'var(--accent-text)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Clock className="w-3 h-3" />
        {eta}
      </div>
    </motion.div>
  );
};

export default ComingSoonFeature;

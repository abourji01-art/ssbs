import React from 'react';

/**
 * Reusable skeleton loader components with shimmer animation.
 * Use these to show loading placeholders while data is being fetched.
 */

/* ── Base shimmer block ── */
const Shimmer = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div
    className={`animate-pulse rounded-xl bg-gradient-to-r from-[#F3F4F6] via-[#E5E7EB] to-[#F3F4F6] bg-[length:200%_100%] ${className}`}
    style={{ animation: 'shimmer 1.5s ease-in-out infinite', ...style }}
  />
);

/* ── SkeletonText — single or multi-line text placeholder ── */
export const SkeletonText = ({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={`space-y-2.5 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <Shimmer
        key={i}
        className={`h-3.5 rounded-md ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

/* ── SkeletonAvatar — circular or rounded avatar placeholder ── */
export const SkeletonAvatar = ({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizeClass = { sm: 'w-8 h-8', md: 'w-11 h-11', lg: 'w-20 h-20' }[size];
  return <Shimmer className={`rounded-full ${sizeClass} ${className}`} />;
};

/* ── SkeletonCard — stat / info card placeholder ── */
export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 p-5 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <Shimmer className="w-11 h-11 rounded-xl" />
      <Shimmer className="w-14 h-6 rounded-lg" />
    </div>
    <Shimmer className="h-7 w-20 rounded-md mb-2" />
    <Shimmer className="h-3.5 w-28 rounded-md" />
  </div>
);

/* ── SkeletonTable — full table placeholder ── */
export const SkeletonTable = ({
  rows = 5,
  cols = 5,
  className = '',
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) => (
  <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${className}`}>
    {/* Header */}
    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
      <Shimmer className="h-5 w-36 rounded-md" />
      <Shimmer className="h-4 w-20 rounded-md" />
    </div>
    {/* Column headers */}
    <div className="px-5 py-3 bg-slate-50/80 flex gap-4">
      {Array.from({ length: cols }, (_, i) => (
        <Shimmer key={i} className="h-3 w-20 rounded-md flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, r) => (
      <div key={r} className="px-5 py-3.5 flex gap-4 border-t border-slate-100">
        {Array.from({ length: cols }, (_, c) => (
          <Shimmer
            key={c}
            className={`h-4 rounded-md flex-1 ${c === 0 ? 'max-w-[120px]' : ''}`}
          />
        ))}
      </div>
    ))}
  </div>
);

/* ── SkeletonList — notification / reservation list placeholder ── */
export const SkeletonList = ({
  items = 4,
  className = '',
}: {
  items?: number;
  className?: string;
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }, (_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-4"
      >
        <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-40 rounded-md" />
          <Shimmer className="h-3 w-full rounded-md" />
        </div>
        <Shimmer className="h-3 w-14 rounded-md shrink-0" />
      </div>
    ))}
  </div>
);

/* ── SkeletonChart — chart area placeholder ── */
export const SkeletonChart = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 p-5 ${className}`}>
    <Shimmer className="h-5 w-40 rounded-md mb-4" />
    <div className="h-72 flex items-end gap-2 px-4 pb-4">
      {Array.from({ length: 12 }, (_, i) => (
        <Shimmer
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
);

/* ── SkeletonCardGrid — grid of cards placeholder ── */
export const SkeletonCardGrid = ({
  count = 6,
  cols = 'sm:grid-cols-2 lg:grid-cols-3',
  className = '',
}: {
  count?: number;
  cols?: string;
  className?: string;
}) => (
  <div className={`grid ${cols} gap-4 ${className}`}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-4">
          <Shimmer className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-28 rounded-md" />
            <Shimmer className="h-3 w-20 rounded-md" />
          </div>
          <Shimmer className="h-6 w-16 rounded-lg shrink-0" />
        </div>
        <Shimmer className="h-px w-full" />
        <div className="flex gap-4">
          <Shimmer className="h-3 w-12 rounded-md" />
          <Shimmer className="h-3 w-20 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export default Shimmer;

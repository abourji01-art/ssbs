import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollArrowsProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

const ScrollArrows = ({ canScrollLeft, canScrollRight, onScrollLeft, onScrollRight }: ScrollArrowsProps) => (
  <>
    {/* Left Arrow */}
    <button
      onClick={onScrollLeft}
      disabled={!canScrollLeft}
      aria-label="Scroll left"
      className={`absolute left-0 sm:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
        canScrollLeft
          ? 'opacity-100 md:opacity-0 md:group-hover/scroll:opacity-100 cursor-pointer'
          : 'opacity-0 pointer-events-none'
      }`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <ChevronLeft className="w-5 h-5" />
    </button>

    {/* Right Arrow */}
    <button
      onClick={onScrollRight}
      disabled={!canScrollRight}
      aria-label="Scroll right"
      className={`absolute right-0 sm:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
        canScrollRight
          ? 'opacity-100 md:opacity-0 md:group-hover/scroll:opacity-100 cursor-pointer'
          : 'opacity-0 pointer-events-none'
      }`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  </>
);

export default ScrollArrows;

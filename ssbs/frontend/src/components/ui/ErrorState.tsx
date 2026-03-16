import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error state placeholder shown when data fetching fails.
 * Includes a "Try Again" button that triggers the retry callback.
 */
const ErrorState = ({
  title = 'Something went wrong',
  subtitle = 'Failed to load data. Please try again.',
  onRetry,
  className = '',
}: ErrorStateProps) => (
  <div className={`bg-white rounded-2xl border border-red-100 p-12 text-center ${className}`}>
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
      <AlertOctagon className="w-8 h-8 text-red-400" />
    </div>

    <h3 className="text-base font-bold text-primary-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">{subtitle}</p>

    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    )}
  </div>
);

export default ErrorState;

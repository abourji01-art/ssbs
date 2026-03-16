import { useState, useEffect, useCallback } from 'react';

type LoadState = 'loading' | 'error' | 'ready';

/**
 * Simulates a data-fetching lifecycle with loading → ready/error states.
 * 
 * @param delay  How long to stay in loading state (ms). Default: 1500.
 * @param errorChance  Probability of simulated error (0-1). Default: 0 (never).
 */
export function useLoadingState(delay = 1500, errorChance = 0) {
  const [state, setState] = useState<LoadState>('loading');

  const load = useCallback(() => {
    setState('loading');
    const timer = setTimeout(() => {
      if (Math.random() < errorChance) {
        setState('error');
      } else {
        setState('ready');
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, errorChance]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  const retry = useCallback(() => {
    load();
  }, [load]);

  return { state, isLoading: state === 'loading', isError: state === 'error', isReady: state === 'ready', retry };
}

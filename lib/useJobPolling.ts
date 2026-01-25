import { useEffect } from 'react';
import { type Job } from '@/lib/api';
import { useActiveJobs } from './useActiveJobs';

export interface UseJobPollingOptions {
  interval?: number;        // Ignored, kept for compatibility
  enabled?: boolean;
  onComplete?: (job: Job) => void;
  onFail?: (job: Job) => void;
}

/**
 * Hook to monitor a specific job using real-time SSE updates.
 * Previously used polling, now leverages useActiveJobs/useJobEvents.
 */
export function useJobPolling(jobId: string | null, options: UseJobPollingOptions = {}) {
  const {
    enabled = true,
    onComplete = null,
    onFail = null,
  } = options;

  // Use the global job list which is updated via SSE
  const { jobs, isPolling } = useActiveJobs();

  const job = jobId ? jobs.find(j => j.job_id === jobId) || null : null;
  const error = jobId && !job && isPolling ? 'Job not found' : null;

  useEffect(() => {
    if (!enabled || !job) return;

    // Check status changes
    if (job.status === 'completed') {
      onComplete?.(job);
    } else if (job.status === 'failed') {
      onFail?.(job);
    }
  }, [job, enabled, onComplete, onFail]);

  return {
    job,
    isPolling, // Connected to SSE
    error,
    stopPolling: () => { }, // No-op
    startPolling: () => { }, // No-op
    refetch: () => { }, // No-op, managed globally
  };
}

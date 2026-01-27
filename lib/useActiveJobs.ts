import { jobsAPI, type Job } from '@/lib/api';
import { useJobEvents } from './useJobEvents';
import { logger } from "@/lib/logger";

export interface UseActiveJobsOptions {
  interval?: number;        // Poll every N milliseconds (default: 5000)
  enabled?: boolean;         // Can disable polling (default: true)
}

const ACTIVE_STATUSES = ['pending', 'downloading', 'processing', 'voice_cloning', 'lip_sync', 'uploading', 'waiting_approval', 'ready'];

export function useActiveJobs(options: UseActiveJobsOptions = {}) {
  // Use the refined connection state from useJobEvents
  const { jobs, isConnected, isSseActive, isPollingActive, refetch } = useJobEvents();

  const activeJobs = jobs.filter(j => ACTIVE_STATUSES.includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');
  const hasActiveJobs = activeJobs.length > 0;

  return {
    jobs,
    activeJobs,
    completedJobs,
    failedJobs,
    hasActiveJobs,
    isLoading: !isConnected && jobs.length === 0,
    error: null,
    refetch,
    isPolling: isConnected,
    isSseActive,
    isPollingActive
  };
}

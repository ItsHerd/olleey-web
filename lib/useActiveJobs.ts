// import { useState, useEffect, useCallback } from 'react';
import { jobsAPI, type Job } from '@/lib/api';
import { useJobEvents } from './useJobEvents';

export interface UseActiveJobsOptions {
  interval?: number;        // Poll every N milliseconds (default: 5000)
  enabled?: boolean;         // Can disable polling (default: true)
}

const ACTIVE_STATUSES = ['pending', 'downloading', 'processing', 'voice_cloning', 'lip_sync', 'uploading', 'ready'];

export function useActiveJobs(options: UseActiveJobsOptions = {}) {
  // Options like interval are now ignored as we rely on SSE
  const { jobs, isConnected, refetch } = useJobEvents();

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
    isLoading: !isConnected && jobs.length === 0, // Loading if not connected and no jobs yet
    error: null,
    refetch,
    isPolling: isConnected, // Map connected state to isPolling for consumers
  };
}

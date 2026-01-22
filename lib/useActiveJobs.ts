import { useState, useEffect, useCallback } from 'react';
import { jobsAPI, type Job } from '@/lib/api';

export interface UseActiveJobsOptions {
  interval?: number;        // Poll every N milliseconds (default: 5000)
  enabled?: boolean;         // Can disable polling (default: true)
}

const ACTIVE_STATUSES = ['pending', 'downloading', 'processing', 'voice_cloning', 'lip_sync', 'uploading', 'ready'];

export function useActiveJobs(options: UseActiveJobsOptions = {}) {
  const { interval = 5000, enabled = true } = options;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchJobs = useCallback(async () => {
    try {
      const data = await jobsAPI.listJobs();
      setJobs(data.jobs);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Failed to fetch jobs:', err);
    }
  }, []);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Fetch immediately
    fetchJobs();
    
    // Poll at interval
    const intervalId = setInterval(fetchJobs, interval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, interval, fetchJobs]);
  
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
    isLoading,
    error,
    refetch: fetchJobs,
    isPolling: hasActiveJobs || isLoading, // Indicate polling is active if there are active jobs or still loading
  };
}

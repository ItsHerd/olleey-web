import { useState, useEffect, useCallback } from 'react';
import { jobsAPI, type Job } from '@/lib/api';

export interface UseJobPollingOptions {
  interval?: number;        // Poll every N milliseconds (default: 5000)
  enabled?: boolean;         // Can disable polling (default: true)
  onComplete?: (job: Job) => void;      // Callback when job completes
  onFail?: (job: Job) => void;          // Callback when job fails
}

export function useJobPolling(jobId: string | null, options: UseJobPollingOptions = {}) {
  const {
    interval = 5000,
    enabled = true,
    onComplete = null,
    onFail = null,
  } = options;
  
  const [job, setJob] = useState<Job | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  
  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    
    try {
      const data = await jobsAPI.listJobs();
      const currentJob = data.jobs.find(j => j.job_id === jobId);
      
      if (currentJob) {
        setJob(currentJob);
        setError(null);
        
        // Check if job is done
        if (currentJob.status === 'completed') {
          setIsPolling(false);
          onComplete?.(currentJob);
        } else if (currentJob.status === 'failed') {
          setIsPolling(false);
          onFail?.(currentJob);
        }
      } else {
        setError('Job not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job';
      setError(errorMessage);
      console.error('Job polling error:', err);
    }
  }, [jobId, onComplete, onFail]);
  
  useEffect(() => {
    if (!jobId || !isPolling) return;
    
    // Fetch immediately
    fetchJob();
    
    // Then poll at interval
    const intervalId = setInterval(fetchJob, interval);
    
    return () => clearInterval(intervalId);
  }, [jobId, isPolling, interval, fetchJob]);
  
  return {
    job,
    isPolling,
    error,
    stopPolling: () => setIsPolling(false),
    startPolling: () => setIsPolling(true),
    refetch: fetchJob,
  };
}

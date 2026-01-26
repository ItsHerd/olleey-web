import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, tokenStorage, jobsAPI, type Job } from '@/lib/api';
import { useProject } from '@/lib/ProjectContext';

/**
 * Hook to subscribe to Server-Sent Events for real-time job updates.
 * Effectively replaces polling but falls back to it if SSE is unavailable.
 */
export function useJobEvents() {
    const { selectedProject } = useProject();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isFallingBack, setIsFallingBack] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 3;

    // Initial fetch to populate state
    const fetchJobs = useCallback(async () => {
        if (!selectedProject) {
            setJobs([]);
            return;
        }
        try {
            const data = await jobsAPI.listJobs(selectedProject.id);
            setJobs(data.jobs);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        }
    }, [selectedProject]);

    useEffect(() => {
        // 1. Load initial data
        fetchJobs();

        // 2. Setup Polling if SSE fails consistently or we choose to fallback
        let pollingInterval: NodeJS.Timeout | null = null;
        const startPolling = () => {
            if (pollingInterval) return;
            console.log("[useJobEvents] Falling back to polling (SSE issues)");
            setIsFallingBack(true);
            pollingInterval = setInterval(fetchJobs, 5000);
        };

        const stopPolling = () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                setIsFallingBack(false);
            }
        };

        // 3. Setup EventSource
        const setupSSE = async () => {
            const token = tokenStorage.getAccessToken();
            if (!token) return;

            const url = `${API_BASE_URL}/events/stream?token=${token}`;

            // Pre-flight check to see if endpoint is even alive/authorized
            try {
                const response = await fetch(url, { method: 'HEAD' }).catch(() => null);
                if (response && response.status === 401) {
                    console.error("[SSE] Unauthorized (401). Token might be expired.");
                    startPolling();
                    return;
                }
            } catch (e) {
                // Ignore pre-flight error, let EventSource try
            }

            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log("[SSE] Connected to job event stream");
                setIsConnected(true);
                retryCountRef.current = 0;
                stopPolling();
            };

            eventSource.onerror = (err) => {
                console.error("[SSE] Connection error. Current state:", eventSource.readyState);
                setIsConnected(false);

                retryCountRef.current += 1;
                if (retryCountRef.current >= MAX_RETRIES) {
                    console.error("[SSE] Max retries reached. Switching to polling.");
                    eventSource.close();
                    startPolling();
                }
            };

            eventSource.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    const updatedJob = parsedData.job || parsedData;

                    if (updatedJob && updatedJob.job_id) {
                        if (selectedProject && updatedJob.project_id && updatedJob.project_id !== selectedProject.id) {
                            return;
                        }

                        setJobs(prevJobs => {
                            const exists = prevJobs.find(j => j.job_id === updatedJob.job_id);
                            if (exists) {
                                return prevJobs.map(j => j.job_id === updatedJob.job_id ? updatedJob : j);
                            } else {
                                if (selectedProject && updatedJob.project_id && updatedJob.project_id !== selectedProject.id) {
                                    return prevJobs;
                                }
                                return [updatedJob, ...prevJobs];
                            }
                        });
                    }
                } catch (e) {
                    console.error("[SSE] Failed to parse event data:", e);
                }
            };
        };

        setupSSE();

        // Cleanup
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            stopPolling();
        };
    }, [fetchJobs, selectedProject]);

    return {
        jobs,
        isConnected: isConnected || isFallingBack,
        isSseActive: isConnected,
        isPollingActive: isFallingBack,
        refetch: fetchJobs
    };
}

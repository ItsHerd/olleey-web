import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, tokenStorage, jobsAPI, type Job } from '@/lib/api';
import { useProject } from '@/lib/ProjectContext';

/**
 * Hook to subscribe to Server-Sent Events for real-time job updates.
 * Effectively replaces polling.
 */
export function useJobEvents() {
    const { selectedProject } = useProject();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

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
            console.error("Failed to fetch initial jobs:", error);
        }
    }, [selectedProject]);

    useEffect(() => {
        // 1. Load initial data
        fetchJobs();

        // 2. Setup EventSource
        const token = tokenStorage.getAccessToken();
        if (!token) return;

        // Append token to query string for auth
        const url = `${API_BASE_URL}/events/stream?token=${token}`;

        // Create connection
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log("[SSE] Connected to job event stream");
            setIsConnected(true);
        };

        eventSource.onerror = (err) => {
            console.error("[SSE] Connection error:", err);
            setIsConnected(false);
            // EventSource automatically attempts to reconnect
        };

        // Listen for generic "message" events or specific event types
        // Assuming backend sends JSON data in the `data` field
        eventSource.onmessage = (event) => {
            try {
                const parsedData = JSON.parse(event.data);

                console.log("[SSE] Received update:", parsedData);

                // Handle different event types from backend
                // Expected format: { type: 'job_update', job: { ... } } or just the job object
                // Adjust based on actual backend implementation. 
                // If backend sends the full list: setJobs(parsedData)
                // If backend sends single job update: update local state

                // Assuming for now it sends a job object that changed
                const updatedJob = parsedData.job || parsedData;

                if (updatedJob && updatedJob.job_id) {
                    // Check project scope
                    if (selectedProject && updatedJob.project_id && updatedJob.project_id !== selectedProject.id) {
                        return; // Ignore updates for different projects
                    }

                    setJobs(prevJobs => {
                        const exists = prevJobs.find(j => j.job_id === updatedJob.job_id);
                        if (exists) {
                            return prevJobs.map(j => j.job_id === updatedJob.job_id ? updatedJob : j);
                        } else {
                            // Only add new job if it belongs to current project
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

        // Cleanup on unmount
        return () => {
            console.log("[SSE] Closing connection");
            eventSource.close();
            setIsConnected(false);
            eventSourceRef.current = null;
        };
    }, [fetchJobs, selectedProject]); // Re-connect if project changes? Actually stream is user level, but fetchJobs changes.
    // If stream is user-level, we don't need to re-connect on project change, just re-fetch initial jobs. 
    // But fetchJobs runs on project change.

    return {
        jobs,
        isConnected,
        refetch: fetchJobs // Allow manual refresh if needed
    };
}

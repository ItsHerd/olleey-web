import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL, authenticatedFetch, ProcessingJob } from "./api";
import { useSupabaseJobs } from "./useSupabase";
import { JobStatus } from "./schema";

export function useDashboardJobs(params: { projectId?: string; limit?: number; enabled?: boolean; user_id?: string } = {}) {
  const { projectId, limit = 20, enabled = true, user_id } = params;
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);

  // Real-time Supabase sync with limit support
  const { jobs: supabaseJobs, loading: supabaseLoading, error: supabaseError, refetch: refetchSupabaseJobs } = useSupabaseJobs(
    user_id,
    { project_id: projectId, limit },
    { enabled: enabled && !!user_id }
  );

  // Merge Supabase updates
  useEffect(() => {
    console.log('[useDashboardJobs] Supabase jobs received:', {
      count: supabaseJobs.length,
      jobs: supabaseJobs,
      userId: user_id,
      projectId
    });

    // Supabase already returns data sorted and limited, just map it.
    // Always sync local state to Supabase (including empty arrays) to avoid stale UI.
    const mapped: ProcessingJob[] = supabaseJobs.map(sj => ({
      job_id: sj.job_id,
      source_video_id: sj.source_video_id,
      status: sj.status as JobStatus,
      progress: sj.progress || (sj.status === 'completed' ? 100 : 0),
      target_languages: sj.target_languages,
      created_at: sj.created_at,
      project_id: sj.project_id,
      current_stage: (sj as any).current_stage,
      workflow_state: (sj as any).workflow_state,
    }));

    console.log('[useDashboardJobs] Mapped jobs:', mapped);
    setJobs(mapped);
  }, [supabaseJobs]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    if (!enabled) {
      console.log('[useDashboardJobs] Load skipped: enabled=false');
      return;
    }

    // Primary refetch path: always refresh Supabase-backed jobs on demand.
    if (user_id) {
      try {
        await refetchSupabaseJobs();
        return;
      } catch (supabaseErr) {
        console.warn('[useDashboardJobs] Supabase refetch failed, falling back to legacy API', supabaseErr);
      }
    }

    console.log('[useDashboardJobs] Loading jobs from legacy API...', { projectId, limit });
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (projectId) queryParams.append("project_id", projectId);
      queryParams.append("limit", limit.toString());

      const url = `${API_BASE_URL}/dashboard/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await authenticatedFetch(url, { method: "GET" });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to load jobs: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[useDashboardJobs] Legacy API jobs loaded:', { count: data.jobs?.length || 0 });

      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load jobs";
      setError(errorMessage);
      console.error("[useDashboardJobs] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, limit, enabled, user_id, refetchSupabaseJobs]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return {
    jobs,
    total,
    loading: loading || (enabled && !!user_id && supabaseLoading),
    error: error || supabaseError,
    refetch: loadJobs,
  };
}

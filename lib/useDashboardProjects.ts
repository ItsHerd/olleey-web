import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL, authenticatedFetch } from "./api";

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

export function useDashboardProjects(params: { enabled?: boolean } = {}) {
  const { enabled = true } = params;
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    if (!enabled) return;

    console.log('[useDashboardProjects] Loading projects...');
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/dashboard/projects`;
      const response = await authenticatedFetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[useDashboardProjects] Projects loaded:', data);
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
      console.error("[useDashboardProjects] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    total,
    loading,
    error,
    refetch: loadProjects,
  };
}

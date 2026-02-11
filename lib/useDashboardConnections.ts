import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL, authenticatedFetch, YouTubeConnection } from "./api";

export function useDashboardConnections(params: { enabled?: boolean } = {}) {
  const { enabled = true } = params;
  const [connections, setConnections] = useState<YouTubeConnection[]>([]);
  const [total, setTotal] = useState(0);
  const [hasConnection, setHasConnection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    if (!enabled) return;

    console.log('[useDashboardConnections] Loading connections...');
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/dashboard/connections`;
      const response = await authenticatedFetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Failed to load connections: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[useDashboardConnections] Connections loaded:', data);
      setConnections(data.connections || []);
      setTotal(data.total || 0);
      setHasConnection(data.has_connection || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections");
      console.error("[useDashboardConnections] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  return {
    connections,
    total,
    hasConnection,
    loading,
    error,
    refetch: loadConnections,
  };
}

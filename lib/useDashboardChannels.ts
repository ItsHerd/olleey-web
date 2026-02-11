import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL, authenticatedFetch, LanguageChannel } from "./api";
import { useSupabaseChannels } from "./useSupabase";
import { ChannelStatus } from "./schema";

export function useDashboardChannels(params: { projectId?: string; enabled?: boolean; user_id?: string } = {}) {
  const { projectId, enabled = true, user_id } = params;
  const [channels, setChannels] = useState<LanguageChannel[]>([]);

  // Real-time Supabase sync
  const { channels: supabaseChannels } = useSupabaseChannels(
    user_id,
    { project_id: projectId },
    { enabled: enabled && !!user_id }
  );

  // Merge Supabase updates
  useEffect(() => {
    if (supabaseChannels.length > 0) {
      // Supabase already returns data sorted, just map it
      const mapped: LanguageChannel[] = supabaseChannels.map(sc => ({
        id: sc.channel_id,
        channel_id: sc.channel_id,
        channel_name: sc.channel_name,
        channel_avatar_url: sc.thumbnail_url,
        language_code: sc.language_code,
        language_name: sc.language_name,
        created_at: sc.created_at,
        status: {
          status: ChannelStatus.ACTIVE,
          permissions: ["read"]
        },
        videos_count: sc.video_count,
        last_upload: null,
        is_paused: (sc as any).is_paused || false
      }));

      setChannels(mapped);
    }
  }, [supabaseChannels]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    // Only load from legacy API if enabled and no Supabase data is present
    if (!enabled || (supabaseChannels && supabaseChannels.length > 0)) {
      return;
    }

    console.log('[useDashboardChannels] Loading channels...', { projectId });
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (projectId) queryParams.append("project_id", projectId);

      const url = `${API_BASE_URL}/dashboard/channels${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await authenticatedFetch(url, { method: "GET" });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to load channels: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[useDashboardChannels] Channels loaded:', data);
      setChannels(data.channels || []);
      setTotal(data.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load channels";
      setError(errorMessage);
      console.error("[useDashboardChannels] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, enabled]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  return {
    channels,
    total,
    loading,
    error,
    refetch: loadChannels,
  };
}

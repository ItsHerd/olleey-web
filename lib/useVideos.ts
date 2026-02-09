import { useState, useEffect } from "react";
import { type Video } from "./api";
import { useSupabaseVideos } from "./useSupabase";

/**
 * React hook for fetching and managing video data from Supabase
 * Provides real-time updates and automatic refetching
 */
export function useVideos(
  params?: { 
    page?: number; 
    page_size?: number; 
    channel_id?: string; 
    project_id?: string; 
    user_id?: string 
  }, 
  options: { enabled?: boolean } = { enabled: true }
) {
  const { enabled = true } = options;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('[useVideos] Hook initialized with:', { 
    params, 
    userId: params?.user_id,
    enabled
  });

  // Fetch videos from Supabase with real-time updates
  const { 
    videos: supabaseVideos, 
    loading: supabaseLoading,
    error: supabaseError,
    refetch: supabaseRefetch
  } = useSupabaseVideos(
    params?.user_id,
    { project_id: params?.project_id, channel_id: params?.channel_id },
    { enabled: enabled && !!params?.user_id }
  );
  
  console.log('[useVideos] Supabase videos received:', {
    count: supabaseVideos?.length || 0,
    enabled: enabled && !!params?.user_id,
    loading: supabaseLoading
  });

  // Sync Supabase data to local state
  useEffect(() => {
    console.log('[useVideos] Syncing Supabase data:', {
      supabaseVideosLength: supabaseVideos.length,
      supabaseLoading
    });
    
    if (supabaseVideos.length > 0) {
      // Map Supabase videos to our Video type
      const mapped: Video[] = supabaseVideos.map(sv => ({
        video_id: sv.video_id,
        title: sv.title,
        description: sv.description,
        thumbnail_url: sv.thumbnail_url,
        duration: sv.duration,
        published_at: sv.published_at,
        view_count: sv.view_count,
        status: sv.status as any,
        channel_id: sv.channel_id,
        channel_name: sv.channel_name,
        localizations: (sv as any).localizations as any || {},
        video_type: sv.video_type as any,
        source_video_id: sv.source_video_id,
        language_code: sv.language_code,
      }));
      
      console.log('[useVideos] Setting videos:', {
        count: mapped.length,
        firstVideo: mapped[0]?.video_id
      });
      
      setVideos(mapped);
      setError(null);
    } else if (!supabaseLoading) {
      // Only clear videos if loading is complete and we have no results
      setVideos([]);
    }
    
    setLoading(supabaseLoading);
    
    if (supabaseError) {
      setError(supabaseError);
    }
  }, [supabaseVideos, supabaseLoading, supabaseError]);

  return {
    videos,
    loading,
    error,
    total: videos.length,
    refetch: supabaseRefetch,
  };
}

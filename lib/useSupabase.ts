/**
 * React hooks for Supabase data access
 * Provides real-time updates and automatic refetching
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseHelpers, SupabaseVideo, SupabaseJob, SupabaseChannel } from './supabase';
import { logger } from './logger';

/**
 * Hook to fetch and subscribe to videos in real-time
 */
export function useSupabaseVideos(
  userId: string | undefined,
  filters?: { project_id?: string; channel_id?: string },
  options?: { enabled?: boolean; realtime?: boolean }
) {
  const [videos, setVideos] = useState<SupabaseVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled !== false;
  const realtime = options?.realtime !== false;

  const fetchVideos = useCallback(async () => {
    console.log('[useSupabaseVideos] fetchVideos called:', { userId, enabled, filters });
    
    if (!userId || !enabled) {
      console.log('[useSupabaseVideos] Skipping fetch:', { userId, enabled });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('[useSupabaseVideos] Starting query for user:', userId);
      
      // Build query - let Supabase handle filtering and sorting
      let query = supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        // NOTE: deleted_at column may not exist yet, commenting out for now
        // .is('deleted_at', null) // Exclude soft-deleted
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false }); // Secondary sort
      
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters?.channel_id) {
        query = query.eq('channel_id', filters.channel_id);
      }

      const { data: videosData, error: queryError } = await query;
      
      if (queryError) {
        console.error('[useSupabaseVideos] Query error:', queryError);
        throw queryError;
      }
      
      console.log('[useSupabaseVideos] Videos query result:', { count: videosData?.length || 0 });
      
      // Fetch localized videos for these source videos
      if (videosData && videosData.length > 0) {
        const videoIds = videosData.map(v => v.video_id);
        
        console.log('[useSupabaseVideos] Fetching localizations for:', videoIds);
        
        const { data: localizedData, error: localizedError } = await supabase
          .from('localized_videos')
          .select('*')
          .in('source_video_id', videoIds)
          .eq('user_id', userId);
        
        if (localizedError) {
          console.error('[useSupabaseVideos] Localizations error:', localizedError);
        }
        
        if (!localizedError && localizedData) {
          console.log('[useSupabaseVideos] Localizations fetched:', { count: localizedData.length });
          
          // Merge localizations into videos
          const videosWithLocalizations = videosData.map(video => {
            const videoLocalizations = localizedData.filter(lv => lv.source_video_id === video.video_id);
            const localizationsMap: any = {};
            
            videoLocalizations.forEach(lv => {
              localizationsMap[lv.language_code] = {
                status: lv.status,
                progress: lv.status === 'live' ? 100 : 0,
                job_id: lv.job_id,
                video_url: lv.video_url,
                title: lv.title,
                description: lv.description,
                thumbnail_url: lv.thumbnail_url,
              };
            });
            
            return {
              ...video,
              localizations: localizationsMap
            } as SupabaseVideo;
          });
          
          console.log('[useSupabaseVideos] Final videos with localizations:', {
            count: videosWithLocalizations.length,
            sample: videosWithLocalizations[0] ? {
              title: videosWithLocalizations[0].title,
              localizations: Object.keys((videosWithLocalizations[0] as any).localizations || {})
            } : null
          });
          
          setVideos(videosWithLocalizations);
          logger.info('useSupabaseVideos', 'Fetched videos with localizations', { 
            videos: videosData.length,
            localizations: localizedData.length 
          });
          return;
        }
      }
      
      console.log('[useSupabaseVideos] Setting videos without localizations');
      setVideos(videosData as SupabaseVideo[]);
      logger.info('useSupabaseVideos', 'Fetched videos', { count: videosData?.length || 0 });
    } catch (err: any) {
      console.error('[useSupabaseVideos] Error:', err);
      logger.error('useSupabaseVideos', 'Failed to fetch videos', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, filters?.project_id, filters?.channel_id, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Real-time subscription
  useEffect(() => {
    if (!userId || !enabled || !realtime) return;

    logger.info('useSupabaseVideos', 'Setting up real-time subscription', { userId });

    const channel = supabaseHelpers.subscribeToVideos(userId, (payload) => {
      logger.info('useSupabaseVideos', 'Real-time update received', payload);

      // Handle different event types
      if (payload.eventType === 'INSERT') {
        setVideos((prev) => [payload.new as SupabaseVideo, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setVideos((prev) =>
          prev.map((video) =>
            video.id === payload.new.id ? (payload.new as SupabaseVideo) : video
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setVideos((prev) => prev.filter((video) => video.id !== payload.old.id));
      }
    });

    return () => {
      logger.info('useSupabaseVideos', 'Cleaning up real-time subscription');
      supabaseHelpers.unsubscribe(channel);
    };
  }, [userId, enabled, realtime]);

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos,
  };
}

/**
 * Hook to fetch and subscribe to jobs in real-time
 */
export function useSupabaseJobs(
  userId: string | undefined,
  filters?: { status?: string; project_id?: string; limit?: number },
  options?: { enabled?: boolean; realtime?: boolean; showToasts?: boolean }
) {
  const [jobs, setJobs] = useState<SupabaseJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled !== false;
  const realtime = options?.realtime !== false;
  const showToasts = options?.showToasts !== false; // Default to showing toasts
  const limit = filters?.limit || 100;

  const fetchJobs = useCallback(async () => {
    console.log('[useSupabaseJobs] fetchJobs called:', { userId, enabled, filters });
    
    if (!userId || !enabled) {
      console.log('[useSupabaseJobs] Skipping fetch:', { userId, enabled });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('[useSupabaseJobs] Starting query for user:', userId);
      
      // Build query - let Supabase handle filtering and sorting
      let query = supabase
        .from('processing_jobs')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null) // Exclude soft-deleted
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (filters?.status) {
        console.log('[useSupabaseJobs] Adding status filter:', filters.status);
        query = query.eq('status', filters.status);
      }
      if (filters?.project_id) {
        console.log('[useSupabaseJobs] Adding project_id filter:', filters.project_id);
        query = query.eq('project_id', filters.project_id);
      }

      const { data, error: queryError } = await query;
      
      console.log('[useSupabaseJobs] Query result:', { 
        count: data?.length || 0, 
        error: queryError,
        firstJob: data?.[0]
      });
      
      if (queryError) throw queryError;
      
      setJobs(data as SupabaseJob[]);
      logger.info('useSupabaseJobs', 'Fetched jobs', { count: data?.length || 0 });
    } catch (err: any) {
      console.error('[useSupabaseJobs] Error:', err);
      logger.error('useSupabaseJobs', 'Failed to fetch jobs', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, filters?.status, filters?.project_id, limit, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Real-time subscription
  useEffect(() => {
    if (!userId || !enabled || !realtime) return;

    logger.info('useSupabaseJobs', 'Setting up real-time subscription', { userId });

    const channel = supabaseHelpers.subscribeToJobs(userId, (payload) => {
      logger.info('useSupabaseJobs', 'Real-time update received', payload);

      // Handle different event types
      if (payload.eventType === 'INSERT') {
        setJobs((prev) => [payload.new as SupabaseJob, ...prev]);

        // Show toast for new job (if enabled)
        if (showToasts && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('olleey-toast', {
            detail: { message: 'Job created', type: 'success' }
          }));
        }
      } else if (payload.eventType === 'UPDATE') {
        const oldJob = jobs.find(j => j.id === payload.old?.id);
        const newJob = payload.new as SupabaseJob;

        setJobs((prev) =>
          prev.map((job) =>
            job.id === newJob.id ? newJob : job
          )
        );

        // Show toast for status changes (if enabled)
        if (showToasts && oldJob && oldJob.status !== newJob.status && typeof window !== 'undefined') {
          if (newJob.status === 'completed' || newJob.status === 'waiting_approval') {
            window.dispatchEvent(new CustomEvent('olleey-toast', {
              detail: { message: '✅ Video ready for review!', type: 'success' }
            }));
          } else if (newJob.status === 'failed') {
            window.dispatchEvent(new CustomEvent('olleey-toast', {
              detail: { message: '❌ Job failed', type: 'error' }
            }));
          } else if (newJob.status === 'processing' && oldJob.status !== 'processing') {
            window.dispatchEvent(new CustomEvent('olleey-toast', {
              detail: { message: '🎬 Processing video...', type: 'info' }
            }));
          }
        }
      } else if (payload.eventType === 'DELETE') {
        setJobs((prev) => prev.filter((job) => job.id !== payload.old.id));
      }
    });

    return () => {
      logger.info('useSupabaseJobs', 'Cleaning up real-time subscription');
      supabaseHelpers.unsubscribe(channel);
    };
  }, [userId, enabled, realtime]);

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
  };
}

/**
 * Hook for generic Supabase queries with real-time updates
 */
export function useSupabaseQuery<T>(
  table: string,
  query: (client: typeof supabase) => any,
  dependencies: any[] = [],
  options?: { enabled?: boolean; realtime?: boolean }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled !== false;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const { data: result, error: queryError } = await query(supabase);

      if (queryError) throw queryError;

      setData(result || []);
      logger.info('useSupabaseQuery', 'Query executed', { table, count: result?.length });
    } catch (err: any) {
      logger.error('useSupabaseQuery', 'Query failed', { table, error: err });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, enabled, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to fetch and subscribe to channels in real-time
 */
export function useSupabaseChannels(
  userId: string | undefined,
  filters?: { project_id?: string },
  options?: { enabled?: boolean; realtime?: boolean }
) {
  const [channels, setChannels] = useState<SupabaseChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled !== false;
  const realtime = options?.realtime !== false;

  const fetchChannels = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      setLoading(true);
      setError(null);
      
      // Build query - let Supabase handle filtering and sorting
      let query = supabase
        .from('channels')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null) // Exclude soft-deleted
        .order('created_at', { ascending: false });
      
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      const { data, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      setChannels(data as SupabaseChannel[]);
      logger.info('useSupabaseChannels', 'Fetched channels', { count: data?.length || 0 });
    } catch (err: any) {
      logger.error('useSupabaseChannels', 'Failed to fetch channels', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, filters?.project_id, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Real-time subscription
  useEffect(() => {
    if (!userId || !enabled || !realtime) return;

    logger.info('useSupabaseChannels', 'Setting up real-time subscription', { userId });

    const channel = supabaseHelpers.subscribeToChannels(userId, (payload) => {
      logger.info('useSupabaseChannels', 'Real-time update received', payload);

      if (payload.eventType === 'INSERT') {
        setChannels((prev) => [payload.new as SupabaseChannel, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setChannels((prev) =>
          prev.map((ch) =>
            ch.channel_id === payload.new.channel_id ? (payload.new as SupabaseChannel) : ch
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setChannels((prev) => prev.filter((ch) => ch.channel_id !== payload.old.channel_id));
      }
    });

    return () => {
      logger.info('useSupabaseChannels', 'Cleaning up real-time subscription');
      supabaseHelpers.unsubscribe(channel);
    };
  }, [userId, enabled, realtime]);

  return {
    channels,
    loading,
    error,
    refetch: fetchChannels,
  };
}

/**
 * Supabase client for direct frontend access
 * Provides real-time subscriptions, direct queries, and auth integration
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use custom storage to sync with Firebase auth
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-client-info': 'olleey-frontend'
    }
  }
});

/**
 * Sync Firebase user with Supabase auth
 * Call this after Firebase authentication succeeds
 */
export async function syncFirebaseAuthToSupabase(firebaseUser: any) {
  try {
    // Create or update Supabase auth session with Firebase user ID
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('Failed to sync Firebase auth to Supabase:', error);
      return;
    }

    console.log('✅ Firebase auth synced to Supabase', {
      firebaseUid: firebaseUser.uid,
      supabaseUid: data.user?.id
    });

    return data.user;
  } catch (err) {
    console.error('Error syncing auth:', err);
  }
}

/**
 * Sign out from both Firebase and Supabase
 */
export async function signOutFromAll() {
  await supabase.auth.signOut();
  // Also sign out from Firebase (handled by your Firebase auth)
}

// Database types (update these based on your Supabase schema)
export interface SupabaseVideo {
  id: string;
  video_id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  storage_url?: string;
  duration?: number;
  view_count: number;
  status: string;
  published_at: string;
  channel_id: string;
  channel_name?: string;
  video_type?: "original" | "translated";
  source_video_id?: string | null;
  language_code?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseJob {
  id: string;
  job_id: string;
  user_id: string;
  project_id?: string;
  source_video_id: string;
  target_languages: string[];
  status: string;
  source_channel_id?: string;
  progress?: number;
  workflow_state?: any;
  created_at: string;
  updated_at: string;
}

export interface SupabaseChannel {
  channel_id: string;
  user_id: string;
  project_id?: string;
  channel_name: string;
  language_code: string;
  language_name: string;
  is_master: boolean;
  master_channel_id?: string;
  description?: string;
  thumbnail_url?: string;
  subscriber_count: number;
  video_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseLocalizedVideo {
  id: string;
  job_id?: string;
  source_video_id: string;
  user_id: string;
  project_id?: string;
  channel_id?: string;
  language_code: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  status: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

// Helper functions for common operations
export const supabaseHelpers = {
  /**
   * Get videos for current user
   */
  async getVideos(userId: string, filters?: { project_id?: string; channel_id?: string }) {
    let query = supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters?.channel_id) {
      query = query.eq('channel_id', filters.channel_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as SupabaseVideo[];
  },

  /**
   * Get single video by video_id
   */
  async getVideo(videoId: string) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (error) throw error;
    return data as SupabaseVideo;
  },

  /**
   * Subscribe to real-time video updates
   */
  subscribeToVideos(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return channel;
  },

  /**
   * Get processing jobs for current user
   */
  async getJobs(userId: string, filters?: { status?: string; project_id?: string }) {
    let query = supabase
      .from('processing_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as SupabaseJob[];
  },

  /**
   * Subscribe to real-time job updates
   */
  subscribeToJobs(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'processing_jobs',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return channel;
  },

  /**
   * Get channels for current user
   */
  async getChannels(userId: string, filters?: { project_id?: string }) {
    let query = supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as SupabaseChannel[];
  },

  /**
   * Subscribe to real-time channel updates
   */
  subscribeToChannels(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('channels_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
};

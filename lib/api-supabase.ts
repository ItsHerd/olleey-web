/**
 * Supabase-powered API client
 * Replaces backend API calls with direct Supabase queries
 * Drop-in replacement for api.ts
 */

import { supabase } from './supabase';
import type { Video, Job, MasterNode, VideoListResponse } from './api';

import { LocalizationStatus, JobStatus, VideoStatus, ChannelStatus } from './schema';

// Get user ID from localStorage (set by auth)
function getUserId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('userId') || '';
}

export const videosAPI = {
  /**
   * List videos with filters (Supabase handles sorting/filtering)
   */
  async listVideos(params?: {
    page?: number;
    page_size?: number;
    channel_id?: string;
    project_id?: string;
    status?: string;
  }): Promise<VideoListResponse> {
    const userId = getUserId();
    const page = params?.page || 1;
    const pageSize = params?.page_size || 50;
    const offset = (page - 1) * pageSize;

    // Build query - let Supabase do filtering and sorting
    let query = supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null) // Exclude soft-deleted
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }); // Secondary sort

    if (params?.channel_id) {
      query = query.eq('channel_id', params.channel_id);
    }
    if (params?.project_id) {
      query = query.eq('project_id', params.project_id);
    }
    if (params?.status) {
      query = query.eq('status', params.status);
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    // Transform Supabase data to match API format
    const videos: Video[] = (data || []).map((v: any) => ({
      video_id: v.video_id,
      title: v.title,
      description: v.description,
      thumbnail_url: v.thumbnail_url,
      published_at: v.published_at,
      view_count: v.view_count || 0,
      channel_id: v.channel_id,
      channel_name: v.channel_name,
      video_url: v.video_url,
      duration: v.duration,
      localizations: {}, // TODO: Join with localized_videos
      status: v.status as VideoStatus,
      video_type: v.video_type,
      source_video_id: v.source_video_id,
      language_code: v.language_code,
    }));

    return {
      videos,
      total: count || 0,
    };
  },

  /**
   * Get single video
   */
  async getVideo(videoId: string): Promise<Video> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (error) throw new Error(error.message);

    return {
      video_id: data.video_id,
      title: data.title,
      description: data.description,
      thumbnail_url: data.thumbnail_url,
      published_at: data.published_at,
      view_count: data.view_count || 0,
      channel_id: data.channel_id,
      channel_name: data.channel_name,
      localizations: {},
    };
  },
};

export const jobsAPI = {
  /**
   * List jobs (Supabase handles sorting/filtering/limiting)
   */
  async listJobs(params?: {
    projectId?: string;
    status?: string;
    limit?: number;
  }): Promise<{ jobs: Job[]; total: number }> {
    const userId = getUserId();
    const limit = params?.limit || 100;

    // Build query - let Supabase do filtering and sorting
    let query = supabase
      .from('processing_jobs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null) // Exclude soft-deleted
      .order('created_at', { ascending: false })
      .limit(limit);

    if (params?.projectId) {
      query = query.eq('project_id', params.projectId);
    }
    if (params?.status) {
      query = query.eq('status', params.status);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    const jobs: Job[] = (data || []).map((j: any) => ({
      job_id: j.job_id,
      source_video_id: j.source_video_id,
      source_channel_id: j.source_channel_id,
      target_languages: j.target_languages || [],
      status: j.status,
      progress: j.progress || 0,
      error_message: j.error_message,
      workflow_state: j.workflow_state || {},
      created_at: j.created_at,
      updated_at: j.updated_at,
      started_at: j.started_at,
      completed_at: j.completed_at,
    }));

    return { jobs, total: count || 0 };
  },

  /**
   * Create job
   */
  async createJob(data: any): Promise<any> {
    const userId = getUserId();

    const jobData = {
      user_id: userId,
      source_video_id: data.source_video_id,
      source_channel_id: data.source_channel_id,
      target_languages: data.target_languages,
      project_id: data.project_id,
      status: JobStatus.PENDING,
      workflow_state: {},
    };

    const { data: job, error } = await supabase
      .from('processing_jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return job;
  },

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: string): Promise<any> {
    const { data, error } = await supabase
      .from('processing_jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('job_id', jobId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { message: 'Status updated', job_id: jobId };
  },

  /**
   * Save draft
   */
  async saveDraft(videoId: string, languageCode: string): Promise<any> {
    // Update localized video status to draft
    const { error } = await supabase
      .from('localized_videos')
      .update({ status: LocalizationStatus.DRAFT, updated_at: new Date().toISOString() })
      .eq('source_video_id', videoId)
      .eq('language_code', languageCode);

    if (error) throw new Error(error.message);

    return { message: 'Draft saved' };
  },

  /**
   * Approve job
   */
  async approveJob(jobId: string): Promise<any> {
    const { error } = await supabase
      .from('processing_jobs')
      .update({
        status: JobStatus.COMPLETED,
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', jobId);

    if (error) throw new Error(error.message);

    return { message: 'Job approved' };
  },
};

export const youtubeAPI = {
  /**
   * Get channel graph (Supabase handles filtering/sorting)
   */
  async getChannelGraph(projectId?: string): Promise<{ master_nodes: MasterNode[] }> {
    const userId = getUserId();

    // Build query - let Supabase do filtering and sorting
    let query = supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null) // Exclude soft-deleted
      .order('is_master', { ascending: false }) // Masters first
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // Group channels into master nodes (minimal JS processing)
    const masterChannels = (data || []).filter((c: any) => c.is_master);
    const satelliteChannels = (data || []).filter((c: any) => !c.is_master);

    const masterNodes: MasterNode[] = masterChannels.map((master: any) => ({
      channel_id: master.channel_id,
      channel_name: master.channel_name,
      connection_id: master.channel_id,
      is_primary: master.is_master,
      connected_at: master.created_at,
      status: { 
        status: master.is_paused ? ChannelStatus.DISCONNECTED : ChannelStatus.ACTIVE, 
        last_checked: master.updated_at, 
        token_expires_at: null, 
        permissions: [] 
      },
      total_videos: master.video_count || 0,
      total_translations: 0,
      language_code: master.language_code,
      language_name: master.language_name,
      language_channels: satelliteChannels
        .filter((lc: any) => lc.master_channel_id === master.channel_id)
        .map((lc: any) => ({
          id: lc.channel_id,
          channel_id: lc.channel_id,
          channel_name: lc.channel_name,
          language_code: lc.language_code,
          language_name: lc.language_name,
          created_at: lc.created_at,
          status: { 
            status: lc.is_paused ? ChannelStatus.DISCONNECTED : ChannelStatus.ACTIVE, 
            permissions: [] 
          },
          videos_count: lc.video_count || 0,
          last_upload: null,
        })),
    }));

    return { master_nodes: masterNodes };
  },
};

// Export everything for compatibility
export * from './api';

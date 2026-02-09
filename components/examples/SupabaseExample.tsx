/**
 * Example component demonstrating Supabase integration
 * Shows how to use direct queries and real-time subscriptions
 */

"use client";

import { useState, useEffect } from 'react';
import { useSupabaseVideos, useSupabaseJobs } from '@/lib/useSupabase';
import { supabase, supabaseHelpers } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Video, Zap, RefreshCw } from 'lucide-react';

interface SupabaseExampleProps {
  userId: string;
  projectId?: string;
}

export function SupabaseExample({ userId, projectId }: SupabaseExampleProps) {
  // Example 1: Using the hook with real-time updates
  const {
    videos,
    loading: videosLoading,
    error: videosError,
    refetch: refetchVideos
  } = useSupabaseVideos(
    userId,
    { project_id: projectId },
    { enabled: true, realtime: true } // Real-time enabled!
  );

  // Example 2: Using the hook for jobs
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs
  } = useSupabaseJobs(
    userId,
    { project_id: projectId },
    { enabled: true, realtime: true }
  );

  // Example 3: Direct Supabase query
  const [customData, setCustomData] = useState<any[]>([]);

  const fetchCustomData = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('video_id, title, view_count')
        .eq('user_id', userId)
        .gt('view_count', 1000)
        .order('view_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCustomData(data || []);
    } catch (err) {
      console.error('Custom query failed:', err);
    }
  };

  // Example 4: Real-time subscription with custom filter
  useEffect(() => {
    // Subscribe to only processing jobs
    const channel = supabase
      .channel('processing_jobs_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'processing_jobs',
          filter: `user_id=eq.${userId} AND status=eq.processing`
        },
        (payload) => {
          console.log('Job status updated!', payload);
          // Update UI or show notification
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Supabase Integration Example</h2>
        <div className="flex gap-2">
          <Button onClick={refetchVideos} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Videos
          </Button>
          <Button onClick={refetchJobs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Jobs
          </Button>
          <Button onClick={fetchCustomData} variant="outline" size="sm">
            Custom Query
          </Button>
        </div>
      </div>

      {/* Videos Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Videos (Real-time)</h3>
          {videosLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>

        {videosError && (
          <div className="text-red-500 text-sm mb-4">
            Error: {videosError}
          </div>
        )}

        {videos.length === 0 && !videosLoading ? (
          <p className="text-gray-500">No videos found</p>
        ) : (
          <div className="space-y-2">
            {videos.slice(0, 5).map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div>
                  <p className="font-medium">{video.title}</p>
                  <p className="text-sm text-gray-500">
                    {video.view_count.toLocaleString()} views • {video.status}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(video.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Jobs Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Processing Jobs (Real-time)</h3>
          {jobsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>

        {jobsError && (
          <div className="text-red-500 text-sm mb-4">
            Error: {jobsError}
          </div>
        )}

        {jobs.length === 0 && !jobsLoading ? (
          <p className="text-gray-500">No jobs found</p>
        ) : (
          <div className="space-y-2">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div>
                  <p className="font-medium">Job {job.job_id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {job.target_languages.join(', ')} • {job.status}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Query Results */}
      {customData.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            Top Videos by Views (Custom Query)
          </h3>
          <div className="space-y-2">
            {customData.map((item) => (
              <div
                key={item.video_id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <p className="font-medium">{item.title}</p>
                <span className="text-sm text-gray-500">
                  {item.view_count.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Indicator */}
      <div className="flex items-center gap-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
        Real-time updates active
      </div>
    </div>
  );
}

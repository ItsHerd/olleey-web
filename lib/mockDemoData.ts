/**
 * Mock demo data for YC CEO video flow
 * Used for frontend-only demo when backend is not available
 */

export const DEMO_USER_ID = "096c8549-ce41-4b94-b7f7-25e39eb7578b";

export const YC_CEO_DEMO_VIDEO = {
  video_id: "demo_yc_ceo_video_001",
  user_id: DEMO_USER_ID,
  title: "YC CEO on early stage startups",
  description: "Insights from YC CEO on building successful startups, product-market fit, and what it takes to create something people want.",
  storage_url: "https://wfjpbrcktxbwasbamchx.supabase.co/storage/v1/object/sign/videos/en.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZGQ0M2IwOS0zYWYwLTQ1NDAtYmE1Yy0xNTVmMjEwYzYzYzgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvZW4ubXA0IiwiaWF0IjoxNzcwNjcxNzU0LCJleHAiOjE4MDIyMDc3NTR9.HIq1ZPttEGbhMfT7JBdcJqH3s9MJstfZLqB2n0fsA2Y",
  video_url: "https://wfjpbrcktxbwasbamchx.supabase.co/storage/v1/object/sign/videos/en.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZGQ0M2IwOS0zYWYwLTQ1NDAtYmE1Yy0xNTVmMjEwYzYzYzgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvZW4ubXA0IiwiaWF0IjoxNzcwNjcxNzU0LCJleHAiOjE4MDIyMDc3NTR9.HIq1ZPttEGbhMfT7JBdcJqH3s9MJstfZLqB2n0fsA2Y",
  thumbnail_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200",
  duration: 180,
  view_count: 0,
  status: "draft",
  channel_id: "demo_channel_en",
  channel_name: "English Master",
  published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  localizations: {},
  metadata: {
    language: "en",
    source: "manual_upload",
    original_filename: "en.mp4",
    is_demo: true
  }
};

export const YC_CEO_SPANISH_TRANSLATION = {
  title: "CEO de YC sobre startups en etapa temprana",
  description: "Perspectivas del CEO de YC sobre la construcción de startups exitosas, el ajuste producto-mercado y lo que se necesita para crear algo que la gente quiera.",
  dubbed_video_url: "https://wfjpbrcktxbwasbamchx.supabase.co/storage/v1/object/sign/videos/es.mov?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZGQ0M2IwOS0zYWYwLTQ1NDAtYmE1Yy0xNTVmMjEwYzYzYzgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvZXMubW92IiwiaWF0IjoxNzcwNjcxNzczLCJleHAiOjE4MDIyMDc3NzN9.aenWpJLvVePebL1EiDYD9-H7g-KIykkf_xL0uaVIkX4",
  language_code: "es",
  language_name: "Spanish"
};

/**
 * Check if a user is the demo user
 */
export function isDemoUser(userId?: string): boolean {
  return userId === DEMO_USER_ID;
}

/**
 * Get mock draft videos for the demo user
 */
export function getMockDraftVideos(userId?: string) {
  if (!isDemoUser(userId)) {
    return [];
  }

  return [YC_CEO_DEMO_VIDEO];
}

/**
 * Simulate processing for the demo video
 * Returns a promise that resolves after 3-4 seconds
 */
export async function simulateProcessing(videoId: string, targetLanguage: string = 'es'): Promise<{
  job_id: string;
  status: 'completed';
  progress: 100;
  dubbed_video_url: string;
  translated_title: string;
  translated_description: string;
}> {
  console.log(`[DEMO] Starting processing simulation for ${videoId} -> ${targetLanguage}`);

  // Simulate 3.5 seconds processing
  await new Promise(resolve => setTimeout(resolve, 3500));

  console.log(`[DEMO] Processing complete for ${videoId}`);

  return {
    job_id: `demo_job_${Date.now()}`,
    status: 'completed',
    progress: 100,
    dubbed_video_url: YC_CEO_SPANISH_TRANSLATION.dubbed_video_url,
    translated_title: YC_CEO_SPANISH_TRANSLATION.title,
    translated_description: YC_CEO_SPANISH_TRANSLATION.description
  };
}

/**
 * Save video to drafts (mock implementation)
 */
export function saveToDrafts(videoData: any): void {
  console.log('[DEMO] Saving to drafts:', videoData);

  // Store in localStorage for persistence
  const draftsKey = `olleey_drafts_${DEMO_USER_ID}`;
  const existingDrafts = JSON.parse(localStorage.getItem(draftsKey) || '[]');

  // Check if already exists
  const existingIndex = existingDrafts.findIndex((d: any) => d.video_id === videoData.video_id);

  if (existingIndex >= 0) {
    // Update existing
    existingDrafts[existingIndex] = {
      ...existingDrafts[existingIndex],
      ...videoData,
      updated_at: new Date().toISOString()
    };
  } else {
    // Add new
    existingDrafts.push({
      ...videoData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  localStorage.setItem(draftsKey, JSON.stringify(existingDrafts));

  // Trigger refresh event
  window.dispatchEvent(new CustomEvent('olleey-refresh'));
}

/**
 * Get all drafts from localStorage
 */
export function getDraftsFromStorage(userId?: string): any[] {
  if (!isDemoUser(userId) || typeof window === 'undefined') {
    return [];
  }

  const draftsKey = `olleey_drafts_${DEMO_USER_ID}`;
  return JSON.parse(localStorage.getItem(draftsKey) || '[]');
}

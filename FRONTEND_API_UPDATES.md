# Frontend API Updates

Updated `lib/api.ts` to include all backend endpoints.

## Summary of Changes

### ✅ Added Endpoints

#### 1. Dashboard API (5 new endpoints)
```typescript
dashboardAPI.getStats(projectId?)           // GET /dashboard/stats
dashboardAPI.getJobs(projectId?, limit?)    // GET /dashboard/jobs
dashboardAPI.getChannels(projectId?)        // GET /dashboard/channels
dashboardAPI.getProjects()                  // GET /dashboard/projects
dashboardAPI.getConnections(projectId?)     // GET /dashboard/connections
```

#### 2. Projects API (4 new endpoints)
```typescript
projectsAPI.getProject(projectId)                    // GET /projects/{project_id}
projectsAPI.updateProject(projectId, data)           // PATCH /projects/{project_id}
projectsAPI.deleteProject(projectId)                 // DELETE /projects/{project_id}
projectsAPI.getProjectActivity(projectId)            // GET /projects/{project_id}/activity
```

#### 3. Jobs API (15 new endpoints)
```typescript
jobsAPI.createManualJob(data)                        // POST /jobs/manual
jobsAPI.approveVideos(jobId, languageCodes)          // POST /jobs/{job_id}/videos/approve
jobsAPI.rejectVideos(jobId, data)                    // POST /jobs/{job_id}/videos/reject
jobsAPI.updateVideoStatus(jobId, lang, status)       // POST /jobs/{job_id}/videos/{lang}/status
jobsAPI.startProcessing(jobId)                       // POST /jobs/{job_id}/start-processing
jobsAPI.pauseJob(jobId)                              // POST /jobs/{job_id}/pause

// Statistics endpoints
jobsAPI.getStatisticsMetrics()                       // GET /jobs/statistics/metrics
jobsAPI.getStatisticsRecent()                        // GET /jobs/statistics/recent
jobsAPI.getStatisticsErrors(days?)                   // GET /jobs/statistics/errors
jobsAPI.getStatisticsLanguages()                     // GET /jobs/statistics/languages
jobsAPI.getStatisticsInsights()                      // GET /jobs/statistics/insights
```

#### 4. Costs API (3 new endpoints) - NEW SECTION
```typescript
costsAPI.estimateCost(data)                          // POST /costs/estimate
costsAPI.getSummary()                                // GET /costs/summary
costsAPI.getJobCost(jobId)                           // GET /costs/job/{job_id}
```

**New Interfaces:**
- `CostEstimateRequest`
- `CostEstimateResponse`
- `UserCostSummary`
- `JobCostDetails`

#### 5. Localization API (1 new endpoint) - NEW SECTION
```typescript
localizationAPI.uploadCaptions(file, lang, videoId)  // POST /localization/captions/upload
```

**New Interfaces:**
- `CaptionUploadResponse`

#### 6. Events API (SSE) - NEW SECTION
```typescript
eventsAPI.connectToStream(onMessage, onError?)       // GET /events/stream (SSE)
eventsAPI.disconnectFromStream(eventSource)          // Close EventSource
```

### 📊 Before vs After

| API Section | Before | After | Added |
|-------------|--------|-------|-------|
| Dashboard   | 2      | 7     | +5    |
| Projects    | 2      | 6     | +4    |
| Jobs        | 13     | 28    | +15   |
| Videos      | 5      | 5     | 0     |
| Channels    | 6      | 6     | 0     |
| YouTube     | 7      | 7     | 0     |
| Settings    | 2      | 2     | 0     |
| Voice       | 2      | 2     | 0     |
| Preferences | 2      | 2     | 0     |
| **Costs**   | 0      | 3     | +3 ✨ |
| **Localization** | 0 | 1     | +1 ✨ |
| **Events (SSE)** | 0 | 2     | +2 ✨ |
| **TOTAL**   | **41** | **71** | **+30** |

### 🎯 Key Features Added

#### Real-time Updates (SSE)
```typescript
// Connect to server-sent events stream
const eventSource = eventsAPI.connectToStream(
  (event) => {
    const data = JSON.parse(event.data);
    console.log('Job update:', data);
  },
  (error) => console.error('SSE error:', error)
);

// Disconnect when done
eventsAPI.disconnectFromStream(eventSource);
```

#### Cost Estimation
```typescript
// Estimate cost before creating job
const estimate = await costsAPI.estimateCost({
  video_duration_seconds: 180,
  target_languages: ['es', 'fr', 'de'],
  include_lip_sync: true
});

console.log(`Estimated cost: $${estimate.estimated_cost}`);
```

#### Batch Operations
```typescript
// Approve multiple languages at once
await jobsAPI.approveVideos('job_123', ['es', 'fr', 'de']);

// Reject with feedback
await jobsAPI.rejectVideos('job_123', {
  language_codes: ['es'],
  reason: 'Poor audio quality',
  feedback: 'Voice sounds robotic at 0:45'
});
```

#### Job Statistics
```typescript
// Get comprehensive job metrics
const metrics = await jobsAPI.getStatisticsMetrics();
// { total_jobs: 150, success_rate: 0.96, avg_time: 3600 }

// Get language popularity
const languages = await jobsAPI.getStatisticsLanguages();
// [{ language_code: 'es', job_count: 45, completion_rate: 0.95 }]

// Get AI-generated insights
const insights = await jobsAPI.getStatisticsInsights();
// [{ type: 'recommendation', message: '...' }]
```

### 🔧 Usage Examples

#### Complete Job Workflow
```typescript
// 1. Estimate cost
const estimate = await costsAPI.estimateCost({
  video_duration_seconds: 180,
  target_languages: ['es', 'fr'],
  include_lip_sync: true
});

// 2. Create job
const job = await jobsAPI.createJob({
  source_video_id: 'video_123',
  target_languages: ['es', 'fr'],
  project_id: 'project_456'
});

// 3. Start processing
await jobsAPI.startProcessing(job.job_id);

// 4. Monitor via SSE
const eventSource = eventsAPI.connectToStream((event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'job_completed' && data.job_id === job.job_id) {
    console.log('Job completed!');
  }
});

// 5. Review and approve
const videos = await jobsAPI.getJobVideos(job.job_id);
await jobsAPI.approveVideos(job.job_id, ['es', 'fr']);

// 6. Check cost
const actualCost = await costsAPI.getJobCost(job.job_id);
console.log(`Actual cost: $${actualCost.actual_cost}`);
```

#### Dashboard Data Loading
```typescript
// Load all dashboard data in parallel
const [stats, jobs, channels, projects, connections] = await Promise.all([
  dashboardAPI.getStats(projectId),
  dashboardAPI.getJobs(projectId, 10),
  dashboardAPI.getChannels(projectId),
  dashboardAPI.getProjects(),
  dashboardAPI.getConnections(projectId)
]);
```

#### Error Handling Pattern
```typescript
try {
  const job = await jobsAPI.createJob(data);
  console.log('Job created:', job.job_id);
} catch (error) {
  if (error.message.includes('insufficient credits')) {
    // Show upgrade modal
  } else {
    // Show generic error toast
  }
}
```

### 🚀 Next Steps

#### Features Now Possible

1. **Cost Dashboard** - Build UI to show spending over time
2. **Batch Review** - Implement multi-language approval in ReviewView
3. **Real-time Progress** - Use SSE to show live job updates
4. **Job Statistics** - Create analytics page with insights
5. **Caption Management** - Allow users to upload custom captions
6. **Project Management** - Full CRUD for projects

#### Components to Build

- `CostEstimator.tsx` - Pre-job cost calculator
- `BatchApprovalPanel.tsx` - Multi-select approval UI
- `JobStatisticsView.tsx` - Analytics dashboard
- `RejectionModal.tsx` - Rejection workflow UI
- `LiveJobMonitor.tsx` - Real-time job progress with SSE
- `CaptionUploader.tsx` - SRT/VTT file upload

### 📝 Type Safety

All endpoints include:
- ✅ Full TypeScript interfaces
- ✅ Request/response types
- ✅ JSDoc comments with examples
- ✅ Error handling
- ✅ Authentication handling

### 🔒 Authentication

All new endpoints use `authenticatedFetch()` which:
- Automatically includes Bearer token
- Handles 401 (refreshes token)
- Returns consistent error format
- Clears tokens on auth failure

---

**Updated:** 2025-02-12
**Total Endpoints:** 71
**New Sections:** 3 (Costs, Localization, Events)
**Lines Added:** ~500

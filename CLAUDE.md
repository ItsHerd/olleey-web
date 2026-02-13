# CLAUDE.md - Development Guide

## Project Overview
Olleey is an automated global release engine for creators. When a creator uploads a video, Olleey transcribes and translates the dialogue, generates dubbed audio, and regenerates lip sync so the video looks and feels native in each language. It also localizes packaging like titles, descriptions, and tags, then publishes the localized versions as YouTube Multi Language Audio tracks or to linked language channels. Creators review and approve everything in one dashboard, and future uploads can run through the same workflow automatically.

## User Capabilities & Workflow

### 1. Content Upload & Processing
- **Automated Uploads**: Creators can upload videos directly or link their YouTube channels for automated ingestion.
- **Global Localization**: Once uploaded, the engine automatically:
    - Transcribes the original dialogue.
    - Translates content into multiple target languages.
    - Generates high-quality AI dubbed audio.
    - Regenerates lip sync to match the new audio tracks.

### 2. Packaging & Metadata
- **Localized Packaging**: Titles, descriptions, and tags are automatically translated to ensure maximum reach in regional markets.
- **Brand Consistency**: Localization maintains the creator's voice and brand identity across all platforms.

### 3. Review & Approval
- **Unified Dashboard**: Creators have a central hub to review transcriptions, listen to dubbed audio, and preview localized videos.
- **Editing Tools**: Final adjustments can be made to translations and packaging before publishing.
- **One-Click Approval**: Once approved, the content is queued for distribution.

### 4. Distribution & Deployment
- **YouTube Multi-Audio**: Publish localized tracks directly as Multi-Language Audio on a single video.
- **Linked Channels**: Distribute localized versions to dedicated regional channels.
- **Future Automation**: Workflows can be saved to automatically process future uploads based on approved settings.

## Architecture Overview

### Backend vs Frontend Separation

Olleey uses a **two-service architecture**:

```
┌─────────────────────────────────────┐
│     olleey-web (Next.js 15)         │
│     Port: 3000                      │
│                                     │
│  - React UI components              │
│  - User authentication (JWT)        │
│  - Dashboard & review interfaces    │
│  - Real-time job status updates     │
│  - Calls olleey-backend APIs        │
└──────────────┬──────────────────────┘
               │ HTTP REST
               │ WebSocket
               ↓
┌─────────────────────────────────────┐
│   olleey-backend (FastAPI/Python)   │
│   Port: 8000                        │
│                                     │
│  - Video processing (FFmpeg)        │
│  - Job queue & workers              │
│  - Third-party API integrations:    │
│    • ElevenLabs (dubbing)           │
│    • SyncLabs (lip sync)            │
│    • YouTube Data API               │
│  - Database operations (Supabase)   │
│  - S3 storage management            │
│  - OAuth token management           │
└─────────────────────────────────────┘
```

**Frontend Responsibilities (olleey-web):**
- Display UI and handle user interactions
- Manage client-side state and authentication
- Make API calls to backend
- Display real-time updates via WebSocket or polling
- Handle routing and navigation

**Backend Responsibilities (olleey-backend):**
- Process videos (download, transcode, assemble)
- Manage job queue and workers
- Integrate with third-party APIs (ElevenLabs, SyncLabs, YouTube)
- Perform database CRUD operations
- Store and retrieve files from S3/Supabase Storage
- Handle OAuth flows and token refresh


### Frontend Patterns (olleey-web)
- **Components**: Functional components with hooks.
- **UI**: Use `shadcn@latest` for all UI components.
- **Styling**: Tailwind CSS for all layout and design elements.
- **State**: React context or server components where appropriate.
- **API Calls**: Use custom hooks (e.g., `useVideos`, `useJobs`) for data fetching.
- **Type Safety**: Define interfaces for all API responses and props.

### Backend Patterns (olleey-backend)
- **Routing**: Use FastAPI routers for organized endpoint grouping.
- **Services**: Separate business logic into service modules (`services/`).
- **Schemas**: Use Pydantic models for request/response validation.
- **Database**: Use async operations with Supabase client.
- **Error Handling**: Return consistent error responses with proper HTTP status codes.
- **Type Hints**: Use Python 3.10+ type hints for all functions.
- **Logging**: Use structured logging with context (user_id, job_id, etc.).

## 🚧 Remaining Work

### Backend Infrastructure

#### 🎯 Pipeline Architecture Decision

**IMPORTANT: ElevenLabs offers a comprehensive Dubbing API that can simplify the pipeline significantly.**

---

#### 1. ElevenLabs Dubbing API Integration (Recommended Path)
**Goal**: Complete transcription → translation → dubbing pipeline in one API

- [x] **ElevenLabs Dubbing API Setup** ✅
  - [x] Review ElevenLabs Dubbing API documentation
  - [x] Obtain API key with dubbing access (requires specific plan)
  - [x] Test dubbing API with sample video
  - [x] Understand pricing model (per minute of video)
  - [x] Document API rate limits and quotas
  - **IMPLEMENTATION**: `services/elevenlabs_service.py` with mock support

- [x] **Video Upload & Job Creation** ✅
  - [x] Implement video upload to ElevenLabs (or provide URL)
  - [x] Submit dubbing job with parameters:
    - Source language (auto-detect or specify)
    - Target languages (array)
    - Voice settings (clone source voice or use preset)
    - Number of speakers (auto-detect or specify)
  - [x] Store ElevenLabs job ID in database
  - **IMPLEMENTATION**: Handled in `services/dubbing.py` lines 99-118

- [x] **Job Monitoring** ✅
  - [x] Implement polling for job status (pending → dubbing → dubbed)
  - [ ] Set up webhook receiver for completion notifications (future enhancement)
  - [x] Handle job errors and retries
  - [x] Track processing time per video
  - **IMPLEMENTATION**: `elevenlabs_service.py` lines 51-83

- [x] **Result Processing** ✅
  - [x] Download dubbed audio files for each language
  - [x] Extract transcript and translation from response via `get_dubbing_metadata()`
  - [x] Store results in database using PipelineTracker:
    - `transcripts` table (source transcript with timestamps)
    - `translations` table (per target language)
    - `dubbed_audio` table (audio metadata)
    - `lip_sync_jobs` table (SyncLabs tracking)
    - `localized_videos` table (final video records)
  - [x] Generate preview URLs for review
  - **IMPLEMENTATION**:
    - `elevenlabs_service.py` lines 68-110 (get_dubbing_metadata)
    - `dubbing.py` lines 11, 122-240 (PipelineTracker integration)

- [x] **Database Schema for ElevenLabs Pipeline** ✅
  - [x] Enhance `processing_jobs` table (serves as dubbing_jobs):
    - `elevenlabs_job_id`, `source_language`
    - `target_languages` (already exists as array)
    - `status`, `progress`, `error_message` (already exists)
    - `estimated_cost`, `actual_cost`, `cost_breakdown`
    - `current_stage`, `dubbing_metadata`, `processing_time_seconds`
  - [x] Create detail tables: `transcripts`, `translations`, `dubbed_audio`, `lip_sync_jobs`
  - [x] Update `localized_videos` to reference new tables
  - **IMPLEMENTATION**: Migrations in `migrations/001_*.sql` and `migrations/002_*.sql`

- [x] **Cost Tracking** ✅
  - [x] Calculate cost per minute of video
  - [x] Track total dubbing costs per job
  - [x] Implement cost estimation before job submission
  - [x] User cost summaries and analytics
  - **IMPLEMENTATION**: `services/cost_tracking.py`, `routers/costs.py`



#### 2a. Translation Service (EllevenLabs)
**Goal**: Translate transcripts into target languages while preserving meaning and timing

- [ ] **Choose & Configure Provider**
  - [ ] Evaluate translation quality for different language pairs
  - [ ] Consider cost per character and API limits
  - [ ] Set up API credentials and billing
  
- [ ] **Create Translation Service Module** (`services/translation.py`)
  - [ ] Implement base translation interface
  - [ ] Create provider-specific implementations
  - [ ] Add support for batch translation (multiple languages at once)
  - [ ] Implement context preservation (maintain speaking style)
  - [ ] Add glossary/terminology management for brand-specific terms
  
- [ ] **Translation Logic**
  - [ ] Split long transcripts into chunks (respect API limits)
  - [ ] Preserve timestamps during translation
  - [ ] Handle special characters, emojis, and formatting
  - [ ] Detect and preserve named entities (names, brands, places)
  - [ ] Add language-specific post-processing rules
  
- [ ] **Database Schema**
  - [ ] Create `translations` table:
    - `id`, `transcript_id`, `job_id`, `video_id`
    - `source_language`, `target_language`, `provider`
    - `translated_text`, `word_timestamps` (jsonb)
    - `confidence_score`, `status`, `reviewed`
    - `created_at`, `updated_at`
  
- [ ] **Quality Features**
  - [ ] Implement translation confidence scoring
  - [ ] Add human review flagging for low-confidence translations
  - [ ] Create translation comparison view (original vs translated)
  - [ ] Store translation alternatives for A/B testing

#### 4. Lip Sync Service (SyncLabs)
**Goal**: Regenerate video with lip movements matching dubbed audio (applies to both pipeline options)

- [x] **SyncLabs Integration Enhancement** ✅
  - [x] Review existing `synclabs.py` implementation
  - [x] Update to latest SyncLabs API (using official SDK)
  - [x] Test API with sample videos
  - [x] Document API rate limits and quotas
  - **IMPLEMENTATION**: `services/synclabs.py` with mock support for demo users

- [x] **Video Preparation** ✅ (Basic)
  - [x] Upload video to public URL for API access
  - [x] Optimize video resolution for API (using original resolution)
  - **IMPLEMENTATION**: `dubbing.py` lines 127-142

- [x] **Lip Sync Processing** ✅
  - [x] Submit video + dubbed audio to SyncLabs API
  - [x] Handle long videos (API handles automatically)
  - [x] Poll for job completion with exponential backoff
  - [x] Download processed video segments
  - [ ] Implement webhook receiver for async notifications (future enhancement)
  - **IMPLEMENTATION**: `synclabs.py` lines 29-108, 171-240
  
- [ ] **Batch Processing**
  - [ ] Process multiple languages in parallel
  - [ ] Implement queue prioritization
  - [ ] Add retry logic for failed segments
  - [ ] Track processing costs per video
  
- [x] **Database Schema** ✅
  - [x] Created `lip_sync_jobs` table:
    - `id`, `job_id`, `language_code`
    - `synclabs_job_id`, `status`
    - `video_url`, `audio_url`, `output_video_url`
    - `processing_time_seconds`, `created_at`, `completed_at`
  - [x] Integrated tracking via PipelineTracker
  - **IMPLEMENTATION**:
    - `migrations/002_create_dubbing_detail_tables.sql`
    - `services/pipeline_tracking.py` lines 149-182
    - `dubbing.py` lines 221-233 (tracking calls)

#### 5. Video Assembly Service
**Goal**: Combine original video, dubbed audio, and lip sync into final output (applies to both pipeline options)

- [ ] **Create Video Assembly Module** (`services/video_assembly.py`)
  - [ ] Set up FFmpeg integration
  - [ ] Implement video + audio merging
  - [ ] Add subtitle burning (if requested)
  - [ ] Handle different video codecs and containers
  
- [ ] **Multi-Track Audio Support**
  - [ ] Research YouTube Multi-Language Audio (MLA) format requirements
  - [ ] Implement MLA track generation
  - [ ] Create single video file with multiple audio tracks
  - [ ] Add track metadata (language, title, is_default)
  
- [ ] **Video Processing**
  - [ ] Implement video transcoding for different quality levels (1080p, 720p, 480p)
  - [ ] Add video compression optimization
  - [ ] Generate video previews and thumbnails
  - [ ] Extract keyframes for timeline preview
  
- [ ] **Output Management**
  - [ ] Store final videos in S3/Supabase Storage
  - [ ] Generate public/signed URLs for playback
  - [ ] Implement CDN integration for fast delivery
  - [ ] Add video expiration policies for draft videos
  
- [ ] **Database Updates**
  - [ ] Update `localized_videos` table with final video URLs
  - [ ] Store video technical metadata (codec, bitrate, resolution)
  - [ ] Track processing time and costs
  - [ ] Add video file size tracking

#### 6. Job Queue & Processing Infrastructure
**Goal**: Reliable async processing of multi-stage video workflows

- [x] **Choose Task Queue System** ✅ (Simplified)
  - [x] Using FastAPI BackgroundTasks for MVP
  - [x] Test with sample video processing job
  - [ ] Upgrade to Celery/Redis for production scale (future)
  - **IMPLEMENTATION**: `services/job_queue.py`

- [x] **Worker Architecture** ✅ (Simplified)
  - [x] Background task workers via FastAPI
  - [x] Define worker types (video processing, API calls)
  - [ ] Implement worker scaling logic (future: Docker/K8s)
  - [ ] Add worker health checks (future enhancement)
  - **IMPLEMENTATION**: Background tasks in `job_queue.py` lines 52-114

- [x] **Job State Machine** ✅
  - [x] Define job states: `pending`, `downloading`, `processing`, `waiting_approval`, `uploading`, `completed`, `failed`
  - [x] Create state transition rules
  - [x] Implement state persistence in database (Supabase)
  - [x] Add state change hooks for notifications
  - **IMPLEMENTATION**: `dubbing.py` job status updates, `notification_service` broadcasts

- [x] **Pipeline Orchestration** ✅
  - [x] Mock pipeline in `services/mock_pipeline.py`
  - [x] Real pipeline in `services/dubbing.py`
  - [x] Implement stage sequencing logic
  - [x] Handle parallel processing (multiple languages sequentially for now)
  - **IMPLEMENTATION**: `mock_pipeline.py` (demo), `dubbing.py` (production)

- [x] **Job Management** ✅ (Basic)
  - [x] Create job creation endpoint with validation
  - [ ] Implement job cancellation logic (future)
  - [ ] Add job pause/resume functionality (future)
  - [ ] Create job priority system (future)
  - **IMPLEMENTATION**: `routers/jobs.py`, `job_queue.enqueue_dubbing_job`

- [x] **Progress Tracking** ✅
  - [x] Define progress calculation per stage (0-100%)
  - [x] Implement real-time progress updates via WebSocket
  - [x] Store progress checkpoints in database
  - **IMPLEMENTATION**: Progress updates in `dubbing.py` lines 54, 73, 241
  - [ ] Store progress checkpoints in database
  - [ ] Add estimated time remaining calculation
  - [ ] Create progress event emitter for frontend
  
- [ ] **Error Handling & Recovery**
  - [ ] Implement automatic retry with exponential backoff
  - [ ] Define max retry attempts per stage
  - [ ] Add partial completion handling (save progress on failure)
  - [ ] Create error categorization (transient vs permanent)
  - [ ] Implement dead letter queue for failed jobs
  - [ ] Add manual retry trigger endpoint
  
- [ ] **Job Logging**
  - [ ] Create `job_logs` table for detailed logging:
    - `id`, `job_id`, `stage`, `level` (info/warn/error)
    - `message`, `metadata` (jsonb), `timestamp`
  - [ ] Log all state transitions
  - [ ] Log API calls and responses
  - [ ] Log processing times per stage
  - [ ] Store error stack traces
  
- [ ] **Resource Management**
  - [ ] Implement job concurrency limits
  - [ ] Add queue capacity monitoring
  - [ ] Create job rate limiting per user
  - [ ] Track resource usage (CPU, memory, API quotas)
  - [ ] Implement cost tracking per job

#### 7. Webhook & Automation System
**Goal**: Automatic video ingestion from YouTube channels

- [ ] **YouTube PubSubHubbub Integration**
  - [ ] Review existing `webhooks.py` implementation
  - [ ] Register webhook callback URL with YouTube
  - [ ] Implement webhook verification logic
  - [ ] Handle webhook subscription renewal (lease expiration)
  
- [ ] **Webhook Processing**
  - [ ] Parse YouTube notification XML payload
  - [ ] Extract video metadata from notification
  - [ ] Validate webhook signature/authenticity
  - [ ] Implement idempotency (avoid processing same video twice)
  
- [ ] **Automatic Job Creation**
  - [ ] Create workflow templates per channel
  - [ ] Auto-trigger jobs when new video published
  - [ ] Apply saved language preferences
  - [ ] Use default voice settings
  - [ ] Queue job with appropriate priority
  
- [ ] **Database Schema**
  - [ ] Update `subscriptions` table (already exists)
  - [ ] Create `webhook_events` table for logging:
    - `id`, `subscription_id`, `video_id`
    - `event_type`, `payload` (jsonb)
    - `processed`, `job_created`
    - `created_at`

#### 8. Storage & Media Management
**Goal**: Efficient storage and retrieval of video assets

- [ ] **Video Download Service**
  - [ ] Review existing `video_download.py`
  - [ ] Add support for multiple sources (YouTube, direct upload, URL)
  - [ ] Implement download progress tracking
  - [ ] Add download resumption for failed downloads
  - [ ] Handle region-restricted videos
  
- [ ] **Video Format Conversion**
  - [ ] Set up FFmpeg wrapper service
  - [ ] Implement format detection and validation
  - [ ] Convert videos to standard format (MP4 H.264)
  - [ ] Create multiple quality versions (adaptive bitrate)
  - [ ] Extract audio tracks separately
  
- [ ] **Thumbnail Management**
  - [ ] Extract thumbnails from video at multiple timestamps
  - [ ] Generate custom thumbnails with text overlay
  - [ ] Implement thumbnail localization (translate text)
  - [ ] Store thumbnails in multiple sizes (small, medium, large)
  - [ ] Create thumbnail upload endpoint
  
- [ ] **Storage Organization**
  - [ ] Define S3 bucket structure:
    - `/users/{user_id}/videos/originals/{video_id}`
    - `/users/{user_id}/videos/processed/{job_id}/{language}`
    - `/users/{user_id}/audio/{job_id}/{language}`
    - `/users/{user_id}/thumbnails/{video_id}`
    - `/users/{user_id}/transcripts/{video_id}`
  - [ ] Implement storage path generation utilities
  
- [ ] **Storage Lifecycle Policies**
  - [ ] Implement automatic cleanup of draft videos (30 days)
  - [ ] Archive old jobs to cold storage (Glacier)
  - [ ] Delete intermediate processing files after job completion
  - [ ] Add storage quota enforcement per user
  
- [ ] **Metadata Extraction**
  - [ ] Create metadata extraction service
  - [ ] Extract video properties (resolution, FPS, codec, duration)
  - [ ] Parse embedded metadata (title, description, tags)
  - [ ] Extract closed captions if available
  - [ ] Store all metadata in database

#### 9. Authentication & Authorization
**Goal**: Secure access control and token management

- [ ] **YouTube OAuth Enhancement**
  - [ ] Review existing OAuth implementation
  - [ ] Implement automatic token refresh before expiration
  - [ ] Add token refresh error handling
  - [ ] Store token refresh history for auditing
  - [ ] Handle revoked token scenarios
  
- [ ] **OAuth Scope Management**
  - [ ] Request minimum required scopes initially
  - [ ] Implement incremental authorization (request scopes as needed)
  - [ ] Add scope verification before API calls
  - [ ] Handle scope change requests
  
- [ ] **Multi-Channel Support**
  - [ ] Allow connecting multiple YouTube channels per user
  - [ ] Store separate OAuth tokens per channel
  - [ ] Implement channel switching in UI
  - [ ] Add default channel selection
  
- [ ] **User Session Management**
  - [ ] Implement JWT-based authentication
  - [ ] Add refresh token rotation
  - [ ] Set appropriate token expiration times
  - [ ] Implement session invalidation on logout
  - [ ] Add "remember me" functionality
  
- [ ] **API Key Management**
  - [ ] Create `api_keys` table:
    - `id`, `user_id`, `key_name`, `key_hash`
    - `permissions` (jsonb), `last_used_at`
    - `expires_at`, `created_at`
  - [ ] Implement API key generation endpoint
  - [ ] Add API key rotation functionality
  - [ ] Create API key usage tracking
  
- [ ] **Role-Based Access Control (RBAC)**
  - [ ] Define roles: `owner`, `admin`, `editor`, `viewer`
  - [ ] Create `user_roles` table
  - [ ] Implement permission checks in API endpoints
  - [ ] Add role management UI
  - [ ] Create audit log for permission changes
  
- [ ] **Team/Organization Support**
  - [ ] Create `organizations` table
  - [ ] Implement organization invitations
  - [ ] Add team member management
  - [ ] Create organization-level settings
  - [ ] Implement resource sharing within org

### Frontend User Experience

#### 10. Dashboard Enhancements
**Goal**: Real-time, information-rich command center

- [ ] **Real-Time Job Updates**
  - [ ] Implement WebSocket connection (`/ws/jobs`)
  - [ ] Create WebSocket context provider in React
  - [ ] Subscribe to job updates on dashboard mount
  - [ ] Update job cards in real-time without refresh
  - [ ] Add visual indicators for active processing
  - [ ] Show toast notifications for job state changes
  
- [ ] **Alternative: Polling Implementation**
  - [ ] Create custom `useJobPolling` hook (may already exist)
  - [ ] Implement smart polling (faster when jobs active, slower when idle)
  - [ ] Add polling interval configuration (5s, 10s, 30s)
  - [ ] Pause polling when tab not visible
  - [ ] Resume polling when tab becomes active
  
- [ ] **Analytics Dashboard**
  - [ ] Create `AnalyticsDashboard.tsx` component
  - [ ] Implement chart library integration (Recharts or Chart.js)
  - [ ] Add total views chart (last 7/30/90 days)
  - [ ] Show engagement rate per language
  - [ ] Display subscriber growth across channels
  - [ ] Add language performance comparison charts
  - [ ] Create top-performing videos widget
  
- [ ] **Performance Metrics API**
  - [ ] Create `/api/analytics/overview` endpoint
  - [ ] Implement `/api/analytics/by-language` endpoint
  - [ ] Add `/api/analytics/video/{video_id}/performance` endpoint
  - [ ] Fetch data from YouTube Analytics API
  - [ ] Cache analytics data (update every 6-12 hours)
  - [ ] Add date range filtering
  
- [ ] **Activity Feed Enhancement**
  - [ ] Review existing activity feed component
  - [ ] Add filtering by activity type (uploads, approvals, failures)
  - [ ] Implement search functionality
  - [ ] Add pagination or infinite scroll
  - [ ] Create activity detail modal
  - [ ] Add activity export (CSV/PDF)
  
- [ ] **Dashboard Widgets**
  - [ ] Create "Processing Queue" widget showing active jobs
  - [ ] Add "Needs Review" widget for pending approvals
  - [ ] Implement "Quick Stats" cards (total videos, languages, views)
  - [ ] Create "Recent Uploads" widget
  - [ ] Add "Storage Usage" progress indicator
  - [ ] Implement "API Quota" monitoring widget

#### 11. Review & Approval Workflow
**Goal**: Comprehensive review tools before publishing

- [ ] **Audio Preview Player**
  - [ ] Create `AudioPreviewPlayer.tsx` component
  - [ ] Implement HTML5 audio player with custom controls
  - [ ] Add waveform visualization
  - [ ] Create playback speed controls (0.5x, 1x, 1.5x, 2x)
  - [ ] Add 10-second skip forward/backward buttons
  - [ ] Implement timestamp markers for transcript sync
  - [ ] Add volume control
  
- [ ] **Video Preview Player**
  - [ ] Create `VideoPreviewPlayer.tsx` component
  - [ ] Implement side-by-side comparison view
  - [ ] Add tab switching (original vs dubbed versions)
  - [ ] Create synchronized playback (play both at once)
  - [ ] Implement fullscreen mode
  - [ ] Add quality selector (if multiple versions available)
  - [ ] Create frame-by-frame stepping controls
  
- [ ] **Transcript Editor**
  - [ ] Create `TranscriptEditor.tsx` component
  - [ ] Display transcript in editable text area
  - [ ] Implement word-level timestamp display
  - [ ] Add inline editing with auto-save
  - [ ] Create speaker labeling (if multiple speakers)
  - [ ] Implement search and replace within transcript
  - [ ] Add undo/redo functionality
  - [ ] Show confidence scores per word/segment
  
- [ ] **Translation Editor**
  - [ ] Create `TranslationEditor.tsx` component
  - [ ] Show source and target text side-by-side
  - [ ] Implement segment-by-segment editing
  - [ ] Add translation suggestions/alternatives
  - [ ] Create glossary lookup integration
  - [ ] Implement character count warnings (for titles/descriptions)
  - [ ] Add validation rules (no profanity, proper formatting)
  
- [ ] **Review Modal Enhancement**
  - [ ] Review existing `enhanced-review-modal.tsx`
  - [ ] Add tabbed interface (Audio, Video, Transcript, Metadata)
  - [ ] Implement approval checklist
  - [ ] Create comment/feedback system
  - [ ] Add approval with modifications option
  - [ ] Implement multi-language batch review
  - [ ] Add keyboard shortcuts for faster review
  
- [ ] **Batch Approval**
  - [ ] Create `BatchApprovalPanel.tsx` component
  - [ ] Add checkbox selection for multiple languages
  - [ ] Implement "Select All" / "Select None" controls
  - [ ] Create quick preview thumbnails
  - [ ] Add batch approve button with confirmation
  - [ ] Implement batch rejection with reason
  - [ ] Show approval progress indicator
  
- [ ] **Rejection Workflow**
  - [ ] Create `RejectionModal.tsx` component
  - [ ] Add rejection reason dropdown (audio quality, translation, lip sync, other)
  - [ ] Implement free-text feedback field
  - [ ] Add specific issue markers (timestamp-based comments)
  - [ ] Create re-queue with priority option
  - [ ] Implement notification to processing team
  - [ ] Track rejection history per job

#### 12. Content Management
**Goal**: Organize and manage video library efficiently

- [ ] **Video Library Page**
  - [ ] Create `VideoLibrary.tsx` page component
  - [ ] Implement grid and list view toggle
  - [ ] Add video thumbnail cards with metadata
  - [ ] Create hover preview (play short clip)
  - [ ] Implement multi-select for batch operations
  - [ ] Add sorting options (date, views, duration, status)
  
- [ ] **Advanced Filtering**
  - [ ] Create `VideoFilters.tsx` component
  - [ ] Add filter by status (draft, processing, live)
  - [ ] Implement filter by language
  - [ ] Add filter by project
  - [ ] Create filter by channel
  - [ ] Add filter by date range
  - [ ] Implement filter by duration (short, medium, long)
  - [ ] Add filter by view count ranges
  
- [ ] **Search Functionality**
  - [ ] Implement full-text search in titles and descriptions
  - [ ] Add search by video ID
  - [ ] Create tag-based search
  - [ ] Implement search filters (AND/OR logic)
  - [ ] Add search suggestions/autocomplete
  - [ ] Create saved searches feature
  
  
- [ ] **Project Management UI**
  - [ ] Create `ProjectsPage.tsx`
  - [ ] Implement project creation modal
  - [ ] Add project card/list view
  - [ ] Create project detail page
  - [ ] Implement project settings panel
  - [ ] Add project member management (if team feature exists)
  - [ ] Create project-level statistics
  
- [ ] **Project Features**
  - [ ] Implement drag-and-drop video assignment
  - [ ] Add project templates (common language sets)
  - [ ] Create project duplication
  - [ ] Implement project archiving
  - [ ] Add project export (all videos + metadata)
  
- [ ] **Draft Management**
  - [ ] Create `DraftsPage.tsx`
  - [ ] Show all videos in draft state
  - [ ] Add draft age indicator (7 days old, 15 days old, etc.)
  - [ ] Implement draft expiration warnings
  - [ ] Create publish draft workflow
  - [ ] Add draft deletion (with confirmation)
  
#### 14. Settings & Configuration
**Goal**: Customizable workflows and preferences

- [ ] **Workflow Templates**
  - [ ] Create `WorkflowTemplates.tsx` page
  - [ ] Implement template creation modal
  - [ ] Add template configuration form:
    - Target languages (multi-select)
    - Voice selection per language
    - Distribution channels per language
    - Publish timing (immediate, scheduled, draft)
  - [ ] Create template list view
  - [ ] Add template editing
  - [ ] Implement template duplication
  - [ ] Create "Apply Template" option in job creation
  
- [ ] **Language Preferences**
  - [ ] Create `LanguageSettings.tsx` component
  - [ ] Add favorite languages multi-select
  - [ ] Implement language priority ordering (drag-and-drop)
  - [ ] Create default voice assignment per language
  - [ ] Add language-specific quality settings
  - [ ] Implement language pair preferences (e.g., EN->ES always use DeepL)
  
- [ ] **Billing & Usage Tracking**
  - [ ] Create `BillingDashboard.tsx` page
  - [ ] Display current plan and limits
  - [ ] Show usage metrics:
    - Processing minutes used
    - Storage used
    - API calls made
  - [ ] Add usage charts (daily/monthly)
  - [ ] Implement overage warnings
  - [ ] Create upgrade/downgrade plan options
  - [ ] Add payment method management
  - [ ] Show billing history


### Feature Enhancements

#### 21. Advanced Features
**Goal**: Premium features for power users

- [ ] **Voice Cloning**
  - [ ] Create `VoiceCloning.tsx` page
  - [ ] Add voice sample upload interface (multiple files)
  - [ ] Implement audio quality validation:
    - Minimum duration (1 minute total)
    - Clean audio (no background noise)
    - Single speaker only
    - Sample rate validation
  - [ ] Create progress tracking for cloning process
  - [ ] Add voice testing interface after cloning
  - [ ] Implement voice comparison tool (original vs clone)
  - [ ] Create voice management (delete, rename clones)
  - [ ] Add cost estimation per clone

- [ ] **Thumbnail Localization**
  - [ ] Implement OCR on thumbnail images
  - [ ] Extract text from thumbnails
  - [ ] Translate extracted text
  - [ ] Create thumbnail editing interface
  - [ ] Implement text replacement on thumbnails
  - [ ] Add font matching/selection
  - [ ] Generate localized thumbnail variants
  - [ ] Create A/B testing for thumbnails

- [ ] **Scheduled Publishing**
  - [ ] Add schedule date/time picker in review modal
  - [ ] Implement timezone selection
  - [ ] Create scheduled jobs queue
  - [ ] Add scheduled job management page
  - [ ] Implement schedule cancellation
  - [ ] Add schedule modification
  - [ ] Create scheduling calendar view

### Known Issues & Technical Debt

#### 26. Technical Debt & Cleanup
**Goal**: Improve code quality and maintainability

- [ ] **Firestore Migration Cleanup**
  - [ ] Review all `.firestore.backup` files
  - [ ] Verify Supabase equivalents are working
  - [ ] Delete backup files: `channels.py.firestore.backup`, `dashboard.py.firestore.backup`, `jobs.py.firestore.backup`, `projects.py.firestore.backup`, `videos.py.firestore.backup`
  - [ ] Remove Firestore dependencies from `requirements.txt`
  - [ ] Delete `services/firestore.py` if no longer needed
  - [ ] Update documentation to remove Firestore references
  
- [ ] **Demo Mode Integration**
  - [ ] Review `services/demo_simulator.py`
  - [ ] Document demo mode usage
  - [ ] Integrate demo mode with production workflows
  - [ ] Add demo mode toggle in UI
  - [ ] Create demo data reset endpoint
  - [ ] Add demo mode indicator in UI
  
- [ ] **Error Message Standardization**
  - [ ] Create centralized error message definitions
  - [ ] Standardize error response format:
    ```json
    {
      "error": {
        "code": "VIDEO_NOT_FOUND",
        "message": "The requested video could not be found",
        "details": {},
        "timestamp": "2025-02-10T12:00:00Z"
      }
    }
    ```
  - [ ] Update all API endpoints to use standard format
  - [ ] Create error code documentation
  - [ ] Add internationalization for error messages
  
- [ ] **TypeScript Type Coverage**
  - [ ] Run TypeScript strict mode checks
  - [ ] Replace all `any` types with proper types
  - [ ] Add type definitions for API responses
  - [ ] Create shared type definitions file
  - [ ] Add type validation for form inputs
  - [ ] Document complex type structures
  
- [ ] **Code Duplication Refactoring**
  - [ ] Identify duplicate logic in components
  - [ ] Extract common patterns to shared utilities
  - [ ] Create reusable hooks for common operations
  - [ ] Consolidate similar API calls
  - [ ] Extract repeated UI patterns to components
  - [ ] Create shared constants file
  
- [ ] **Performance Optimization**
  - [ ] Implement React.memo for expensive components
  - [ ] Add lazy loading for routes
  - [ ] Optimize bundle size (code splitting)
  - [ ] Implement image lazy loading
  - [ ] Add pagination for large data sets
  - [ ] Optimize database queries (add missing indexes)
  
- [ ] **Accessibility Improvements**
  - [ ] Add ARIA labels to interactive elements
  - [ ] Ensure keyboard navigation works everywhere
  - [ ] Add screen reader support
  - [ ] Implement focus management
  - [ ] Add alt text to all images
  - [ ] Ensure color contrast meets WCAG AA standards
  - [ ] Test with screen readers (NVDA, JAWS)
  
---

## 📊 Progress Tracking

### Implementation Priority

**Phase 1: Core Pipeline (MVP)**
- [x] **Architecture Decision**: ElevenLabs All-in-One (CHOSEN) ✅
- [x] **ElevenLabs All-in-One Pipeline**:
  - [x] ElevenLabs Dubbing API Integration (Item 1) ✅
  - [x] Lip Sync Service Enhancement (Item 4) ✅
  - [x] Database Schema & Pipeline Tracking ✅
  - [x] Job Queue Infrastructure (Item 6) ✅ (Basic - BackgroundTasks)
  - [ ] Video Assembly Service (Item 5) - Partial (SyncLabs output used directly)

**Phase 2: User Experience**
- [ ] Review & Approval Workflow (Item 11)
- [ ] Dashboard Enhancements (Item 10)
- [ ] Content Management (Item 12)
- [ ] Channel Management (Item 13)

**Phase 3: Quality & Reliability**
- [ ] Testing Infrastructure (Item 15)
- [ ] Quality Assurance (Item 16)
- [ ] Monitoring & Observability (Item 17)
- [ ] Security (Item 19)

**Phase 4: Scale & Polish**
- [ ] Scalability (Item 18)
- [ ] Deployment (Item 20)
- [ ] Advanced Features (Item 21)
- [ ] Analytics & Insights (Item 23)

**Phase 5: Collaboration & Docs**
- [ ] Collaboration Features (Item 22)
- [ ] Documentation (Items 24-25)
- [ ] Technical Debt Cleanup (Item 26)

---

*Last Updated: 2026-02-11*

## ✅ Recent Completions (Feb 11, 2026)

### ElevenLabs Integration & Pipeline Tracking
- ✅ Added `get_dubbing_metadata()` to extract transcript/translation from ElevenLabs API
- ✅ Integrated PipelineTracker into real dubbing pipeline (`dubbing.py`)
- ✅ Transcript extraction and storage in database
- ✅ Translation extraction for each target language
- ✅ Dubbed audio metadata tracking
- ✅ Lip sync job tracking with SyncLabs integration
- ✅ Full audit trail implementation for all pipeline stages
- ✅ Mock support for demo/test environments

**Files Modified:**
- `services/elevenlabs_service.py` (added metadata extraction)
- `services/dubbing.py` (integrated PipelineTracker)
- `TODO.md` (marked pipeline tracking complete)

**Next Steps:** Apply database migrations, test backend with real job, build frontend UI for transcript/translation display

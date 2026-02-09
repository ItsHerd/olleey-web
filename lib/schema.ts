/**
 * Centralized schema and constants for the Olleey platform
 */

/**
 * Overall status of a video based on its localizations
 */
export enum VideoStatus {
    NOT_STARTED = "not-started",
    QUEUED = "queued",
    PROCESSING = "processing",
    DRAFT = "draft",
    LIVE = "live",
    FAILED = "failed",
}

/**
 * Status of a specific localized version of a video
 */
export enum LocalizationStatus {
    NOT_STARTED = "not-started",
    QUEUED = "queued",
    PROCESSING = "processing",
    DRAFT = "draft",
    LIVE = "live",
    FAILED = "failed",
}

/**
 * Status of a processing job (FastAPI / Supabase)
 */
export enum JobStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    WAITING_APPROVAL = "waiting_approval",
    READY = "ready",
}

/**
 * Status of a YouTube channel connection
 */
export enum ChannelStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    RESTRICTED = "restricted",
    DISCONNECTED = "disconnected",
}

/**
 * Type of video (Original vs Translated)
 */
export enum VideoType {
    ORIGINAL = "original",
    TRANSLATED = "translated",
}

/**
 * Workflow stages for a processing job
 */
export enum WorkflowStage {
    METADATA_EXTRACTION = "metadata_extraction",
    TRANSLATIONS = "translations",
    VIDEO_DUBBING = "video_dubbing",
    THUMBNAILS = "thumbnails",
}

/**
 * Helper to get status priority (for sorting/filtering)
 */
export const STATUS_PRIORITY = {
    [VideoStatus.FAILED]: 0,
    [VideoStatus.PROCESSING]: 1,
    [VideoStatus.QUEUED]: 2,
    [VideoStatus.DRAFT]: 3,
    [VideoStatus.LIVE]: 4,
    [VideoStatus.NOT_STARTED]: 5,
};

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, AlertCircle, CheckCircle, Flag, Volume2, Maximize2, SkipBack, SkipForward, Sparkles, User, RotateCcw, Languages, Image as ImageIcon, Check, Upload, Wand2, RefreshCw, Eye, Edit3, Type, Save, Activity, Zap, ShieldCheck, Youtube, Settings, Baby, Shield, MessageSquare, ThumbsUp, Rss } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS, getFakeLocalizedText } from "@/lib/languages";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { jobsAPI, videosAPI, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { LocalizationStatus, JobStatus } from "@/lib/schema";
import { logger } from "@/lib/logger";
import { YC_CEO_DEMO_VIDEO, YC_CEO_SPANISH_TRANSLATION, isDemoUser, saveToDrafts } from "@/lib/mockDemoData";

// Demo AI-generated thumbnail URL
const DEMO_THUMBNAIL = "https://tii.imgix.net/production/articles/7643/03e02ef7-f12e-4faf-8551-37d5c5785586-UQ6LXV.jpg?auto=compress&fit=crop&auto=format";

export default function ReviewHubPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { toast } = useToast();

    // Extract video ID from path (/workflows/review/[id]) or query params (backward compatibility)
    const pathParts = pathname?.split('/') || [];
    const videoIdFromPath = pathParts[3]; // /workflows/review/[id]
    const videoIdFromUrl = videoIdFromPath || searchParams.get("video_id");
    const langFromUrl = searchParams.get("lang");

    const {
        quickCheckState,
        handleApprove: baseHandleApprove,
        handleFlag,
        openReview
    } = useReview();

    const { selectedProject } = useProject();

    // Get userId directly from localStorage
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || undefined : undefined;
    const { videos, loading: videosLoading, refetch: refetchVideos } = useVideos({ project_id: selectedProject?.id, user_id: userId });

    // Listen for global refresh events
    useEffect(() => {
        const handleRefresh = async () => {
            console.log('[ReviewHubPage] Refresh event received');
            await refetchVideos();
        };

        window.addEventListener('olleey-refresh', handleRefresh);
        return () => window.removeEventListener('olleey-refresh', handleRefresh);
    }, [refetchVideos]);

    // Synchronize state with backend when video_id or lang changes in URL
    useEffect(() => {
        if (!videoIdFromUrl || videosLoading) return;

        const isCurrentVideo = quickCheckState.videoId === videoIdFromUrl &&
            quickCheckState.languageCode === (langFromUrl || quickCheckState.languageCode);

        // If we don't have the video loaded in state, or if we want to ensure freshness
        if (!isCurrentVideo || !quickCheckState.originalVideoUrl) {
            // First try to find as a video_id in the already loaded videos list
            let video = videos.find(v => v.video_id === videoIdFromUrl);
            console.log('[ReviewHubPage] Initial lookup:', {
                videoIdFromUrl,
                foundInList: !!video,
                totalVideos: videos.length,
                videoData: video ? {
                    title: video.title,
                    storage_url: (video as any).storage_url,
                    video_url: (video as any).video_url
                } : null
            });

            // Check if this is the demo video first
            if (videoIdFromUrl === "demo_yc_ceo_video_001" && isDemoUser(userId)) {
                console.log('[ReviewHubPage] Demo video detected, using mock data');

                const langCode = langFromUrl || "es";

                openReview({
                    videoId: videoIdFromUrl,
                    languageCode: langCode,
                    originalVideoUrl: YC_CEO_DEMO_VIDEO.storage_url,
                    dubbedVideoUrl: YC_CEO_SPANISH_TRANSLATION.dubbed_video_url,
                    videoTitle: YC_CEO_DEMO_VIDEO.title,
                    videoDescription: YC_CEO_DEMO_VIDEO.description,
                    thumbnailUrl: YC_CEO_DEMO_VIDEO.thumbnail_url,
                    localizedTitle: YC_CEO_SPANISH_TRANSLATION.title,
                    localizedDescription: YC_CEO_SPANISH_TRANSLATION.description,
                    isApproved: false,
                    approvedAt: YC_CEO_DEMO_VIDEO.published_at
                });

                return; // Exit early for demo video
            }

            // Fetch sequence to ensure we have the most accurate backend data
            (async () => {
                try {
                    let targetVideo = video;
                    let targetJob: any = null;
                    let jobVideos: any[] = [];

                    // Try to get job data - first as job_id, then by finding job with source_video_id
                    try {
                        // First, try as a job_id
                        targetJob = await jobsAPI.getJobById(videoIdFromUrl);
                        jobVideos = await jobsAPI.getJobVideos(videoIdFromUrl);

                        // If it's a job, the source video is what we want for "original"
                        if (!targetVideo) {
                            targetVideo = videos.find(v => v.video_id === targetJob.source_video_id);
                        }
                    } catch (e) {
                        // Not a job_id, treat as video_id and find associated job
                        console.log("Not a job ID, treating as video ID and finding associated job");

                        try {
                            // Find job by source_video_id
                            const jobsResponse = await jobsAPI.listJobs();
                            const associatedJob = jobsResponse.jobs.find(j => j.source_video_id === videoIdFromUrl);

                            if (associatedJob) {
                                targetJob = associatedJob;
                                jobVideos = await jobsAPI.getJobVideos(associatedJob.job_id);
                                console.log("Found associated job:", associatedJob.job_id);
                            }
                        } catch (jobError) {
                            console.log("Could not find associated job, using video data only");
                        }
                    }

                    // If we still don't have the video, try to fetch it directly
                    if (!targetVideo && videoIdFromUrl) {
                        try {
                            console.log("Fetching video directly by ID:", videoIdFromUrl);
                            const videoData = await videosAPI.getVideoById(videoIdFromUrl);
                            targetVideo = videoData;
                            console.log("Fetched video data:", videoData);
                        } catch (err) {
                            console.error("Failed to fetch video directly:", err);
                        }
                    }

                    if (targetVideo) {
                        const langCode = langFromUrl || targetJob?.target_languages?.[0] || Object.keys(targetVideo.localizations || {})[0] || "es";

                        // Find localization info (either from jobVideos for active jobs or video.localizations for existing)
                        const localizedVideo = jobVideos.find(jv => jv.language_code === langCode);
                        const loc = targetVideo.localizations?.[langCode];

                        // Helper to construct full URL for storage paths
                        const getFullUrl = (url: string | undefined) => {
                            if (!url) return undefined;
                            if (url.startsWith('http')) return url;
                            return `${API_BASE_URL}${url}`;
                        };

                        // Get source video URL - favor storage_url for uploaded videos, then video_url
                        const sourceVideoUrl = getFullUrl((targetVideo as any).storage_url || (targetVideo as any).video_url) ||
                            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

                        // Get dubbed video URL - favor storage_url from the localized video (can be empty if not ready)
                        const dubbedVideoUrl = getFullUrl(localizedVideo?.storage_url || loc?.video_url) || "";

                        // Get localized metadata (for the Localized Metadata section)
                        const localizedTitle = localizedVideo?.title || loc?.title || "";
                        const localizedDescription = localizedVideo?.description || loc?.description || "";

                        // Debug logging
                        console.log('[ReviewHubPage] Video data:', {
                            videoId: videoIdFromUrl,
                            langCode,
                            hasJobVideos: jobVideos.length > 0,
                            sourceVideo: {
                                title: targetVideo.title,
                                storage_url: (targetVideo as any).storage_url,
                                video_url: (targetVideo as any).video_url,
                                thumbnail_url: targetVideo.thumbnail_url
                            },
                            localizedVideo: localizedVideo ? {
                                title: localizedVideo.title,
                                storage_url: localizedVideo.storage_url,
                                thumbnail_url: localizedVideo.thumbnail_url
                            } : null,
                            locFromVideo: loc ? {
                                title: loc.title,
                                video_url: loc.video_url,
                                thumbnail_url: loc.thumbnail_url
                            } : null,
                            constructedUrls: {
                                sourceVideoUrl,
                                dubbedVideoUrl: dubbedVideoUrl || '(empty - not ready)',
                                sourceThumbnail: getFullUrl(targetVideo.thumbnail_url)
                            }
                        });

                        openReview({
                            videoId: videoIdFromUrl,
                            languageCode: langCode,
                            originalVideoUrl: sourceVideoUrl,
                            dubbedVideoUrl: dubbedVideoUrl,
                            videoTitle: targetVideo.title, // Use SOURCE video title for header
                            videoDescription: targetVideo.description || "", // Use SOURCE description
                            thumbnailUrl: getFullUrl(targetVideo.thumbnail_url), // Use SOURCE thumbnail
                            localizedTitle: localizedTitle, // Add localized metadata
                            localizedDescription: localizedDescription,
                            isApproved: localizedVideo?.status === LocalizationStatus.LIVE || loc?.status === LocalizationStatus.LIVE,
                            approvedAt: targetVideo.published_at || (targetVideo as any).created_at
                        });
                    }
                } catch (error) {
                    console.error("Failed to synchronize video details:", error);
                }
            })();
        }
    }, [videoIdFromUrl, langFromUrl, videos, videosLoading, openReview, quickCheckState.videoId, quickCheckState.languageCode, quickCheckState.originalVideoUrl]);

    const {
        originalVideoUrl,
        dubbedVideoUrl,
        languageCode,
        videoTitle,
        videoDescription,
        localizedTitle,
        localizedDescription,
        isApproved,
        approvedAt
    } = quickCheckState;

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

    // Refs for video syncing
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [flagReason, setFlagReason] = useState("");
    const [flagCategory, setFlagCategory] = useState("general");
    const [showFlagInput, setShowFlagInput] = useState(false);
    const [volume, setVolume] = useState(1);
    const [originalMuted, setOriginalMuted] = useState(true);
    const [dubbedMuted, setDubbedMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [checklist, setChecklist] = useState({
        lipSync: isApproved,
        translation: isApproved,
        tone: isApproved,
        audioQuality: isApproved
    });
    const [targetLanguage, setTargetLanguage] = useState(languageCode === "es" ? "ES" : "EN");
    const [thumbnailStrategy, setThumbnailStrategy] = useState<"original" | "converted" | "upload" | "generate">("original");
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
    const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
    const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editedTitle, setEditedTitle] = useState(localizedTitle || "");
    const [editedDescription, setEditedDescription] = useState(localizedDescription || "No description provided.");
    const [isGeneratingInfo, setIsGeneratingInfo] = useState(false);
    const [showInfoPreview, setShowInfoPreview] = useState(false);
    const [tempTitle, setTempTitle] = useState("");
    const [tempDescription, setTempDescription] = useState("");
    const [reprocessingItems, setReprocessingItems] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<'edit' | 'ai'>('edit');
    const [isAiVerifying, setIsAiVerifying] = useState(false);
    const [verifyingItems, setVerifyingItems] = useState<Record<string, boolean>>({});
    const [selectedFocus, setSelectedFocus] = useState<"source" | "prod">("prod");
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Individual loading states for progressive loading
    const [originalVideoLoading, setOriginalVideoLoading] = useState(true);
    const [dubbedVideoLoading, setDubbedVideoLoading] = useState(true);
    const [thumbnailLoading, setThumbnailLoading] = useState(true);
    const [metadataLoading, setMetadataLoading] = useState(true);

    // YouTube-style video settings
    const [madeForKids, setMadeForKids] = useState(false);
    const [ageRestricted, setAgeRestricted] = useState(false);
    const [allowComments, setAllowComments] = useState(true);
    const [allowRatings, setAllowRatings] = useState(true);
    const [publishToFeed, setPublishToFeed] = useState(true);

    useEffect(() => {
        if (localizedTitle) setEditedTitle(localizedTitle);
        if (localizedDescription) setEditedDescription(localizedDescription);
    }, [localizedTitle, localizedDescription]);

    // Auto-disable age restriction when made for kids is enabled
    useEffect(() => {
        if (madeForKids && ageRestricted) {
            setAgeRestricted(false);
        }
    }, [madeForKids, ageRestricted]);

    const handleRedo = (key: string) => {
        setReprocessingItems(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
            setReprocessingItems(prev => ({ ...prev, [key]: false }));
            setChecklist(prev => ({ ...prev, [key]: true }));
        }, 3000);
    };

    const handleGenerateThumbnail = () => {
        setThumbnailStrategy("generate");
        setIsGeneratingThumbnail(true);
        setShowThumbnailPreview(false);

        // Demo: Use specific AI-generated thumbnail after 2-3 seconds
        setTimeout(() => {
            setIsGeneratingThumbnail(false);
            setShowThumbnailPreview(true);
            // The thumbnail URL is now set via the DEMO_THUMBNAIL constant
        }, 2500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCustomThumbnail(url);
            setCustomThumbnailFile(file);
            setThumbnailStrategy("upload");
            setShowThumbnailPreview(true);
        }
    };

    const handleGenerateInfo = () => {
        setIsGeneratingInfo(true);

        // Demo: Generate Spanish translations
        setTimeout(() => {
            setIsGeneratingInfo(false);

            // Check if this is the YC CEO demo video
            const isYcCeoDemo = quickCheckState.videoId === "demo_yc_ceo_video_001";
            const isGarryTanDemo = videoTitle?.includes("Garry Tan") || quickCheckState.videoId === "garry_tan_yc_demo";

            if (isYcCeoDemo && (targetLanguage === "ES" || languageCode === "es")) {
                // Spanish translations for YC CEO demo
                setEditedTitle(YC_CEO_SPANISH_TRANSLATION.title);
                setEditedDescription(YC_CEO_SPANISH_TRANSLATION.description);
            } else if (isGarryTanDemo && targetLanguage === "ES") {
                // Spanish translations for Garry Tan demo
                setEditedTitle("Garry Tan - Presidente y CEO de Y Combinator");
                setEditedDescription(
                    "Garry Tan es el Presidente y CEO de Y Combinator (YC), la aceleradora de startups más exitosa del mundo.\n\n" +
                    "En este video, Garry comparte perspectivas sobre la misión de YC de ayudar a las startups a tener éxito, " +
                    "la importancia de construir grandes productos, y consejos para fundadores navegando el viaje del emprendimiento.\n\n" +
                    "Este es un video de demostración que muestra las capacidades de localización de video impulsadas por IA de Olleey."
                );
            } else {
                // Generic localized text for other videos
                setEditedTitle(`${videoTitle || "Untitled"} [${targetLanguage === "ES" ? "SPAIN" : "EN"}_LOCALIZED]`);
                setEditedDescription(`${videoDescription || "No original description."} \n\nLocalized for global distribution via Olleey AI.`);
            }

            // Switch to edit tab to show the generated content
            setActiveTab('edit');

            // Show success toast
            toast("✨ AI-generated Spanish translation ready!", "success");
        }, 2500);
    };

    const handleManualEdit = () => {
        setTempTitle(editedTitle);
        setTempDescription(editedDescription);
        setShowInfoPreview(true);
    };

    const saveChanges = async () => {
        // Check if there are any changes to save
        const titleChanged = editedTitle !== (localizedTitle || "");
        const descriptionChanged = editedDescription !== (localizedDescription || "");
        const thumbnailChanged = thumbnailStrategy === "upload" || thumbnailStrategy === "generate";

        if (titleChanged || descriptionChanged || thumbnailChanged) {
            // We need the job_id to save changes
            // Try to find it from the video_id
            const jobsResponse = await jobsAPI.listJobs();
            const job = jobsResponse.jobs.find(j => j.source_video_id === quickCheckState.videoId);

            if (job && languageCode) {
                console.log('[ReviewHubPage] Saving changes:', {
                    titleChanged,
                    descriptionChanged,
                    thumbnailChanged,
                    thumbnailStrategy,
                    job_id: job.job_id,
                    language_code: languageCode
                });

                let thumbnailFile = customThumbnailFile;

                // If using generated thumbnail, fetch it as a file
                if (thumbnailStrategy === "generate" && !customThumbnailFile) {
                    try {
                        const response = await fetch(DEMO_THUMBNAIL);
                        const blob = await response.blob();
                        thumbnailFile = new File([blob], "generated-thumbnail.jpg", { type: "image/jpeg" });
                    } catch (error) {
                        console.error('[ReviewHubPage] Failed to fetch generated thumbnail:', error);
                    }
                }

                await jobsAPI.updateLocalizedVideo(job.job_id, languageCode, {
                    title: titleChanged ? editedTitle : undefined,
                    description: descriptionChanged ? editedDescription : undefined,
                    thumbnailFile: thumbnailChanged ? (thumbnailFile || undefined) : undefined,
                    // YouTube settings (as metadata for now)
                    ...(madeForKids !== undefined && { madeForKids }),
                    ...(ageRestricted !== undefined && !madeForKids && { ageRestricted }),
                    ...(allowComments !== undefined && { allowComments }),
                    ...(allowRatings !== undefined && { allowRatings }),
                    ...(publishToFeed !== undefined && { publishToFeed }),
                } as any);

                console.log('[ReviewHubPage] Changes saved successfully');
                toast("Changes saved successfully", "success");

                // Trigger refresh
                window.dispatchEvent(new CustomEvent('olleey-refresh'));
            } else {
                console.warn('[ReviewHubPage] Could not find job to save changes');
            }
        }
    };

    const handlePublishToYouTube = async () => {
        setIsPublishing(true);

        try {
            // Save any pending changes first
            await saveChanges();

            const videoId = quickCheckState.videoId;
            const isGarryTanDemo = videoId === "garry_tan_yc_demo" || videoTitle?.includes("Garry Tan");

            // Demo Flow for Garry Tan video
            if (isGarryTanDemo && videoId && languageCode) {
                console.log('[ReviewHubPage] Starting Garry Tan demo deployment flow');

                // Update status to processing
                await jobsAPI.updateJobStatus(videoId, JobStatus.PROCESSING);

                toast("Deployment initiated! Redirecting to pipeline...", "success");

                // Navigate to Dashboard immediately
                router.push('/app?page=Dashboard');

                // Trigger refresh to show in pipeline
                window.dispatchEvent(new CustomEvent('olleey-refresh'));

                // After 3 seconds, update to ready for review
                setTimeout(async () => {
                    try {
                        if (videoId) {
                            await jobsAPI.updateJobStatus(videoId, JobStatus.WAITING_APPROVAL);
                        }
                        window.dispatchEvent(new CustomEvent('olleey-refresh'));
                        toast("Video processed! Ready for review", "success");
                    } catch (err) {
                        console.error('[ReviewHubPage] Demo status update failed:', err);
                    }
                }, 3000);

                return;
            }

            // Regular publishing flow for non-demo videos
            if (videoId && languageCode) {
                await jobsAPI.publishToYouTube(videoId, languageCode);
                toast("Successfully published to YouTube!", "success");

                // Refresh data
                window.dispatchEvent(new CustomEvent('olleey-refresh'));

                // Navigate back to library
                router.push('/app?page=All Media', { scroll: false });
            }
        } catch (error: any) {
            console.error('[ReviewHubPage] Publishing error:', error);
            toast(error.message || "Failed to publish to YouTube", "error");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSavingDraft(true);

        try {
            console.log('[ReviewHubPage] Saving draft...', {
                videoId: quickCheckState.videoId,
                languageCode
            });

            // Check if this is the demo video
            if (quickCheckState.videoId === "demo_yc_ceo_video_001" && isDemoUser(userId)) {
                // Save to localStorage for demo
                const draftVideo = {
                    video_id: `draft_${quickCheckState.videoId}_${languageCode}_${Date.now()}`,
                    user_id: userId,
                    title: editedTitle || YC_CEO_SPANISH_TRANSLATION.title,
                    description: editedDescription || YC_CEO_SPANISH_TRANSLATION.description,
                    storage_url: YC_CEO_SPANISH_TRANSLATION.dubbed_video_url,
                    video_url: YC_CEO_SPANISH_TRANSLATION.dubbed_video_url,
                    thumbnail_url: YC_CEO_DEMO_VIDEO.thumbnail_url,
                    duration: 180,
                    view_count: 0,
                    status: 'draft',
                    channel_id: 'demo_channel_es',
                    channel_name: 'Spanish Dubs',
                    language_code: languageCode,
                    localizations: {
                        [languageCode || 'es']: {
                            status: 'draft',
                            progress: 100,
                            title: editedTitle || YC_CEO_SPANISH_TRANSLATION.title,
                            description: editedDescription || YC_CEO_SPANISH_TRANSLATION.description,
                            video_url: YC_CEO_SPANISH_TRANSLATION.dubbed_video_url
                        }
                    },
                    metadata: {
                        language: languageCode || 'es',
                        source: 'demo_dubbing',
                        original_video_id: 'demo_yc_ceo_video_001',
                        is_demo: true
                    }
                };

                saveToDrafts(draftVideo);
                console.log('[ReviewHubPage] Demo draft saved to localStorage');

                toast("✅ Draft saved successfully!", "success");

                // Small delay to ensure toast is visible before navigation
                await new Promise(resolve => setTimeout(resolve, 800));

                // Navigate back to All Media page
                console.log('[ReviewHubPage] Redirecting to All Media...');
                router.push('/app?page=All Media');

                setIsSavingDraft(false);
                return;
            }

            // Save any pending changes first
            await saveChanges();

            // Save as draft
            if (quickCheckState.videoId && languageCode) {
                await jobsAPI.saveDraft(quickCheckState.videoId, languageCode);
                console.log('[ReviewHubPage] Draft saved successfully');

                toast("Draft saved successfully!", "success");

                // Refresh data
                window.dispatchEvent(new CustomEvent('olleey-refresh'));

                // Small delay to ensure toast is visible before navigation
                await new Promise(resolve => setTimeout(resolve, 500));

                // Navigate back to All Media page
                console.log('[ReviewHubPage] Redirecting to All Media...');
                router.push('/app?page=All Media');
            } else {
                console.error('[ReviewHubPage] Missing videoId or languageCode');
                toast("Cannot save draft: missing video information", "error");
            }
        } catch (error: any) {
            console.error('[ReviewHubPage] Save draft error:', error);
            toast(error.message || "Failed to save draft", "error");
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleCommit = () => {
        // Typically would call an API here to save metadata updates
        router.push('/app?page=Preview', { scroll: false });
    };

    const handleAiVerify = async () => {
        setIsAiVerifying(true);
        const items = Object.keys(checklist);

        for (const item of items) {
            setVerifyingItems(prev => ({ ...prev, [item]: true }));
            await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));
            setChecklist(prev => ({ ...prev, [item]: true }));
            setVerifyingItems(prev => ({ ...prev, [item]: false }));
        }

        setIsAiVerifying(false);
    };

    const togglePlay = () => {
        // In preview mode, only dubbed video is shown
        if (isPreviewMode) {
            if (dubbedVideoRef.current) {
                if (isPlaying) {
                    dubbedVideoRef.current.pause();
                } else {
                    dubbedVideoRef.current.play().catch(err => {
                        console.error('[ReviewHubPage] Error playing dubbed video:', err);
                    });
                }
                setIsPlaying(!isPlaying);
            }
        } else {
            // In review mode, play whatever is available (both if possible, otherwise just one)
            const hasOriginal = !!originalVideoRef.current;
            const hasDubbed = !!dubbedVideoRef.current;

            if (hasOriginal || hasDubbed) {
                if (isPlaying) {
                    if (hasOriginal) originalVideoRef.current?.pause();
                    if (hasDubbed) dubbedVideoRef.current?.pause();
                } else {
                    if (hasOriginal) originalVideoRef.current?.play().catch(err => console.error('Original video play error:', err));
                    if (hasDubbed) dubbedVideoRef.current?.play().catch(err => console.error('Dubbed video play error:', err));
                }
                setIsPlaying(!isPlaying);
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (isPreviewMode) {
            // In preview mode, only seek the dubbed video
            if (dubbedVideoRef.current) {
                dubbedVideoRef.current.currentTime = time;
                setCurrentTime(time);
            }
        } else {
            // In review mode, seek whatever is available
            const hasOriginal = !!originalVideoRef.current;
            const hasDubbed = !!dubbedVideoRef.current;

            if (hasOriginal) originalVideoRef.current!.currentTime = time;
            if (hasDubbed) dubbedVideoRef.current!.currentTime = time;

            if (hasOriginal || hasDubbed) {
                setCurrentTime(time);
            }
        }
    };

    const skipTime = (seconds: number) => {
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));

        if (isPreviewMode) {
            // In preview mode, only skip the dubbed video
            if (dubbedVideoRef.current) {
                dubbedVideoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
            }
        } else {
            // In review mode, skip whatever is available
            const hasOriginal = !!originalVideoRef.current;
            const hasDubbed = !!dubbedVideoRef.current;

            if (hasOriginal) originalVideoRef.current!.currentTime = newTime;
            if (hasDubbed) dubbedVideoRef.current!.currentTime = newTime;

            if (hasOriginal || hasDubbed) {
                setCurrentTime(newTime);
            }
        }
    };

    const toggleOriginalMute = () => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            setOriginalMuted(false);
            setDubbedMuted(true);
            originalVideoRef.current.muted = false;
            dubbedVideoRef.current.muted = true;
        }
    };

    const toggleDubbedMute = () => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            setOriginalMuted(true);
            setDubbedMuted(false);
            originalVideoRef.current.muted = true;
            dubbedVideoRef.current.muted = false;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (originalVideoRef.current) originalVideoRef.current.volume = newVolume;
        if (dubbedVideoRef.current) dubbedVideoRef.current.volume = newVolume;
    };

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        if (isPreviewMode) {
            // In preview mode, only change dubbed video speed
            if (dubbedVideoRef.current) {
                dubbedVideoRef.current.playbackRate = speed;
            }
        } else {
            // In review mode, change both videos
            if (originalVideoRef.current && dubbedVideoRef.current) {
                originalVideoRef.current.playbackRate = speed;
                dubbedVideoRef.current.playbackRate = speed;
            }
        }
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        setCurrentTime(video.currentTime);
        const otherVideo = video === originalVideoRef.current ? dubbedVideoRef.current : originalVideoRef.current;
        if (otherVideo && Math.abs(video.currentTime - otherVideo.currentTime) > 0.1) {
            otherVideo.currentTime = video.currentTime;
        }
    };

    const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setDuration(e.currentTarget.duration);
    };

    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);

    // Video loading handlers
    const handleOriginalVideoCanPlay = () => {
        console.log('[ReviewHubPage] Original video can play');
        setOriginalVideoLoading(false);
    };

    const handleDubbedVideoCanPlay = () => {
        console.log('[ReviewHubPage] Dubbed video can play');
        setDubbedVideoLoading(false);
    };

    const handleOriginalVideoWaiting = () => {
        setOriginalVideoLoading(true);
    };

    const handleDubbedVideoWaiting = () => {
        setDubbedVideoLoading(true);
    };

    // Reset loading states when URLs change
    useEffect(() => {
        if (originalVideoUrl) {
            setOriginalVideoLoading(true);
        }
    }, [originalVideoUrl]);

    useEffect(() => {
        if (dubbedVideoUrl) {
            setDubbedVideoLoading(true);
        }
    }, [dubbedVideoUrl]);

    useEffect(() => {
        if (isApproved) {
            setChecklist({
                lipSync: true,
                translation: true,
                tone: true,
                audioQuality: true
            });
        }
    }, [isApproved]);

    // Theme-aware classes matching Dashboard
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-gray-200" : "border-white/10";
    const isDark = theme === "dark";

    // Derived values for UI
    const progressPercent = (currentTime / duration) * 100 || 0;

    // Set metadata loading based on video data availability
    useEffect(() => {
        if (quickCheckState.videoId && quickCheckState.originalVideoUrl) {
            setMetadataLoading(false);
        } else {
            setMetadataLoading(true);
        }
    }, [quickCheckState.videoId, quickCheckState.originalVideoUrl]);

    // Show minimal loading only if there's no video ID from URL at all
    // (Remove full-page blocking loader to allow progressive component loading)

    // Show empty state only if there's no video ID from URL at all
    if (!videoIdFromUrl && !quickCheckState.videoId) {
        return (
            <div className={`w-full h-full flex items-center justify-center p-8 ${bgClass}`}>
                <div className="max-w-md w-full text-center space-y-6">
                    <div className={`w-20 h-20 bg-white/5 border ${borderClass} rounded-[2.5rem] flex items-center justify-center mx-auto`}>
                        <RefreshCw className={`w-8 h-8 ${textSecondaryClass} opacity-50`} />
                    </div>
                    <div className="space-y-2">
                        <h2 className={`text-xl font-medium ${textClass} tracking-tight`}>Review Hub Empty</h2>
                        <p className={`${textSecondaryClass} text-sm opacity-60`}>Select a production asset from the media library to begin the review process.</p>
                    </div>
                    <Button
                        onClick={() => router.push('/app?page=All Media')}
                        className="h-10 px-8 bg-olleey-yellow text-black hover:bg-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full"
                    >
                        Browse Library
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col ${bgClass} ${textClass} overflow-hidden`}>
            {/* Action Toolbar */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-200'} shrink-0`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${isApproved ? "border-green-500/30 text-green-500 bg-green-500/5" : "border-olleey-yellow/30 text-olleey-yellow bg-olleey-yellow/5"}`}>
                            {isApproved ? "Live Master" : "Quality Check"}
                        </Badge>
                    </div>
                    <p className={`text-lg ${textSecondaryClass} font-bold tracking-wide opacity-90 truncate max-w-md`}>
                        {videoTitle}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Preview Mode Toggle */}
                    <div className={`flex items-center ${isDark ? "bg-white/[0.03]" : "bg-gray-100"} border ${isDark ? 'border-white/5' : 'border-gray-200'} rounded-full p-1`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPreviewMode(false)}
                            className={cn(
                                "h-7 px-4 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                                !isPreviewMode
                                    ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm")
                                    : (isDark ? "text-white/30 hover:text-white" : "text-black/40 hover:text-black")
                            )}
                        >
                            Review
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPreviewMode(true)}
                            className={cn(
                                "h-7 px-4 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                                isPreviewMode
                                    ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm")
                                    : (isDark ? "text-white/30 hover:text-white" : "text-black/40 hover:text-black")
                            )}
                        >
                            <Eye className="w-3 h-3 mr-1.5" />
                            Preview
                        </Button>
                    </div>

                    {!isApproved && (
                        <Button
                            onClick={async () => {
                                if (confirm("Cancel this review? The job will be cancelled and removed from the pipeline.")) {
                                    try {
                                        if (quickCheckState.videoId) {
                                            await jobsAPI.cancelJob(quickCheckState.videoId);
                                        }
                                        // Trigger refresh
                                        window.dispatchEvent(new CustomEvent('olleey-refresh'));
                                        router.push('/app?page=All Media');
                                    } catch (error) {
                                        console.error("Failed to cancel job:", error);
                                        alert("Failed to cancel job. Please try again.");
                                    }
                                }
                            }}
                            variant="outline"
                            className={`h-10 px-6 rounded-full bg-transparent hover:bg-red-500/10 text-red-500 border-red-500/20 hover:border-red-500/40 text-[10px] font-black uppercase tracking-[0.2em]`}
                        >
                            <X className="w-3.5 h-3.5 mr-2" /> Cancel Review
                        </Button>
                    )}
                    {isApproved && (
                        <div className="h-10 px-6 rounded-full border border-green-500/20 bg-green-500/5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live on YouTube</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6">
                {/* Main Content Area - Video Player */}
                <div className={`flex-1 flex flex-col relative rounded-[2.5rem] border ${borderClass} bg-[#0c0c0c] overflow-hidden shadow-2xl`}>

                    {/* Video Grid */}
                    <div className={cn(
                        "flex-1 relative group",
                        isPreviewMode ? "flex items-center justify-center bg-white/5 p-4" : "grid grid-cols-2 gap-px bg-white/5"
                    )}>
                        {/* Source Feed - Hidden in Preview Mode */}
                        {!isPreviewMode && (
                            <div
                                onClick={() => setSelectedFocus("source")}
                                className={cn(
                                    "relative overflow-hidden transition-all duration-500 bg-black/40 cursor-pointer rounded-tl-[2.5rem]",
                                    !originalMuted ? "opacity-100" : "opacity-60",
                                    selectedFocus === "source" ? "border-2 border-olleey-yellow z-10 shadow-[0_0_30px_rgba(234,179,8,0.2)]" : "border-transparent borderHover"
                                )}
                            >
                                <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5">
                                    <Badge className={cn(
                                        "backdrop-blur-md border px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full pointer-events-none transition-colors",
                                        selectedFocus === "source"
                                            ? "bg-olleey-yellow text-black border-olleey-yellow"
                                            : "bg-black/40 text-white/50 border-white/10"
                                    )}>
                                        Original Source
                                    </Badge>
                                </div>
                                <video
                                    ref={originalVideoRef}
                                    src={originalVideoUrl}
                                    className="w-full h-full object-contain"
                                    muted={originalMuted}
                                    onTimeUpdate={handleVideoTimeUpdate}
                                    onLoadedMetadata={handleVideoLoadedMetadata}
                                    onPlay={handleVideoPlay}
                                    onPause={handleVideoPause}
                                    onCanPlay={handleOriginalVideoCanPlay}
                                    onWaiting={handleOriginalVideoWaiting}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOriginalMute();
                                        setSelectedFocus("source");
                                    }}
                                />
                                {/* Loading overlay for original video */}
                                {originalVideoLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
                                            />
                                            <span className="text-xs font-medium text-white/60">Loading video...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Dubbed Feed */}
                        <div
                            onClick={() => setSelectedFocus("prod")}
                            className={cn(
                                "relative overflow-hidden transition-all duration-500 bg-black/40 cursor-pointer",
                                isPreviewMode ? "rounded-[2rem] w-full aspect-video shadow-2xl" : "rounded-tr-[2.5rem]",
                                !dubbedMuted ? "opacity-100" : "opacity-60",
                                selectedFocus === "prod" ? "border-2 border-olleey-yellow z-10 shadow-[0_0_30px_rgba(234,179,8,0.2)]" : "border-transparent borderHover"
                            )}
                        >
                            <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5 ">
                                <Badge className={cn(
                                    "backdrop-blur-md border px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full pointer-events-none transition-colors",
                                    selectedFocus === "prod" || isPreviewMode
                                        ? "bg-olleey-yellow text-black border-olleey-yellow"
                                        : "bg-black/40 text-white/50 border-white/10"
                                )}>
                                    {isPreviewMode ? "Final Output Preview" : `${languageName} Output`}
                                </Badge>
                            </div>
                            {dubbedVideoUrl ? (
                                <>
                                    <video
                                        ref={dubbedVideoRef}
                                        src={dubbedVideoUrl}
                                        className="w-full h-full object-contain"
                                        muted={dubbedMuted}
                                        playsInline
                                        preload="metadata"
                                        onTimeUpdate={handleVideoTimeUpdate}
                                        onLoadedMetadata={handleVideoLoadedMetadata}
                                        onPlay={handleVideoPlay}
                                        onPause={handleVideoPause}
                                        onCanPlay={handleDubbedVideoCanPlay}
                                        onWaiting={handleDubbedVideoWaiting}
                                        onError={(e) => {
                                            console.error('[ReviewHubPage] Dubbed video error:', {
                                                url: dubbedVideoUrl,
                                                error: e
                                            });
                                            setDubbedVideoLoading(false);
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDubbedMute();
                                            setSelectedFocus("prod");
                                        }}
                                    />
                                    {/* Loading overlay for dubbed video */}
                                    {dubbedVideoLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                                            <div className="flex flex-col items-center gap-3">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                    className="w-10 h-10 border-2 border-olleey-yellow/20 border-t-olleey-yellow rounded-full"
                                                />
                                                <span className="text-xs font-medium text-white/60">Loading dubbed video...</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/20">
                                    <div className="text-center space-y-3 p-6">
                                        <AlertCircle className="w-12 h-12 text-white/20 mx-auto" />
                                        <p className="text-xs font-bold text-white/60">
                                            Localized video not ready
                                        </p>
                                        <p className="text-[10px] text-white/30">
                                            The dubbed video is still processing or the URL is not available.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Center Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                            <AnimatePresence>
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: isPlaying ? 0 : 1, scale: 1 }}
                                    whileHover={{ scale: 1.1, opacity: 1 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        togglePlay();
                                    }}
                                    className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 hover:bg-white/20 hover:scale-105 pointer-events-auto"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 text-white fill-current" />
                                    ) : (
                                        <Play className="w-8 h-8 text-white fill-current pl-1" />
                                    )}
                                </motion.button>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="h-20 bg-white/[0.02] backdrop-blur-xl border-t border-white/5 px-8 flex flex-col justify-center gap-3">
                        {/* Scrubber */}
                        <div className="relative h-1.5 flex items-center group/scrub cursor-pointer">
                            <div className="absolute inset-0 bg-white/10 rounded-full" />
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-olleey-yellow rounded-full z-10"
                                style={{ width: `${progressPercent}%` }}
                            />
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" onClick={() => skipTime(-5)} className="w-8 h-8 rounded-full hover:bg-white/5 text-white/60 hover:text-white">
                                        <SkipBack className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={togglePlay}
                                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white"
                                    >
                                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => skipTime(5)} className="w-8 h-8 rounded-full hover:bg-white/5 text-white/60 hover:text-white">
                                        <SkipForward className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="w-px h-6 bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium tracking-widest ${!originalMuted ? 'text-white' : 'text-white/40'} cursor-pointer hover:text-white transition-colors`} onClick={toggleOriginalMute}>Source</span>
                                    <span className="text-white/20">/</span>
                                    <span className={`text-xs font-medium tracking-widest ${!dubbedMuted ? 'text-olleey-yellow' : 'text-white/40'} cursor-pointer hover:text-olleey-yellow transition-colors`} onClick={toggleDubbedMute}>Prod</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs font-mono text-white/40">
                                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                                <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                                    {[1, 1.5, 2].map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => changePlaybackSpeed(speed)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-bold transition-all",
                                                playbackSpeed === speed ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className={`w-[400px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2`}>

                    {/* Preview Mode: Show Metadata Prominently */}
                    {isPreviewMode && (
                        <div className={`rounded-[2rem] border ${borderClass} bg-white/5 p-6 space-y-6 shadow-xl`}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                    <Eye className="w-4 h-4 text-olleey-yellow" />
                                </div>
                                <h3 className="text-sm font-medium tracking-tight">Final Output Preview</h3>
                            </div>

                            {/* Thumbnail Preview */}
                            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl group relative">
                                <img
                                    src={thumbnailStrategy === 'upload' && customThumbnail ? customThumbnail : (thumbnailStrategy === 'generate' ? DEMO_THUMBNAIL : (quickCheckState.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"))}
                                    alt="Thumbnail Preview"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onLoad={() => setThumbnailLoading(false)}
                                    onError={() => setThumbnailLoading(false)}
                                />
                                {thumbnailLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Type className="w-3.5 h-3.5 text-white/40" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Title</span>
                                </div>
                                {metadataLoading ? (
                                    <div className="space-y-2">
                                        <div className="h-5 bg-white/10 rounded animate-pulse w-3/4"></div>
                                        <div className="h-5 bg-white/10 rounded animate-pulse w-1/2"></div>
                                    </div>
                                ) : (
                                    <p className="text-base font-bold text-white leading-snug">
                                        {(() => {
                                            // Use edited title if available, otherwise show Spanish for Garry Tan demo
                                            if (editedTitle && editedTitle !== (localizedTitle || "")) {
                                                return editedTitle;
                                            }
                                            // If Garry Tan demo and Spanish, show Spanish title
                                            if ((videoTitle?.includes("Garry Tan") || quickCheckState.videoId === "garry_tan_yc_demo") && languageCode === "es") {
                                                return "Garry Tan - Presidente y CEO de Y Combinator";
                                            }
                                            return editedTitle || localizedTitle || videoTitle || "Untitled Video";
                                        })()}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Edit3 className="w-3.5 h-3.5 text-white/40" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Description</span>
                                </div>
                                {metadataLoading ? (
                                    <div className="space-y-2">
                                        <div className="h-4 bg-white/10 rounded animate-pulse w-full"></div>
                                        <div className="h-4 bg-white/10 rounded animate-pulse w-5/6"></div>
                                        <div className="h-4 bg-white/10 rounded animate-pulse w-4/5"></div>
                                        <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/70 leading-relaxed line-clamp-6">
                                        {(() => {
                                            // Use edited description if available, otherwise show Spanish for Garry Tan demo
                                            if (editedDescription && editedDescription !== (localizedDescription || "No description provided.")) {
                                                return editedDescription;
                                            }
                                            // If Garry Tan demo and Spanish, show Spanish description
                                            if ((videoTitle?.includes("Garry Tan") || quickCheckState.videoId === "garry_tan_yc_demo") && languageCode === "es") {
                                                return "Garry Tan es el Presidente y CEO de Y Combinator (YC), la aceleradora de startups más exitosa del mundo.\n\nEn este video, Garry comparte perspectivas sobre la misión de YC de ayudar a las startups a tener éxito, la importancia de construir grandes productos, y consejos para fundadores navegando el viaje del emprendimiento.\n\nEste es un video de demostración que muestra las capacidades de localización de video impulsadas por IA de Olleey.";
                                            }
                                            return editedDescription || localizedDescription || videoDescription || "No description available";
                                        })()}
                                    </p>
                                )}
                            </div>

                            {/* Language Badge */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Languages className="w-4 h-4 text-olleey-yellow" />
                                    <span className="text-xs font-bold">Target Language</span>
                                </div>
                                <Badge className="bg-olleey-yellow/10 text-olleey-yellow border-olleey-yellow/20">
                                    {languageName}
                                </Badge>
                            </div>

                            {/* Launch Actions */}
                            {!isApproved && (
                                <div className="space-y-3 pt-2">
                                    <Button
                                        onClick={handlePublishToYouTube}
                                        disabled={isPublishing || isSavingDraft}
                                        className="w-full h-11 rounded-full bg-olleey-yellow hover:bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-olleey-yellow/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPublishing ? (
                                            <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Publishing...</>
                                        ) : (
                                            <><Youtube className="w-3.5 h-3.5 mr-2" /> Launch to YouTube</>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleSaveDraft}
                                        disabled={isPublishing || isSavingDraft}
                                        variant="outline"
                                        className="w-full h-11 rounded-full bg-transparent hover:bg-white/5 text-white border-white/10 hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingDraft ? (
                                            <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save className="w-3.5 h-3.5 mr-2" /> Save Draft</>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Update Action for Approved Videos */}
                            {isApproved && (
                                <div className="pt-2">
                                    <Button
                                        onClick={handlePublishToYouTube}
                                        disabled={isPublishing}
                                        className="w-full h-11 rounded-full bg-olleey-yellow hover:bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-olleey-yellow/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPublishing ? (
                                            <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> Updating...</>
                                        ) : (
                                            <><RefreshCw className="w-3.5 h-3.5 mr-2" /> Update on YouTube</>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Review Mode: Show Checklist */}
                    {!isPreviewMode && (
                        <div className={`rounded-[2rem] border ${borderClass} bg-white/5 p-6 space-y-6 shadow-xl`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                        <ShieldCheck className="w-4 h-4 text-olleey-yellow" />
                                    </div>
                                    <h3 className="text-sm font-medium tracking-tight">Quality Assurance</h3>
                                </div>

                                {!isApproved && (
                                    <Button
                                        size="sm"
                                        onClick={handleAiVerify}
                                        disabled={isAiVerifying}
                                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
                                    >
                                        {isAiVerifying ? <RefreshCw className="w-3 h-3 animate-spin mr-1.5" /> : <Zap className="w-3 h-3 fill-current mr-1.5" />}
                                        AI Check
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {Object.entries(checklist).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 pl-4 rounded-2xl border transition-all duration-300 group",
                                            value
                                                ? "bg-green-500/10 border-green-500/20"
                                                : (reprocessingItems[key] ? "bg-olleey-yellow/5 border-olleey-yellow/20" : "bg-white/[0.03] border-white/5")
                                        )}
                                    >
                                        <button
                                            disabled={isApproved || reprocessingItems[key]}
                                            onClick={() => setChecklist(prev => ({ ...prev, [key]: !value }))}
                                            className="flex items-center gap-3 flex-1 text-left"
                                        >
                                            <div className={cn(
                                                "w-2 h-2 rounded-full transition-all shrink-0",
                                                value ? "bg-green-500" : (reprocessingItems[key] || verifyingItems[key] ? "bg-olleey-yellow animate-pulse" : "bg-white/20")
                                            )} />
                                            <span className={cn(
                                                "text-xs font-semibold tracking-wide capitalize",
                                                value ? "text-white" : "text-white/60 group-hover:text-white"
                                            )}>
                                                {key.replace(/([A-Z])/g, ' $1')}
                                            </span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {reprocessingItems[key] ? (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow animate-pulse mr-2">Fixing...</span>
                                            ) : value ? (
                                                <div className="w-8 h-8 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                </div>
                                            ) : (
                                                !isApproved && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRedo(key);
                                                        }}
                                                        className="h-8 px-4 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white text-white/40 rounded-full border border-white/5 hover:border-white/10 transition-all"
                                                    >
                                                        Redo
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Thumbnail Panel - Review Mode Only */}
                    {!isPreviewMode && (
                        <div className={`rounded-[2rem] border ${borderClass} bg-white/5 p-6 space-y-6 shadow-xl`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                        <ImageIcon className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <h3 className="text-sm font-medium tracking-tight">Thumbnail</h3>
                                </div>
                                <div className="flex bg-white/5 rounded-full p-0.5 border border-white/5">
                                    {(['original', 'generate', 'upload'] as const).map((strategy) => (
                                        <button
                                            key={strategy}
                                            onClick={() => {
                                                setThumbnailStrategy(strategy);
                                                if (strategy === 'upload') fileInputRef.current?.click();
                                                if (strategy === 'generate') handleGenerateThumbnail();
                                            }}
                                            className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                                thumbnailStrategy === strategy ? "bg-white text-black" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            {strategy}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group/thumb aspect-video bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                                {isGeneratingThumbnail ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm z-20">
                                        <RefreshCw className="w-6 h-6 text-olleey-yellow animate-spin" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-olleey-yellow animate-pulse">Synthesizing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <img
                                            src={thumbnailStrategy === 'upload' && customThumbnail ? customThumbnail : (thumbnailStrategy === 'generate' ? DEMO_THUMBNAIL : (quickCheckState.thumbnailUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"))}
                                            alt="Thumbnail Preview"
                                            className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                                            onLoad={() => setThumbnailLoading(false)}
                                            onError={() => setThumbnailLoading(false)}
                                        />
                                        {thumbnailLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                    className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
                                                />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <Badge className="w-fit rounded-full bg-white text-black text-[8px] font-black uppercase border-none">Active: {thumbnailStrategy}</Badge>
                                        </div>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            {thumbnailStrategy === 'generate' && !isGeneratingThumbnail && (
                                <Button
                                    onClick={handleGenerateThumbnail}
                                    className="w-full rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] font-black uppercase tracking-widest h-9"
                                >
                                    <Wand2 className="w-3.5 h-3.5 mr-2" /> Re-Generate
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Metadata Panel - Review Mode Only */}
                    {!isPreviewMode && (
                        <div className={`rounded-[2rem] border ${borderClass} bg-white/5 p-6 space-y-6 shadow-xl`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <Type className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-medium tracking-tight">Localized Metadata</h3>
                                </div>
                                <div className="flex bg-white/5 rounded-full p-0.5 border border-white/5">
                                    <button
                                        onClick={() => setActiveTab('edit')}
                                        className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'edit' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                                    >
                                        Manual
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('ai')}
                                        className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'ai' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                                    >
                                        AI Assist
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'edit' ? (
                                metadataLoading ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 pl-1">Title</label>
                                            <div className="h-11 bg-white/10 rounded-xl animate-pulse"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 pl-1">Description</label>
                                            <div className="h-32 bg-white/10 rounded-xl animate-pulse"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 pl-1">Title</label>
                                            <input
                                                type="text"
                                                value={editedTitle}
                                                onChange={(e) => setEditedTitle(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-olleey-yellow/50 focus:bg-black/40 outline-none transition-all placeholder:text-white/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 pl-1">Description</label>
                                            <textarea
                                                value={editedDescription}
                                                onChange={(e) => setEditedDescription(e.target.value)}
                                                className="w-full h-32 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-olleey-yellow/50 focus:bg-black/40 outline-none transition-all resize-none leading-relaxed placeholder:text-white/20"
                                            />
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-4 text-center">
                                    <div className="p-3 bg-olleey-yellow/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-olleey-yellow/20">
                                        <Sparkles className="w-5 h-5 text-olleey-yellow" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-white">AI Optimization</h4>
                                        <p className="text-xs text-white/40">Generate SEO-optimized titles and descriptions for this locale.</p>
                                    </div>
                                    <Button
                                        onClick={handleGenerateInfo}
                                        disabled={isGeneratingInfo}
                                        className="w-full rounded-full bg-white hover:bg-white/90 text-black font-bold h-10 mt-2"
                                    >
                                        {isGeneratingInfo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                        Generate
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* YouTube-style Video Settings */}
                    {!isPreviewMode && (
                        <div className={`rounded-[2rem] border ${borderClass} bg-white/5 p-6 space-y-5 shadow-xl`}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <Settings className="w-4 h-4 text-purple-400" />
                                </div>
                                <h3 className="text-sm font-medium tracking-tight">Video Settings</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Made for Kids */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Baby className="w-4 h-4 text-white/40" />
                                        <div>
                                            <div className="text-xs font-medium text-white">Made for Kids</div>
                                            <div className="text-[10px] text-white/40 mt-0.5">Designed for children under 13</div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={madeForKids}
                                        onCheckedChange={setMadeForKids}
                                    />
                                </div>

                                {/* Age Restriction */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-white/40" />
                                        <div>
                                            <div className="text-xs font-medium text-white">Age Restriction</div>
                                            <div className="text-[10px] text-white/40 mt-0.5">Restrict to viewers 18+</div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={ageRestricted}
                                        onCheckedChange={setAgeRestricted}
                                        disabled={madeForKids}
                                    />
                                </div>

                                {/* Allow Comments */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-4 h-4 text-white/40" />
                                        <div>
                                            <div className="text-xs font-medium text-white">Allow Comments</div>
                                            <div className="text-[10px] text-white/40 mt-0.5">Viewers can leave comments</div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={allowComments}
                                        onCheckedChange={setAllowComments}
                                    />
                                </div>

                                {/* Allow Ratings */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <ThumbsUp className="w-4 h-4 text-white/40" />
                                        <div>
                                            <div className="text-xs font-medium text-white">Allow Ratings</div>
                                            <div className="text-[10px] text-white/40 mt-0.5">Show like/dislike counts</div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={allowRatings}
                                        onCheckedChange={setAllowRatings}
                                    />
                                </div>

                                {/* Publish to Subscriptions Feed */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Rss className="w-4 h-4 text-white/40" />
                                        <div>
                                            <div className="text-xs font-medium text-white">Publish to Feed</div>
                                            <div className="text-[10px] text-white/40 mt-0.5">Notify subscribers of new video</div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={publishToFeed}
                                        onCheckedChange={setPublishToFeed}
                                    />
                                </div>
                            </div>

                            {/* Settings Info */}
                            <div className="pt-2 px-3">
                                <p className="text-[10px] text-white/30 leading-relaxed">
                                    These settings will be applied when the video is published to YouTube.
                                </p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Dashboard Layout Optimization */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}

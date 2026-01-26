import React, { useState, useEffect } from "react";
import { Play, RotateCw, AlertCircle, Loader2, CheckCircle, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/useTheme";
import { StatusChip } from "@/components/ui/StatusChip";

// Duplicate types for now to avoid circular deps or large refactors, 
// can be moved to a types file later.
type LocalizationStatus = "live" | "draft" | "processing" | "not-started" | "failed";

interface LocalizationInfo {
    status: LocalizationStatus;
    url?: string;
    views?: number;
    video_id?: string;
    confidence?: number; // New field from requirements, might be missing in API currently
    title?: string; // Current title
    originalTitle?: string; // For ghost text
}

interface SatelliteRowProps {
    languageCode: string;
    languageName: string;
    flag: string;
    localization: LocalizationInfo;
    onPreview: (langCode: string, videoId?: string) => void;
    onPublish: (langCode: string, videoId?: string) => void;
    onUpdateTitle: (langCode: string, newTitle: string) => void;
    isSelected: boolean;
    onToggleSelect: (checked: boolean) => void;
    isProcessingAction?: boolean; // For when publish/preview is loading
    onViewDetails?: (jobId: string, videoTitle: string, language: string) => void;
}

export function SatelliteRow({
    languageCode,
    languageName,
    flag,
    localization,
    onPreview,
    onPublish,
    onUpdateTitle,
    isSelected,
    onToggleSelect,
    isProcessingAction = false,
    onViewDetails
}: SatelliteRowProps) {
    const { theme } = useTheme();

    // Theme classes
    const textClass = theme === "light" ? "text-gray-900" : "text-white";
    const textSecondaryClass = theme === "light" ? "text-gray-500" : "text-gray-400";
    const bgHoverClass = theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5";
    const borderClass = theme === "light" ? "border-gray-200" : "border-gray-800";
    const inputBgClass = theme === "light" ? "bg-transparent focus:bg-white" : "bg-transparent focus:bg-white/10";

    const [title, setTitle] = useState(localization.title || "");
    const [isEditing, setIsEditing] = useState(false);

    // Living Row State
    const [processingStage, setProcessingStage] = useState(0);
    const [progress, setProgress] = useState(0);

    const PROCESSING_STAGES = [
        "Downloading Video...",
        "Transcribing Audio...",
        "Cloning Voice (ElevenLabs)...",
        "Syncing Lips (SyncLabs)...",
        "Finalizing..."
    ];

    useEffect(() => {
        setTitle(localization.title || "");
    }, [localization.title]);

    // Simulate progress for "processing" status
    useEffect(() => {
        if (localization.status === "processing") {
            const interval = setInterval(() => {
                setProcessingStage(prev => (prev + 1) % PROCESSING_STAGES.length);
                setProgress(prev => Math.min(prev + (100 / PROCESSING_STAGES.length), 95));
            }, 3000); // Change stage every 3s
            return () => clearInterval(interval);
        } else {
            setProcessingStage(0);
            setProgress(0);
        }
    }, [localization.status]);

    const handleTitleBlur = () => {
        setIsEditing(false);
        if (title !== localization.title) {
            onUpdateTitle(languageCode, title);
        }
    };



    return (
        <div
            className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-4 py-3 pl-12 border-b ${borderClass} bg-black/20 transition-colors group relative ${localization.status === "processing" ? "cursor-pointer hover:bg-amber-500/5 border-amber-500/10" : bgHoverClass
                }`}
            onClick={() => {
                if (localization.status === "processing" && onViewDetails) {
                    // Use a dummy job ID for simulation if none exists
                    onViewDetails(localization.video_id || `job-${languageCode}`, localization.title || "Untitled Video", languageName);
                }
            }}
        >

            {/* Checkbox & Language */}
            <div className="flex items-center gap-4 min-w-[140px]">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onToggleSelect(e.target.checked)}
                    className="rounded border-gray-600 bg-transparent text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={languageName}>{flag}</span>
                    <span className={`text-sm font-medium ${textSecondaryClass} uppercase`}>{languageCode}</span>
                </div>
            </div>

            {/* Smart Metadata (Title) */}
            <div className="flex flex-col gap-1 min-w-0 pr-8">
                <div className="relative group/input">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        onFocus={() => setIsEditing(true)}
                        className={`h-8 px-2 py-1 text-sm font-medium border-transparent ${inputBgClass} hover:border-gray-700 focus:border-indigo-500 transition-all shadow-none rounded`}
                        placeholder={`Enter ${languageName} title...`}
                    />
                </div>
                {localization.originalTitle && (
                    <span className="text-xs text-gray-500 opacity-40 px-2 truncate pointer-events-none select-none">
                        {localization.originalTitle}
                    </span>
                )}
            </div>

            {/* Status */}
            <div className="min-w-[150px]">
                {localization.status === "processing" ? (
                    <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-olleey-yellow">
                                {PROCESSING_STAGES[processingStage]}
                                <span className="relative flex h-2 w-2 ml-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olleey-yellow/40 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-olleey-yellow"></span>
                                </span>
                            </span>
                        </div>
                        <div className="h-1 w-full bg-gray-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-olleey-yellow transition-all duration-1000 ease-in-out shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                style={{ width: `${Math.max(progress, 5)}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <StatusChip
                        status={localization.status}
                        size="sm"
                        label={localization.status === "live" ? "Published" : undefined}
                    />
                )}
                {(localization.status === "draft" || localization.status === "failed") && localization.confidence !== undefined && (
                    <span className={`text-[10px] ${(localization.confidence || 100) < 70 ? "text-amber-500" : textSecondaryClass} block mt-1`}>
                        AI Confidence: {localization.confidence}%
                    </span>
                )}
            </div>

            {/* Control Center */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPreview(languageCode, localization.video_id)}
                    disabled={isProcessingAction || localization.status === "not-started" || localization.status === "processing"}
                    className={`p-2 rounded-lg border ${borderClass} ${textSecondaryClass} hover:${textClass} hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Quick Preview"
                >
                    <Play className="w-4 h-4" />
                </button>

                {localization.status !== "live" && (
                    <button
                        onClick={() => onPublish(languageCode, localization.video_id)}
                        disabled={isProcessingAction || localization.status === "processing" || localization.status === "not-started"}
                        className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all
                        ${localization.status === "not-started"
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white hover:border-transparent hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            }
                    `}
                    >
                        {isProcessingAction ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        Publish
                    </button>
                )}
            </div>
        </div>
    );
}

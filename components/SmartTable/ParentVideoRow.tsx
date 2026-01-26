import React from "react";
import { ChevronDown, ChevronRight, Clock, Video } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { StatusChip } from "@/components/ui/StatusChip";

// Duplicate types for now (should be shared)
type LocalizationStatus = "live" | "draft" | "processing" | "not-started" | "failed";

interface LocalizationInfo {
    status: LocalizationStatus;
    url?: string;
    views?: number;
    video_id?: string;
    confidence?: number;
}

interface ParentVideoRowProps {
    video: {
        video_id: string;
        title: string;
        thumbnail_url?: string;
        duration?: number;
        published_at: string;
        localizations?: Record<string, LocalizationInfo>;
    };
    isExpanded: boolean;
    onToggleExpand: () => void;
    languageOptions: { code: string; flag: string; name: string }[];
}

export function ParentVideoRow({
    video,
    isExpanded,
    onToggleExpand,
    languageOptions,
}: ParentVideoRowProps) {
    const { theme } = useTheme();

    // Theme classes
    const textClass = theme === "light" ? "text-gray-900" : "text-white";
    const textSecondaryClass = theme === "light" ? "text-gray-500" : "text-gray-400";
    const cardClass = theme === "light" ? "bg-white" : "bg-[#0f0f0f]"; // Slightly lighter than pure black for row
    const hoverClass = theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5";
    const borderClass = theme === "light" ? "border-gray-200" : "border-gray-800";

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const getAggregatedStatus = () => {
        const localizations = Object.values(video.localizations || {});
        const activeLocalizations = localizations.filter(l => l.status !== "not-started");

        if (activeLocalizations.length === 0) {
            return { label: "Ready to Dub", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" };
        }

        const pendingCount = activeLocalizations.filter(l => l.status === "draft").length;
        const processingCount = activeLocalizations.filter(l => l.status === "processing").length;
        const failedCount = activeLocalizations.filter(l => l.status === "failed").length;

        if (failedCount > 0) {
            return { label: `${failedCount} Failed`, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
        }
        if (processingCount > 0) {
            return { label: "Processing", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
        }
        if (pendingCount > 0) {
            return { label: `${pendingCount} Pending Review`, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
        }

        return { label: "All Systems Live", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" };
    };

    const status = getAggregatedStatus();

    return (
        <div
            onClick={onToggleExpand}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-6 items-center px-4 py-4 cursor-pointer transition-all border-b ${borderClass} ${cardClass} ${hoverClass} relative group`}
        >
            {/* Left Accent Bar for Expanded State */}
            {isExpanded && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
            )}

            {/* Video Asset */}
            <div className="flex items-center gap-4 min-w-0">
                {/* Thumbnail */}
                <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 border border-white/10 shadow-sm transition-transform group-hover:scale-[1.02]">
                    {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Video className="text-gray-600" />
                        </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {formatDuration(video.duration)}
                    </div>
                </div>

                {/* Info */}
                <div className="flex flex-col min-w-0">
                    <h3 className={`font-bold text-base ${textClass} mb-1 truncate`}>{video.title}</h3>
                    <div className={`flex items-center gap-2 text-xs ${textSecondaryClass}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Uploaded {getTimeAgo(video.published_at)}</span>
                    </div>
                </div>
            </div>

            {/* Global Reach (Flags) */}
            <div className="flex items-center gap-1.5 min-w-[120px]">
                {Object.entries(video.localizations || {}).map(([langCode, loc]) => {
                    const lang = languageOptions.find(l => l.code === langCode);
                    if (!lang || loc.status === "not-started") return null;

                    return (
                        <div key={langCode} className="relative group/flag">
                            <span className={`text-xl cursor-help transition-transform hover:scale-110 block ${loc.status === "processing" ? "animate-pulse" : ""}`}>
                                {lang.flag}
                            </span>
                            {/* Status Dot */}
                            {loc.status === "draft" && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full ring-1 ring-black" />
                            )}
                            {loc.status === "failed" && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full ring-1 ring-black" />
                            )}
                            {loc.status === "processing" && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full ring-1 ring-black" />
                            )}
                        </div>
                    );
                })}
                {Object.values(video.localizations || {}).filter(l => l.status !== "not-started").length === 0 && (
                    <span className={`text-xs ${textSecondaryClass} italic`}>No active languages</span>
                )}
            </div>

            {/* Aggregated Status */}
            <div className="min-w-[180px] flex justify-end">
                <StatusChip
                    status={status.label === "Processing" ? "processing" : status.label === "All Systems Live" ? "live" : status.label === "Ready to Dub" ? "not-started" : "needs_review"}
                    label={status.label}
                    size="sm"
                />
            </div>

            {/* Expand Toggle */}
            <div className={`p-2 rounded-full ${isExpanded ? "bg-white/10" : "bg-transparent"} transition-colors`}>
                {isExpanded ? (
                    <ChevronDown className={`w-5 h-5 ${textSecondaryClass}`} />
                ) : (
                    <ChevronRight className={`w-5 h-5 ${textSecondaryClass}`} />
                )}
            </div>
        </div>
    );
}

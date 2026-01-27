import React, { useState } from "react";
import { ParentVideoRow } from "./ParentVideoRow";
import { SatelliteRow } from "./SatelliteRow";
import { useTheme } from "@/lib/useTheme";
import { Video } from "@/lib/api"; // Basic video type
import { CheckSquare, UploadCloud, X } from "lucide-react";

// Types
type LocalizationStatus = "live" | "draft" | "processing" | "not-started" | "failed";

interface LocalizationInfo {
    status: LocalizationStatus;
    progress: number;
    url?: string;
    views?: number;
    video_id?: string;
    confidence?: number;
    title?: string;
    originalTitle?: string;
}

interface VideoWithLocalizations extends Video {
    localizations?: Record<string, LocalizationInfo>;
    estimated_credits?: number;
    global_views?: number;
}

interface SmartVideoTableProps {
    videos: VideoWithLocalizations[];
    languageOptions: { code: string; flag: string; name: string }[];
    onPreview: (langCode: string, videoId?: string) => void;
    onPublish: (langCode: string, videoId?: string) => void;
    onUpdateTitle: (langCode: string, videoId: string, newTitle: string) => void;
    isProcessingId?: string; // ID of video currently being operated on
    onViewDetails?: (jobId: string, videoTitle: string, language: string) => void;
}

export function SmartVideoTable({
    videos,
    languageOptions,
    onPreview,
    onPublish,
    onUpdateTitle,
    isProcessingId,
    onViewDetails
}: SmartVideoTableProps) {
    const { theme } = useTheme();

    // State
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // Composite key: videoId:langCode

    // Theme classes
    const headerClass = theme === "light" ? "bg-gray-50 text-gray-500" : "bg-[#1f1f1f] text-gray-400";
    const borderClass = theme === "light" ? "border-gray-200" : "border-gray-800";
    const cardClass = theme === "light" ? "bg-white" : "bg-dark-card";

    // Actions
    const toggleExpand = (videoId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(videoId)) {
            newExpanded.delete(videoId);
        } else {
            newExpanded.add(videoId);
        }
        setExpandedRows(newExpanded);
    };

    const toggleSelect = (videoId: string, langCode: string, checked: boolean) => {
        const key = `${videoId}:${langCode}`;
        const newSelected = new Set(selectedItems);
        if (checked) {
            newSelected.add(key);
        } else {
            newSelected.delete(key);
        }
        setSelectedItems(newSelected);
    };

    const clearSelection = () => {
        setSelectedItems(new Set());
    };

    const handleBulkPublish = () => {
        // In a real implementation, this would iterate selected items and call API
        // For now we just console log or maybe alert since we don't have a bulk API ready in this scope
        console.log("Bulk publishing:", Array.from(selectedItems));
        alert(`Publishing ${selectedItems.size} videos... (Simulated)`);
        clearSelection();
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Table Header */}
            <div className={`grid grid-cols-[1fr_auto_auto_auto] gap-6 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b ${borderClass} ${headerClass} rounded-t-xl`}>
                <div>Video Asset</div>
                <div className="w-[120px]">Global Reach</div>
                <div className="w-[180px] text-right">Status</div>
                <div className="w-5"></div> {/* Spacer for chevron */}
            </div>

            {/* Rows */}
            <div className={`flex-1 overflow-y-auto ${cardClass} rounded-b-xl border-x border-b ${borderClass}`}>
                {videos.map((video) => {
                    const isExpanded = expandedRows.has(video.video_id);

                    return (
                        <React.Fragment key={video.video_id}>
                            {/* Parent Row */}
                            <ParentVideoRow
                                video={video}
                                isExpanded={isExpanded}
                                onToggleExpand={() => toggleExpand(video.video_id)}
                                languageOptions={languageOptions}
                            />

                            {/* Satellite Rows (Expanded View) */}
                            {isExpanded && video.localizations && (
                                <div className="bg-black/40 shadow-inner">
                                    {languageOptions.map(lang => {
                                        const localization = video.localizations?.[lang.code];

                                        // Only show if we have data or if we want to show "not started" rows
                                        // Requirement says "Visible only when Parent is expanded... renders as a nested list".
                                        // Usually we want to show all selected project languages, initialized or not.

                                        // If localization object exists, use it. If not, create a dummy one for "Not Started"
                                        const effectiveLoc: LocalizationInfo = localization || {
                                            status: "not-started",
                                            progress: 0,
                                            originalTitle: video.title
                                        };

                                        const isSelected = selectedItems.has(`${video.video_id}:${lang.code}`);

                                        return (
                                            <SatelliteRow
                                                key={lang.code}
                                                languageCode={lang.code}
                                                languageName={lang.name}
                                                flag={lang.flag || "🏳️"} // fallback flag
                                                localization={{
                                                    ...effectiveLoc,
                                                    // Ensure title defaults exist
                                                    title: effectiveLoc.title || "",
                                                    originalTitle: video.title
                                                }}
                                                onPreview={(code, vid) => onPreview(code, vid || video.video_id)}
                                                onPublish={(code, vid) => onPublish(code, vid || video.video_id)}
                                                onUpdateTitle={(code, newTitle) => onUpdateTitle(code, video.video_id, newTitle)}
                                                isSelected={isSelected}
                                                onToggleSelect={(checked) => toggleSelect(video.video_id, lang.code, checked)}
                                                isProcessingAction={isProcessingId === effectiveLoc.video_id}
                                                onViewDetails={onViewDetails}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
                {videos.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No videos found
                    </div>
                )}
            </div>

            {/* Floating Bulk Action Bar */}
            {selectedItems.size > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl border border-indigo-500/30 backdrop-blur-md ${theme === 'light' ? 'bg-white/90 text-gray-900' : 'bg-gray-900/90 text-white'}`}>
                        <div className="flex items-center gap-2 font-medium">
                            <CheckSquare className="w-5 h-5 text-indigo-500" />
                            <span>{selectedItems.size} Selected</span>
                        </div>
                        <div className="h-6 w-px bg-gray-500/20" />
                        <button
                            onClick={handleBulkPublish}
                            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                        >
                            <UploadCloud className="w-4 h-4" />
                            Publish Selection
                        </button>
                        <button
                            onClick={clearSelection}
                            className="p-1 rounded-full hover:bg-gray-500/10 transition-colors ml-1"
                        >
                            <X className="w-5 h-5 opacity-50" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertCircle, Play, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/useTheme";
import { jobsAPI, type LocalizedVideo } from "@/lib/api";
import { logger } from "@/lib/logger";

interface ReviewJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string | null;
    onApproved?: () => void;
}

const LANGUAGE_FLAGS: Record<string, string> = {
    es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", pt: "🇵🇹",
    ja: "🇯🇵", ko: "🇰🇷", hi: "🇮🇳", ar: "🇸🇦",
    ru: "🇷🇺", it: "🇮🇹", zh: "🇨🇳", en: "🇺🇸",
};

export function ReviewJobModal({
    isOpen,
    onClose,
    jobId,
    onApproved,
}: ReviewJobModalProps) {
    const { theme } = useTheme();
    const [videos, setVideos] = useState<LocalizedVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [approving, setApproving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";

    // Fetch videos when modal opens
    useEffect(() => {
        if (isOpen && jobId) {
            loadVideos(jobId);
        } else {
            setVideos([]);
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, jobId]);

    const loadVideos = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await jobsAPI.getJobVideos(id);
            setVideos(data);
        } catch (err: any) {
            logger.error("ReviewJobModal", "Failed to load videos", err);
            setError("Failed to load video previews.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!jobId) return;

        try {
            setApproving(true);
            setError(null);
            await jobsAPI.approveJob(jobId);
            setSuccess(true);

            // Wait for animation then close/notify
            setTimeout(() => {
                onClose();
                if (onApproved) onApproved();
            }, 1500);
        } catch (err: any) {
            logger.error("ReviewJobModal", "Failed to approve job", err);
            setError(err.message || "Failed to approve job");
        } finally {
            setApproving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative ${cardClass} border ${borderClass} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col`}
            >
                {/* Header */}
                <div className={`flex-shrink-0 ${cardClass} border-b ${borderClass} px-6 py-4 flex items-center justify-between`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${textClass}`}>
                            Review & Approve
                        </h2>
                        <p className={`text-sm ${textSecondaryClass} mt-1`}>
                            Review the localized videos before publishing
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`${textSecondaryClass} hover:${textClass} transition-colors`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className={`h-8 w-8 animate-spin ${textSecondaryClass}`} />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                            <p className="text-red-500 mb-4">{error}</p>
                            <Button onClick={() => jobId && loadVideos(jobId)} variant="outline">
                                Retry
                            </Button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-12">
                            <p className={textSecondaryClass}>No videos found for this job.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {videos.map((video) => (
                                <div key={video.id} className={`${cardAltClass} rounded-xl overflow-hidden border ${borderClass}`}>
                                    {/* Video Player */}
                                    <div className="aspect-video bg-black relative group">
                                        {video.storage_url ? (
                                            <video
                                                controls
                                                className="w-full h-full"
                                                src={video.storage_url}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/50">
                                                <p>Video not available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {LANGUAGE_FLAGS[video.language_code] || "🌍"}
                                            </span>
                                            <div>
                                                <p className={`font-medium ${textClass} capitalize`}>
                                                    {video.language_code}
                                                </p>
                                                <p className={`text-xs ${textSecondaryClass}`}>
                                                    {video.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex-shrink-0 ${cardClass} border-t ${borderClass} px-6 py-4 flex items-center justify-between`}>
                    <p className={`text-sm ${textSecondaryClass}`}>
                        {videos.length} videos ready using {videos.length} credits
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={approving || success}
                            className="px-6 bg-transparent border border-gray-300 text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApprove}
                            disabled={approving || success || loading || videos.length === 0}
                            className={`px-6 ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'}`}
                        >
                            {approving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Approving...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approved!
                                </>
                            ) : (
                                "Approve & Publish"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

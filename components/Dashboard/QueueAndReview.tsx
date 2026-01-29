"use client";

import React from "react";
import { Clock, CheckCircle, Loader2, RefreshCw, FileCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { getRelativeTime } from "@/lib/utils";

interface QueueAndReviewProps {
    videosLoading: boolean;
    filteredVideos: any[];
    isDark: boolean;
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    getOverallVideoStatus: (localizations: any) => string;
    onNavigate: (videoId: string) => void;
}

export function QueueAndReview({
    videosLoading,
    filteredVideos,
    isDark,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    getOverallVideoStatus,
    onNavigate
}: QueueAndReviewProps) {
    const activeVideos = filteredVideos.filter(v =>
        ["draft", "processing"].includes(getOverallVideoStatus(v.localizations || {}))
    );

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-olleey-yellow/10 rounded-none shadow-sm border border-olleey-yellow/20">
                        <Clock className="w-5 h-5 text-olleey-yellow" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-300 ${textClass} tracking-tight`}>Queue & Review</h2>
                        <p className={`text-[10px] ${textSecondaryClass} font-medium`}>Active processing and pending approvals</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-none border border-white/5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-olleey-yellow animate-pulse" />
                    <span className={`text-[10px] font-bold ${textClass}`}>
                        {activeVideos.length} production active
                    </span>
                </div>
            </div>

            {videosLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-none border border-white/5">
                    <Loader2 className={`h-10 w-10 animate-spin text-olleey-yellow mb-4 opacity-50`} />
                    <p className={`text-sm font-medium ${textSecondaryClass}`}>Syncing with production servers...</p>
                </div>
            ) : activeVideos.length === 0 ? (
                null
            ) : (
                <div className={`${cardClass} border-y ${borderClass} rounded-none shadow-2xl shadow-black/10 overflow-hidden`}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${isDark ? 'bg-white/5' : 'bg-gray-50/50'} border-b ${borderClass}`}>
                                <th className={`px-4 py-3 text-[10px] font-bold ${textSecondaryClass}`}>Asset & Source</th>
                                <th className={`px-4 py-3 text-[10px] font-bold ${textSecondaryClass}`}>Stage</th>
                                <th className={`px-4 py-3 text-[10px] font-bold ${textSecondaryClass}`}>Distribution</th>
                                <th className={`px-4 py-3 text-[10px] font-bold ${textSecondaryClass} text-right`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {activeVideos.map((video) => {
                                const status = getOverallVideoStatus(video.localizations || {});
                                const isReview = status === "draft";
                                const isProcessing = status === "processing";

                                return (
                                    <tr
                                        key={video.video_id}
                                        className={`group hover:${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'} transition-all cursor-pointer`}
                                        onClick={() => onNavigate(video.video_id)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-16 aspect-video rounded-none overflow-hidden bg-gray-900 shrink-0 shadow-lg border border-white/5">
                                                    {video.thumbnail_url && <img src={video.thumbnail_url} className={`w-full h-full object-cover ${isProcessing ? 'opacity-40' : ''}`} alt="" />}
                                                    {isProcessing && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                                            <RefreshCw className="w-3.5 h-3.5 text-olleey-yellow animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-bold ${textClass} truncate max-w-[280px] mb-1 group-hover:text-olleey-yellow transition-colors`}>
                                                        {video.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-medium ${textSecondaryClass}`}>
                                                            {video.channel_name}
                                                        </span>
                                                        <span className="text-[10px] text-white/10">•</span>
                                                        <span className={`text-[10px] font-medium ${textSecondaryClass}`}>
                                                            {getRelativeTime(video.published_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isReview ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-none bg-olleey-yellow/10 text-olleey-yellow text-[10px] font-bold border border-olleey-yellow/20 shadow-sm">
                                                    <FileCheck className="w-3 h-3" />
                                                    Review
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-[10px] font-bold text-blue-400">Rendering</span>
                                                        <span className="text-[10px] font-bold text-olleey-yellow">85%</span>
                                                    </div>
                                                    <div className="w-28 h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                                                        <div className="h-full bg-olleey-yellow animate-[shimmer_2s_infinite_linear] bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/30 to-transparent w-[85%] rounded-full" />
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center -space-x-1.5">
                                                {Object.keys(video.localizations || {})
                                                    .filter(l => ["draft", "processing"].includes(video.localizations?.[l]?.status || ''))
                                                    .slice(0, 6)
                                                    .map(lang => (
                                                        <div
                                                            key={lang}
                                                            className={`w-7 h-7 rounded-full border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-white'} bg-white/5 flex items-center justify-center shadow-lg relative z-0 hover:z-10 transition-all hover:scale-125 hover:-translate-y-1`}
                                                            title={LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}
                                                        >
                                                            <span className="text-lg">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                                            <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-white'} ${video.localizations?.[lang].status === 'draft' ? 'bg-olleey-yellow' : 'bg-blue-500 animate-pulse'}`} />
                                                        </div>
                                                    ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant={isReview ? "default" : "ghost"}
                                                size="sm"
                                                className={`h-8 px-4 text-[10px] font-bold transition-all ${isReview
                                                    ? 'bg-olleey-yellow text-black hover:bg-olleey-yellow/90 hover:scale-105 shadow-xl shadow-olleey-yellow/20'
                                                    : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`}`}
                                            >
                                                {isReview ? "Review now" : "Manage"}
                                                <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

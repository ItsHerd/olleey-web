"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Layers, ChevronRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReleasedMedia } from "./ReleasedMedia";
import { MediaGridSkeleton } from "./DashboardSkeletons";
import { motion } from "framer-motion";

interface ActiveDistributionsProps {
    videos: any[];
    videosLoading: boolean;
    getOverallVideoStatus: (localizations: any, videoId?: string) => string;
    onNavigate: (videoId: string) => void;
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    isDark: boolean;
    itemVariants: any;
}

export function ActiveDistributions({
    videos,
    videosLoading,
    getOverallVideoStatus,
    onNavigate,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    isDark,
    itemVariants
}: ActiveDistributionsProps) {
    const router = useRouter();
    const releasedVideos = videos.filter(v =>
        Object.values(v.localizations || {}).some((l: any) => l.status === "live")
    );

    console.log('[ActiveDistributions] Released videos:', {
        totalVideos: videos.length,
        releasedVideos: releasedVideos.length,
        sampleVideo: videos[0] ? {
            title: videos[0].title,
            localizations: videos[0].localizations
        } : null
    });

    return (
        <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4 min-h-[480px]"
        >
            <div className="flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className={`text-xl font-normal ${textClass} tracking-tight leading-none`}>Active Distributions</h3>
                        <p className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest opacity-40 mt-1`}>Validated releases</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/app?page=All Media')}
                    className={`h-9 px-4 text-[10px] ${isDark ? 'text-white/60' : 'text-gray-500'} font-black uppercase tracking-[0.2em] hover:text-emerald-400 ${isDark ? 'hover:bg-white/5' : 'hover:bg-emerald-50'} transition-all rounded-full group`}
                >
                    Explore All <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            <div className={`flex-1 rounded-[2.5rem] border ${borderClass} ${cardClass} shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col z-10 overflow-hidden relative backdrop-blur-md`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                <div className="flex-1 overflow-hidden">
                    {!videosLoading && releasedVideos.length === 0 ? (
                        <div className="flex flex-col h-full items-center justify-center opacity-25 p-12">
                            <div className={`w-16 h-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center mb-6`}>
                                <Target className={`w-8 h-8 opacity-20 ${isDark ? 'text-white' : 'text-black'}`} />
                            </div>
                            <p className={`text-xs ${textSecondaryClass} text-center font-black uppercase tracking-[0.2em] opacity-40`}>Grid optimized for live media</p>
                        </div>
                    ) : videosLoading ? (
                        <div className="p-4 h-full">
                            <MediaGridSkeleton isDark={isDark} borderClass={borderClass} />
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-y-auto custom-scrollbar">
                            <ReleasedMedia
                                filteredVideos={releasedVideos.slice(0, 4)}
                                textClass={textClass}
                                textSecondaryClass={textSecondaryClass}
                                cardClass="bg-transparent"
                                borderClass="border-none"
                                getOverallVideoStatus={getOverallVideoStatus}
                                onNavigate={onNavigate}
                                isDark={isDark}
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

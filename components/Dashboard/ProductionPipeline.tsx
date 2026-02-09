"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Activity, ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalizationStatus } from "@/lib/schema";
import { QueueAndReview } from "./QueueAndReview";
import { RowSkeleton } from "./DashboardSkeletons";
import { motion } from "framer-motion";

interface ProductionPipelineProps {
    videos: any[];
    videosLoading: boolean;
    jobs: any[];
    getOverallVideoStatus: (localizations: any, videoId?: string) => string;
    onNavigate: (videoId: string) => void;
    isDark: boolean;
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    itemVariants: any;
}

export function ProductionPipeline({
    videos,
    videosLoading,
    jobs,
    getOverallVideoStatus,
    onNavigate,
    isDark,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    itemVariants
}: ProductionPipelineProps) {
    const router = useRouter();
    const queueVideos = videos.filter(v => [LocalizationStatus.QUEUED, LocalizationStatus.DRAFT, LocalizationStatus.PROCESSING, LocalizationStatus.NOT_STARTED].includes(getOverallVideoStatus(v.localizations || {}, v.video_id) as LocalizationStatus));
    const processingCount = videos.filter(v => [LocalizationStatus.QUEUED, LocalizationStatus.PROCESSING].includes(getOverallVideoStatus(v.localizations || {}, v.video_id) as LocalizationStatus)).length;

    console.log('[ProductionPipeline] Queue videos:', {
        totalVideos: videos.length,
        queueVideos: queueVideos.length,
        sampleVideo: videos[0] ? {
            title: videos[0].title,
            localizations: videos[0].localizations,
            status: getOverallVideoStatus(videos[0].localizations || {}, videos[0].video_id)
        } : null
    });

    return (
        <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col gap-4 min-h-[480px]"
        >
            <div className="flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-olleey-yellow/10 rounded-2xl border border-olleey-yellow/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-olleey-yellow" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className={`text-xl font-normal ${textClass} tracking-tight leading-none`}>Production Pipeline</h3>
                        <p className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest opacity-40 mt-1`}>Real-time processing</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-olleey-yellow/5 rounded-full border border-olleey-yellow/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-olleey-yellow animate-pulse" />
                        <span className="text-[10px] font-black text-olleey-yellow uppercase tracking-widest italic">{processingCount} Processing</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/app?page=Workflows')}
                        className={`h-9 px-4 text-[10px] ${isDark ? 'text-white/60' : 'text-gray-600'} font-black uppercase tracking-[0.2em] hover:text-olleey-yellow ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-all rounded-full group`}
                    >
                        View Pipeline <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            <div className={`flex-1 rounded-[2.5rem] border ${borderClass} ${cardClass} flex flex-col z-10 overflow-hidden relative backdrop-blur-md`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div className="flex-1 overflow-hidden">
                    {!videosLoading && queueVideos.length === 0 ? (
                        <div className={`flex flex-col h-full items-center justify-center py-20 ${isDark ? 'bg-white/[0.01]' : 'bg-gray-50'} rounded-[2rem] border ${isDark ? 'border-white/5' : 'border-gray-200'} border-dashed m-4`}>
                            <LayoutGrid className={`h-8 w-8 ${isDark ? 'text-white/10' : 'text-gray-300'} mb-4`} />
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Pipeline Idle</p>
                        </div>
                    ) : videosLoading ? (
                        <RowSkeleton count={5} isDark={isDark} />
                    ) : (
                        <div className="w-full h-full">
                            <QueueAndReview
                                videosLoading={videosLoading}
                                filteredVideos={queueVideos.slice(0, 10)}
                                isDark={isDark}
                                textClass={textClass}
                                textSecondaryClass={textSecondaryClass}
                                cardClass="bg-transparent"
                                borderClass="border-none"
                                getOverallVideoStatus={getOverallVideoStatus}
                                onNavigate={onNavigate}
                                jobs={jobs}
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Zap, ArrowRight, ExternalLink, User, BarChart3, Clock, LayoutGrid, Layers, History, CheckCircle, Settings, Shield, Sparkles, TrendingUp, Target, Rocket, Activity, ChevronRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatViews } from "@/lib/utils";
import { QueueAndReview } from "./QueueAndReview";
import { ReleasedMedia } from "./ReleasedMedia";
import { ActivityFeed } from "./ActivityFeed";
import { motion } from "framer-motion";

interface GridDashboardProps {
    userName: string;
    userEmail: string;
    projects: any[];
    selectedProject: any;
    videos: any[];
    videosLoading: boolean;
    activities: any[];
    activitiesLoading: boolean;
    getOverallVideoStatus: (localizations: any) => string;
    isDark: boolean;
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    onNavigate: (videoId: string) => void;
    onCreateProject: () => void;
    totalVideos: number;
    totalTranslations: number;
}

export function GridDashboard({
    userName,
    userEmail,
    projects,
    selectedProject,
    videos,
    videosLoading,
    activities,
    activitiesLoading,
    getOverallVideoStatus,
    isDark,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    onNavigate,
    onCreateProject,
    totalVideos,
    totalTranslations
}: GridDashboardProps) {
    const router = useRouter();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    // Specialized Row-based Skeleton for lists/tables
    const RowSkeleton = ({ count = 5 }) => (
        <div className="flex flex-col w-full divide-y divide-white/[0.02]">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 w-full py-5 px-6 animate-pulse">
                    <div className={`w-20 h-11 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-xl shrink-0 border border-white/5 opacity-40`} />
                    <div className="flex-1 space-y-3 min-w-0">
                        <div className={`h-2.5 ${isDark ? "bg-white/20" : "bg-gray-300"} rounded-full w-1/4`} />
                        <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-full w-1/3 opacity-30`} />
                    </div>
                    <div className={`w-24 h-8 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded-full shrink-0 border border-white/5`} />
                </div>
            ))}
        </div>
    );

    // Specialized Video Grid Skeleton (9:14 aspect, 4 columns)
    const MediaGridSkeleton = () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full p-8">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex flex-col gap-4 p-5 border ${borderClass} bg-white/[0.03] rounded-3xl animate-pulse`}>
                    <div className={`aspect-video ${isDark ? "bg-white/10" : "bg-gray-100"} rounded-2xl w-full border border-white/5`} />
                    <div className="space-y-3 mt-auto border-t border-white/[0.04] pt-4">
                        <div className={`h-2.5 ${isDark ? "bg-white/20" : "bg-gray-300"} rounded-full w-3/4`} />
                        <div className="flex justify-between items-center">
                            <div className={`h-1.5 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-full w-1/3 opacity-30`} />
                            <div className={`w-6 h-6 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-full opacity-25`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full h-auto pb-20"
        >
            <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">

                {/* --- Row 1: Top Sections --- */}

                {/* 1. Profile Hero Card - Spans 2 cols (Left) */}
                <motion.div
                    variants={itemVariants}
                    className={`col-span-1 md:col-span-2 relative rounded-[2.5rem] overflow-hidden group border ${borderClass} shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col min-h-[480px] bg-[#0c0c0c]`}
                >
                    <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.4] group-hover:scale-110 transition-transform duration-[3000ms] ease-out"
                        alt="Hero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-olleey-yellow/10 via-transparent to-black/80" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_40%)]" />

                    <div className="relative flex-1 p-12 flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-olleey-yellow/10 backdrop-blur-2xl border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-[0.3em] text-olleey-yellow mb-10 shadow-[0_0_40px_rgba(251,191,36,0.1)] group-hover:bg-olleey-yellow/20 transition-all">
                                <Sparkles className="w-4 h-4 animate-pulse" /> Global Creative Command
                            </div>

                            <div className="space-y-2 mb-10">
                                <span className={`text-[12px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/30' : 'text-black/30'} flex items-center gap-3`}>
                                    <span className="w-4 h-[1px] bg-olleey-yellow/40" />
                                    Authorized Access
                                </span>
                                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white tracking-tighter leading-tight">
                                    {userName || "Creator"}
                                </h2>
                            </div>

                            {/* Stats Row with improved design */}
                            <div className="grid grid-cols-2 gap-12 mb-10 pt-10 border-t border-white/5">
                                <div className="flex flex-col group cursor-default">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-olleey-yellow/10 group-hover:border-olleey-yellow/20 transition-all">
                                            <LayoutGrid className="w-4 h-4 text-white/40 group-hover:text-olleey-yellow transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 group-hover:text-white/50 transition-colors">Digital Assets</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-normal text-white group-hover:text-olleey-yellow transition-colors duration-500 tracking-tighter">{totalVideos}</span>
                                        <span className="text-xs font-bold text-white/20 uppercase tracking-widest ml-1">Units</span>
                                    </div>
                                </div>

                                <div className="flex flex-col group cursor-default">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-olleey-yellow/5 flex items-center justify-center border border-olleey-yellow/10 group-hover:bg-olleey-yellow/20 group-hover:border-olleey-yellow/30 transition-all">
                                            <Rocket className="w-4 h-4 text-olleey-yellow/60 group-hover:text-olleey-yellow transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-olleey-yellow/40 group-hover:text-olleey-yellow transition-colors">Market Deployments</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-normal text-olleey-yellow group-hover:scale-105 transition-transform duration-500 tracking-tighter shadow-olleey-yellow/20 shadow-2xl">{totalTranslations}</span>
                                        <span className="text-xs font-bold text-olleey-yellow/20 uppercase tracking-widest ml-1">Live</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Action Row */}
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={onCreateProject}
                                className={`h-12 px-8 text-[11px] text-black font-black uppercase tracking-[0.2em] bg-olleey-yellow hover:bg-white hover:scale-105 active:scale-[0.98] transition-all rounded-full group shadow-[0_20px_40px_rgba(251,191,36,0.2)]`}
                            >
                                <Plus className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Start Workflow
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/app?page=All Media')}
                                className={`h-12 px-8 text-[11px] text-white font-black uppercase tracking-[0.2em] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all rounded-full group`}
                            >
                                <PlayCircle className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-100" /> Open Library
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Queue & Review Container */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-1 md:col-span-2 flex flex-col gap-4 min-h-[480px]"
                >
                    <div className="flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-olleey-yellow/10 rounded-2xl border border-olleey-yellow/20 flex items-center justify-center shadow-inner">
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
                                <span className="text-[10px] font-black text-olleey-yellow uppercase tracking-widest italic">{videos.filter(v => getOverallVideoStatus(v.localizations || {}) === 'processing').length} Processing</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/app?page=Workflows')}
                                className={`h-9 px-4 text-[10px] text-white/60 font-black uppercase tracking-[0.2em] hover:text-olleey-yellow hover:bg-white/5 transition-all rounded-full group`}
                            >
                                View Pipeline <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    <div className={`flex-1 rounded-[2.5rem] border ${borderClass} ${cardClass} shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col z-10 overflow-hidden relative backdrop-blur-md`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                        <div className="flex-1 overflow-hidden">
                            {(() => {
                                const queueVideos = videos.filter(v => ["draft", "processing"].includes(getOverallVideoStatus(v.localizations || {})));
                                if (!videosLoading && queueVideos.length === 0) {
                                    return (
                                        <div className="flex flex-col h-full items-center justify-center py-20 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed m-4">
                                            <LayoutGrid className="h-8 w-8 text-white/10 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Pipeline Idle</p>
                                        </div>
                                    );
                                }
                                if (videosLoading) {
                                    return <RowSkeleton count={5} />;
                                }
                                return (
                                    <div className="w-full h-full">
                                        <QueueAndReview
                                            videosLoading={videosLoading}
                                            filteredVideos={queueVideos.slice(0, 4)}
                                            isDark={isDark}
                                            textClass={textClass}
                                            textSecondaryClass={textSecondaryClass}
                                            cardClass="bg-transparent"
                                            borderClass="border-none"
                                            getOverallVideoStatus={getOverallVideoStatus}
                                            onNavigate={onNavigate}
                                        />
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </motion.div>

                {/* --- Row 2: Bottom Sections --- */}

                {/* 3. Released Media Container */}
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
                            className={`h-9 px-4 text-[10px] text-white/60 font-black uppercase tracking-[0.2em] hover:text-emerald-400 hover:bg-white/5 transition-all rounded-full group`}
                        >
                            Explore All <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className={`flex-1 rounded-[2.5rem] border ${borderClass} ${cardClass} shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col z-10 overflow-hidden relative backdrop-blur-md`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                        <div className="flex-1 overflow-hidden">
                            {(() => {
                                const releasedVideos = videos.filter(v =>
                                    Object.values(v.localizations || {}).some((l: any) => l.status === "live")
                                );
                                if (!videosLoading && releasedVideos.length === 0) {
                                    return (
                                        <div className="flex flex-col h-full items-center justify-center opacity-25 p-12">
                                            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                                                <Target className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className={`text-xs ${textSecondaryClass} text-center font-black uppercase tracking-[0.2em] opacity-40`}>Grid optimized for live media</p>
                                        </div>
                                    );
                                }
                                if (videosLoading) {
                                    return (
                                        <div className="p-4 h-full">
                                            <MediaGridSkeleton />
                                        </div>
                                    );
                                }
                                return (
                                    <div className="w-full h-full overflow-y-auto custom-scrollbar">
                                        <ReleasedMedia
                                            filteredVideos={releasedVideos.slice(0, 4)}
                                            textClass={textClass}
                                            textSecondaryClass={textSecondaryClass}
                                            cardClass="bg-transparent"
                                            borderClass="border-none"
                                            getOverallVideoStatus={getOverallVideoStatus}
                                            onNavigate={onNavigate}
                                        />
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </motion.div>

                {/* 4. Activity Feed Container */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4 min-h-[480px]"
                >
                    <div className="flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                                <History className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className={`text-xl font-normal ${textClass} tracking-tight leading-none`}>System Heartbeat</h3>
                                <p className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest opacity-40 mt-1`}>Audit trail</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-500/5 rounded-full border border-blue-500/10">
                                <BarChart3 className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">{activities.length} Events</span>
                            </div>
                        </div>
                    </div>

                    <div className={`flex-1 rounded-[2.5rem] border ${borderClass} ${cardClass} shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col z-10 overflow-hidden relative backdrop-blur-md`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.02] to-transparent pointer-events-none" />
                        <div className="flex-1 overflow-hidden">
                            {!activitiesLoading && activities.length === 0 ? (
                                <div className="flex flex-col h-full items-center justify-center opacity-30 p-12">
                                    <Activity className="w-8 h-8 opacity-20 mb-4" />
                                    <p className={`text-[10px] font-white text-blue-400 uppercase tracking-[0.2em]`}>Awaiting system interaction</p>
                                </div>
                            ) : activitiesLoading ? (
                                <div className="p-4 h-full">
                                    <RowSkeleton count={5} />
                                </div>
                            ) : (
                                <div className="w-full h-full overflow-y-auto custom-scrollbar">
                                    <ActivityFeed
                                        activitiesLoading={activitiesLoading}
                                        activities={activities.slice(0, 10)}
                                        textClass={textClass}
                                        textSecondaryClass={textSecondaryClass}
                                        cardClass="bg-transparent"
                                        borderClass="border-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
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
        </motion.div>
    );
}

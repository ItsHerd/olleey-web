"use client";

import React from "react";
import { Plus, Zap, ArrowRight, ExternalLink, User, BarChart3, Clock, LayoutGrid, Layers, History, CheckCircle, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatViews } from "@/lib/utils";
import { QueueAndReview } from "./QueueAndReview";
import { ReleasedMedia } from "./ReleasedMedia";
import { ActivityFeed } from "./ActivityFeed";

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
    // Specialized Row-based Skeleton for lists/tables
    const RowSkeleton = ({ count = 5 }) => (
        <div className="flex flex-col w-full divide-y divide-white/[0.02]">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 w-full py-4 px-6">
                    <div className={`w-16 h-10 ${isDark ? "bg-white/5" : "bg-gray-200"} rounded-none shrink-0 animate-pulse border border-white/5 opacity-40`} />
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className={`h-2.5 ${isDark ? "bg-white/10" : "bg-gray-300"} rounded-none w-1/4 animate-pulse`} />
                        <div className={`h-1.5 ${isDark ? "bg-white/5" : "bg-gray-200"} rounded-none w-1/3 animate-pulse opacity-30`} />
                    </div>
                    <div className={`w-20 h-7 ${isDark ? "bg-white/5" : "bg-gray-100"} rounded-none shrink-0 animate-pulse border border-white/5`} />
                </div>
            ))}
        </div>
    );

    // Specialized Video Grid Skeleton (9:14 aspect, 4 columns)
    const MediaGridSkeleton = () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full p-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex flex-col gap-3 p-4 border ${borderClass} bg-white/5 rounded-none animate-pulse`}>
                    <div className={`aspect-video xl:aspect-[9/14] ${isDark ? "bg-white/5" : "bg-gray-100"} rounded-none w-full border border-white/5`} />
                    <div className="space-y-2 mt-auto border-t border-white/[0.04] pt-3">
                        <div className={`h-2.5 ${isDark ? "bg-white/10" : "bg-gray-300"} rounded-none w-3/4`} />
                        <div className="flex justify-between items-center">
                            <div className={`h-1.5 ${isDark ? "bg-white/5" : "bg-gray-200"} rounded-none w-1/3 opacity-30`} />
                            <div className={`w-5 h-5 ${isDark ? "bg-white/10" : "bg-gray-200"} rounded-full opacity-25`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full h-auto pt-1 pb-20">
            <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6 relative">

                {/* --- Row 1: Top Sections --- */}

                {/* 1. Profile Hero Card - Spans 2 cols (Left) */}
                <div className="col-span-1 md:col-span-2 relative rounded-none overflow-hidden group border border-white/5 shadow-2xl flex flex-col min-h-[400px] bg-black/20">
                    <img
                        src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-1000"
                        alt="Hero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    <div className="relative flex-1 p-10 flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-olleey-yellow/20 backdrop-blur-md border border-olleey-yellow/30 text-[11px] font-black uppercase tracking-widest text-olleey-yellow mb-8 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                                <User className="w-4 h-4" /> Professional Tier
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-normal text-white tracking-tighter mb-4 leading-none">
                                {userName || "Creator"}
                            </h2>

                            {/* Stats Row */}
                            <div className="flex items-center gap-8 mb-8 pb-8 border-b border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Total Assets</span>
                                    <span className="text-3xl font-normal text-white">{totalVideos}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-olleey-yellow/40 mb-1">Distributions</span>
                                    <span className="text-3xl font-normal text-olleey-yellow">{totalTranslations}</span>
                                </div>
                            </div>

                            {/* Quick Links Row */}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={onCreateProject}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-4 text-[10px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-none"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-2" /> New Project
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onNavigate('Settings')}
                                    className="h-8 px-4 text-[10px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-none"
                                >
                                    <Settings className="w-3.5 h-3.5 mr-2" /> Settings
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onNavigate('Guardrails')}
                                    className="h-8 px-4 text-[10px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-none"
                                >
                                    <Shield className="w-3.5 h-3.5 mr-2" /> Guardrails
                                </Button>
                            </div>
                        </div>


                    </div>
                </div>

                {/* 2. Queue & Review Container */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className={`text-lg md:text-xl lg:text-2xl font-300 ${textClass} tracking-tight`}>Queue & Review</h3>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-olleey-yellow/10 rounded-none border border-olleey-yellow/20">
                                <div className="w-2.5 h-2.5 rounded-full bg-olleey-yellow animate-pulse" />
                                <span className="text-[11px] font-black text-olleey-yellow uppercase tracking-widest">Active Jobs</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-5 text-[11px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-none"
                            >
                                Full Queue
                            </Button>
                        </div>
                    </div>

                    <div className={`rounded-none border ${borderClass} ${cardClass} shadow-2xl overflow-hidden flex flex-col min-h-[350px] z-10`}>
                        <div className="flex-1">
                            {!videosLoading && (videos.length === 0 || !videos.some(v => ["draft", "processing"].includes(getOverallVideoStatus(v.localizations || {})))) ? (
                                <div className="flex flex-col h-full opacity-30">
                                    <RowSkeleton />
                                </div>
                            ) : videosLoading ? (
                                <RowSkeleton />
                            ) : (
                                <div className="h-full">
                                    <QueueAndReview
                                        videosLoading={videosLoading}
                                        filteredVideos={videos.slice(0, 4)}
                                        isDark={isDark}
                                        textClass={textClass}
                                        textSecondaryClass={textSecondaryClass}
                                        cardClass="bg-transparent"
                                        borderClass="border-none"
                                        getOverallVideoStatus={getOverallVideoStatus}
                                        onNavigate={onNavigate}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Row 2: Bottom Sections --- */}

                {/* 3. Released Media Container */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className={`text-lg md:text-xl lg:text-2xl font-300 ${textClass} tracking-tight`}>Released Media</h3>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-5 text-[11px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-none"
                            >
                                Studio Library
                            </Button>
                        </div>
                    </div>

                    <div className={`rounded-none border ${borderClass} ${cardClass} shadow-2xl overflow-hidden flex flex-col min-h-[400px] z-10`}>
                        <div className="flex-1">
                            {!videosLoading && (videos.length === 0 || !videos.some(v => getOverallVideoStatus(v.localizations || {}) === "live")) ? (
                                <div className="flex flex-col h-full opacity-25">
                                    <MediaGridSkeleton />
                                </div>
                            ) : videosLoading ? (
                                <MediaGridSkeleton />
                            ) : (
                                <ReleasedMedia
                                    filteredVideos={videos.slice(0, 4)}
                                    textClass={textClass}
                                    textSecondaryClass={textSecondaryClass}
                                    cardClass="bg-transparent"
                                    borderClass="border-none"
                                    getOverallVideoStatus={getOverallVideoStatus}
                                    onNavigate={onNavigate}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Activity Feed Container */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className={`text-lg md:text-xl lg:text-2xl font-300 ${textClass} tracking-tight`}>Activity Feed</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-5 text-[11px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-none"
                        >
                            View Logs
                        </Button>
                    </div>

                    <div className={`rounded-none border ${borderClass} ${cardClass} shadow-2xl overflow-hidden flex flex-col min-h-[400px] z-10`}>
                        <div className="flex-1">
                            {!activitiesLoading && activities.length === 0 ? (
                                <div className="flex flex-col h-full opacity-30">
                                    <RowSkeleton />
                                </div>
                            ) : activitiesLoading ? (
                                <RowSkeleton />
                            ) : (
                                <ActivityFeed
                                    activitiesLoading={activitiesLoading}
                                    activities={activities.slice(0, 4)}
                                    textClass={textClass}
                                    textSecondaryClass={textSecondaryClass}
                                    cardClass="bg-transparent"
                                    borderClass="border-none"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles to make sub-components fit better in grid */}
            <style jsx global>{`
                .dashboard-grid section {
                    padding: 1.5rem !important;
                }
                @media (min-width: 768px) {
                    .dashboard-grid section {
                        padding: 1.5rem !important;
                    }
                }
                .dashboard-grid section > div:first-child {
                    display: none !important;
                }
                .dashboard-grid table {
                    font-size: 0.9rem;
                }
                @media (min-width: 1024px) {
                    .dashboard-grid table {
                        font-size: 1.1rem;
                    }
                }
                .dashboard-grid td, .dashboard-grid th {
                    padding: 0.75rem 1rem !important;
                }
                @media (min-width: 768px) {
                    .dashboard-grid td, .dashboard-grid th {
                        padding: 1.5rem 2rem !important;
                    }
                }
                .dashboard-grid th {
                    font-size: 0.7rem !important;
                    font-weight: 900 !important;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                @media (min-width: 768px) {
                    .dashboard-grid th {
                        font-size: 0.85rem !important;
                    }
                }
                .dashboard-grid .aspect-video {
                    width: 5rem !important;
                }
                @media (min-width: 768px) {
                    .dashboard-grid .aspect-video {
                        width: 7rem !important;
                    }
                }
                .dashboard-grid h4 {
                    font-size: 1rem !important;
                    font-weight: 900 !important;
                    letter-spacing: -0.02em;
                }
                @media (min-width: 768px) {
                    .dashboard-grid h4 {
                        font-size: 1.5rem !important;
                    }
                }
                .dashboard-grid p {
                    font-size: 0.9rem !important;
                }
                @media (min-width: 1024px) {
                    .dashboard-grid p {
                        font-size: 1.1rem !important;
                    }
                }
                /* Ensure tables don't break layout on narrow windows */
                .dashboard-grid .overflow-y-auto, .dashboard-grid .overflow-hidden {
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
}

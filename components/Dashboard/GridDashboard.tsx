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
    // Generic Skeleton
    const CardSkeleton = () => (
        <div className="flex flex-col gap-4 w-full h-full">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-6 w-full">
                    <div className="w-16 h-10 bg-white/5 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-3">
                        <div className="h-3 bg-white/10 rounded-full w-1/3" />
                        <div className="h-2 bg-white/5 rounded-full w-1/2" />
                    </div>
                    <div className="w-24 h-8 bg-white/5 rounded-full shrink-0" />
                </div>
            ))}
        </div>
    );

    // Specialized Video Grid Skeleton (9:14 aspect, 4 columns)
    const MediaGridSkeleton = () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full h-full">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-3 h-full">
                    <div className="aspect-[9/14] bg-white/5 rounded-2xl w-full border border-white/5" />
                    <div className="space-y-2 mt-2 px-1">
                        <div className="h-3 bg-white/10 rounded-full w-3/4" />
                        <div className="h-2 bg-white/5 rounded-full w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="h-full w-full flex flex-col pt-1">
            <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-[auto_1fr_auto_1fr] gap-x-5 gap-y-4 h-full overflow-hidden">

                {/* --- Row 1 & 2: Top Sections --- */}

                {/* 1. Profile Hero Card - Spans 2 cols, 2 rows (Left) */}
                <div className="col-span-1 md:col-span-2 row-start-1 row-end-3 relative rounded-3xl overflow-hidden group border border-white/5 shadow-2xl flex flex-col h-full bg-black/20">
                    <img
                        src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-1000"
                        alt="Hero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    <div className="relative flex-1 p-10 flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olleey-yellow/20 backdrop-blur-md border border-olleey-yellow/30 text-[11px] font-black uppercase tracking-widest text-olleey-yellow mb-8 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
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
                                <Button variant="ghost" size="sm" className="h-8 px-4 text-[10px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-full">
                                    <Plus className="w-3.5 h-3.5 mr-2" /> New Project
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onNavigate('Settings')}
                                    className="h-8 px-4 text-[10px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-full"
                                >
                                    <Settings className="w-3.5 h-3.5 mr-2" /> Settings
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onNavigate('Guardrails')}
                                    className="h-8 px-4 text-[10px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-full"
                                >
                                    <Shield className="w-3.5 h-3.5 mr-2" /> Guardrails
                                </Button>
                            </div>
                        </div>


                    </div>
                </div>

                {/* 2. Queue & Review TITLE */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-between px-2 pt-1">
                    <h3 className={`text-lg md:text-xl lg:text-2xl font-300 ${textClass} tracking-tight`}>Queue & Review</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-olleey-yellow/10 rounded-full border border-olleey-yellow/20">
                            <div className="w-2.5 h-2.5 rounded-full bg-olleey-yellow animate-pulse" />
                            <span className="text-[11px] font-black text-olleey-yellow uppercase tracking-widest">Active Jobs</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-5 text-[11px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-full"
                        >
                            Full Queue
                        </Button>
                    </div>
                </div>

                {/* 2. Queue & Review CARD */}
                <div className={`col-span-1 md:col-span-2 row-start-2 row-end-3 rounded-[2rem] border ${borderClass} ${cardClass} shadow-2xl overflow-hidden flex flex-col h-full`}>
                    <div className="flex-1 overflow-hidden">
                        {!videosLoading && (videos.length === 0 || !videos.some(v => ["draft", "processing"].includes(getOverallVideoStatus(v.localizations || {})))) ? (
                            <div className="flex flex-col h-full">
                                <div className="p-8 pb-4">
                                    <p className={`text-xs font-bold uppercase tracking-widest ${textSecondaryClass} opacity-30`}>Queue empty • Awaiting new processing jobs</p>
                                </div>
                                <div className="flex-1 opacity-20 px-8 pb-8">
                                    <CardSkeleton />
                                </div>
                            </div>
                        ) : videosLoading ? (
                            <CardSkeleton />
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

                {/* --- Row 3 & 4: Bottom Sections --- */}

                {/* 3. Released Media TITLE */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-between px-2 pt-3">
                    <h3 className={`text-lg md:text-xl lg:text-2xl font-300 ${textClass} tracking-tight`}>Released Media</h3>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-5 text-[11px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-full"
                        >
                            Archive View
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-5 text-[11px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-full"
                        >
                            Studio Library
                        </Button>
                    </div>
                </div>

                {/* 4. Activity Feed TITLE */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-between px-2 pt-3">
                    <h3 className={`text-lg md:text-xl lg:text-2xl font-300 ${textClass} tracking-tight`}>Activity Feed</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-5 text-[11px] text-white font-black uppercase tracking-widest bg-white/5 border border-white/20 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow transition-all rounded-full"
                    >
                        View Logs
                    </Button>
                </div>

                {/* 3. Released Media CARD */}
                <div className={`col-span-1 md:col-span-2 row-start-4 row-end-5 rounded-[2rem] border ${borderClass} ${cardClass} shadow-2xl overflow-hidden flex flex-col h-full`}>
                    <div className="flex-1 overflow-hidden">
                        {!videosLoading && (videos.length === 0 || !videos.some(v => getOverallVideoStatus(v.localizations || {}) === "live")) ? (
                            <div className="flex flex-col h-full">
                                <div className="p-8 pb-4">
                                    <p className={`text-xs font-bold uppercase tracking-widest ${textSecondaryClass} opacity-30`}>Library empty • Archive and released media will appear here</p>
                                </div>
                                <div className="flex-1 opacity-20 px-8 pb-8">
                                    <MediaGridSkeleton />
                                </div>
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

                {/* 4. Activity Feed CARD */}
                <div className={`col-span-1 md:col-span-2 row-start-4 row-end-5 rounded-[2rem] border ${borderClass} ${cardClass} shadow-2xl overflow-hidden flex flex-col h-full`}>
                    <div className="flex-1 overflow-hidden">
                        {!activitiesLoading && activities.length === 0 ? (
                            <div className="flex flex-col h-full">
                                <div className="p-8 pb-4">
                                    <p className={`text-xs font-bold uppercase tracking-widest ${textSecondaryClass} opacity-30`}>Feed empty • System activity logs will appear here</p>
                                </div>
                                <div className="flex-1 opacity-20 px-8 pb-8">
                                    <CardSkeleton />
                                </div>
                            </div>
                        ) : activitiesLoading ? (
                            <CardSkeleton />
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

            {/* Custom Styles to make sub-components fit better in grid */}
            <style jsx global>{`
                .dashboard-grid section {
                    padding: 1rem !important;
                }
                @media (min-width: 768px) {
                    .dashboard-grid section {
                        padding: 2rem !important;
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

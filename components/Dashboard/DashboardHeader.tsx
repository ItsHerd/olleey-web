"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, ArrowLeft, ChevronRight, LayoutGrid, TrendingUp, Sparkles } from "lucide-react";

interface DashboardHeaderProps {
    textClass: string;
    textSecondaryClass: string;
    isDark: boolean;
    videosLoading: boolean;
    showManualProcessView: boolean;
    refetchVideos: () => void;
    setShowManualProcessView: (show: boolean) => void;
    totalVideos: number;
    totalTranslations: number;
    userName?: string | null;
}

export function DashboardHeader({
    textClass,
    textSecondaryClass,
    isDark,
    videosLoading,
    showManualProcessView,
    refetchVideos,
    setShowManualProcessView,
    totalVideos,
    totalTranslations,
    userName
}: DashboardHeaderProps) {
    return (
        <div className={`flex-shrink-0 px-0 pt-6 pb-6`}>
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                    {showManualProcessView && (
                        <div className="flex-shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowManualProcessView(false)}
                                className={`h-11 px-4 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-black hover:bg-gray-100'} transition-all rounded-none group shadow-xl`}
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        {!showManualProcessView ? (
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="p-1.5 bg-olleey-yellow/10 rounded-sm border border-olleey-yellow/20">
                                            <Sparkles className="w-3.5 h-3.5 text-olleey-yellow" />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-olleey-yellow/60' : 'text-olleey-yellow'}`}>Universal Pipeline</span>
                                    </div>
                                    <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal ${textClass} tracking-tighter leading-none`}>
                                        Welcome back, <span className="font-bold">{userName?.split(' ')[0] || 'Creator'}</span>
                                    </h1>
                                    <p className={`text-xs sm:text-sm ${textSecondaryClass} opacity-60 font-medium`}>
                                        Synthesized metrics for <span className={textClass}>Global Distribution</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end group cursor-default">
                                        <div className="flex items-center gap-2 mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <LayoutGrid className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Assets</span>
                                        </div>
                                        <span className={`text-xl font-bold ${textClass} tracking-tighter`}>{totalVideos}</span>
                                    </div>
                                    <div className={`w-px h-8 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                                    <div className="flex flex-col items-end group cursor-default">
                                        <div className="flex items-center gap-2 mb-1 text-olleey-yellow/60 group-hover:text-olleey-yellow transition-colors">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
                                        </div>
                                        <span className="text-xl font-bold text-olleey-yellow tracking-tighter">{totalTranslations}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-300 ${textClass} truncate uppercase tracking-widest`}>
                                    Manual Process Pipeline
                                </h1>
                                <p className={`text-xs sm:text-sm md:text-base ${textSecondaryClass} truncate uppercase tracking-tight opacity-60`}>
                                    Configure source and distribution settings for manual dubbing.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

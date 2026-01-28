"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, ArrowLeft } from "lucide-react";

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
        <div className={`flex-shrink-0 px-0 pt-5 pb-0`}>
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        {!showManualProcessView ? (
                            <div>
                                <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal ${textClass} mb-1 sm:mb-2 truncate`}>
                                    Welcome back, {userName?.split(' ')[0] || 'Creator'}
                                </h1>
                                <p className={`text-xs sm:text-sm md:text-base ${textSecondaryClass} truncate`}>
                                    Manage your personal work and videos.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-300 ${textClass} mb-1 sm:mb-2 truncate uppercase tracking-widest`}>
                                    Manual Process Pipeline
                                </h1>
                                <p className={`text-xs sm:text-sm md:text-base ${textSecondaryClass} truncate uppercase tracking-tight opacity-60`}>
                                    Configure source and distribution settings for manual dubbing.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {showManualProcessView && (
                            <Button
                                onClick={() => setShowManualProcessView(false)}
                                className={`h-11 px-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-none hover:bg-white/10 transition-all mr-2`}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Exit Manual Mode
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={refetchVideos}
                            disabled={videosLoading}
                            className={`h-11 w-11 rounded-none ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-gray-200'}`}
                            title="Refresh"
                        >
                            <RefreshCw className={`h-5 w-5 ${videosLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, ArrowLeft, ChevronRight } from "lucide-react";

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
                <div className="flex items-center gap-4 sm:gap-6">
                    {showManualProcessView && (
                        <div className="flex-shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowManualProcessView(false)}
                                className={`h-11 px-4 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-none group`}
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}

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

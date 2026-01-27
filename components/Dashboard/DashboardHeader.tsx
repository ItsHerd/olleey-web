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
    totalTranslations
}: DashboardHeaderProps) {
    return (
        <div className={`flex-shrink-0 px-0 py-3 sm:py-4 md:py-6`}>
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal ${textClass} mb-1 sm:mb-2 truncate`}>
                            Dashboard
                        </h1>
                        <p className={`text-xs sm:text-sm md:text-base ${textSecondaryClass} truncate`}>
                            Manage your videos and track translation progress across languages
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={refetchVideos}
                            disabled={videosLoading}
                            className={`h-10 w-10 ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200'}`}
                            title="Refresh"
                        >
                            <RefreshCw className={`h-5 w-5 ${videosLoading ? "animate-spin" : ""}`} />
                        </Button>
                        <Button
                            onClick={() => setShowManualProcessView(!showManualProcessView)}
                            className={`gap-2 h-10 px-4 transition-all duration-300 ${showManualProcessView
                                ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black')
                                : 'bg-olleey-yellow text-black font-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                                }`}
                        >
                            {showManualProcessView ? (
                                <>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Dashboard
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4" />
                                    Start Manual Process
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className={`flex items-center gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm ${textSecondaryClass} flex-shrink-0 flex-wrap ml-auto`}>
                    <span className="whitespace-nowrap">Total Videos: <strong className={`${textClass}`}>{totalVideos}</strong></span>
                    <span className="whitespace-nowrap">Translations: <strong className="text-indigo-400">
                        {totalTranslations}
                    </strong></span>
                </div>
            </div>
        </div>
    );
}

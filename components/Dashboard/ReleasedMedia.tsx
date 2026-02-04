"use client";

import React from "react";
import { CheckCircle, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { formatViews, getRelativeTime } from "@/lib/utils";

interface ReleasedMediaProps {
    filteredVideos: any[];
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    getOverallVideoStatus: (localizations: any) => string;
    onNavigate: (videoId: string) => void;
}

export function ReleasedMedia({
    filteredVideos,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    getOverallVideoStatus,
    onNavigate
}: ReleasedMediaProps) {
    const liveVideos = filteredVideos.filter(v => {
        const status = getOverallVideoStatus(v.localizations || {});
        console.log('[ReleasedMedia]', v.title, 'status:', status, 'localizations:', v.localizations);
        return status === "live";
    });

    return (
        <section>
            {liveVideos.length === 0 ? (
                <div className={`${cardClass} border border-dashed ${borderClass} rounded-none p-12 text-center shadow-inner`}>
                    <p className={`text-sm font-medium ${textSecondaryClass}`}>Your completed productions will be showcased here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {liveVideos.slice(0, 8).map((video) => {
                        const liveLangs = Object.keys(video.localizations || {})
                            .filter(l => video.localizations?.[l].status === 'live');
                        
                        return (
                            <div
                                key={video.video_id}
                                onClick={() => onNavigate(video.video_id)}
                                className={`${cardClass} border ${borderClass} rounded-sm p-3 flex flex-col gap-3 cursor-pointer hover:border-olleey-yellow/40 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-olleey-yellow/5 group relative overflow-hidden`}
                            >
                                <div className="w-full aspect-video rounded-sm bg-gray-900 shrink-0 overflow-hidden shadow-md relative border border-white/5">
                                    <img src={video.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute top-2 right-2">
                                        <div className="px-1.5 py-0.5 bg-green-500/90 backdrop-blur-sm rounded-sm flex items-center gap-1">
                                            <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
                                            <span className="text-[8px] font-black text-white uppercase">
                                                Live
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h4 className={`text-[11px] font-bold ${textClass} truncate group-hover:text-olleey-yellow transition-colors`}>
                                        {video.title}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {liveLangs.slice(0, 3).map(lang => (
                                                <div key={lang} className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-sm" title={LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}>
                                                    <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                                </div>
                                            ))}
                                            {liveLangs.length > 3 && (
                                                <span className={`text-[8px] font-bold ${textSecondaryClass} ml-0.5`}>
                                                    +{liveLangs.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-[8px] font-bold ${textSecondaryClass} uppercase`}>
                                            {getRelativeTime(video.published_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

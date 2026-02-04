"use client";

import React from "react";
import { CheckCircle, Radio, Layers } from "lucide-react";
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
    const liveVideos = filteredVideos.filter(v =>
        Object.values(v.localizations || {}).some((l: any) => l.status === "live")
    );

    return (
        <section>
            {liveVideos.length === 0 ? (
                <div className={`${cardClass} border border-white/5 rounded-none p-16 text-center shadow-2xl relative overflow-hidden bg-black/20 group`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-olleey-yellow/5 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-none bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6 shadow-xl group-hover:border-olleey-yellow/30 transition-colors duration-500">
                            <Layers className="w-8 h-8 text-white/20 stroke-[1px]" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Production Archive Empty</h4>
                        <p className="text-xs font-light text-white/20 max-w-[200px] leading-relaxed">
                            Once your translations are published, they will appear in this operational hub.
                        </p>
                    </div>
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

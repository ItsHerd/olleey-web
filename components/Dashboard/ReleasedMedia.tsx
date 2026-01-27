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
    const liveVideos = filteredVideos.filter(v =>
        getOverallVideoStatus(v.localizations || {}) === "live"
    );

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-2xl shadow-sm border border-green-500/20">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-300 ${textClass} tracking-tight`}>Released Media</h2>
                        <p className={`text-[11px] ${textSecondaryClass} font-medium`}>Recently published global distribution</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className={`h-10 px-6 text-[11px] font-black uppercase tracking-widest ${textSecondaryClass} hover:${textClass} hover:bg-white/5`}>
                    View All Media
                </Button>
            </div>

            {liveVideos.length === 0 ? (
                <div className={`${cardClass} border border-dashed ${borderClass} rounded-3xl p-16 text-center shadow-inner`}>
                    <p className={`text-sm font-medium ${textSecondaryClass}`}>Your completed productions will be showcased here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {liveVideos.slice(0, 6).map((video) => (
                        <div
                            key={video.video_id}
                            onClick={() => onNavigate(video.video_id)}
                            className={`${cardClass} border ${borderClass} rounded-3xl p-6 flex flex-col gap-5 cursor-pointer hover:border-olleey-yellow/40 transition-all hover:translate-y-[-6px] hover:shadow-2xl hover:shadow-olleey-yellow/5 group relative overflow-hidden`}
                        >
                            <div className="w-full aspect-video rounded-2xl bg-gray-900 shrink-0 overflow-hidden shadow-xl relative border border-white/5">
                                <img src={video.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt="" />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent transition-opacity" />
                                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                                    <Radio className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-tighter">
                                        {formatViews(video.global_views)} Global Views
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-lg font-bold ${textClass} truncate mb-3 group-hover:text-olleey-yellow transition-colors`}>{video.title}</h4>
                                <div className="flex items-center justify-between border-t border-white/[0.04] pt-5 mt-2">
                                    <div className="flex items-center gap-2.5">
                                        {Object.keys(video.localizations || {})
                                            .filter(l => video.localizations?.[l].status === 'live')
                                            .slice(0, 5)
                                            .map(lang => (
                                                <div key={lang} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg hover:scale-125 hover:-translate-y-1 transition-all" title={lang}>
                                                    <span className="text-lg">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                                </div>
                                            ))}
                                    </div>
                                    <span className={`text-[10px] font-black ${textSecondaryClass} uppercase tracking-tighter`}>{getRelativeTime(video.published_at)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

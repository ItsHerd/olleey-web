"use client";

import React from "react";
import { Layers } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { getRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";

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
    onNavigate
}: ReleasedMediaProps) {
    const liveVideos = filteredVideos.filter(v =>
        Object.values(v.localizations || {}).some((l: any) => l.status === "live")
    );

    return (
        <div className="p-4">
            {liveVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed">
                    <Layers className="h-8 w-8 text-white/10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Archive Offline</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {liveVideos.slice(0, 8).map((video, idx) => {
                        const liveLangs = Object.keys(video.localizations || {})
                            .filter(l => video.localizations?.[l].status === 'live');

                        return (
                            <motion.div
                                key={`${video.video_id}-${idx}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => onNavigate(video.video_id)}
                                className="group relative bg-white/[0.03] border border-white/5 rounded-3xl p-3 cursor-pointer hover:bg-white/[0.06] hover:border-white/10 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 overflow-hidden"
                            >
                                {/* Active Broadcast Indication */}
                                <div className="absolute top-0 right-0 p-4 z-20">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>

                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5 mb-3 group-hover:scale-[1.02] transition-transform duration-500">
                                    <img
                                        src={video.thumbnail_url}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] italic">Module::Distribution</span>
                                        <h4 className={`text-[11px] font-bold text-white truncate leading-none group-hover:text-olleey-yellow transition-colors`}>
                                            {video.title}
                                        </h4>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center -space-x-1.5">
                                            {liveLangs.slice(0, 3).map((lang, lIdx) => (
                                                <div
                                                    key={lang}
                                                    className="w-5 h-5 rounded-full bg-white/5 border border-[#0c0c0c] flex items-center justify-center shadow-sm relative group/flag hover:z-10 hover:scale-110 transition-transform"
                                                    style={{ zIndex: 10 - lIdx }}
                                                >
                                                    <span className="text-[10px]">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag}</span>
                                                </div>
                                            ))}
                                            {liveLangs.length > 3 && (
                                                <div className="w-5 h-5 rounded-full bg-white/5 border border-[#0c0c0c] flex items-center justify-center z-0">
                                                    <span className="text-[7px] font-black text-white/40">+{liveLangs.length - 3}</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">
                                            {getRelativeTime(video.published_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-olleey-yellow/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DistributionNodesProps {
    channels: any[];
    textClass: string;
    textSecondaryClass: string;
    cardClass: string;
    borderClass: string;
    itemVariants: any;
}

export function DistributionNodes({
    channels,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    itemVariants
}: DistributionNodesProps) {
    const router = useRouter();

    return (
        <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-4 flex flex-col gap-4"
        >
            <div className="flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className={`text-xl font-normal ${textClass} tracking-tight leading-none`}>Distribution Nodes</h3>
                        <p className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest opacity-40 mt-1`}>Network architecture</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/app?page=Channels')}
                    className={`h-9 px-4 text-[10px] text-white/60 font-black uppercase tracking-[0.2em] hover:text-indigo-400 hover:bg-white/5 transition-all rounded-full group`}
                >
                    Manage Grid <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4`}>
                {channels.map((channel, idx) => (
                    <motion.div
                        key={channel.id || idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-6 rounded-[2rem] border ${borderClass} ${cardClass} backdrop-blur-3xl group hover:border-indigo-500/30 transition-all cursor-pointer`}
                        onClick={() => router.push(`/app?page=Channels&channel_id=${channel.channel_id}`)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <img
                                    src={channel.channel_avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${channel.channel_name}`}
                                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                                    alt={channel.channel_name}
                                />
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0c0c0c] ${channel.status?.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'} shadow-lg`} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{channel.channel_name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">{channel.language_name || channel.language_code}</span>
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">•</span>
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{channel.videos_count || 0} Assets</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {channels.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-20 border border-dashed border-white/10 rounded-[2rem]">
                        <Globe className="w-8 h-8 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No satellites deployed</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, LayoutGrid, Rocket, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ProfileHeroCardProps {
    userName: string;
    totalVideos: number;
    totalTranslations: number;
    isDark: boolean;
    onCreateProject: () => void;
    itemVariants: any;
}

export function ProfileHeroCard({
    userName,
    totalVideos,
    totalTranslations,
    isDark,
    onCreateProject,
    itemVariants
}: ProfileHeroCardProps) {
    const router = useRouter();

    return (
        <motion.div
            variants={itemVariants}
            className={`col-span-1 md:col-span-2 relative rounded-[2.5rem] overflow-hidden group border border-white/[0.08] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col min-h-[480px] bg-[#0c0c0c]`}
        >
            <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.4] group-hover:scale-110 transition-transform duration-[3000ms] ease-out"
                alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-olleey-yellow/10 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_40%)]" />

            <div className="relative flex-1 p-12 flex flex-col justify-between">
                <div>
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-olleey-yellow/10 backdrop-blur-2xl border border-olleey-yellow/20 text-[10px] font-black uppercase tracking-[0.3em] text-olleey-yellow mb-10 shadow-[0_0_40px_rgba(251,191,36,0.1)] group-hover:bg-olleey-yellow/20 transition-all">
                        <Sparkles className="w-4 h-4 animate-pulse" /> Global Creative Command
                    </div>

                    <div className="space-y-2 mb-10">
                        <span className={`text-[12px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/30' : 'text-black/30'} flex items-center gap-3`}>
                            <span className="w-4 h-[1px] bg-olleey-yellow/40" />
                            Authorized Access
                        </span>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white tracking-tighter leading-tight">
                            {userName || "Creator"}
                        </h2>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-12 mb-10 pt-10 border-t border-white/5">
                        <div className="flex flex-col group cursor-default">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-olleey-yellow/10 group-hover:border-olleey-yellow/20 transition-all">
                                    <LayoutGrid className="w-4 h-4 text-white/40 group-hover:text-olleey-yellow transition-colors" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 group-hover:text-white/50 transition-colors">Digital Assets</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-normal text-white group-hover:text-olleey-yellow transition-colors duration-500 tracking-tighter">{totalVideos}</span>
                                <span className="text-xs font-bold text-white/20 uppercase tracking-widest ml-1">Units</span>
                            </div>
                        </div>

                        <div className="flex flex-col group cursor-default">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-olleey-yellow/5 flex items-center justify-center border border-olleey-yellow/10 group-hover:bg-olleey-yellow/20 group-hover:border-olleey-yellow/30 transition-all">
                                    <Rocket className="w-4 h-4 text-olleey-yellow/60 group-hover:text-olleey-yellow transition-colors" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-olleey-yellow/40 group-hover:text-olleey-yellow transition-colors">Market Deployments</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-normal text-olleey-yellow group-hover:scale-105 transition-transform duration-500 tracking-tighter shadow-olleey-yellow/20 shadow-2xl">{totalTranslations}</span>
                                <span className="text-xs font-bold text-olleey-yellow/20 uppercase tracking-widest ml-1">Live</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={onCreateProject}
                        className={`h-12 px-8 text-[11px] text-black font-black uppercase tracking-[0.2em] bg-olleey-yellow hover:bg-white hover:scale-105 active:scale-[0.98] transition-all rounded-full group shadow-[0_20px_40px_rgba(251,191,36,0.2)]`}
                    >
                        <Plus className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Start Workflow
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/app?page=All Media')}
                        className={`h-12 px-8 text-[11px] text-white font-black uppercase tracking-[0.2em] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all rounded-full group`}
                    >
                        <PlayCircle className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-100" /> Open Library
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

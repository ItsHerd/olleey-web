"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Globe, Target, BarChart3, ArrowRight, RefreshCw,
    ShieldCheck, Plus, ExternalLink, Play, Pause, Search,
    Filter, MoreHorizontal, DollarSign, Users, MousePointer2,
    Calendar, CheckCircle2, AlertCircle, Info
} from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DETECTED_SEGMENTS = [
    { id: 1, type: "content", start: "00:00", end: "01:20", label: "Intro & Hook", status: "safe" },
    { id: 2, type: "sponsor", start: "01:20", end: "01:50", label: "Detected: NordVPN", status: "detected" },
    { id: 3, type: "content", start: "01:50", end: "04:30", label: "Main Topic Part 1", status: "safe" },
    { id: 4, type: "sponsor", start: "04:30", end: "05:15", label: "Detected: Shopify", status: "detected" },
    { id: 5, type: "content", start: "05:15", end: "08:45", label: "Main Topic Part 2", status: "safe" },
    { id: 6, type: "sponsor", start: "08:45", end: "09:30", label: "Detected: Outro Brand", status: "detected" },
];

const REGIONAL_OFFERS = [
    { country: "Spain", flag: "🇪🇸", sponsor: "BBVA", category: "Fintech", offer: "Local Sign-up Perk", status: "Matched" },
    { country: "Mexico", flag: "🇲🇽", sponsor: "Mercado Libre", category: "E-commerce", offer: "Free Shipping Promo", status: "Matched" },
    { country: "India", flag: "🇮🇳", sponsor: "Reliance Digital", category: "Tech", offer: "Diwali Special", status: "Pending" },
    { country: "Japan", flag: "🇯🇵", sponsor: "SoftBank", category: "Telecom", offer: "5G Bundle Invite", status: "Recommended" },
];

export default function SponsorsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [selectedRegion, setSelectedRegion] = useState(REGIONAL_OFFERS[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSegment, setActiveSegment] = useState(2); // Start on first sponsor segment

    const bgClass = isDark ? "bg-dark-bg" : "bg-light-bg";
    const borderClass = isDark ? "border-white/5" : "border-gray-200";
    const cardClass = isDark ? "bg-white/[0.03]" : "bg-white";
    const textClass = isDark ? "text-white" : "text-black";
    const textSecondaryClass = isDark ? "text-white/40" : "text-black/40";

    return (
        <div className={cn("w-full h-full flex flex-col overflow-hidden relative", bgClass, textClass)}>
            {/* Grey Overlay - Makes page non-interactive */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto cursor-not-allowed">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md text-center space-y-4 pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-olleey-yellow/20 flex items-center justify-center mx-auto border border-olleey-yellow/30">
                        <Zap className="w-8 h-8 text-olleey-yellow" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Feature In Development</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                        Dynamic Sponsor Swap is currently in early development. This preview showcases the planned interface and capabilities.
                    </p>
                    <Badge className="bg-olleey-yellow/10 text-olleey-yellow border-olleey-yellow/30 text-[9px] font-black uppercase px-4 py-1.5">
                        Coming Soon
                    </Badge>
                </div>
            </div>

            {/* Header / Sub-nav */}
            <div className={cn("px-8 py-4 border-b flex items-center justify-between shrink-0 bg-black/5 backdrop-blur-xl", borderClass)}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                        <Zap className="w-5 h-5 text-olleey-yellow" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-tight">Dynamic Sponsor Swap</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[8px] h-4 font-black uppercase rounded-full border-olleey-yellow/30 text-olleey-yellow bg-olleey-yellow/5">Dev Preview</Badge>
                            <span className={cn("text-[10px] uppercase font-mono tracking-widest opacity-40")}>Engine_Version: 2.1.0-alpha</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/10 bg-white/5">
                        <Filter className="w-3.5 h-3.5 mr-2" /> Global Settings
                    </Button>
                    <Button className="h-9 px-6 rounded-xl bg-olleey-yellow text-black hover:bg-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-olleey-yellow/10">
                        Enable Auto-Swap
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-7xl mx-auto space-y-10">
                    {/* Main Interface Grid */}
                    <div className="grid grid-cols-12 gap-8">

                        {/* Left: Video Analysis & Segments */}
                        <div className="col-span-12 lg:col-span-7 space-y-8">
                            {/* Video Analysis Viewport */}
                            <div className={cn("aspect-video rounded-[2.5rem] border overflow-hidden relative group shadow-2xl", borderClass, isDark ? "bg-black" : "bg-gray-100")}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                                {/* Analysis Overlay UI */}
                                <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
                                    <Badge className="bg-olleey-yellow text-black font-black uppercase text-[10px] px-4 py-1.5 rounded-full">
                                        AI Segmentation Active
                                    </Badge>
                                    <Badge className="bg-black/60 backdrop-blur-xl border border-white/10 text-white font-bold uppercase text-[10px] px-4 py-1.5 rounded-full">
                                        Target: {selectedRegion.country}
                                    </Badge>
                                </div>

                                <video
                                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                                    className="w-full h-full object-cover opacity-80"
                                    muted
                                    loop
                                    autoPlay={isPlaying}
                                />

                                {/* Bounding Box Simulation */}
                                <AnimatePresence>
                                    {activeSegment % 2 === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-20"
                                        >
                                            <div className="w-full h-full border-2 border-dashed border-olleey-yellow/50 rounded-3xl relative">
                                                <div className="absolute -top-4 -left-4 bg-olleey-yellow text-black text-[9px] font-black uppercase px-3 py-1 rounded-lg">
                                                    Sponsor Boundary Detected
                                                </div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                                    <RefreshCw className="w-12 h-12 text-olleey-yellow animate-spin-slow mb-4 opacity-50" />
                                                    <span className="text-white text-xs font-black uppercase tracking-widest text-shadow-lg">
                                                        Injecting Regional Asset...
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Playhead Controls */}
                                <div className="absolute bottom-8 left-8 right-8 z-20">
                                    <div className="flex items-center justify-between mb-4">
                                        <Button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="w-12 h-12 rounded-full bg-white text-black hover:bg-olleey-yellow transition-all flex items-center justify-center border-none"
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current pl-1" />}
                                        </Button>
                                        <div className="text-white font-mono text-xs opacity-80">
                                            01:45 / 09:30
                                        </div>
                                    </div>

                                    {/* Advanced Timeline */}
                                    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden flex cursor-pointer backdrop-blur-sm border border-white/5">
                                        {DETECTED_SEGMENTS.map(seg => (
                                            <div
                                                key={seg.id}
                                                onClick={() => setActiveSegment(seg.id)}
                                                className={cn(
                                                    "h-full transition-all border-r border-black/20",
                                                    seg.type === 'sponsor' ? "bg-olleey-yellow/60 hover:bg-olleey-yellow" : "bg-white/5 hover:bg-white/10",
                                                    activeSegment === seg.id && "ring-2 ring-white/50 z-10"
                                                )}
                                                style={{ width: `${(100 / DETECTED_SEGMENTS.length)}%` }}
                                            />
                                        ))}
                                        {/* Playhead */}
                                        <div className="absolute top-0 bottom-0 w-0.5 bg-white z-20 left-[18.4%]" />
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Detection List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">Asset Segmentation Manifest</h3>
                                    <span className="text-[9px] font-mono opacity-20">8.2s Total Brand Latency</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {DETECTED_SEGMENTS.map(seg => (
                                        <button
                                            key={seg.id}
                                            onClick={() => setActiveSegment(seg.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                                activeSegment === seg.id
                                                    ? "bg-olleey-yellow/[0.03] border-olleey-yellow/30"
                                                    : cn("hover:border-white/10 bg-white/[0.01]", borderClass)
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                                    seg.type === 'sponsor' ? "bg-olleey-yellow/10 border-olleey-yellow/20 text-olleey-yellow" : "bg-white/5 border-white/5"
                                                )}>
                                                    {seg.type === 'sponsor' ? <Target className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold">{seg.label}</div>
                                                    <div className="text-[10px] opacity-40 font-mono tracking-tighter mt-0.5">
                                                        Timeframe: {seg.start} — {seg.end}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {seg.type === 'sponsor' ? (
                                                    <Badge className="bg-olleey-yellow/10 text-olleey-yellow border-olleey-yellow/20 text-[9px] font-bold uppercase py-1 px-3">
                                                        Swappable
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[9px] opacity-20 uppercase font-black">Content View</span>
                                                )}
                                                <MoreHorizontal className="w-4 h-4 opacity-20" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Regional Control & Metrics */}
                        <div className="col-span-12 lg:col-span-5 space-y-8">
                            {/* Regional Matcher */}
                            <section className={cn("p-8 rounded-[2.5rem] border space-y-8", borderClass, cardClass)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-olleey-yellow" />
                                        <h3 className="text-sm font-bold tracking-tight">Regional Optimization</h3>
                                    </div>
                                    <button className="text-[9px] font-black uppercase text-olleey-yellow tracking-widest hover:underline">View All Regions</button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {REGIONAL_OFFERS.map(offer => (
                                        <button
                                            key={offer.country}
                                            onClick={() => setSelectedRegion(offer)}
                                            className={cn(
                                                "p-4 rounded-[2rem] border transition-all text-left space-y-3 group",
                                                selectedRegion.country === offer.country
                                                    ? "bg-olleey-yellow border-olleey-yellow text-black"
                                                    : cn("bg-white/5 hover:border-white/10", borderClass)
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl">{offer.flag}</span>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center border",
                                                    selectedRegion.country === offer.country ? "bg-black/10 border-black/10" : "bg-white/5 border-white/10"
                                                )}>
                                                    <CheckCircle2 className={cn("w-3 h-3", selectedRegion.country === offer.country ? "opacity-100" : "opacity-0")} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold">{offer.country}</div>
                                                <div className={cn(
                                                    "text-[10px] font-medium opacity-60",
                                                    selectedRegion.country === offer.country && "text-black"
                                                )}>{offer.sponsor}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className={cn("p-6 rounded-3xl border space-y-4", borderClass, isDark ? "bg-black/20" : "bg-gray-50")}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <ExternalLink className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-black tracking-widest opacity-40">Active Injection</div>
                                            <div className="text-xs font-bold">Local Offer: {selectedRegion.offer}</div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] leading-relaxed opacity-60">
                                        Asset verified and transcoded for regional distribution. Dynamic metadata injected for real-time tracking.
                                    </p>
                                </div>
                            </section>

                            {/* Revenue Simulation */}
                            <section className={cn("p-8 rounded-[2.5rem] border space-y-8", borderClass, cardClass)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="w-5 h-5 text-green-500" />
                                        <h3 className="text-sm font-bold tracking-tight">Projected Impact</h3>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-500 border-none font-black text-[9px] px-3">+42% ROI Uplift</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <div className="text-[9px] uppercase font-black tracking-widest opacity-30">Avg. CPM Delta</div>
                                        <div className="text-2xl font-black text-olleey-yellow">+$8.40</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] uppercase font-black tracking-widest opacity-30">Engagement</div>
                                        <div className="text-2xl font-black text-blue-400">2.4x</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="opacity-40">Global Distribution Coverage</span>
                                        <span className="font-mono">84%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "84%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-olleey-yellow to-green-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-[10px] opacity-40 font-medium">Estimated based on prior 30-day regional performance.</span>
                                    </div>
                                </div>
                            </section>

                            {/* Help / Tip Card */}
                            <div className="p-6 rounded-[2.5rem] bg-olleey-yellow/[0.03] border border-olleey-yellow/20 flex gap-4">
                                <Info className="w-5 h-5 text-olleey-yellow shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-xs font-bold mb-1">AI Optimization Tip</h4>
                                    <p className="text-[11px] leading-relaxed opacity-60 font-medium">
                                        Enabling "Seamless Blend" will use neural synthesis to match the background lighting and acoustics of your local sponsor clips to the original source.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

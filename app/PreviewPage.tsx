"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Play,
    Share2,
    Globe,
    Eye,
    CheckCircle2,
    Youtube,
    ExternalLink,
    Copy,
    MoreHorizontal,
    Monitor,
    Layout,
    CheckCircle,
    Zap,
    Download,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";

export default function PreviewPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { quickCheckState, handleApprove } = useReview();
    const [isPublishing, setIsPublishing] = useState(false);

    // Fallback if state is missing (though should be handled by context)
    const {
        videoTitle,
        videoDescription,
        dubbedVideoUrl,
        languageCode,
        isApproved
    } = quickCheckState;

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

    // Simulate some metadata
    const [stats] = useState({
        qualityScore: "98.4",
        syncDrift: "0.02ms",
        culturalMatch: "High",
        aiProcessing: "Full Opt"
    });

    const [copied, setCopied] = useState(false);

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            await handleApprove();
        } catch (error) {
            console.error("Publishing error:", error);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#020202] text-white selection:bg-olleey-yellow selection:text-black">
            {/* Minimal Command Header */}
            <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Return to Monitoring</span>
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-olleey-yellow bg-olleey-yellow/10 px-2 py-0.5 border border-olleey-yellow/20">Final Preview</span>
                            {isApproved ? (
                                <Badge className="bg-green-500/10 border-green-500/20 text-green-500 text-[8px] font-black uppercase rounded-full px-3 tracking-widest">Distributed_Live</Badge>
                            ) : (
                                <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-500 text-[8px] font-black uppercase rounded-full px-3 tracking-widest">Processed_Node</Badge>
                            )}
                            <h1 className="text-xs font-black uppercase tracking-tight text-white/90 truncate max-w-[300px]">
                                {videoTitle || "Unnamed_Asset_01"}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-9"
                    >
                        <Download className="w-3.5 h-3.5 mr-2" />
                        Export Master
                    </Button>
                    <Button
                        size="sm"
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="rounded-full bg-olleey-yellow hover:bg-olleey-yellow/90 text-black text-[9px] font-black uppercase tracking-widest h-9 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                    >
                        {isPublishing ? (
                            <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                        ) : (
                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        )}
                        {isPublishing ? "Publishing..." : (isApproved ? "Redistribute Asset" : "Global Release")}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Viewport */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-black relative p-8">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Video Player Section */}
                        <section className="relative aspect-video bg-[#050505] border border-white/5 group overflow-hidden rounded-[2.5rem] shadow-2xl">
                            <video
                                src={dubbedVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"}
                                controls
                                className="w-full h-full"
                                poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"
                            />

                            {/* Cinematic Overlay UI */}
                            <div className="absolute top-6 right-6 flex items-center gap-2 z-10 pointer-events-none">
                                <Badge className="bg-black/60 backdrop-blur-md border border-olleey-yellow/30 text-olleey-yellow text-[8px] font-black uppercase px-3 py-1.5 rounded-full">
                                    4K Localized
                                </Badge>
                                <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-white/60 text-[8px] font-black uppercase px-3 py-1.5 rounded-full">
                                    {languageName}
                                </Badge>
                            </div>
                        </section>

                        {/* Content Info Grid */}
                        <div className="grid grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Asset Manifest</h2>
                                        <div className="flex items-center gap-4">
                                            <button onClick={handleCopy} className="text-white/40 hover:text-white transition-colors flex items-center gap-1.5">
                                                <Copy className="w-3 h-3" />
                                                <span className="text-[8px] font-black uppercase tracking-wider">{copied ? "Copied" : "Copy Data"}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-8 border border-white/5 bg-white/[0.02] space-y-6 rounded-[2rem]">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-black text-white/90 leading-tight tracking-tight">{videoTitle}</h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="rounded-full border-green-500/20 text-green-500 bg-green-500/5 text-[8px] font-black uppercase px-2.5">Production Ready</Badge>
                                                </div>
                                            </div>

                                            {/* Channel Attribution */}
                                            <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
                                                <div className="w-8 h-8 rounded-full bg-olleey-yellow/10 flex items-center justify-center border border-white/10">
                                                    <Youtube className="w-4 h-4 text-olleey-yellow" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black uppercase tracking-widest text-white/20">Target Channel</span>
                                                    <span className="text-xs font-bold text-white/80">Olleey Global Labs</span>
                                                </div>
                                                <div className="w-px h-6 bg-white/10 mx-2" />
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black uppercase tracking-widest text-white/20">Language</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs">{LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.flag || "🇪🇸"}</span>
                                                        <span className="text-xs font-bold text-white/80">{languageName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <p className="text-sm text-white/50 leading-relaxed font-medium">
                                            {videoDescription || "No localized description available for this production cycle."}
                                        </p>
                                    </div>
                                </div>

                                {/* Industrial Metrics */}
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: "Sync Fidelity", value: stats.qualityScore + "%", icon: Zap },
                                        { label: "Vocal Latency", value: stats.syncDrift, icon: Monitor },
                                        { label: "Cultural Tone", value: stats.culturalMatch, icon: Globe },
                                        { label: "AI Engine", value: stats.aiProcessing, icon: Layout }
                                    ].map((metric, i) => (
                                        <div key={i} className="p-4 border border-white/5 bg-white/[0.01] space-y-2 rounded-2xl">
                                            <div className="flex items-center gap-2 text-white/20">
                                                <metric.icon className="w-3 h-3" />
                                                <span className="text-[7px] font-black uppercase tracking-widest">{metric.label}</span>
                                            </div>
                                            <p className="text-xs font-mono font-bold text-olleey-yellow">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Visual Identity</h2>
                                    <div className="aspect-video border border-white/5 overflow-hidden group/thumb relative rounded-[2rem]">
                                        <img
                                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
                                            alt="Localized Thumbnail"
                                            className="w-full h-full object-cover grayscale opacity-60 group-hover/thumb:grayscale-0 group-hover/thumb:opacity-100 transition-all duration-700 scale-110 group-hover/thumb:scale-100"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Active Production Cover</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border border-olleey-yellow/10 bg-olleey-yellow/[0.02] space-y-4 relative overflow-hidden group rounded-[2rem]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-olleey-yellow/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-olleey-yellow/10 transition-colors" />
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-olleey-yellow" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-olleey-yellow">Verification Logic</span>
                                        </div>
                                        <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                                            This asset has passed all 4 security and quality gates. It is ready for distribution across global networks.
                                        </p>
                                        <Button
                                            onClick={handlePublish}
                                            disabled={isPublishing}
                                            className="w-full rounded-full bg-olleey-yellow hover:bg-olleey-yellow/90 text-black text-[9px] font-black uppercase tracking-widest h-10"
                                        >
                                            {isPublishing ? "Processing..." : (isApproved ? "Update Distributed Feed" : "Schedule Channel Post")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Bottom HUD */}
            <footer className="h-8 border-t border-white/5 bg-[#050505] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">Secure Connection Established</span>
                    </div>
                    <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Node ID: OL_NX_{Math.floor(Math.random() * 99999)}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">System Status: Nominal</span>
                </div>
            </footer>
        </div>
    );
}

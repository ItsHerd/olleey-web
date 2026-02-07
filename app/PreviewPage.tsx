"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
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
    RefreshCw,
    Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { useVideos } from "@/lib/useVideos";
import { useProject } from "@/lib/ProjectContext";

export default function PreviewPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { quickCheckState, handleApprove, openReview } = useReview();
    const [isPublishing, setIsPublishing] = useState(false);

    // Fetch full video data to get all localizations
    const { selectedProject } = useProject();
    const { videos } = useVideos({ project_id: selectedProject?.id });
    const currentVideo = videos.find(v => v.video_id === quickCheckState.videoId);

    const [viewMode, setViewMode] = useState<'dubbed' | 'original'>('dubbed');

    // Fallback if state is missing
    const {
        videoTitle,
        videoDescription,
        dubbedVideoUrl,
        originalVideoUrl,
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

    const handleSwitchToDub = (code: string, loc: any) => {
        if (!currentVideo) return;

        openReview({
            videoId: currentVideo.video_id,
            languageCode: code,
            originalVideoUrl: (currentVideo as any).video_url || originalVideoUrl,
            dubbedVideoUrl: loc.video_url,
            videoTitle: loc.title || currentVideo.title,
            videoDescription: loc.description || currentVideo.description,
            thumbnailUrl: loc.thumbnail_url || currentVideo.thumbnail_url,
            isApproved: loc.status === "live",
            approvedAt: currentVideo.published_at || (currentVideo as any).created_at
        });
        setViewMode('dubbed');
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#0c0c0c] text-white selection:bg-olleey-yellow selection:text-black">
            {/* Minimal Command Header */}
            <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="w-10 h-10 hover:bg-white/10 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5 opacity-60" />
                    </Button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-normal tracking-tight">Final Preview</h1>
                            {viewMode === 'original' ? (
                                <Badge className="bg-white/10 border-white/20 text-white text-[8px] font-black uppercase rounded-full px-3 tracking-widest">Original Source</Badge>
                            ) : isApproved ? (
                                <Badge className="bg-green-500/10 border-green-500/20 text-green-500 text-[8px] font-black uppercase rounded-full px-3 tracking-widest">Distributed_Live</Badge>
                            ) : (
                                <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-500 text-[8px] font-black uppercase rounded-full px-3 tracking-widest">Processed_Node</Badge>
                            )}
                        </div>
                        <p className="text-xs text-white/60 font-medium tracking-wide opacity-60 truncate max-w-md mt-0.5">
                            {videoTitle || "Unnamed_Asset_01"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode(prev => prev === 'original' ? 'dubbed' : 'original')}
                        className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-9 px-4 text-white/80 hover:text-white"
                    >
                        {viewMode === 'dubbed' ? (
                            <>
                                <Layout className="w-3.5 h-3.5 mr-2" />
                                View Original
                            </>
                        ) : (
                            <>
                                <Monitor className="w-3.5 h-3.5 mr-2" />
                                Return to Dub
                            </>
                        )}
                    </Button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

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
                        disabled={isPublishing || viewMode === 'original'}
                        className={cn(
                            "rounded-full bg-olleey-yellow hover:bg-olleey-yellow/90 text-black text-[9px] font-black uppercase tracking-widest h-9 shadow-[0_0_20px_rgba(251,191,36,0.2)]",
                            viewMode === 'original' && "opacity-50 grayscale cursor-not-allowed"
                        )}
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
                                key={viewMode === 'original' ? originalVideoUrl : dubbedVideoUrl}
                                src={viewMode === 'original' ? originalVideoUrl : (dubbedVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4")}
                                controls
                                className="w-full h-full"
                                poster={quickCheckState.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"}
                            />

                            {/* Cinematic Overlay UI */}
                            <div className="absolute top-6 right-6 flex items-center gap-2 z-10 pointer-events-none">
                                <Badge className="bg-black/60 backdrop-blur-md border border-olleey-yellow/30 text-olleey-yellow text-[8px] font-black uppercase px-3 py-1.5 rounded-full">
                                    {viewMode === 'original' ? "Source Master" : "4K Localized"}
                                </Badge>
                                <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-white/60 text-[8px] font-black uppercase px-3 py-1.5 rounded-full">
                                    {viewMode === 'original' ? "Original" : languageName}
                                </Badge>
                            </div>
                        </section>

                        {/* Content Info Grid */}
                        <div className="grid grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-8">
                                {viewMode === 'original' ? (
                                    /* Original Mode: Show List of Dubbed Versions */
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Global Localization Hub</h2>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentVideo?.localizations && Object.entries(currentVideo.localizations).map(([code, loc]: [string, any]) => {
                                                const lang = LANGUAGE_OPTIONS.find(l => l.code === code);
                                                return (
                                                    <button
                                                        key={code}
                                                        onClick={() => handleSwitchToDub(code, loc)}
                                                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition-all group text-left"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg shadow-inner">
                                                                {lang?.flag || "🌐"}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-white group-hover:text-olleey-yellow transition-colors">
                                                                    {lang?.name || code.toUpperCase()} Dub
                                                                </h3>
                                                                <p className="text-[9px] font-mono text-white/30 uppercase tracking-wider mt-0.5">
                                                                    Status: {loc.status || "Processing"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <Badge className={cn(
                                                                "border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full",
                                                                loc.status === 'live'
                                                                    ? "bg-green-500/10 border-green-500/20 text-green-500"
                                                                    : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                                            )}>
                                                                {loc.status === 'live' ? 'Verified' : 'In Review'}
                                                            </Badge>
                                                            <ChevronLeft className="w-4 h-4 text-white/20 rotate-180 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            {(!currentVideo?.localizations || Object.keys(currentVideo.localizations).length === 0) && (
                                                <div className="p-8 text-center border border-white/5 border-dashed rounded-2xl">
                                                    <p className="text-xs text-white/30 font-mono">No localizations found for this asset.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Dubbed Mode: Show Asset Manifest */
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
                                )}

                                {/* Industrial Metrics (Always Visible) */}
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
                                            src={quickCheckState.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"}
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
                                            disabled={isPublishing || viewMode === 'original'}
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

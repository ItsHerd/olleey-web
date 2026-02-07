"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Activity,
    Cpu,
    Dna,
    Mic2,
    MessageSquare,
    Zap,
    Shield,
    BarChart3,
    Terminal as TerminalIcon,
    Radio,
    Clock,
    Globe,
    CheckCircle2,
    Pause,
    RotateCcw,
    XOctagon,
    Play,
    Eye
} from "lucide-react";
import { LoadingPanda } from "@/components/ui/LoadingPanda";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReview } from "@/lib/ReviewContext";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";

const STAGES = [
    { id: 'extraction', label: 'Audio Isolation', icon: Mic2, description: 'Separating vocal tracks from background ambient noise.' },
    { id: 'translation', label: 'Neural Translation', icon: Globe, description: 'LLM-driven linguistic mapping and cultural adaptation.' },
    { id: 'synthesis', label: 'Voice Cloning', icon: Dna, description: 'Generating high-fidelity vocal performance matching original timber.' },
    { id: 'sync', label: 'Lip-Sync Alignment', icon: Activity, description: 'Frame-by-frame visual manipulation for perfect phonetic sync.' },
    { id: 'mastering', label: 'Final Mastering', icon: Zap, description: 'Balancing levels and finalizing metadata injection.' }
];

export default function ProcessingPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { quickCheckState } = useReview();

    const [progress, setProgress] = useState(35);
    const [activeStage, setActiveStage] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [isAborted, setIsAborted] = useState(false);
    const [previewingStage, setPreviewingStage] = useState<number | null>(null);

    useEffect(() => {
        if (isPaused || isAborted) return;

        const timer = setInterval(() => {
            setProgress(prev => (prev < 92 ? prev + Math.random() * 2 : prev));
            if (progress > (activeStage + 1) * 20 && activeStage < STAGES.length - 1) {
                setActiveStage(prev => prev + 1);
            }
        }, 3000);
        return () => clearInterval(timer);
    }, [isPaused, isAborted, progress, activeStage]);

    const handleAbort = () => {
        setIsAborted(true);
    };

    const handleRetry = (stageIndex: number) => {
        setIsAborted(false);
        setIsPaused(false);
        setActiveStage(stageIndex);
        setProgress(stageIndex * 20); // Reset progress for the stage
    };

    const { videoTitle, languageCode } = quickCheckState;
    const languageName = LANGUAGE_OPTIONS.find(l => l.code === languageCode)?.name || "Spanish";

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#0a0a0a] text-white selection:bg-olleey-yellow selection:text-black">
            {/* Minimal Command Header */}
            <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Abort Monitor</span>
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-olleey-yellow bg-olleey-yellow/10 px-2 py-0.5 border border-olleey-yellow/20 rounded-full">Active Processing</span>
                            <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-500 text-[8px] font-black uppercase rounded-full px-3 tracking-widest animate-pulse">Neural_Sync_Live</Badge>
                            <h1 className="text-xs font-black uppercase tracking-tight text-white/90 truncate max-w-[300px]">
                                {videoTitle || "Unnamed_Asset_01"}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsPaused(!isPaused)}
                            className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-8"
                            disabled={isAborted}
                        >
                            {isPaused ? <Play className="w-3 h-3 mr-2" /> : <Pause className="w-3 h-3 mr-2" />}
                            {isPaused ? "Resume Pipeline" : "Pause Cluster"}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleAbort}
                            className="rounded-full bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 text-[9px] font-black uppercase tracking-widest h-8"
                            disabled={isAborted}
                        >
                            <XOctagon className="w-3 h-3 mr-2" />
                            Abort Sync
                        </Button>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 uppercase">Global Progress</span>
                        <span className="text-sm font-mono font-bold text-olleey-yellow">{isAborted ? "TERMINATED" : `${Math.floor(progress)}%`}</span>
                    </div>
                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className={cn(
                                "h-full shadow-[0_0_10px_rgba(251,191,36,0.5)]",
                                isAborted ? "bg-red-500" : "bg-olleey-yellow"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-black relative p-8">
                    <div className="max-w-7xl mx-auto grid grid-cols-12 gap-12">

                        {/* Center Stage - Rendering View */}
                        <div className="col-span-7 space-y-8">
                            <section className="relative aspect-video bg-[#050505] border border-white/5 overflow-hidden rounded-[3rem] shadow-2xl group">
                                {/* Simulated Neural Scan Lines */}
                                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-20">
                                    <div className="w-full h-1 bg-olleey-yellow/30 absolute top-0 animate-[scan_4s_linear_infinite]" />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                                </div>

                                <video
                                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                    autoPlay
                                    muted
                                    loop
                                    className="w-full h-full object-cover opacity-40 blur-sm grayscale"
                                />

                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        {isAborted ? (
                                            <XOctagon className="w-16 h-16 text-red-500" />
                                        ) : isPaused ? (
                                            <Pause className="w-16 h-16 text-olleey-yellow" />
                                        ) : (
                                            <LoadingPanda size={160} />
                                        )}
                                        <div className={cn(
                                            "absolute inset-0 blur-2xl rounded-full",
                                            isAborted ? "bg-red-500/20" : "bg-olleey-yellow/20 animate-pulse"
                                        )} />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-white">
                                            {isAborted ? "Sync Terminated" : isPaused ? "Processing Suspended" : "Neural Synthesis"}
                                        </h3>
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-olleey-yellow/60">
                                            {isAborted ? "Cluster Offline" : `Node OL_NX_7742 ${isPaused ? "Dormant" : "Active"}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between z-20">
                                    <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem]">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                            <Cpu className="w-5 h-5 text-olleey-yellow" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Active Compute</span>
                                            <span className="text-xs font-bold text-white/80">NVIDIA Tensor Core H100</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem]">
                                        <div className="flex flex-col text-right">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Throughput</span>
                                            <span className="text-xs font-bold text-white/80">244 FPS / ~1.2 TB/s</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-green-500/20">
                                            <Activity className="w-5 h-5 text-green-500" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar - Stages & Gates */}
                        <div className="col-span-5 space-y-8">
                            <section className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                            <Shield className="w-4 h-4 text-olleey-yellow" />
                                        </div>
                                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Processing Pipeline</h2>
                                    </div>
                                    <span className="text-[10px] font-mono text-white/20">5_NODES_ACTIVE</span>
                                </div>

                                <div className="space-y-4">
                                    {STAGES.map((stage, i) => (
                                        <div
                                            key={stage.id}
                                            className={cn(
                                                "p-6 border transition-all duration-500 rounded-[2.5rem] relative overflow-hidden group",
                                                i < activeStage
                                                    ? "bg-green-500/[0.03] border-green-500/20"
                                                    : (i === activeStage ? "bg-olleey-yellow/[0.03] border-olleey-yellow/30 shadow-[0_20px_40px_-12px_rgba(251,191,36,0.1)]" : "bg-white/[0.01] border-white/5 opacity-40")
                                            )}
                                        >
                                            <div className="flex gap-6 relative z-10">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 border transition-all duration-500",
                                                    i < activeStage
                                                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                                                        : (i === activeStage
                                                            ? "bg-olleey-yellow/10 border-olleey-yellow/30 text-olleey-yellow scale-110 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                                                            : "bg-white/5 border-white/10 text-white/20")
                                                )}>
                                                    <stage.icon className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className={cn(
                                                            "text-sm font-black uppercase tracking-widest",
                                                            i <= activeStage ? "text-white" : "text-white/20"
                                                        )}>{stage.label}</h3>
                                                        {i < activeStage && (
                                                            <div className="flex items-center gap-1 text-green-500">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">Done</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-medium text-white/40 leading-relaxed italic pr-4">{stage.description}</p>

                                                    {/* PROMINENT BUTTONS */}
                                                    {(i <= activeStage) && (
                                                        <div className="flex items-center gap-2 pt-4">
                                                            {i < activeStage && (
                                                                <Button
                                                                    onClick={(e) => { e.stopPropagation(); setPreviewingStage(i); }}
                                                                    className="flex-1 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl"
                                                                >
                                                                    <Eye className="w-4 h-4" /> Preview
                                                                </Button>
                                                            )}
                                                            <Button
                                                                onClick={(e) => { e.stopPropagation(); handleRetry(i); }}
                                                                variant="outline"
                                                                className={cn(
                                                                    "h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 transition-all",
                                                                    i === activeStage
                                                                        ? "flex-1 bg-olleey-yellow/10 border-olleey-yellow/30 text-olleey-yellow hover:bg-olleey-yellow/20"
                                                                        : "px-4 border-white/10 hover:bg-white/5 text-white/40 hover:text-white"
                                                                )}
                                                                disabled={isAborted}
                                                            >
                                                                <RotateCcw className="w-4 h-4" /> {i === activeStage ? "Restart Stage" : ""}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {i === activeStage && !isPaused && !isAborted && (
                                                <motion.div
                                                    className="absolute bottom-0 left-0 h-1 bg-olleey-yellow shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 10, repeat: Infinity }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>

            {/* Bottom HUD */}
            <footer className="h-10 border-t border-white/5 bg-[#050505] flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Core Neural Engine Online</span>
                    </div>
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">Job_ID: {quickCheckState.videoId || "OL_J_8841"}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-olleey-yellow/60 italic">Estimated Completion: ~4.2 minutes</span>
                </div>
            </footer>

            {/* Neural Gate Preview Modal */}
            <AnimatePresence>
                {previewingStage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="w-full max-w-5xl bg-[#050505] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] relative"
                        >
                            <div className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-olleey-yellow/10 rounded-2xl flex items-center justify-center border border-olleey-yellow/20">
                                        {React.createElement(STAGES[previewingStage].icon, { className: "w-6 h-6 text-olleey-yellow" })}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Gate Validation Protocol</span>
                                        <h2 className="text-xl font-black uppercase tracking-widest text-white">{STAGES[previewingStage].label}</h2>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setPreviewingStage(null)}
                                    className="h-12 w-12 rounded-full p-0 hover:bg-white/10 hover:rotate-90 transition-all duration-500"
                                >
                                    <XOctagon className="w-6 h-6 text-white/40" />
                                </Button>
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="aspect-video bg-black rounded-[3rem] overflow-hidden border border-white/10 relative group shadow-2xl">
                                    <video
                                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                        autoPlay
                                        muted
                                        loop
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-green-500/20 border-green-500/30 text-green-400 text-[10px] font-black uppercase rounded-xl px-4 py-1.5 tracking-widest shadow-lg">Stage_Sync_Verified</Badge>
                                                <div className="h-4 w-px bg-white/10" />
                                                <span className="text-xs font-mono text-white/60 tracking-wider">TS: 00:02:44:12</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Neural Confidence</span>
                                                    <span className="text-sm font-bold text-olleey-yellow font-mono">0.9841</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                                                    <Activity className="w-5 h-5 text-olleey-yellow animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-8">
                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-3 group hover:bg-white/[0.05] transition-colors">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Operational Status</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <p className="text-sm font-black text-green-500 uppercase tracking-widest">Optimized</p>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-3 group hover:bg-white/[0.05] transition-colors">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Data Integrity</span>
                                        <p className="text-sm font-black text-white uppercase tracking-widest">100% Validated</p>
                                    </div>
                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-3 group hover:bg-white/[0.05] transition-colors">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Artifact Detection</span>
                                        <p className="text-sm font-black text-olleey-yellow uppercase tracking-widest italic">Zero Anomalies</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes scan {
                    from { transform: translateY(0); }
                    to { transform: translateY(1080px); }
                }
            `}</style>
        </div>
    );
}

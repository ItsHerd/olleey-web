import React, { useState, useEffect, useRef } from "react";
import { X, Terminal, Clock, Activity, AlertCircle, CheckCircle, Copy } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

interface LogEntry {
    timestamp: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    id: string;
}

interface JobTerminalPanelProps {
    isOpen: boolean;
    onClose: () => void;
    jobId?: string;
    videoTitle?: string;
    language?: string;
}

export function JobTerminalPanel({ isOpen, onClose, jobId, videoTitle, language }: JobTerminalPanelProps) {
    const { theme } = useTheme();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Theme classes
    const panelBg = theme === "light" ? "bg-white" : "bg-[#111]";
    const textPrimary = theme === "light" ? "text-gray-900" : "text-white";
    const textSecondary = theme === "light" ? "text-gray-500" : "text-gray-400";
    const border = theme === "light" ? "border-gray-200" : "border-gray-800";

    // Simulated log generation
    useEffect(() => {
        if (isOpen && jobId) {
            setLogs([]); // Reset logs

            const steps = [
                { msg: `Job initialized for "${videoTitle}"`, type: "info", delay: 100 },
                { msg: `Target Language: ${language?.toUpperCase()}`, type: "info", delay: 500 },
                { msg: "Allocating GPU resources...", type: "warning", delay: 1200 },
                { msg: "Downloading source video (1080p)...", type: "info", delay: 2000 },
                { msg: "Audio track extracted successfully", type: "success", delay: 3500 },
                { msg: "Separating vocals (Demucs v4)...", type: "info", delay: 4200 },
                { msg: "Generating transcript...", type: "info", delay: 6000 },
                { msg: "Translating text [EN -> ${language}]...", type: "info", delay: 7500 },
                { msg: "Voice cloning initialized (ElevenLabs)", type: "warning", delay: 9000 },
                { msg: "Synthesizing audio segments [0/45]...", type: "info", delay: 10500 },
                { msg: "Synthesizing audio segments [12/45]...", type: "info", delay: 12000 },
            ];

            let timeouts: NodeJS.Timeout[] = [];

            steps.forEach((step, index) => {
                const timeout = setTimeout(() => {
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });

                    setLogs(prev => [...prev, {
                        id: Math.random().toString(36),
                        timestamp: timeStr,
                        message: step.msg.replace("${language}", language || "Target"),
                        type: step.type as any
                    }]);
                }, step.delay);
                timeouts.push(timeout);
            });

            return () => timeouts.forEach(clearTimeout);
        }
    }, [isOpen, jobId, videoTitle, language]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 placeholder-shown:pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md ${panelBg} shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l ${border} flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className={`p-5 border-b ${border} flex items-center justify-between`}>
                    <div>
                        <div className={`flex items-center gap-2 text-xs font-mono mb-1 ${textSecondary}`}>
                            <HashIcon className="w-3 h-3" />
                            JOB ID: {jobId?.substring(0, 8) || "..."}
                        </div>
                        <h2 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                            Processing Job
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${textSecondary}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Info Bar */}
                <div className={`px-5 py-3 bg-amber-500/5 border-b ${border} flex items-center gap-3`}>
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Terminal className={`w-5 h-5 ${textSecondary}`} />
                    </div>
                    <div className="min-w-0">
                        <h3 className={`text-sm font-medium ${textPrimary} truncate`}>{videoTitle}</h3>
                        <p className="text-xs text-amber-500 font-medium">Stage: Voice Cloning...</p>
                    </div>
                </div>

                {/* Terminal Output */}
                <div className="flex-1 overflow-hidden relative bg-[#0c0c0c] font-mono text-xs">
                    <div className="absolute inset-0 overflow-y-auto p-4 space-y-2 custom-scrollbar" ref={scrollRef}>
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                                <span className="text-gray-600 flex-shrink-0 select-none">[{log.timestamp}]</span>
                                <div className="flex-1 break-words">
                                    {log.type === "info" && <span className="text-gray-300">{log.message}</span>}
                                    {log.type === "success" && <span className="text-green-400 font-bold">{log.message}</span>}
                                    {log.type === "warning" && <span className="text-amber-400">{log.message}</span>}
                                    {log.type === "error" && <span className="text-red-400 font-bold">{log.message}</span>}
                                </div>
                            </div>
                        ))}
                        {/* Blinking Cursor */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-green-500">➜</span>
                            <span className="w-2 h-4 bg-gray-500 animate-pulse block"></span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${border} bg-gray-50 dark:bg-[#151515]`}>
                    <div className="flex justify-between items-center">
                        <div className={`flex items-center gap-1.5 text-xs ${textSecondary}`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Time elapsed: 00:42</span>
                        </div>
                        <button className={`text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors`}>
                            Cancel Job
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function HashIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
    );
}

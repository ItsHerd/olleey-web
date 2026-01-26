import React, { useState, useRef, useEffect } from "react";
import { X, Play, Pause, AlertCircle, CheckCircle, Flag } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

interface QuickCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalVideoUrl?: string;
    dubbedVideoUrl?: string; // This might be a blob URL or storage URL
    languageName: string;
    onApprove: () => void;
    onFlag: (reason: string) => void;
}

export function QuickCheckModal({
    isOpen,
    onClose,
    originalVideoUrl,
    dubbedVideoUrl,
    languageName,
    onApprove,
    onFlag
}: QuickCheckModalProps) {
    const { theme } = useTheme();

    // Refs for video syncing
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [flagReason, setFlagReason] = useState("");
    const [showFlagInput, setShowFlagInput] = useState(false);

    // Theme classes
    const cardClass = theme === "light" ? "bg-white" : "bg-[#1f1f1f]";
    const textClass = theme === "light" ? "text-gray-900" : "text-white";
    const textSecondaryClass = theme === "light" ? "text-gray-500" : "text-gray-400";

    // Sync logic
    const togglePlay = () => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            if (isPlaying) {
                originalVideoRef.current.pause();
                dubbedVideoRef.current.pause();
            } else {
                originalVideoRef.current.play();
                dubbedVideoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (originalVideoRef.current && dubbedVideoRef.current) {
            originalVideoRef.current.currentTime = time;
            dubbedVideoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Sync playback events (fail-safe)
    useEffect(() => {
        const onTimeUpdate = () => {
            if (originalVideoRef.current) {
                setCurrentTime(originalVideoRef.current.currentTime);
                // Force sync if DRIFT exceeds 0.1s
                if (dubbedVideoRef.current && Math.abs(dubbedVideoRef.current.currentTime - originalVideoRef.current.currentTime) > 0.1) {
                    dubbedVideoRef.current.currentTime = originalVideoRef.current.currentTime;
                }
            }
        };

        const original = originalVideoRef.current;
        if (original) {
            original.addEventListener('timeupdate', onTimeUpdate);
        }
        return () => {
            if (original) {
                original.removeEventListener('timeupdate', onTimeUpdate);
            }
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content */}
            <div className={`relative ${cardClass} rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]`}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <div>
                        <h3 className={`text-lg font-bold ${textClass}`}>Quick Check: {languageName}</h3>
                        <p className={`text-sm ${textSecondaryClass}`}>Verify lip-sync and audio quality</p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-white/10 ${textSecondaryClass} hover:${textClass}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Video Area */}
                <div className="flex-1 bg-black grid grid-cols-2 gap-1 p-1 relative group">
                    {/* Original (Muted) */}
                    <div className="relative">
                        <span className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs font-semibold z-10 pointer-events-none">Original (Muted)</span>
                        <video
                            ref={originalVideoRef}
                            src={originalVideoUrl}
                            className="w-full h-full object-contain bg-gray-900"
                            muted
                        />
                    </div>

                    {/* Dubbed (Audio On) */}
                    <div className="relative">
                        <span className="absolute top-4 left-4 bg-indigo-600/80 text-white px-2 py-1 rounded text-xs font-semibold z-10 pointer-events-none">Dubbed Audio</span>
                        <video
                            ref={dubbedVideoRef}
                            src={dubbedVideoUrl}
                            className="w-full h-full object-contain bg-gray-900"
                        />
                    </div>

                    {/* Center Play Button Overlay */}
                    <button
                        onClick={togglePlay}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all scale-0 group-hover:scale-100"
                    >
                        {isPlaying ? <Pause className="w-8 h-8 text-white fill-current" /> : <Play className="w-8 h-8 text-white fill-current ml-1" />}
                    </button>
                </div>

                {/* Subtitles Layer (Mock) */}
                <div className="bg-black/90 p-4 text-center border-t border-gray-800">
                    <p className="text-yellow-400 font-medium text-lg italic hover:underline cursor-text" contentEditable suppressContentEditableWarning>
                        "Click here to edit this subtitle text directly..."
                    </p>
                    <p className="text-gray-600 text-xs mt-1">Hint: Pause to edit subtitles</p>
                </div>

                {/* Footer / Controls */}
                <div className={`p-6 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-800'} flex items-center justify-between gap-4`}>
                    {/* Status / Flag Input */}
                    <div className="flex-1">
                        {showFlagInput ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-left-5">
                                <input
                                    type="text"
                                    value={flagReason}
                                    onChange={(e) => setFlagReason(e.target.value)}
                                    placeholder="Describe the issue (e.g. Lip sync off at 0:42)..."
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                                    autoFocus
                                />
                                <button
                                    onClick={() => onFlag(flagReason)}
                                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                                >
                                    Submit Flag
                                </button>
                                <button
                                    onClick={() => setShowFlagInput(false)}
                                    className="p-2 text-gray-500 hover:text-gray-300"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowFlagInput(true)}
                                className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm font-medium px-2 py-1"
                            >
                                <Flag className="w-4 h-4" />
                                Flag Issue for Remix
                            </button>
                        )}
                    </div>

                    {/* Primary Action */}
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-right mr-2 hidden sm:block">
                            <span className="block text-gray-400">Ready to go?</span>
                            <span className="text-green-500 font-medium">Confidence: 94%</span>
                        </div>
                        <button
                            onClick={onApprove}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Approve & Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

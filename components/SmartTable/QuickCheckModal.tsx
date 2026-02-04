import React, { useState, useRef, useEffect } from "react";
import { X, Play, Pause, AlertCircle, CheckCircle, Flag, Volume2, VolumeX, Maximize2, SkipBack, SkipForward } from "lucide-react";
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
    const [duration, setDuration] = useState(0);
    const [flagReason, setFlagReason] = useState("");
    const [showFlagInput, setShowFlagInput] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Theme classes
    const cardClass = theme === "light" ? "bg-white" : "bg-[#0a0a0a]";
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

    const skipTime = (seconds: number) => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
            originalVideoRef.current.currentTime = newTime;
            dubbedVideoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const toggleMute = () => {
        if (dubbedVideoRef.current) {
            dubbedVideoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (dubbedVideoRef.current) {
            dubbedVideoRef.current.volume = newVolume;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

        const onLoadedMetadata = () => {
            if (originalVideoRef.current) {
                setDuration(originalVideoRef.current.duration);
            }
        };

        const original = originalVideoRef.current;
        if (original) {
            original.addEventListener('timeupdate', onTimeUpdate);
            original.addEventListener('loadedmetadata', onLoadedMetadata);
        }
        return () => {
            if (original) {
                original.removeEventListener('timeupdate', onTimeUpdate);
                original.removeEventListener('loadedmetadata', onLoadedMetadata);
            }
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            {/* Modal Content */}
            <div className={`relative ${cardClass} rounded-none shadow-2xl border border-white/10 w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]`}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-gradient-to-r from-olleey-yellow/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-olleey-yellow rounded-full" />
                        <div>
                            <h3 className={`text-base font-bold ${textClass} tracking-tight`}>Review: {languageName}</h3>
                            <p className={`text-[10px] ${textSecondaryClass} font-medium`}>Compare original and dubbed versions</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-1.5 rounded-sm hover:bg-white/10 ${textSecondaryClass} hover:${textClass} transition-colors`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Video Area */}
                <div className="flex-1 bg-black grid grid-cols-2 gap-0.5 relative group min-h-[400px]">
                    {/* Original (Muted) */}
                    <div className="relative bg-black">
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                            <span className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border border-white/20">
                                Original
                            </span>
                            <span className="bg-red-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-sm text-[9px] font-bold flex items-center gap-1">
                                <VolumeX className="w-3 h-3" />
                                Muted
                            </span>
                        </div>
                        <video
                            ref={originalVideoRef}
                            src={originalVideoUrl}
                            className="w-full h-full object-contain"
                            muted
                        />
                    </div>

                    {/* Dubbed (Audio On) */}
                    <div className="relative bg-black">
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                            <span className="bg-olleey-yellow/90 backdrop-blur-sm text-black px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border border-olleey-yellow">
                                {languageName}
                            </span>
                            <span className="bg-green-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-sm text-[9px] font-bold flex items-center gap-1">
                                <Volume2 className="w-3 h-3" />
                                Audio
                            </span>
                        </div>
                        <video
                            ref={dubbedVideoRef}
                            src={dubbedVideoUrl}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Center Play Button Overlay */}
                    <button
                        onClick={togglePlay}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-olleey-yellow/20 hover:bg-olleey-yellow/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border-2 border-olleey-yellow/40"
                    >
                        {isPlaying ? <Pause className="w-10 h-10 text-olleey-yellow fill-current" /> : <Play className="w-10 h-10 text-olleey-yellow fill-current ml-1" />}
                    </button>
                </div>

                {/* Video Controls */}
                <div className="bg-black/95 border-t border-white/10 p-3">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-2 rounded-sm hover:bg-white/10 text-white transition-colors"
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        {/* Skip Back */}
                        <button
                            onClick={() => skipTime(-5)}
                            className="p-2 rounded-sm hover:bg-white/10 text-white transition-colors"
                        >
                            <SkipBack className="w-4 h-4" />
                        </button>

                        {/* Skip Forward */}
                        <button
                            onClick={() => skipTime(5)}
                            className="p-2 rounded-sm hover:bg-white/10 text-white transition-colors"
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>

                        {/* Time Display */}
                        <span className="text-[11px] font-mono text-white/80 min-w-[80px]">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* Progress Bar */}
                        <div className="flex-1 relative group/slider">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-olleey-yellow [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                style={{
                                    background: `linear-gradient(to right, rgb(251, 191, 36) 0%, rgb(251, 191, 36) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
                                }}
                            />
                        </div>

                        {/* Volume Control */}
                        <button
                            onClick={toggleMute}
                            className="p-2 rounded-sm hover:bg-white/10 text-white transition-colors"
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        <div className="w-20">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className={`p-4 border-t border-white/10 flex items-center justify-between gap-4 ${cardClass}`}>
                    {/* Flag Input */}
                    <div className="flex-1">
                        {showFlagInput ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={flagReason}
                                    onChange={(e) => setFlagReason(e.target.value)}
                                    placeholder="Describe the issue (e.g., Lip sync off at 0:42)..."
                                    className={`flex-1 ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'} border border-white/10 rounded-sm px-3 py-2 text-[11px] ${textClass} focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        onFlag(flagReason);
                                        setShowFlagInput(false);
                                        setFlagReason("");
                                    }}
                                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors"
                                >
                                    Submit
                                </button>
                                <button
                                    onClick={() => {
                                        setShowFlagInput(false);
                                        setFlagReason("");
                                    }}
                                    className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowFlagInput(true)}
                                className={`flex items-center gap-2 ${textSecondaryClass} hover:text-red-400 transition-colors text-[11px] font-medium px-2 py-1.5 rounded-sm hover:bg-white/5`}
                            >
                                <Flag className="w-3.5 h-3.5" />
                                Flag for Review
                            </button>
                        )}
                    </div>

                    {/* Primary Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/5 hover:bg-white/10'} ${textClass} rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors border border-white/10`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onApprove();
                                onClose();
                            }}
                            className="flex items-center gap-2 px-5 py-2 bg-olleey-yellow hover:bg-olleey-yellow/90 text-black rounded-sm font-bold shadow-lg shadow-olleey-yellow/20 transition-all hover:scale-105 text-[10px] uppercase tracking-wider"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approve & Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

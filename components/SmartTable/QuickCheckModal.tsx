import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Play, Pause, AlertCircle, CheckCircle, Flag, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Sparkles, User, RotateCcw, Languages, Image as ImageIcon, Check, Upload, Wand2, RefreshCw, Eye, Edit3, Type, Save } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";

interface QuickCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalVideoUrl?: string;
    dubbedVideoUrl?: string;
    languageName: string;
    videoTitle?: string;
    videoDescription?: string;
    onApprove: () => void;
    onFlag: (reason: string, category?: string) => void;
    isApproved?: boolean;
    approvedAt?: string;
}

export function QuickCheckModal({
    isOpen,
    onClose,
    originalVideoUrl,
    dubbedVideoUrl,
    languageName,
    videoTitle,
    videoDescription,
    onApprove,
    onFlag,
    isApproved = false,
    approvedAt
}: QuickCheckModalProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Refs for video syncing
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [flagReason, setFlagReason] = useState("");
    const [flagCategory, setFlagCategory] = useState("general");
    const [showFlagInput, setShowFlagInput] = useState(false);
    const [volume, setVolume] = useState(1);
    const [originalMuted, setOriginalMuted] = useState(true);
    const [dubbedMuted, setDubbedMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [checklist, setChecklist] = useState({
        lipSync: isApproved,
        translation: isApproved,
        tone: isApproved,
        audioQuality: isApproved
    });
    const [targetLanguage, setTargetLanguage] = useState(languageName === "Spanish" ? "ES" : "EN");
    const [thumbnailStrategy, setThumbnailStrategy] = useState<"original" | "converted" | "upload" | "generate">("original");
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
    const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState(videoTitle || "");
    const [editedDescription, setEditedDescription] = useState(videoDescription || "No description provided.");
    const [isGeneratingInfo, setIsGeneratingInfo] = useState(false);
    const [showInfoPreview, setShowInfoPreview] = useState(false);
    const [tempTitle, setTempTitle] = useState("");
    const [tempDescription, setTempDescription] = useState("");
    const [reprocessingItems, setReprocessingItems] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRedo = (key: string) => {
        setReprocessingItems(prev => ({ ...prev, [key]: true }));
        // Simulate processing for 3 seconds
        setTimeout(() => {
            setReprocessingItems(prev => ({ ...prev, [key]: false }));
            setChecklist(prev => ({ ...prev, [key]: true }));
        }, 3000);
    };

    const handleGenerateThumbnail = () => {
        setThumbnailStrategy("generate");
        setIsGeneratingThumbnail(true);
        setShowThumbnailPreview(false);
        // Simulate AI generation delay
        setTimeout(() => {
            setIsGeneratingThumbnail(false);
            setShowThumbnailPreview(true);
        }, 3500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCustomThumbnail(url);
            setThumbnailStrategy("upload");
            setShowThumbnailPreview(true);
        }
    };

    const handleGenerateInfo = () => {
        setIsGeneratingInfo(true);
        setShowInfoPreview(false);
        // Simulate AI Metadata Translation
        setTimeout(() => {
            setIsGeneratingInfo(false);
            setTempTitle(`${videoTitle || "Untitled"} [${targetLanguage === "ES" ? "SPAIN" : "EN"}_LOCALIZED]`);
            setTempDescription(`${videoDescription || "No original description."} \n\nLocalized for global distribution via Olleey AI.`);
            setShowInfoPreview(true);
        }, 2500);
    };

    const handleManualEdit = () => {
        setTempTitle(editedTitle);
        setTempDescription(editedDescription);
        setShowInfoPreview(true);
    };

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

    const toggleOriginalMute = () => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            setOriginalMuted(false);
            setDubbedMuted(true);
            originalVideoRef.current.muted = false;
            dubbedVideoRef.current.muted = true;
        }
    };

    const toggleDubbedMute = () => {
        if (originalVideoRef.current && dubbedVideoRef.current) {
            setOriginalMuted(true);
            setDubbedMuted(false);
            originalVideoRef.current.muted = true;
            dubbedVideoRef.current.muted = false;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (originalVideoRef.current) originalVideoRef.current.volume = newVolume;
        if (dubbedVideoRef.current) dubbedVideoRef.current.volume = newVolume;
    };

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        if (originalVideoRef.current && dubbedVideoRef.current) {
            originalVideoRef.current.playbackRate = speed;
            dubbedVideoRef.current.playbackRate = speed;
        }
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        setCurrentTime(video.currentTime);

        // Sync the other video if it exists
        const otherVideo = video === originalVideoRef.current ? dubbedVideoRef.current : originalVideoRef.current;
        if (otherVideo && Math.abs(video.currentTime - otherVideo.currentTime) > 0.1) {
            otherVideo.currentTime = video.currentTime;
        }
    };

    const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setDuration(e.currentTarget.duration);
    };

    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);

    // Simplified effect - we'll use event props instead
    useEffect(() => {
        if (!isOpen) {
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [isOpen]);

    // Also update checklist if isApproved changes
    useEffect(() => {
        if (isApproved) {
            setChecklist({
                lipSync: true,
                translation: true,
                tone: true,
                audioQuality: true
            });
        }
    }, [isApproved]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            {/* Modal Content */}
            <div className={`relative ${cardClass} rounded-none shadow-2xl border border-white/10 w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh]`}>

                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b border-white/10 ${isApproved ? 'bg-green-500/10' : 'bg-gradient-to-r from-olleey-yellow/10 to-transparent'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-2 ${isApproved ? 'bg-green-500/20 border-green-500/30' : 'bg-olleey-yellow/20 border-olleey-yellow/30'} rounded-none border`}>
                            {isApproved ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Sparkles className="w-5 h-5 text-olleey-yellow" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className={`text-lg font-black ${textClass} tracking-tight uppercase`}>
                                    {isApproved ? 'Live Production' : 'Review Hub'}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 ${isApproved ? 'bg-green-500 text-white' : 'bg-olleey-yellow text-black'} text-[9px] font-black uppercase tracking-widest rounded-none`}>
                                        {targetLanguage === "ES" ? "Spanish" : "English"} {isApproved ? 'Live' : 'Stage'}
                                    </span>
                                    {!isApproved && (
                                        <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-none">
                                            <button
                                                onClick={() => setTargetLanguage("EN")}
                                                className={`px-1.5 py-0.5 text-[8px] font-black uppercase transition-all ${targetLanguage === "EN" ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white/60'}`}
                                            >
                                                EN
                                            </button>
                                            <button
                                                onClick={() => setTargetLanguage("ES")}
                                                className={`px-1.5 py-0.5 text-[8px] font-black uppercase transition-all ${targetLanguage === "ES" ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white/60'}`}
                                            >
                                                ES
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className={`text-[11px] ${textSecondaryClass} font-medium flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[500px]`}>
                                {videoTitle || "Operational Quality Check"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {isApproved && approvedAt && (
                            <div className="hidden md:flex flex-col items-end px-4 border-l border-white/10">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Approved On</p>
                                <p className="text-xs font-mono text-green-500">{new Date(approvedAt).toLocaleDateString()}</p>
                            </div>
                        )}
                        <div className="hidden md:flex items-center gap-6 px-4 py-1.5 border-l border-white/10">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Time Code</p>
                                <p className="text-xs font-mono text-olleey-yellow">{formatTime(currentTime)} / {formatTime(duration)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-none hover:bg-white/10 ${textSecondaryClass} hover:${textClass} transition-colors border border-white/10`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* Left Side: Video Players */}
                    <div className="flex-1 flex flex-col bg-black overflow-hidden border-r border-white/10">
                        <div className="flex-1 grid grid-cols-2 gap-px relative group">
                            {/* Original */}
                            <div
                                onClick={toggleOriginalMute}
                                className={cn(
                                    "relative bg-black group/orig overflow-hidden transition-all duration-300 cursor-pointer",
                                    !originalMuted ? "ring-2 ring-olleey-yellow scale-[1.01] z-20 shadow-[0_0_40px_rgba(251,191,36,0.2)]" : "opacity-40 hover:opacity-100 grayscale-[0.5] hover:grayscale-0"
                                )}
                            >
                                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "backdrop-blur-md text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all",
                                            !originalMuted ? "bg-olleey-yellow text-black border-olleey-yellow" : "bg-black/80 border-white/20"
                                        )}>
                                            Original Master
                                        </span>
                                        {!originalMuted && <div className="bg-olleey-yellow w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                                    </div>
                                </div>
                                <video
                                    ref={originalVideoRef}
                                    src={originalVideoUrl}
                                    className="w-full h-full object-contain"
                                    muted={originalMuted}
                                    onTimeUpdate={handleVideoTimeUpdate}
                                    onLoadedMetadata={handleVideoLoadedMetadata}
                                    onPlay={handleVideoPlay}
                                    onPause={handleVideoPause}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover/orig:opacity-100 transition-opacity" />
                            </div>

                            {/* Dubbed */}
                            <div
                                onClick={toggleDubbedMute}
                                className={cn(
                                    "relative bg-black group/dub overflow-hidden transition-all duration-300 cursor-pointer",
                                    !dubbedMuted ? "ring-2 ring-olleey-yellow scale-[1.01] z-20 shadow-[0_0_40px_rgba(251,191,36,0.2)]" : "opacity-40 hover:opacity-100 grayscale-[0.5] hover:grayscale-0"
                                )}
                            >
                                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all",
                                            !dubbedMuted ? "bg-olleey-yellow text-black border-olleey-yellow" : "bg-black/80 text-white border-white/20"
                                        )}>
                                            {targetLanguage === "ES" ? "Spanish" : "English"} Production
                                        </span>
                                        {!dubbedMuted && <div className="bg-olleey-yellow w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                                    </div>
                                </div>
                                <video
                                    ref={dubbedVideoRef}
                                    src={dubbedVideoUrl}
                                    className="w-full h-full object-contain"
                                    muted={dubbedMuted}
                                    onTimeUpdate={handleVideoTimeUpdate}
                                    onLoadedMetadata={handleVideoLoadedMetadata}
                                    onPlay={handleVideoPlay}
                                    onPause={handleVideoPause}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover/dub:opacity-100 transition-opacity" />
                            </div>

                            {/* Play Overlay */}
                            <button
                                onClick={togglePlay}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-olleey-yellow/30 hover:bg-olleey-yellow/40 backdrop-blur-xl rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border-2 border-olleey-yellow/50 scale-90 group-hover:scale-100 shadow-[0_0_50px_rgba(251,191,36,0.3)] z-30"
                            >
                                {isPlaying ? <Pause className="w-10 h-10 text-olleey-yellow fill-current" /> : <Play className="w-10 h-10 text-olleey-yellow fill-current ml-2" />}
                            </button>
                        </div>

                        {/* Player Controls Panel */}
                        <div className="bg-[#050505] p-4 border-t border-white/10 space-y-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlay}
                                    className="p-3 bg-white/5 border border-white/10 hover:bg-olleey-yellow hover:text-black transition-all rounded-none"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                                </button>

                                <div className="flex items-center gap-1">
                                    <button onClick={() => skipTime(-5)} className="p-2 text-white/40 hover:text-white transition-colors">
                                        <SkipBack className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => skipTime(5)} className="p-2 text-white/40 hover:text-white transition-colors">
                                        <SkipForward className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 px-4">
                                    <div className="relative group/slider h-8 flex items-center">
                                        <input
                                            type="range"
                                            min="0"
                                            max={duration || 100}
                                            value={currentTime}
                                            onChange={handleSeek}
                                            className="w-full h-1.5 bg-white/10 rounded-none appearance-none cursor-pointer transition-all hover:h-2"
                                            style={{
                                                background: `linear-gradient(to right, rgb(251, 191, 36) 0%, rgb(251, 191, 36) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-white/5 border border-white/10 p-0.5 rounded-none mr-2">
                                            <button
                                                onClick={toggleOriginalMute}
                                                className={`px-2 py-1 text-[8px] font-black uppercase transition-all ${(!originalMuted) ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white/60'}`}
                                                title="Solo Original"
                                            >
                                                ORIG
                                            </button>
                                            <button
                                                onClick={toggleDubbedMute}
                                                className={`px-2 py-1 text-[8px] font-black uppercase transition-all ${(!dubbedMuted) ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white/60'}`}
                                                title="Solo Dubbed"
                                            >
                                                DUB
                                            </button>
                                        </div>
                                        <div className="text-white/40">
                                            {(!originalMuted && !dubbedMuted) ? <Volume2 className="w-4 h-4 text-olleey-yellow" /> : <Volume2 className="w-4 h-4" />}
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-20 h-1 bg-white/10 rounded-none appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1">
                                        {[0.5, 1, 1.5, 2].map((speed) => (
                                            <button
                                                key={speed}
                                                onClick={() => changePlaybackSpeed(speed)}
                                                className={`px-2 py-1 text-[9px] font-black uppercase transition-all ${playbackSpeed === speed ? 'bg-olleey-yellow text-black' : 'text-white/40 hover:text-white'}`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Options & Info */}
                    <div className={`w-[340px] flex flex-col ${cardClass} overflow-y-auto custom-scrollbar border-l border-white/5`}>
                        <div className="p-6 space-y-8">
                            {/* Target Language Switcher (Mobile/Panel) */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 flex items-center gap-2">
                                    <Languages className="w-3.5 h-3.5" /> Target Production
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setTargetLanguage("EN")}
                                        className={`flex flex-col items-center justify-center p-3 border transition-all rounded-none gap-2 ${targetLanguage === "EN" ? 'border-olleey-yellow bg-olleey-yellow/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <span className={`text-[12px] font-black ${targetLanguage === "EN" ? 'text-olleey-yellow' : 'text-white/40'}`}>ENGLISH</span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${targetLanguage === "EN" ? 'bg-olleey-yellow animate-pulse' : 'bg-white/10'}`} />
                                    </button>
                                    <button
                                        onClick={() => setTargetLanguage("ES")}
                                        className={`flex flex-col items-center justify-center p-3 border transition-all rounded-none gap-2 ${targetLanguage === "ES" ? 'border-olleey-yellow bg-olleey-yellow/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <span className={`text-[12px] font-black ${targetLanguage === "ES" ? 'text-olleey-yellow' : 'text-white/40'}`}>SPANISH</span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${targetLanguage === "ES" ? 'bg-olleey-yellow animate-pulse' : 'bg-white/10'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Status Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5" /> Quality Assurance
                                    </div>
                                    <span className="text-[8px] font-bold text-olleey-yellow/50">STAGE VERIFICATION</span>
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(checklist).map(([key, value]) => (
                                        <div key={key} className="relative group/qa">
                                            <div
                                                role="button"
                                                tabIndex={isApproved || reprocessingItems[key] ? -1 : 0}
                                                onClick={() => !isApproved && !reprocessingItems[key] && setChecklist(prev => ({ ...prev, [key]: !value }))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        if (!isApproved && !reprocessingItems[key]) {
                                                            setChecklist(prev => ({ ...prev, [key]: !value }));
                                                        }
                                                    }
                                                }}
                                                className={`w-full flex items-center justify-between p-3 border transition-all rounded-none 
                                                    ${reprocessingItems[key] ? 'border-olleey-yellow/30 bg-olleey-yellow/5 animate-pulse' :
                                                        value ? 'border-green-500/50 bg-green-500/5' : 'border-white/5 bg-white/5 hover:border-white/20'} 
                                                    ${isApproved ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <span className={`text-[10px] font-black uppercase tracking-tight ${reprocessingItems[key] ? 'text-olleey-yellow' : value ? 'text-green-500' : 'text-white/60'}`}>
                                                        {key.replace(/([A-Z])/g, ' $1')}
                                                    </span>
                                                    {reprocessingItems[key] && (
                                                        <span className="text-[8px] font-bold text-olleey-yellow/60 uppercase">Reprocessing...</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {!isApproved && !reprocessingItems[key] && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRedo(key);
                                                            }}
                                                            className="p-1.5 bg-white/5 hover:bg-olleey-yellow hover:text-black rounded-none border border-white/10 transition-all opacity-0 group-hover/qa:opacity-100"
                                                            title={`Redo ${key}`}
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <div className={`w-4 h-4 border flex items-center justify-center transition-all ${reprocessingItems[key] ? 'border-olleey-yellow' : value ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                                                        {reprocessingItems[key] ? (
                                                            <div className="w-1.5 h-1.5 bg-olleey-yellow animate-ping rounded-full" />
                                                        ) : value && (
                                                            <Check className="w-3 h-3 text-black stroke-[3px]" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnail Strategy */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5" /> Thumbnail Strategy
                                </h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => { setThumbnailStrategy("original"); setShowThumbnailPreview(false); }}
                                        className={`w-full flex items-center gap-3 p-3 border transition-all rounded-none ${thumbnailStrategy === "original" ? 'border-olleey-yellow bg-olleey-yellow/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${thumbnailStrategy === "original" ? 'border-olleey-yellow bg-olleey-yellow' : 'border-white/20'}`}>
                                            {thumbnailStrategy === "original" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className={`text-[10px] font-black uppercase ${thumbnailStrategy === "original" ? 'text-white' : 'text-white/40'}`}>Keep Original</span>
                                            <span className="text-[8px] font-medium text-white/20">Source thumbnail will be reused</span>
                                        </div>
                                    </button>

                                    {/* Upload Option */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full flex items-center gap-3 p-3 border transition-all rounded-none ${thumbnailStrategy === "upload" ? 'border-olleey-yellow bg-olleey-yellow/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${thumbnailStrategy === "upload" ? 'border-olleey-yellow bg-olleey-yellow' : 'border-white/20'}`}>
                                            {thumbnailStrategy === "upload" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <span className={`text-[10px] font-black uppercase ${thumbnailStrategy === "upload" ? 'text-white' : 'text-white/40'} flex items-center gap-2`}>
                                                Upload Custom <Upload className="w-2.5 h-2.5" />
                                            </span>
                                            <span className="text-[8px] font-medium text-white/20">Manually select localized asset</span>
                                        </div>
                                    </button>

                                    {/* Generate Option */}
                                    <button
                                        onClick={handleGenerateThumbnail}
                                        disabled={isGeneratingThumbnail}
                                        className={`w-full flex items-center gap-3 p-3 border transition-all rounded-none ${thumbnailStrategy === "generate" ? 'border-olleey-yellow bg-olleey-yellow/5' : 'border-white/5 bg-white/5 hover:border-white/20'} ${isGeneratingThumbnail ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${thumbnailStrategy === "generate" ? 'border-olleey-yellow bg-olleey-yellow' : 'border-white/20'}`}>
                                            {thumbnailStrategy === "generate" && !isGeneratingThumbnail && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                            {isGeneratingThumbnail && <RefreshCw className="w-2 h-2 text-olleey-yellow animate-spin" />}
                                        </div>
                                        <div className="flex flex-col items-start text-left flex-1">
                                            <span className={`text-[10px] font-black uppercase ${thumbnailStrategy === "generate" ? 'text-white' : 'text-white/40'} flex items-center gap-2`}>
                                                AI Generate <Wand2 className="w-2.5 h-2.5" />
                                            </span>
                                            <span className="text-[8px] font-medium text-olleey-yellow/60">
                                                {isGeneratingThumbnail ? "Neural Engine active..." : "Synthesize localized thumbnail"}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Preview State */}
                                    {showThumbnailPreview && (
                                        <div className="p-3 bg-olleey-yellow border border-olleey-yellow rounded-none animate-in fade-in slide-in-from-top-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                                    <Eye className="w-3 h-3" /> Preview Ready
                                                </span>
                                                <button
                                                    onClick={() => setShowThumbnailPreview(false)}
                                                    className="text-[8px] font-black text-black/40 hover:text-black uppercase underline"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                            <div className="aspect-video bg-black/20 border border-black/10 overflow-hidden relative group">
                                                {thumbnailStrategy === "upload" && customThumbnail ? (
                                                    <img src={customThumbnail} className="w-full h-full object-cover" alt="Custom" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-black/20 italic text-[10px] font-mono">
                                                        [ AI_GEN_THUMBNAIL_DRAFT ]
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button className="bg-white text-black px-3 py-1 text-[8px] font-black uppercase">Click to Expand</button>
                                                </div>
                                            </div>
                                            <button
                                                className="w-full mt-2 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors border border-black"
                                                onClick={() => setShowThumbnailPreview(false)}
                                            >
                                                Confirm Selection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Section - Interactive */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 flex items-center gap-2">
                                    <Type className="w-3.5 h-3.5" /> Production Info
                                </h4>

                                <div className="flex gap-1.5 mb-4">
                                    <button
                                        onClick={handleManualEdit}
                                        className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 text-[8px] font-black text-white hover:bg-white/10 uppercase transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit3 className="w-2.5 h-2.5" /> Manual Edit
                                    </button>
                                    <button
                                        onClick={handleGenerateInfo}
                                        disabled={isGeneratingInfo}
                                        className="flex-[2] px-4 py-1.5 bg-olleey-yellow text-[9px] font-black text-black hover:bg-olleey-yellow/90 uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isGeneratingInfo ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 fill-current" />}
                                        {isGeneratingInfo ? "Processing..." : "AI Generate Metadata"}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-3 bg-[#050505] border border-white/5 rounded-none relative group">
                                        <div className="mb-3">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                                                Primary Title
                                                <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                                            </p>
                                            <p className="text-[11px] font-bold text-white leading-tight">{editedTitle || "Unnamed Project"}</p>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Description</p>
                                            <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{editedDescription}</p>
                                        </div>
                                        <div className="pt-2 border-t border-white/[0.04]">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Current Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1 h-1 rounded-full ${isApproved ? 'bg-green-500' : 'bg-olleey-yellow animate-pulse'}`} />
                                                <p className="text-[10px] text-white/50 italic">
                                                    {isApproved ? "Production Live" : "Review Stage Active"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Preview State */}
                                    {showInfoPreview && (
                                        <div className="p-3 bg-olleey-yellow border border-olleey-yellow rounded-none animate-in fade-in slide-in-from-top-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                                    <Save className="w-3 h-3" /> Metadata Update
                                                </span>
                                                <button
                                                    onClick={() => setShowInfoPreview(false)}
                                                    className="text-[8px] font-black text-black/40 hover:text-black uppercase underline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>

                                            <div className="space-y-4 mb-4">
                                                <div>
                                                    <label className="text-[8px] font-black text-black/60 uppercase block mb-1">Localized Title</label>
                                                    <input
                                                        type="text"
                                                        value={tempTitle}
                                                        onChange={(e) => setTempTitle(e.target.value)}
                                                        className="w-full bg-black/10 border border-black/10 p-2 text-[11px] font-bold text-black outline-none focus:border-black/30"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-black/60 uppercase block mb-1">Localized Description</label>
                                                    <textarea
                                                        value={tempDescription}
                                                        onChange={(e) => setTempDescription(e.target.value)}
                                                        className="w-full bg-black/10 border border-black/10 p-2 text-[10px] font-medium text-black outline-none focus:border-black/30 min-h-[100px] resize-none"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                className="w-full py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                                onClick={() => {
                                                    setEditedTitle(tempTitle);
                                                    setEditedDescription(tempDescription);
                                                    setShowInfoPreview(false);
                                                }}
                                            >
                                                Commit Metadata
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Flagging Controls - Simplified */}
                            {!isApproved && (
                                <div>
                                    {showFlagInput ? (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {['sync', 'audio', 'visual', 'general'].map((cat) => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setFlagCategory(cat)}
                                                        className={`px-2 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all rounded-none ${flagCategory === cat ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={flagReason}
                                                onChange={(e) => setFlagReason(e.target.value)}
                                                placeholder="Technical anomaly details..."
                                                className="w-full h-20 bg-[#050505] border border-white/10 p-2 text-[10px] text-white focus:border-red-500 outline-none transition-colors rounded-none"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        onFlag(flagReason, flagCategory);
                                                        setShowFlagInput(false);
                                                    }}
                                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Confirm Flag
                                                </button>
                                                <button
                                                    onClick={() => setShowFlagInput(false)}
                                                    className="px-3 py-2 bg-white/5 text-white/40 text-[9px] font-black uppercase transition-all"
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowFlagInput(true)}
                                            className="w-full py-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2"
                                        >
                                            <Flag className="w-3 h-3" /> Rejection Protocol
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Final Actions Footer */}
                <div className="px-6 py-4 bg-[#050505] border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-olleey-yellow/20 flex items-center justify-center overflow-hidden">
                                    <User className="w-3 h-3 text-olleey-yellow" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] text-white/30 font-medium ml-2 uppercase tracking-tight">
                            {isApproved ? 'Approved by production team' : 'Review shared with production team'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all border border-white/5 hover:bg-white/5"
                        >
                            {isApproved ? 'Close Panel' : 'Decline Review'}
                        </button>
                        {!isApproved && (
                            <button
                                onClick={() => {
                                    onApprove();
                                    onClose();
                                }}
                                className="group relative flex items-center gap-3 px-10 py-3 bg-olleey-yellow hover:bg-olleey-yellow/90 text-black font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Approve & Publish
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none skew-x-12" />
                            </button>
                        )}
                        {isApproved && (
                            <div className="flex items-center gap-3 px-10 py-3 bg-white/5 text-white/40 font-black uppercase tracking-[0.2em] border border-white/10 cursor-default">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Already Approved
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

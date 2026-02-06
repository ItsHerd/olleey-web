import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Play, Pause, AlertCircle, CheckCircle, Flag, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Sparkles, User, RotateCcw, Languages, Image as ImageIcon, Check } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

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
    const [thumbnailStrategy, setThumbnailStrategy] = useState<"original" | "converted">("converted");
    const [reprocessingItems, setReprocessingItems] = useState<Record<string, boolean>>({});

    const handleRedo = (key: string) => {
        setReprocessingItems(prev => ({ ...prev, [key]: true }));
        // Simulate processing for 3 seconds
        setTimeout(() => {
            setReprocessingItems(prev => ({ ...prev, [key]: false }));
            setChecklist(prev => ({ ...prev, [key]: true }));
        }, 3000);
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
        if (originalVideoRef.current) {
            originalVideoRef.current.muted = !originalMuted;
            setOriginalMuted(!originalMuted);
        }
    };

    const toggleDubbedMute = () => {
        if (dubbedVideoRef.current) {
            dubbedVideoRef.current.muted = !dubbedMuted;
            setDubbedMuted(!dubbedMuted);
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
                            <div className="relative bg-black group/orig overflow-hidden">
                                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-black/80 backdrop-blur-md text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/20">
                                            Original Master
                                        </span>
                                        <button 
                                            onClick={toggleOriginalMute}
                                            className={`${originalMuted ? 'bg-red-500/80 border-red-500/50' : 'bg-green-500/80 border-green-500/50'} backdrop-blur-md text-white px-2 py-1 text-[9px] font-black flex items-center gap-1.5 border transition-all hover:scale-105 active:scale-95`}
                                        >
                                            {originalMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                            {originalMuted ? 'MUTED' : 'LIVE'}
                                        </button>
                                    </div>
                                </div>
                                <video
                                    ref={originalVideoRef}
                                    src={originalVideoUrl}
                                    className="w-full h-full object-contain"
                                    muted={originalMuted}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover/orig:opacity-100 transition-opacity" />
                            </div>

                            {/* Dubbed */}
                            <div className="relative bg-black group/dub overflow-hidden border-l border-white/10">
                                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`${isApproved ? 'bg-green-500 text-white' : 'bg-olleey-yellow text-black'} px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${isApproved ? 'border-green-500 shadow-green-500/20' : 'border-olleey-yellow shadow-olleey-yellow/20'} shadow-lg`}>
                                            {targetLanguage === "ES" ? "Spanish" : "English"} Production
                                        </span>
                                        <button 
                                            onClick={toggleDubbedMute}
                                            className={`${dubbedMuted ? 'bg-red-500/80 border-red-500/50' : 'bg-green-500/80 border-green-500/50'} backdrop-blur-md text-white px-2 py-1 text-[9px] font-black flex items-center gap-1.5 border transition-all hover:scale-105 active:scale-95`}
                                        >
                                            {dubbedMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                            {dubbedMuted ? 'MUTED' : 'STEREOPHONIC'}
                                        </button>
                                    </div>
                                </div>
                                <video
                                    ref={dubbedVideoRef}
                                    src={dubbedVideoUrl}
                                    className="w-full h-full object-contain"
                                    muted={dubbedMuted}
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
                                                onClick={() => { setOriginalMuted(false); setDubbedMuted(true); }}
                                                className={`px-2 py-1 text-[8px] font-black uppercase transition-all ${(!originalMuted && dubbedMuted) ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white/60'}`}
                                                title="Solo Original"
                                            >
                                                ORIG
                                            </button>
                                            <button 
                                                onClick={() => { setOriginalMuted(true); setDubbedMuted(false); }}
                                                className={`px-2 py-1 text-[8px] font-black uppercase transition-all ${(originalMuted && !dubbedMuted) ? 'bg-white/20 text-white' : 'text-white/30 hover:text-white/60'}`}
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
                                            <button
                                                disabled={isApproved || reprocessingItems[key]}
                                                onClick={() => !isApproved && setChecklist(prev => ({ ...prev, [key]: !value }))}
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
                                            </button>
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
                                        onClick={() => setThumbnailStrategy("original")}
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
                                    <button
                                        onClick={() => setThumbnailStrategy("converted")}
                                        className={`w-full flex items-center gap-3 p-3 border transition-all rounded-none ${thumbnailStrategy === "converted" ? 'border-olleey-yellow bg-olleey-yellow/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${thumbnailStrategy === "converted" ? 'border-olleey-yellow bg-olleey-yellow' : 'border-white/20'}`}>
                                            {thumbnailStrategy === "converted" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className={`text-[10px] font-black uppercase ${thumbnailStrategy === "converted" ? 'text-white' : 'text-white/40'}`}>Convert Thumbnail</span>
                                            <span className="text-[8px] font-medium text-olleey-yellow/60">AI-localization for {targetLanguage === "ES" ? "Spanish" : "English"}</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Metadata Section - Compact */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Production Info</h4>
                                <div className="p-3 bg-[#050505] border border-white/5 rounded-none">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Primary Title</p>
                                    <p className="text-[11px] font-bold text-white mb-3 leading-tight">{videoTitle || "Unnamed Project"}</p>
                                    <div className="pt-2 border-t border-white/[0.04]">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-[10px] text-white/50 italic line-clamp-2">
                                            {isApproved ? "Production Live" : "Review Stage Active"}
                                        </p>
                                    </div>
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
                                Approve & Distribute
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

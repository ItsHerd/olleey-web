import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Play, Pause, AlertCircle, CheckCircle, Flag, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Sparkles, User } from "lucide-react";
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
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [checklist, setChecklist] = useState({
        lipSync: isApproved,
        translation: isApproved,
        tone: isApproved,
        audioQuality: isApproved
    });

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
                                <span className={`px-2 py-0.5 ${isApproved ? 'bg-green-500 text-white' : 'bg-olleey-yellow text-black'} text-[9px] font-black uppercase tracking-widest rounded-none`}>
                                    {languageName} {isApproved ? 'Live' : 'Stage'}
                                </span>
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
                                        <span className="bg-red-500/80 backdrop-blur-md text-white px-2 py-1 text-[9px] font-black flex items-center gap-1.5 border border-red-500/50">
                                            <VolumeX className="w-3.5 h-3.5" />
                                            MUTED
                                        </span>
                                    </div>
                                </div>
                                <video
                                    ref={originalVideoRef}
                                    src={originalVideoUrl}
                                    className="w-full h-full object-contain"
                                    muted
                                />
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover/orig:opacity-100 transition-opacity" />
                            </div>

                            {/* Dubbed */}
                            <div className="relative bg-black group/dub overflow-hidden border-l border-white/10">
                                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`${isApproved ? 'bg-green-500 text-white' : 'bg-olleey-yellow text-black'} px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${isApproved ? 'border-green-500 shadow-green-500/20' : 'border-olleey-yellow shadow-olleey-yellow/20'} shadow-lg`}>
                                            {languageName} Production
                                        </span>
                                        <span className="bg-green-500/80 backdrop-blur-md text-white px-2 py-1 text-[9px] font-black flex items-center gap-1.5 border border-green-500/50">
                                            <Volume2 className="w-3.5 h-3.5" />
                                            STEREOPHONIC
                                        </span>
                                    </div>
                                </div>
                                <video
                                    ref={dubbedVideoRef}
                                    src={dubbedVideoUrl}
                                    className="w-full h-full object-contain"
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
                                        <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
                                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
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
                    <div className={`w-80 flex flex-col ${cardClass} overflow-y-auto custom-scrollbar`}>
                        <div className="p-6 space-y-8">
                            {/* Status Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5" /> Quality Assurance
                                </h4>
                                <div className="space-y-3">
                                    {Object.entries(checklist).map(([key, value]) => (
                                        <button
                                            key={key}
                                            disabled={isApproved}
                                            onClick={() => !isApproved && setChecklist(prev => ({ ...prev, [key]: !value }))}
                                            className={`w-full flex items-center justify-between p-3 border transition-all rounded-none ${value ? 'border-green-500/50 bg-green-500/5' : 'border-white/5 bg-white/5 hover:border-white/20'} ${isApproved ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            <span className={`text-[11px] font-bold uppercase tracking-tight ${value ? 'text-green-500' : 'text-white/60'}`}>
                                                {key.replace(/([A-Z])/g, ' $1')}
                                            </span>
                                            <div className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${value ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                                                {value && <CheckCircle className="w-3 h-3 text-black fill-current" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Metadata Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Production Info</h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-none space-y-3">
                                        <div>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Primary Title</p>
                                            <p className="text-xs font-bold text-white line-clamp-2">{videoTitle || "Unnamed Project"}</p>
                                        </div>
                                        <div className="pt-3 border-t border-white/[0.04]">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">{isApproved ? 'Live Description' : 'Draft Description'}</p>
                                            <p className="text-xs text-white/50 leading-relaxed italic line-clamp-4">
                                                {videoDescription || "No production notes provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Flagging Controls - Only show if not approved */}
                            {!isApproved && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Feedback Protocol</h4>
                                    {showFlagInput ? (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-2 gap-2">
                                                {['sync', 'audio', 'visual', 'general'].map((cat) => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setFlagCategory(cat)}
                                                        className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border transition-all rounded-none ${flagCategory === cat ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={flagReason}
                                                onChange={(e) => setFlagReason(e.target.value)}
                                                placeholder="Specify technical anomaly..."
                                                className="w-full h-24 bg-[#050505] border border-white/10 p-3 text-xs text-white focus:border-red-500 outline-none transition-colors rounded-none placeholder:text-white/10"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        onFlag(flagReason, flagCategory);
                                                        setShowFlagInput(false);
                                                    }}
                                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Initiate Flag
                                                </button>
                                                <button
                                                    onClick={() => setShowFlagInput(false)}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowFlagInput(true)}
                                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2"
                                        >
                                            <Flag className="w-3.5 h-3.5" /> Rejection Protocol
                                        </button>
                                    )}
                                </div>
                            )}

                            {isApproved && (
                                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Quality Verified</span>
                                    </div>
                                    <p className="text-[10px] text-white/40 leading-relaxed">
                                        This production has passed all quality assurance checks and is currently distributed across global hubs.
                                    </p>
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

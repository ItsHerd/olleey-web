"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPreviewPlayerProps {
  audioUrl: string;
  title?: string;
  theme: string;
  languageCode?: string;
}

export function AudioPreviewPlayer({ audioUrl, title, theme, languageCode }: AudioPreviewPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const isDark = theme === "dark";

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: isDark ? "#666" : "#999",
      progressColor: "#FFC107",
      cursorColor: "#FFC107",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 80,
      normalize: true,
      backend: "WebAudio",
      interact: true,
      hideScrollbar: true,
    });

    // Load audio
    wavesurfer.load(audioUrl);

    // Event listeners
    wavesurfer.on("loading", () => {
      setIsLoading(true);
    });

    wavesurfer.on("ready", () => {
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on("play", () => {
      setIsPlaying(true);
    });

    wavesurfer.on("pause", () => {
      setIsPlaying(false);
    });

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
      wavesurfer.seekTo(0);
    });

    wavesurfer.on("audioprocess", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("interaction" as any, () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurferRef.current = wavesurfer;

    // Cleanup
    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, isDark]);

  // Update volume
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  // Update playback rate
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const skipForward = () => {
    if (wavesurferRef.current) {
      const current = wavesurferRef.current.getCurrentTime();
      const newTime = Math.min(current + 10, duration);
      wavesurferRef.current.seekTo(newTime / duration);
    }
  };

  const skipBackward = () => {
    if (wavesurferRef.current) {
      const current = wavesurferRef.current.getCurrentTime();
      const newTime = Math.max(current - 10, 0);
      wavesurferRef.current.seekTo(newTime / duration);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn(
      "w-full rounded-lg p-4 border",
      isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-200"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#FFC107]" />
          <h4 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
            {title || "Dubbed Audio"} {languageCode && `(${languageCode.toUpperCase()})`}
          </h4>
        </div>

        {/* Playback Speed Selector */}
        <div className="flex items-center gap-1">
          {[0.5, 1, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded transition-all",
                playbackRate === rate
                  ? isDark
                    ? "bg-[#FFC107] text-black"
                    : "bg-[#FFC107] text-black"
                  : isDark
                  ? "bg-white/5 text-white/60 hover:bg-white/10"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Waveform */}
      <div className="relative mb-3">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded">
            <Loader2 className="w-6 h-6 animate-spin text-[#FFC107]" />
          </div>
        )}
        <div ref={waveformRef} className="w-full" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Skip Backward */}
        <button
          onClick={skipBackward}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-full transition-all",
            isDark ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            "bg-[#FFC107] hover:bg-[#FFC107]/90 text-black shadow-lg",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={skipForward}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-full transition-all",
            isDark ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Time Display */}
        <div className={cn("text-xs font-mono flex-shrink-0", isDark ? "text-white/60" : "text-gray-500")}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleMute}
            className={cn(
              "p-2 rounded-full transition-all",
              isDark ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            )}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={cn(
              "w-20 h-1 rounded-full appearance-none cursor-pointer",
              isDark ? "bg-white/20" : "bg-gray-300",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFC107]"
            )}
          />
        </div>
      </div>
    </div>
  );
}

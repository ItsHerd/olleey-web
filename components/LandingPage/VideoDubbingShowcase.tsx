"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeaturesSectionWithBentoGrid } from "@/components/ui/feature-section-with-bento-grid";

interface VideoPlayerProps {
  src: string;
  label: string;
  isMuted: boolean;
  onToggleMute: (e: React.MouseEvent) => void;
  isPlaying: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  progress: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  onActivate: () => void;
}

function VideoPlayer({ src, label, isMuted, onToggleMute, isPlaying, onTogglePlay, progress, videoRef, isActive, onActivate }: VideoPlayerProps) {
  return (
    <div
      onClick={onActivate}
      className={cn(
        "relative bg-black transition-all duration-300 aspect-video group overflow-hidden cursor-pointer rounded-[2rem]",
        isActive ? "ring-2 ring-green-500 scale-[1.01] z-20 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "border border-black/10 dark:border-white/10 opacity-60 hover:opacity-100"
      )}
    >
      <div className="absolute top-4 left-4 z-20 flex gap-2 text-[9px] font-mono text-white/60">
        <span
          className={cn(
            "border px-1 bg-black/50 backdrop-blur-sm transition-colors",
            isActive ? "border-green-500 text-green-500" : "border-white/20 text-white/60"
          )}
        >
          {label}
        </span>
        {isPlaying && <span className="animate-pulse text-red-500">LIVE</span>}
      </div>

      <video ref={videoRef} src={src} className="w-full h-full object-cover" playsInline muted={isMuted} loop />

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
        <motion.div className={cn("h-full transition-colors", isActive ? "bg-green-500" : "bg-white")} style={{ width: `${progress}%` }} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
        <button
          onClick={onTogglePlay}
          className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
      </div>

      <button
        onClick={onToggleMute}
        className={cn(
          "absolute bottom-4 right-4 z-30 w-8 h-8 backdrop-blur-md border rounded-full flex items-center justify-center transition-all",
          !isMuted ? "bg-green-500 border-green-400 text-black" : "bg-black/50 border-white/20 text-white hover:bg-white/10"
        )}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </div>
  );
}

export default function VideoDubbingShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAudio, setActiveAudio] = useState<"en" | "es">("en");
  const [progress, setProgress] = useState(0);

  const videoRefEn = useRef<HTMLVideoElement>(null);
  const videoRefEs = useRef<HTMLVideoElement>(null);

  const isMutedEn = activeAudio !== "en";
  const isMutedEs = activeAudio !== "es";

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRefEn.current || !videoRefEs.current) return;

    if (isPlaying) {
      videoRefEn.current.pause();
      videoRefEs.current.pause();
    } else {
      videoRefEn.current.play();
      videoRefEs.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (lang: "en" | "es", e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAudio(lang);
  };

  const handleReset = () => {
    if (!videoRefEn.current || !videoRefEs.current) return;
    videoRefEn.current.currentTime = 0;
    videoRefEs.current.currentTime = 0;
    if (isPlaying) {
      videoRefEn.current.play();
      videoRefEs.current.play();
    }
  };

  useEffect(() => {
    const video = videoRefEn.current;
    if (!video) return;

    const updateProgress = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRefEn.current && videoRefEs.current && isPlaying) {
        const diff = Math.abs(videoRefEn.current.currentTime - videoRefEs.current.currentTime);
        if (diff > 0.3) {
          videoRefEs.current.currentTime = videoRefEn.current.currentTime;
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <>
      <FeaturesSectionWithBentoGrid />

      <section id="showcase" className="pt-20 md:pt-24 pb-8 bg-[#FAFAFA] dark:bg-[#07080b] border-t border-black/10 dark:border-white/10 relative overflow-hidden transition-colors duration-300">

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[90px] relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 font-sans transition-colors duration-300"
            >
              Original vs. <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 dark:from-green-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent transition-colors duration-300">Dubbed.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans leading-relaxed mx-auto transition-colors duration-300"
            >
              Parallel comparison of the original English video and its AI-dubbed Spanish version.
              Click either video to switch the audio track and compare the output.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 mb-12">
            <VideoPlayer
              src="https://olleey-videos.s3.us-west-1.amazonaws.com/en.mp4"
              label="SOURCE_EN"
              isMuted={isMutedEn}
              onToggleMute={(e) => toggleMute("en", e)}
              isPlaying={isPlaying}
              onTogglePlay={(e) => togglePlay(e)}
              progress={progress}
              videoRef={videoRefEn}
              isActive={activeAudio === "en"}
              onActivate={() => setActiveAudio("en")}
            />
            <VideoPlayer
              src="https://olleey-videos.s3.us-west-1.amazonaws.com/es.mov"
              label="DUBBED_ES"
              isMuted={isMutedEs}
              onToggleMute={(e) => toggleMute("es", e)}
              isPlaying={isPlaying}
              onTogglePlay={(e) => togglePlay(e)}
              progress={progress}
              videoRef={videoRefEs}
              isActive={activeAudio === "es"}
              onActivate={() => setActiveAudio("es")}
            />
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => togglePlay()}
                className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black px-8 py-3 font-mono text-xs uppercase tracking-widest dark:hover:bg-white/90 transition-all duration-300 flex items-center gap-3 rounded-full shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                {isPlaying ? "Sync Pause" : "Sync Play Comparison"}
              </button>
              <button
                onClick={handleReset}
                className="border border-black/20 dark:border-white/20 text-black dark:text-white p-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300 rounded-full"
                title="Reset Videos"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 font-mono text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", activeAudio === "en" ? "bg-green-600 dark:bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" : "bg-black/20 dark:bg-white/20")} />
                <span className={cn("transition-colors", activeAudio === "en" ? "text-black dark:text-white" : "text-black/40 dark:text-white/40")}>Audio EN (Active)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", activeAudio === "es" ? "bg-green-600 dark:bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" : "bg-black/20 dark:bg-white/20")} />
                <span className={cn("transition-colors", activeAudio === "es" ? "text-black dark:text-white" : "text-black/40 dark:text-white/40")}>Audio ES (Active)</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </>
  );
}

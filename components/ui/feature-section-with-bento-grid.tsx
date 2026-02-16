"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Globe2,
  Languages,
  Pause,
  Play,
  UploadCloud,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FeaturesSectionWithBentoGrid() {
  const features = [
    {
      title: "Stage 1: Detect Uploads",
      description:
        "Olleey watches your connected channel, surfaces newly published videos, and lets you begin processing in one click.",
      skeleton: <StageOneDemo />,
      className: "col-span-1 md:col-span-6 border-b border-black/10 dark:border-white/10",
    },
    {
      title: "Stage 2: Process Languages",
      description:
        "Track each selected language through transcription, translation, dubbing, and upload inside one pipeline.",
      skeleton: <StageTwoSkeleton />,
      className: "col-span-1 md:col-span-3 md:border-r border-black/10 dark:border-white/10",
    },
    {
      title: "Stage 3: Review & Publish",
      description:
        "Approve outputs, validate quality, and publish globally from a single review surface.",
      skeleton: <StageThreeSkeleton />,
      className: "col-span-1 md:col-span-3",
    },
  ];

  return (
    <section
      id="workflow-stages"
      className="relative z-20 py-16 lg:py-24 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[90px]"
    >
      <div className="px-2">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Three-Stage Workflow
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          Detect uploads, process multilingual outputs, and ship to your audience.
        </p>
      </div>

      <div className="relative mt-12">
        <div className="grid grid-cols-1 md:grid-cols-6 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-sm">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("p-4 sm:p-8 relative overflow-hidden", className)}>{children}</div>;
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base",
        "text-neutral-600 font-normal dark:text-neutral-300",
        "text-left max-w-md md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

const StageOneDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      return;
    }
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(videoRef.current.muted);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (!video.duration) return;
      setProgress((video.currentTime / video.duration) * 100);
    };

    const onLoaded = () => {
      video.muted = true;
      setIsMuted(true);
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const ratio = video.videoWidth / video.videoHeight;
        if (Number.isFinite(ratio) && ratio > 0) {
          setVideoAspectRatio(ratio);
        }
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <div
      className="relative mt-4 w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black group"
      style={{ aspectRatio: `${videoAspectRatio}` }}
    >
      <video
        ref={videoRef}
        src="/Demo1.mp4"
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        loop
        preload="metadata"
      />

      <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-2 py-1 text-[10px] font-mono uppercase tracking-widest bg-black/60 text-emerald-300 border border-emerald-500/50 rounded">
        Stage 1 Demo
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25">
        <button
          onClick={togglePlay}
          className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
        <motion.div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
      </div>

      <button
        onClick={toggleMute}
        className="absolute bottom-3 right-3 w-8 h-8 rounded-full border border-white/30 bg-black/50 text-white flex items-center justify-center"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </div>
  );
};

const StageTwoSkeleton = () => {
  const steps = [
    { name: "Transcribing", progress: 100, done: true },
    { name: "Translating", progress: 82, done: false },
    { name: "Dubbing", progress: 46, done: false },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-500">
        <span>Pipeline</span>
        <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <Languages className="w-3.5 h-3.5" />
          4 Languages
        </div>
      </div>

      {steps.map((step) => (
        <div key={step.name} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-black/80 dark:text-white/80">{step.name}</span>
            <span className="text-xs text-neutral-500">{step.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <motion.div
              className={cn("h-full", step.done ? "bg-emerald-500" : "bg-sky-500")}
              initial={{ width: 0 }}
              whileInView={{ width: `${step.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const StageThreeSkeleton = () => {
  const milestones = [
    { label: "QA Review", done: true, icon: CheckCircle2 },
    { label: "Channel Routing", done: true, icon: UploadCloud },
    { label: "Global Publish", done: false, icon: Globe2 },
  ];

  return (
    <div className="mt-4 h-full min-h-[220px] rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-black p-4">
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="relative space-y-3">
        {milestones.map((milestone, idx) => (
          <motion.div
            key={milestone.label}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="flex items-center justify-between rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 bg-white/70 dark:bg-black/40"
          >
            <span className="text-sm text-black/80 dark:text-white/80">{milestone.label}</span>
            <milestone.icon
              className={cn(
                "w-4 h-4",
                milestone.done ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400"
              )}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

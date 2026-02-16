"use client";

import React, { useEffect, useRef, useState } from "react";
import { BadgeCheck, RotateCcw, ShieldCheck, Video, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkflowRow = {
  title: string;
  description: string;
  videoSrc: string;
  videoLabel: string;
  textOnLeft?: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

const workflowRows: WorkflowRow[] = [
  {
    title: "Detect Videos",
    description:
      "We continuously detect newly published videos from your connected channel and surface them instantly so you can start processing.",
    videoSrc: "/Demo1.mp4",
    videoLabel: "Stage 1 Demo",
    textOnLeft: true,
    icon: Video,
  },
  {
    title: "Review And Publish In A Few Clicks",
    description:
      "After processing, review localized outputs, compare final content, and publish to your selected channels in just a few actions.",
    videoSrc: "/DemoReview1.mp4",
    videoLabel: "Stage 2 Demo",
    textOnLeft: false,
    icon: BadgeCheck,
  },
  {
    title: "Set Guardrails And Automations",
    description:
      "Configure approvals, quality thresholds, and safety controls once so your pipeline keeps running with consistent output quality.",
    videoSrc: "/DemoGuards.mp4",
    videoLabel: "Stage 3 Demo",
    textOnLeft: true,
    icon: ShieldCheck,
  },
];

export function FeaturesSectionWithBentoGrid() {
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

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
          Detect videos, review outputs, and run your workflow with clear guardrails.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        {workflowRows.map((row, index) => (
          <div
            key={row.title}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 p-4 lg:p-5"
            onMouseEnter={() => setHoveredRowIndex(index)}
            onMouseLeave={() => setHoveredRowIndex((current) => (current === index ? null : current))}
          >
            {row.textOnLeft ? (
              <>
                <StageTextCard row={row} />
                <StageVideoCard
                  src={row.videoSrc}
                  label={row.videoLabel}
                  enableHoverSound={index === 1}
                  isHovered={hoveredRowIndex === index}
                />
              </>
            ) : (
              <>
                <StageVideoCard
                  src={row.videoSrc}
                  label={row.videoLabel}
                  enableHoverSound={index === 1}
                  isHovered={hoveredRowIndex === index}
                />
                <StageTextCard row={row} />
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function StageTextCard({ row }: { row: WorkflowRow }) {
  const Icon = row.icon;
  return (
    <div className="h-full rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-950/50 p-6 lg:p-8 flex flex-col justify-center">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
        <Icon className="w-4 h-4" />
        Workflow Stage
      </div>
      <h5 className="text-2xl lg:text-3xl tracking-tight text-black dark:text-white">{row.title}</h5>
      <p className="mt-3 text-sm lg:text-base text-neutral-600 dark:text-neutral-300 max-w-xl">{row.description}</p>
    </div>
  );
}

function StageVideoCard({
  src,
  label,
  enableHoverSound = false,
  isHovered = false,
}: {
  src: string;
  label: string;
  enableHoverSound?: boolean;
  isHovered?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!enableHoverSound) {
      video.muted = true;
      video.volume = 0;
      return;
    }

    const canPlayAudio = isHovered && isSoundEnabled;
    video.muted = !canPlayAudio;
    video.volume = canPlayAudio ? 1 : 0;
    if (video.paused) {
      video.play().catch(() => {
        // Keep silent on autoplay restrictions; browser will resume on next interaction.
      });
    }
  }, [enableHoverSound, isHovered, isSoundEnabled]);

  const handleLoadedData = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      // Keep silent on autoplay restrictions; browser will resume on next interaction.
    });
  };

  const restartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {
      // Keep silent on autoplay restrictions; browser will resume on next interaction.
    });
  };

  return (
    <div className="relative h-full min-h-[340px] lg:min-h-[480px] overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black p-2 lg:p-3">
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain rounded-lg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={handleLoadedData}
        onEnded={restartVideo}
      />
      <div
        className={cn(
          "absolute top-3 left-3 rounded border px-2 py-1 text-[10px] font-mono uppercase tracking-widest",
          "bg-black/60 text-emerald-300 border-emerald-500/40"
        )}
      >
        {label}
      </div>
      {enableHoverSound && (
        <button
          type="button"
          onClick={() => setIsSoundEnabled((prev) => !prev)}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded border border-white/25 bg-black/60 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-black/80"
          aria-label={isSoundEnabled ? "Mute video sound" : "Enable video sound"}
        >
          {isSoundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          {isSoundEnabled ? "Mute" : "Listen"}
        </button>
      )}
      <button
        type="button"
        onClick={restartVideo}
        className="absolute bottom-3 right-3 inline-flex items-center justify-center rounded border border-white/25 bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
        aria-label="Restart video"
        title="Restart"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { BadgeCheck, ShieldCheck, Video, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_CARD_BG_URL =
  "https://4kwallpapers.com/images/wallpapers/macos-monterey-stock-pink-light-layers-5k-8k-5120x2880-5892.jpg";

type WorkflowRow = {
  title: string;
  description: string;
  youtubeId: string;
  videoLabel: string;
  textOnLeft?: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

const workflowRows: WorkflowRow[] = [
  {
    title: "Automated Detection & Processing",
    description:
      "Once a new video is detected, you’re in control. Pick your languages and decide if you want a seamless lip-sync or a localized dub. Olleey’s engine processes the video to match your selection, preparing it for a global audience without you lifting a finger.",
    youtubeId: "pbzkE92otqc",
    videoLabel: "Stage 1 Demo",
    textOnLeft: true,
    icon: Video,
  },
  {
    title: "Comprehensive Review & Optimization",
    description:
      "Review your localized videos for every language. Our AI automatically generates optimized titles, descriptions, and thumbnails for each version. Simply select your target channels and push the completed package directly to your YouTube drafts for a final check before going live.",
    youtubeId: "VV0NRTmYpLk",
    videoLabel: "Stage 2 Demo",
    textOnLeft: false,
    icon: BadgeCheck,
  },
  {
    title: "Precision Guardrails & Customization",
    description:
      "Define your brand’s standards with custom quality thresholds and safety controls. Configure your approval workflow once, and our AI will continuously optimize its output to your specific style, ensuring every localized video meets your exact requirements.",
    youtubeId: "STrUW4idNd0",
    videoLabel: "Stage 3 Demo",
    textOnLeft: true,
    icon: ShieldCheck,
  },
];

export function FeaturesSectionWithBentoGrid() {
  return (
    <section
      id="workflow-stages"
      className="relative z-20 w-full bg-white dark:bg-[#141414] pt-16 md:pt-24 lg:pt-32 pb-14 md:pb-16 lg:pb-24 border-t border-black/5 dark:border-white/5"
    >
      <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-12 lg:px-[90px]">
        <div className="text-left mb-16 lg:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-300 tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 font-sans">
            Everything you need to go global.
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans leading-relaxed">
            From initial detection to final publishing, Olleey streamlines the entire localization lifecycle so you can scale your content effortlessly.
          </p>
        </div>

        <div className="mt-0 space-y-8 md:space-y-10 lg:space-y-14">
          {workflowRows.map((row, index) => (
            <div
              key={row.title}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch"
            >
              {row.textOnLeft ? (
                <>
                  <StageTextCard row={row} />
                  <StageVideoCard
                    youtubeId={row.youtubeId}
                    label={row.videoLabel}
                    enableHoverSound={index === 1}
                  />
                </>
              ) : (
                <>
                  <StageVideoCard
                    youtubeId={row.youtubeId}
                    label={row.videoLabel}
                    enableHoverSound={index === 1}
                  />
                  <StageTextCard row={row} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StageTextCard({ row }: { row: WorkflowRow }) {
  return (
    <div className="h-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent p-5 sm:p-6 lg:p-8 flex flex-col justify-center">
      <h5 className="text-2xl sm:text-3xl lg:text-5xl leading-tight tracking-tight text-black dark:text-white">{row.title}</h5>
      <p className="mt-3 text-sm lg:text-base text-neutral-700 dark:text-neutral-200 max-w-xl">{row.description}</p>
    </div>
  );
}

function StageVideoCard({
  youtubeId,
  label,
  enableHoverSound = false,
}: {
  youtubeId: string;
  label: string;
  enableHoverSound?: boolean;
}) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isSoundEnabled ? 0 : 1}&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`;

  return (
    <div
      className="relative w-full min-h-[260px] sm:min-h-[300px] md:min-h-[340px] lg:min-h-[380px] xl:min-h-[440px] self-center overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-cover bg-center group p-3 sm:p-4 lg:p-5"
      style={{ backgroundImage: `url(${STAGE_CARD_BG_URL})` }}
    >
      <div className="absolute inset-0 bg-black/20 dark:bg-black/45" />

      <div className="relative z-20 mx-auto w-full max-w-[900px]">
        <div className="rounded-[1rem] sm:rounded-[1.1rem] border border-black/40 bg-zinc-900 p-2 sm:p-2.5 lg:p-3 shadow-[0_26px_50px_rgba(0,0,0,0.35)]">
          <div className="h-8 rounded-t-[0.7rem] bg-zinc-800 flex items-center gap-1.5 px-3 border-b border-black/30">
            <span className="w-2 h-2 rounded-full bg-red-400/80" />
            <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
            <span className="w-2 h-2 rounded-full bg-green-400/80" />
            <div className="ml-2 h-4 flex-1 rounded-full bg-zinc-700/90 border border-zinc-600/80 px-3 flex items-center">
              <span className="text-[9px] text-zinc-300/90 font-mono truncate">olleey.com/workflow/stage-demo</span>
            </div>
          </div>

          <div className="relative aspect-video rounded-b-[0.7rem] overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full pointer-events-none"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={label}
            />
          </div>
        </div>
      </div>

      {/* Label Overlay */}
      <div
        className={cn(
          "absolute top-4 left-4 rounded border px-2 py-1 text-[9px] font-mono uppercase tracking-[0.2em] pointer-events-none z-40 transition-all",
          "bg-black/60 backdrop-blur-md text-emerald-400 border-emerald-500/40 group-hover:border-emerald-500/60"
        )}
      >
        {label}
      </div>

      {enableHoverSound && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsSoundEnabled((prev) => !prev);
          }}
          className={cn(
            "absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border bg-black/80 backdrop-blur-md px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all z-40",
            isSoundEnabled ? "border-emerald-500/40 hover:bg-black hover:border-emerald-500/60" : "border-yellow-500/40 hover:bg-black hover:border-yellow-500/60"
          )}
          aria-label={isSoundEnabled ? "Mute video sound" : "Enable video sound"}
        >
          {isSoundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-yellow-500 animate-pulse" />}
          {isSoundEnabled ? "Sound On" : "Click to Listen"}
        </button>
      )}

      {/* Invisible overlay for hover interaction */}
      <div className="absolute inset-0 z-10" />
    </div>
  );
}

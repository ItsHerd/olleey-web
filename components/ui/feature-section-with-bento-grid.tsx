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
      className="relative z-20 pt-4 pb-16 lg:pb-24 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-[90px]"
    >

      <div className="mt-0 space-y-10 lg:space-y-14">
        {workflowRows.map((row, index) => (
          <div
            key={row.title}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
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
    </section>
  );
}

function StageTextCard({ row }: { row: WorkflowRow }) {
  return (
    <div className="h-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent p-6 lg:p-8 flex flex-col justify-center">
      <h5 className="text-3xl lg:text-5xl leading-tight tracking-tight text-black dark:text-white">{row.title}</h5>
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
      className="relative w-full min-h-[340px] lg:min-h-[460px] self-center overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-cover bg-center group p-4 lg:p-5"
      style={{ backgroundImage: `url(${STAGE_CARD_BG_URL})` }}
    >
      <div className="absolute inset-0 bg-black/20 dark:bg-black/45" />

      <div className="relative z-20 mx-auto w-full max-w-[900px]">
        <div className="rounded-[1.1rem] border border-black/40 bg-zinc-900 p-2.5 lg:p-3 shadow-[0_26px_50px_rgba(0,0,0,0.35)]">
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
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded border border-white/10 bg-black/60 backdrop-blur-md px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest text-white transition-all hover:bg-black/80 hover:border-white/20 z-40"
          aria-label={isSoundEnabled ? "Mute video sound" : "Enable video sound"}
        >
          {isSoundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          {isSoundEnabled ? "Mute" : "Listen"}
        </button>
      )}

      {/* Invisible overlay for hover interaction */}
      <div className="absolute inset-0 z-10" />
    </div>
  );
}

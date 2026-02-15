"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

interface LottieThemeToggleProps {
  theme: "light" | "dark";
  onThemeChange: (nextTheme: "light" | "dark") => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function LottieThemeToggle({
  theme,
  onThemeChange,
  disabled = false,
  className,
}: LottieThemeToggleProps) {
  const playerRef = useRef<any>(null);
  const prevThemeRef = useRef<"light" | "dark">(theme);
  const [ready, setReady] = useState(false);
  const isDark = theme === "dark";

  const handleToggle = () => {
    if (disabled) return;
    void onThemeChange(isDark ? "light" : "dark");
  };

  const runThemeAnimation = useCallback(
    async (animateTransition: boolean) => {
      const player = playerRef.current;
      if (!player?.getLottie) return;
      const lottie = await player.getLottie();
      if (!lottie) return;

      const dayIdleFrame = 10;
      const nightIdleFrame = 95;
      const dayToNightSegment: [number, number] = [20, 80];
      const nightToDaySegment: [number, number] = [120, 200];

      if (!animateTransition) {
        lottie.goToAndStop(theme === "dark" ? nightIdleFrame : dayIdleFrame, true);
        return;
      }

      if (theme === "dark") {
        lottie.playSegments(dayToNightSegment, true);
      } else {
        lottie.playSegments(nightToDaySegment, true);
      }
    },
    [theme]
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onReady = () => setReady(true);
    player.addEventListener?.("ready", onReady);
    return () => player.removeEventListener?.("ready", onReady);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const previous = prevThemeRef.current;
    const shouldAnimate = previous !== theme;
    void runThemeAnimation(shouldAnimate);
    prevThemeRef.current = theme;
  }, [theme, ready, runThemeAnimation]);

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Script
        src="https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js"
        strategy="afterInteractive"
      />
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted/50"
        )}
      >
        {React.createElement("lottie-player", {
          ref: playerRef,
          src: "/lotties/toogle-main-scene.json",
          autoplay: false,
          style: {
            width: "56px",
            height: "56px",
            pointerEvents: "none",
          },
        })}
      </button>
    </div>
  );
}

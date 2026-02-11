"use client";

import React from "react";
import { Film } from "lucide-react";

interface VideosViewProps {
  theme: string;
}

export function VideosView({ theme }: VideosViewProps) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Videos</h1>
        <p className="text-gray-500">
          Manage your video library and localizations
        </p>
      </div>

      <div className={`${cardBgClass} rounded-2xl border border-white/10 p-12 text-center`}>
        <Film className="w-16 h-16 mx-auto mb-4 text-[#FFC107]" />
        <h3 className="text-xl font-semibold mb-2">Videos View</h3>
        <p className="text-gray-500">
          Video library interface coming soon...
        </p>
      </div>
    </div>
  );
}

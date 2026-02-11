"use client";

import React from "react";
import { Mic } from "lucide-react";

interface VoicesViewProps {
  theme: string;
}

export function VoicesView({ theme }: VoicesViewProps) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Voices</h1>
        <p className="text-gray-500">
          Manage voice profiles and clones
        </p>
      </div>

      <div className={`${cardBgClass} rounded-2xl border border-white/10 p-12 text-center`}>
        <Mic className="w-16 h-16 mx-auto mb-4 text-[#FFC107]" />
        <h3 className="text-xl font-semibold mb-2">Voice Library</h3>
        <p className="text-gray-500">
          Voice management interface coming soon...
        </p>
      </div>
    </div>
  );
}

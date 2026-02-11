"use client";

import React from "react";
import { Radio, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChannelsViewProps {
  theme: string;
}

export function ChannelsView({ theme }: ChannelsViewProps) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Channels</h1>
          <p className="text-gray-500">
            Manage your connected YouTube channels
          </p>
        </div>
        <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-semibold gap-2">
          <Plus className="w-5 h-5" />
          Add Channel
        </Button>
      </div>

      <div className={`${cardBgClass} rounded-2xl border border-white/10 p-12 text-center`}>
        <Radio className="w-16 h-16 mx-auto mb-4 text-[#FFC107]" />
        <h3 className="text-xl font-semibold mb-2">Channel Management</h3>
        <p className="text-gray-500">
          Channel management interface coming soon...
        </p>
      </div>
    </div>
  );
}

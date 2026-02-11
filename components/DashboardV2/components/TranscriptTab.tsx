"use client";

import React from "react";
import { FileText } from "lucide-react";

interface TranscriptTabProps {
  jobId: string;
  theme: string;
}

export function TranscriptTab({ jobId, theme }: TranscriptTabProps) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Source Transcript */}
        <div className={`${cardBgClass} border border-white/10 rounded-lg p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#FFC107]" />
            <h3 className="font-semibold">Source (English)</h3>
          </div>
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">[00:00]</span> Hello everyone, today I want to talk about building startups.</p>
            <p><span className="text-gray-500">[00:05]</span> The first thing you need is a great idea and a team to execute it.</p>
            <p><span className="text-gray-500">[00:10]</span> Let's dive into the details...</p>
          </div>
        </div>

        {/* Translated Transcript */}
        <div className={`${cardBgClass} border border-white/10 rounded-lg p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#FFC107]" />
            <h3 className="font-semibold">Spanish Translation</h3>
          </div>
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">[00:00]</span> Hola a todos, hoy quiero hablar sobre la creación de startups.</p>
            <p><span className="text-gray-500">[00:05]</span> Lo primero que necesitas es una gran idea y un equipo para ejecutarla.</p>
            <p><span className="text-gray-500">[00:10]</span> Profundicemos en los detalles...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

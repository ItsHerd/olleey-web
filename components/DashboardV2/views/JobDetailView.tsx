"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  Globe,
  Mic,
  Video,
  Upload,
  CheckCircle,
  Loader2,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineStepper } from "../components/PipelineStepper";
import { ReviewTab } from "../components/ReviewTab";
import { TranscriptTab } from "../components/TranscriptTab";
import { MetadataTab } from "../components/MetadataTab";
import { DistributionTab } from "../components/DistributionTab";
import { useRouter } from "next/navigation";

interface JobDetailViewProps {
  jobId: string;
  onBack: () => void;
  theme: string;
}

// Pipeline stages configuration
const pipelineStages = [
  { id: "upload", label: "Upload", icon: Download, status: "completed" as const },
  { id: "transcribe", label: "Transcribe", icon: FileText, status: "completed" as const },
  { id: "translate", label: "Translate", icon: Globe, status: "completed" as const },
  { id: "dub", label: "Dub", icon: Mic, status: "active" as const },
  { id: "lipsync", label: "Lip-Sync", icon: Video, status: "pending" as const },
  { id: "assemble", label: "Assemble", icon: Video, status: "pending" as const },
  { id: "review", label: "Review", icon: CheckCircle, status: "pending" as const },
  { id: "publish", label: "Publish", icon: Upload, status: "pending" as const },
];

export function JobDetailView({ jobId, onBack, theme }: JobDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const isDark = theme === "dark";

  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";
  const textClass = isDark ? "text-gray-300" : "text-gray-700";
  const textSecondaryClass = isDark ? "text-gray-500" : "text-gray-500";

  return (
    <div className={`h-full flex flex-col ${bgClass}`}>
      {/* Header */}
      <div className={`${cardBgClass} border-b ${isDark ? "border-white/10" : "border-gray-200"} p-6`}>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={`gap-2 border ${isDark ? "border-white/0 hover:border-white/10" : "border-transparent hover:border-gray-200 hover:bg-gray-50"} transition-all`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className={`h-6 w-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">How to Build a Startup</h1>
            <p className={`text-sm ${textSecondaryClass} mt-1`}>
              Job ID: {jobId.slice(0, 8)}...
            </p>
          </div>
          <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-semibold gap-2 border border-amber-400/50 shadow-lg shadow-amber-400/10">
            <Share2 className="w-4 h-4" />
            Publish
          </Button>
        </div>

        {/* Pipeline Stepper */}
        <PipelineStepper stages={pipelineStages} theme={theme} />
      </div>

      {/* Tabs Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tab List */}
        <div className={`${cardBgClass} border-b ${isDark ? "border-white/10" : "border-gray-200"} flex`}>
          {[
            { id: "overview", label: "Overview" },
            { id: "review", label: "Review" },
            { id: "transcript", label: "Transcript" },
            { id: "metadata", label: "Metadata" },
            { id: "distribution", label: "Distribution" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === tab.id
                ? "text-[#FFC107]"
                : `text-gray-500 ${isDark ? "hover:text-gray-300" : "hover:text-gray-900"}`
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC107]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 } as const}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "overview" && (
            <OverviewTab jobId={jobId} stages={pipelineStages} theme={theme} />
          )}
          {activeTab === "review" && (
            <ReviewTab jobId={jobId} theme={theme} />
          )}
          {activeTab === "transcript" && (
            <TranscriptTab jobId={jobId} theme={theme} />
          )}
          {activeTab === "metadata" && (
            <MetadataTab jobId={jobId} theme={theme} />
          )}
          {activeTab === "distribution" && (
            <DistributionTab jobId={jobId} theme={theme} />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  jobId,
  stages,
  theme
}: {
  jobId: string;
  stages: typeof pipelineStages;
  theme: string;
}) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";
  const textSecondaryClass = isDark ? "text-gray-500" : "text-gray-500";

  return (
    <div className="p-6 space-y-6">
      {/* Language Progress Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Language Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["Spanish", "French", "German"].map((lang) => (
            <motion.div
              key={lang}
              className={`${cardBgClass} border ${isDark ? "border-white/10" : "border-gray-200"} rounded-lg p-4`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{lang}</span>
                <div className="flex items-center gap-2 text-[#FFC107]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">75%</span>
                </div>
              </div>
              <div className="space-y-2">
                {stages.slice(0, 4).map((stage) => (
                  <div key={stage.id} className="flex items-center gap-2 text-sm">
                    {stage.status === "completed" ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : stage.status === "active" ? (
                      <Loader2 className="w-3 h-3 text-[#FFC107] animate-spin" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-500" />
                    )}
                    <span className={textSecondaryClass}>{stage.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stage Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Current Stage: Dubbing</h3>
        <div className={`${cardBgClass} border ${isDark ? "border-white/10" : "border-gray-200"} rounded-lg p-6`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFC107]/10 flex items-center justify-center">
              <Mic className="w-6 h-6 text-[#FFC107]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">Generating Dubbed Audio</h4>
              <p className={`text-sm ${textSecondaryClass} mb-4`}>
                Creating high-quality AI dubbed audio for each target language using ElevenLabs voice synthesis.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="text-[#FFC107]">3 of 7 languages complete</span>
                </div>
                <div className={`w-full h-2 ${isDark ? "bg-gray-800" : "bg-gray-200"} rounded-full overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "43%" }}
                    className="h-full bg-[#FFC107]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

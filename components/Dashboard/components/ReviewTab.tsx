"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ReviewTabProps {
  jobId: string;
  theme: string;
}

export function ReviewTab({ jobId, theme }: ReviewTabProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  const languages = ["Spanish", "French", "German"];

  return (
    <div className="p-6 space-y-6">
      {/* Video Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Side-by-Side Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Original */}
          <div className={`${cardBgClass} border border-white/10 rounded-lg overflow-hidden`}>
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-white opacity-50" />
            </div>
            <div className="p-4">
              <div className="font-semibold mb-1">Original (English)</div>
              <p className="text-sm text-gray-500">Source video</p>
            </div>
          </div>

          {/* Dubbed */}
          <div className={`${cardBgClass} border border-white/10 rounded-lg overflow-hidden`}>
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-white opacity-50" />
            </div>
            <div className="p-4">
              <div className="font-semibold mb-1">Spanish</div>
              <p className="text-sm text-gray-500">Localized version</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Checklist */}
      <div className={`${cardBgClass} border border-white/10 rounded-lg p-6`}>
        <h4 className="font-semibold mb-4">Quality Checklist</h4>
        <div className="space-y-3">
          {[
            "Audio quality is clear and natural",
            "Translation accuracy is verified",
            "Lip-sync appears natural",
            "Metadata is properly localized"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Checkbox id={`check-${idx}`} />
              <label htmlFor={`check-${idx}`} className="text-sm cursor-pointer">
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Approval */}
      <div>
        <h4 className="font-semibold mb-4">Batch Actions</h4>
        <div className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700 gap-2">
            <CheckCircle className="w-4 h-4" />
            Approve All
          </Button>
          <Button variant="outline" className="gap-2">
            <X className="w-4 h-4" />
            Request Changes
          </Button>
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

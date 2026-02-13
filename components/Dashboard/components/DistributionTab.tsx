"use client";

import React from "react";
import { Radio, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DistributionTabProps {
  jobId: string;
  theme: string;
}

export function DistributionTab({ jobId, theme }: DistributionTabProps) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Distribution Strategy</h3>
          <p className="text-sm text-gray-500 mb-6">
            Choose how each localized version should be published to YouTube
          </p>
        </div>

        <div className="space-y-4">
          {["Spanish", "French", "German"].map((lang) => (
            <div key={lang} className={`${cardBgClass} border border-white/10 rounded-lg p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-[#FFC107]" />
                  <div>
                    <div className="font-semibold">{lang}</div>
                    <div className="text-sm text-gray-500">Ready for distribution</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select className="bg-[#0F0F0F] border border-white/10 hover:border-white/20 rounded px-3 py-2 text-xs outline-none focus:border-olleey-yellow transition-all cursor-pointer shadow-sm">
                    <option>Main Channel (Multi-Language Audio)</option>
                    <option>{lang} Dedicated Channel</option>
                    <option>Save as Draft</option>
                  </select>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Youtube className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MetadataTabProps {
  jobId: string;
  theme: string;
}

export function MetadataTab({ jobId, theme }: MetadataTabProps) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  return (
    <div className="p-6">
      <div className="space-y-6">
        {["Spanish", "French", "German"].map((lang) => (
          <div key={lang} className={`${cardBgClass} border border-white/10 rounded-lg p-6`}>
            <h3 className="font-semibold mb-4">{lang}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor={`title-${lang}`}>Title</Label>
                <Input
                  id={`title-${lang}`}
                  placeholder="Localized video title"
                  defaultValue={`How to Build a Startup (${lang})`}
                />
              </div>
              <div>
                <Label htmlFor={`desc-${lang}`}>Description</Label>
                <textarea
                  id={`desc-${lang}`}
                  placeholder="Localized video description"
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <Label htmlFor={`tags-${lang}`}>Tags</Label>
                <Input
                  id={`tags-${lang}`}
                  placeholder="Comma-separated tags"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

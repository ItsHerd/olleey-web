"use client";

import React from "react";
import { Film, PlayCircle, Layers, FolderHeart, ArrowUpRight, Search } from "lucide-react";
import { motion } from "framer-motion";

interface VideosViewProps {
  theme: string;
}

export function VideosView({ theme }: VideosViewProps) {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";

  return (
    <div className={`h-full ${bgClass} overflow-auto custom-scrollbar p-8`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Film className="w-6 h-6 text-orange-500" />
              </div>
              <h1 className={`text-3xl font-bold ${textClass}`}>Media Library</h1>
            </div>
            <p className={mutedTextClass}>
              Your centralized vault for master assets and localized variants.
            </p>
          </div>
          <div className={`flex items-center gap-4`}>
            <div className={`relative hidden md:block`}>
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
              <input
                type="text"
                placeholder="Search assets..."
                className={`bg-white/5 border ${borderClass} rounded-2xl py-2 pl-12 pr-4 text-xs focus:outline-none focus:border-[#FFC107]/40 transition-all`}
              />
            </div>
            <button className={`p-3 rounded-2xl border ${borderClass} ${cardBgClass} hover:border-[#FFC107]/20 transition-all group`}>
              <FolderHeart className={`w-5 h-5 ${mutedTextClass} group-hover:text-[#FFC107] transition-colors`} />
            </button>
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-[4rem] border ${borderClass} ${cardBgClass} flex flex-col items-center justify-center p-20 text-center group`}>
          {/* Background Effects */}
          <div className={`absolute inset-0 bg-gradient-to-br from-[#FFC107]/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000`} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Animated Asset Stack */}
          <div className="relative mb-12 h-40 w-64">
            {[2, 1, 0].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1 - i * 0.2,
                  y: i * 12,
                  scale: 1 - i * 0.05,
                  rotate: i * -2
                }}
                className={`absolute inset-0 rounded-[2rem] border ${borderClass} bg-white/5 backdrop-blur-xl shadow-2xl flex items-center justify-center`}
                style={{ zIndex: 10 - i }}
              >
                {i === 0 && (
                  <div className="relative flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#FFC107]/10 flex items-center justify-center shadow-xl shadow-[#FFC107]/10">
                      <PlayCircle className="w-10 h-10 text-[#FFC107]" />
                    </div>
                    <div className="space-y-2">
                      <div className={`w-32 h-1.5 ${isDark ? 'bg-white/10' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div className="w-2/3 h-full bg-[#FFC107]" />
                      </div>
                      <div className={`w-12 h-1.5 ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-full mx-auto`} />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <h3 className={`text-4xl font-black mb-4 tracking-tighter ${textClass}`}>Digital Asset Management</h3>
          <p className={`text-base ${mutedTextClass} max-w-lg mx-auto mb-12 font-medium leading-relaxed`}>
            Your multi-track assets are being synced to our secure edge storage. Soon you'll have instant access to frame-accurate previews and automated version control for all localized content.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left">
                <div className={`text-xs font-black ${textClass} uppercase tracking-widest`}>Syncing Node</div>
                <div className={`text-[10px] ${mutedTextClass}`}>US-EAST-1</div>
              </div>
            </div>
            <div className={`hidden sm:block w-px h-8 bg-white/10`} />
            <button className={`text-xs font-black uppercase tracking-widest text-[#FFC107] hover:underline flex items-center gap-2`}>
              View Legacy Library <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

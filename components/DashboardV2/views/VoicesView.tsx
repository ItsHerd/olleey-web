"use client";

import React from "react";
import { Mic, Sparkles, AudioLines, Music4, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface VoicesViewProps {
  theme: string;
}

export function VoicesView({ theme }: VoicesViewProps) {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";

  return (
    <div className={`h-full ${bgClass} overflow-auto custom-scrollbar p-8`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[#FFC107]/10 border border-[#FFC107]/20">
              <Mic className="w-6 h-6 text-[#FFC107]" />
            </div>
            <h1 className={`text-3xl font-bold ${textClass}`}>Neural Voice Engine</h1>
          </div>
          <p className={mutedTextClass}>
            Advanced voice cloning and synthetic speech management.
          </p>
        </div>

        <div className={`relative overflow-hidden rounded-[3rem] border ${borderClass} ${cardBgClass} flex flex-col items-center justify-center p-20 text-center group`}>
          {/* Background Effects */}
          <div className={`absolute inset-0 bg-gradient-to-b from-[#FFC107]/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000`} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFC107]/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Animated Icon Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-[#FFC107]/20 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-32 h-32 rounded-[2.5rem] bg-[#FFC107]/10 border border-[#FFC107]/20 flex items-center justify-center shadow-2xl shadow-[#FFC107]/20 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Mic className="w-14 h-14 text-[#FFC107]" />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </motion.div>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-2 -left-6 w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
            >
              <AudioLines className="w-5 h-5 text-purple-400" />
            </motion.div>
          </motion.div>

          <h3 className={`text-4xl font-black mb-4 tracking-tighter ${textClass}`}>Synchronizing Neural Nodes</h3>
          <p className={`text-base ${mutedTextClass} max-w-lg mx-auto mb-12 font-medium leading-relaxed`}>
            We're currently training our high-fidelity voice cloning models. Soon you'll be able to manage unlimited voice profiles with zero-shot cross-lingual emotional consistency.
          </p>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl`}>
            {[
              { icon: Zap, label: "Zero-Latency" },
              { icon: Music4, label: "High-Fidelity" },
              { icon: Globe, label: "Global Scope" },
              { icon: Sparkles, label: "Emotionally Aware" }
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${borderClass} bg-white/5 flex flex-col items-center gap-3 backdrop-blur-sm`}>
                <item.icon className="w-5 h-5 text-[#FFC107]" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${mutedTextClass}`}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className={`mt-12 flex items-center gap-2 px-4 py-2 rounded-full border ${borderClass} bg-white/5`}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${mutedTextClass}`}>Coming in Version 2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}

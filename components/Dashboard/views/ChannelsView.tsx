"use client";

import React from "react";
import { Radio, Plus, Youtube, Globe, Link, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ChannelsViewProps {
  theme: string;
}

export function ChannelsView({ theme }: ChannelsViewProps) {
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
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <Youtube className="w-6 h-6 text-red-500" />
              </div>
              <h1 className={`text-3xl font-bold ${textClass}`}>Olleey Connect</h1>
            </div>
            <p className={mutedTextClass}>
              Manage multi-market YouTube distribution and channel clusters.
            </p>
          </div>
          <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-black px-8 h-12 rounded-2xl text-xs uppercase tracking-widest gap-2 shadow-xl shadow-[#FFC107]/10">
            <Plus className="w-4 h-4" />
            Add Distribution Hub
          </Button>
        </div>

        <div className={`relative overflow-hidden rounded-[3rem] border ${borderClass} ${cardBgClass} flex flex-col items-center justify-center p-20 text-center group`}>
          {/* Background Effects */}
          <div className={`absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000`} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Animated Icon Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-12"
          >
            <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-36 h-36 rounded-[3rem] bg-red-500/5 border border-red-500/10 flex items-center justify-center shadow-2xl shadow-red-500/5 -rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <Radio className="w-16 h-16 text-red-500" />
            </div>

            <div className="absolute -top-6 -right-6 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl">
              <Youtube className="w-7 h-7 text-red-600" />
            </div>
            <div className="absolute -bottom-4 -left-8 w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
          </motion.div>

          <h3 className={`text-4xl font-black mb-4 tracking-tighter ${textClass}`}>Distribution Grid Offline</h3>
          <p className={`text-base ${mutedTextClass} max-w-lg mx-auto mb-12 font-medium leading-relaxed`}>
            We're finalizing our high-speed YouTube API integration suite. Soon you'll be able to manage unlimited localization sub-channels from a single unified CRM interface.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Link, label: "OAuth 2.0 Secure" },
              { icon: ShieldCheck, label: "Enterprise Encryption" },
              { icon: Search, label: "Advanced SEO Tools" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-[#FFC107]" />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${mutedTextClass}`}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className={`mt-16 pt-8 border-t border-white/[0.03] w-full max-w-md`}>
            <p className={`text-[11px] font-black uppercase tracking-widest mb-4 opacity-50 ${mutedTextClass}`}>Platform Status</p>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className={`text-[10px] font-bold ${textClass}`}>API 2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FFC107]" />
                <span className={`text-[10px] font-bold ${textClass}`}>Ingestion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className={`text-[10px] font-bold ${textClass}`}>CRM UI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

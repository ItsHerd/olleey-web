"use client";

import React from "react";
import { Shield, CheckCircle, AlertTriangle, Info, ArrowRight, Zap, ShieldCheck, Search } from "lucide-react";
import { motion } from "framer-motion";

interface GuardrailsViewProps {
  theme: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    } as const
  }
};

export function GuardrailsView({ theme }: GuardrailsViewProps) {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";
  const accentColor = "#FFC107";

  const guardrails = [
    {
      title: "Content Safety",
      description: "Automatically detect and flag inappropriate, sensitive, or high-risk content using neural-linguistic analysis.",
      status: "active",
      icon: Shield,
      color: "bg-blue-500",
      stats: "99.9% filtered"
    },
    {
      title: "Translation Accuracy",
      description: "Neural verification engine ensuring that translations maintain semantic integrity and original intent.",
      status: "active",
      icon: CheckCircle,
      color: "bg-green-500",
      stats: "BLEU Score: 0.94"
    },
    {
      title: "Brand Consistency",
      description: "Ensures that specialized terminology, brand names, and slogans remain consistent across all target markets.",
      status: "active",
      icon: AlertTriangle,
      color: "bg-[#FFC107]",
      stats: "324 terms synced"
    },
    {
      title: "Compliance Checks",
      description: "Real-time automated verification against regional broadcast regulations and digital content laws.",
      status: "active",
      icon: Info,
      color: "bg-purple-500",
      stats: "ISO 27001 Ready"
    },
  ];

  return (
    <div className={`h-full ${bgClass} overflow-auto custom-scrollbar`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto p-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="relative mb-12 group">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 via-[#FFC107]/5 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-500/5">
                <ShieldCheck className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <h1 className={`text-4xl font-bold tracking-tight ${textClass}`}>System Guardrails</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500/80">All Systems Operational</span>
                </div>
              </div>
            </div>
            <p className={`text-lg ${mutedTextClass} max-w-2xl leading-relaxed`}>
              Multi-layer AI safety infrastructure and compliance protocols designed to ensure premium quality, high-accuracy localizations at global scale.
            </p>
          </div>
        </motion.div>

        {/* Search / Filter bar (visual only for now) */}
        <motion.div variants={itemVariants} className={`mb-10 flex gap-4`}>
          <div className={`flex-1 relative`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
            <input
              type="text"
              placeholder="Search guardrails..."
              className={`w-full ${cardBgClass} border ${borderClass} rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#FFC107]/40 transition-all`}
            />
          </div>
          <button className={`px-6 py-3 rounded-2xl border ${borderClass} ${cardBgClass} text-xs font-bold uppercase tracking-widest ${mutedTextClass} hover:border-[#FFC107]/20 transition-all`}>
            All Categories
          </button>
        </motion.div>

        {/* Guardrails Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {guardrails.map((guardrail, idx) => {
            const Icon = guardrail.icon;
            return (
              <motion.div
                variants={itemVariants}
                key={guardrail.title}
                whileHover={{ y: -5 }}
                className={`${cardBgClass} border ${borderClass} rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-[#FFC107]/5 transition-all duration-300`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${guardrail.color}/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl ${guardrail.color}/10 border border-${guardrail.color}/20 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12`}>
                    <Icon className={`w-7 h-7 text-${guardrail.color.split('-')[1]}-500`} style={{ color: guardrail.color.includes('[') ? guardrail.color.match(/\[(.*?)\]/)?.[1] : undefined }} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                      {guardrail.status}
                    </span>
                    <span className={`text-[10px] font-medium ${mutedTextClass} tracking-tight`}>{guardrail.stats}</span>
                  </div>
                </div>

                <h3 className={`text-xl font-bold mb-3 ${textClass} tracking-tight`}>
                  {guardrail.title}
                </h3>
                <p className={`text-sm ${mutedTextClass} leading-relaxed mb-6 line-clamp-2 group-hover:line-clamp-none transition-all duration-300`}>
                  {guardrail.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 ${isDark ? 'border-[#141414]' : 'border-white'} bg-gray-800 flex items-center justify-center text-[8px] font-bold text-white`}>
                        AI
                      </div>
                    ))}
                  </div>
                  <button className={`text-[10px] font-black uppercase tracking-widest ${mutedTextClass} group-hover:text-[#FFC107] flex items-center gap-2 transition-colors`}>
                    Configure <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Protection Stats / Info */}
        <motion.div
          variants={itemVariants}
          className={`relative rounded-3xl border ${borderClass} overflow-hidden group`}
        >
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5' : 'bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50'}`} />
          <div className={`p-10 relative z-10 flex flex-col md:flex-row gap-10 items-center`}>
            <div className={`flex-1`}>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-indigo-500" />
                <h3 className={`text-xl font-bold ${textClass}`}>Automated Enforcement</h3>
              </div>
              <p className={`text-sm ${mutedTextClass} leading-relaxed max-w-xl`}>
                All guardrails are strictly enforced at the neural level. When an anomaly is detected, our system automatically halts the production pipeline and flags the segment for expert human-in-the-loop review. This hybrid approach guarantees 100% compliance with your brand standards.
              </p>
            </div>
            <div className={`grid grid-cols-2 gap-4 w-full md:w-auto shrink-0`}>
              <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} p-6 rounded-2xl border border-white/5 text-center w-full md:w-32`}>
                <div className={`text-2xl font-black text-indigo-400 mb-1`}>2ms</div>
                <div className={`text-[9px] font-black uppercase tracking-widest ${mutedTextClass}`}>Latency</div>
              </div>
              <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} p-6 rounded-2xl border border-white/5 text-center w-full md:w-32`}>
                <div className={`text-2xl font-black text-[#FFC107] mb-1`}>100%</div>
                <div className={`text-[9px] font-black uppercase tracking-widest ${mutedTextClass}`}>Security</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  MessageCircle,
  Book,
  Mail,
  ExternalLink,
  FileText,
  ChevronDown,
  Search,
  PlayCircle,
  Globe,
  ArrowRight,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SupportViewProps {
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

export function SupportView({ theme }: SupportViewProps) {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const supportOptions = [
    {
      title: "Knowledge Base",
      description: "Comprehensive guides, neural engine documentation, and best practices.",
      icon: Book,
      action: "Browse Docs",
      color: "blue",
      stats: "240+ Articles"
    },
    {
      title: "Priority Concierge",
      description: "Enterprise-grade support with dedicated account engineers.",
      icon: MessageCircle,
      action: "Start Session",
      color: "green",
      stats: "2m Avg. Response"
    },
    {
      title: "Expert Assistance",
      description: "Direct line for technical queries and pipeline optimizations.",
      icon: Mail,
      action: "Contact Us",
      color: "purple",
      stats: "24/7 Availability"
    },
    {
      title: "Engineering Proposals",
      description: "Collaborate on custom features or specific localization requirements.",
      icon: FileText,
      action: "Submit Req.",
      color: "orange",
      stats: "Roadmap Priority"
    },
  ];

  const faqs = [
    {
      question: "How do I start a new localization project?",
      answer: "Initiate your project by clicking the 'New Localization' button in the dashboard or sidebar. Our AI-driven wizard will guide you through uploading source assets, defining target linguistic parameters, and selecting professional voice clones.",
    },
    {
      question: "Which high-bitrate formats are supported?",
      answer: "We support a wide array of professional containers including MP4, MOV, AVI, and Pro-Res. Files up to 10GB can be ingested directly through our high-speed uplink; larger assets require SFTP coordination.",
    },
    {
      question: "What is the typical processing latency?",
      answer: "Our neural infrastructure optimizes processing based on asset complexity. Standard dubbing typically completes at a 2:1 ratio (10 minutes of video in 5 minutes). High-fidelity voice cloning adds a marginal overhead for initial training.",
    },
    {
      question: "Can I manually refine translation segments?",
      answer: "Absolutely. Our 'Review' interface provides a frame-accurate editor where you can adjust translations, modify phoneme timing, and fine-tune emotional inflections before final publishing.",
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
        {/* Header */}
        <motion.div variants={itemVariants} className="relative mb-12 text-center py-10">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent blur-3xl opacity-50 pointer-events-none" />
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-[#FFC107]/10 border border-[#FFC107]/20 flex items-center justify-center shadow-2xl shadow-[#FFC107]/10 rotate-3">
                <HelpCircle className="w-10 h-10 text-[#FFC107]" />
              </div>
            </div>
            <h1 className={`text-5xl font-black mb-4 tracking-tighter ${textClass}`}>Olleey Concierge</h1>
            <p className={`text-lg ${mutedTextClass} max-w-2xl mx-auto font-medium`}>
              Precision support for global creators. Access documentation, live engineering assistance, and specialized localization resources.
            </p>
          </div>
        </motion.div>

        {/* Global Search */}
        <motion.div variants={itemVariants} className="relative max-w-2xl mx-auto mb-20 group">
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 ${mutedTextClass} group-focus-within:text-[#FFC107] transition-colors`} />
          <input
            type="text"
            placeholder="Find solutions, documentation, or guides..."
            className={`w-full ${isDark ? 'bg-white/[0.03]' : 'bg-white'} border ${borderClass} rounded-[2rem] py-5 pl-14 pr-6 text-base font-medium focus:outline-none focus:border-[#FFC107]/40 shadow-xl shadow-black/5 transition-all outline-none`}
          />
        </motion.div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            const colorMap: any = {
              blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'hover:border-blue-500/30' },
              green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'hover:border-green-500/30' },
              purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'hover:border-purple-500/30' },
              orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'hover:border-orange-500/30' }
            };
            const themeColors = colorMap[option.color];

            return (
              <motion.div
                variants={itemVariants}
                key={option.title}
                whileHover={{ y: -5 }}
                className={`${cardBgClass} border ${borderClass} rounded-3xl p-6 transition-all cursor-pointer group flex flex-col h-full`}
              >
                <div className={`w-14 h-14 rounded-2xl ${themeColors.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className={`w-7 h-7 ${themeColors.text}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${textClass} tracking-tight`}>
                    {option.title}
                  </h3>
                  <p className={`text-xs ${mutedTextClass} mb-6 leading-relaxed font-medium`}>
                    {option.description}
                  </p>
                </div>
                <div className={`pt-4 border-t ${isDark ? "border-white/[0.03]" : "border-gray-200"} mt-auto`}>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${themeColors.text} mb-4`}>
                    {option.stats}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-between items-center group-hover:bg-[#FFC107]/10 transition-all text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {option.action}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic FAQ Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-8 bg-[#FFC107] rounded-full" />
            <h2 className={`text-3xl font-black ${textClass} tracking-tight`}>Linguistic Logic & FAQ</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                layout
                className={`${cardBgClass} border ${borderClass} rounded-2xl overflow-hidden`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left group"
                >
                  <span className={`text-base font-bold ${textClass} pr-4 group-hover:text-[#FFC107] transition-colors`}>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 ${mutedTextClass} transform transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 overflow-hidden"
                    >
                      <p className={`text-sm ${mutedTextClass} leading-relaxed font-normal`}>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Global Community / CTA Section */}
        <motion.div
          variants={itemVariants}
          className={`relative rounded-[3rem] p-12 overflow-hidden text-center group`}
        >
          <div className={`absolute inset-0 ${isDark ? 'bg-zinc-900 border border-white/5' : 'bg-white border border-gray-200'} shadow-2xl`} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FFC107]/5 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex -space-x-3 mb-8">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-12 h-12 rounded-full border-4 ${isDark ? 'border-zinc-900' : 'border-white'} bg-gray-800 overflow-hidden`}>
                  <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Support User" />
                </div>
              ))}
              <div className={`w-12 h-12 rounded-full border-4 ${isDark ? 'border-zinc-900' : 'border-white'} bg-[#FFC107] flex items-center justify-center text-black font-black text-xs`}>
                +1k
              </div>
            </div>
            <h2 className={`text-3xl font-black mb-4 ${textClass}`}>Still need assistance?</h2>
            <p className={`text-base ${mutedTextClass} mb-10 max-w-xl font-medium`}>
              Join our discord community of 50,000+ global creators or email our specialized engineering division for direct project consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-black px-10 h-14 rounded-2xl text-sm uppercase tracking-widest gap-2">
                <MessageCircle className="w-4 h-4" /> Join Discord
              </Button>
              <Button variant="outline" className={`h-14 px-10 rounded-2xl text-sm font-black uppercase tracking-widest ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}>
                Email Engineering
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

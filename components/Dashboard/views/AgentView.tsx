"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  ChevronRight,
  Loader2,
  Video,
  Languages,
  Eye,
  Plus,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { PromptInputBox } from "../components/PromptInputBox";
import { youtubeAPI } from "@/lib/api";

interface AgentViewProps {
  theme: string;
  onViewChange?: (view: any) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

import Image from "next/image";

const OlleeyLogo = ({ className = "", isDark = true }: { className?: string; isDark?: boolean }) => (
  <div className={`relative w-12 h-12 ${className}`}>
    <Image
      src={isDark ? "/images/translogowhite.png" : "/logo-transparent.png"}
      alt="Olleey Logo"
      fill
      className="object-contain"
    />
  </div>
);

const quickActions = [
  {
    icon: Video,
    title: "Start new localization",
    description: "Upload and translate a video",
  },
  {
    icon: Languages,
    title: "Manual translation review",
    description: "Review and edit translations",
  },
  {
    icon: Eye,
    title: "Review pending videos",
    description: "Check videos awaiting approval",
  },
];

export function AgentView({ theme, onViewChange }: AgentViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const shadowClass = isDark ? "shadow-xl" : "shadow-none";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-gray-400" : "text-gray-600";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'll help you with that. Let me process your request...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.title === "Start new localization") {
      if (onViewChange) {
        onViewChange("manual_workflow");
      }
    } else {
      handleSend(action.title);
    }
  };

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${isDark ? "bg-[#0A0A0A]" : "bg-[#EBEBDC]"}`}>
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? 'white' : 'black'} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? 'white' : 'black'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar">
        {messages.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-10 pt-12">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-6 ${message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${message.role === "assistant"
                      ? "bg-[#D97757]/20 border border-[#D97757]/30"
                      : isDark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10"
                      }`}
                  >
                    {message.role === "assistant" ? (
                      <OlleeyLogo className="w-6 h-6" isDark={isDark} />
                    ) : (
                      <span className={`text-lg font-bold ${textClass}`}>Y</span>
                    )}
                  </div>

                  <div
                    className={`flex-1 max-w-[85%] ${message.role === "user"
                      ? `${cardBgClass} border ${borderClass} rounded-xl p-4 ${isDark ? 'shadow-xl' : 'shadow-none'}`
                      : ""
                      }`}
                  >
                    <p className={`text-lg leading-relaxed ${textClass} whitespace-pre-wrap`}>{message.content}</p>
                    <span className={`text-sm ${textSecondaryClass} mt-3 block`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#D97757]/20 border border-[#D97757]/30 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D97757]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-400">Assistant is thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 pb-6 z-20">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-12"
            >
              <div className="mb-6 px-4">
                <OlleeyLogo className="w-10 h-10" isDark={isDark} />
                <h1 className={`text-2xl font-serif mb-4 ${textClass} tracking-tight`}>Let's knock something off your list</h1>
              </div>

              {/* Connect Tools Banner */}
              <motion.div
                whileHover={{ scale: 1.005 }}
                onClick={async () => {
                  try {
                    const { auth_url } = await youtubeAPI.initiateConnection();
                    window.location.href = auth_url;
                  } catch (error) {
                    console.error("Failed to initiate YouTube connection:", error);
                  }
                }}
                className={`${cardBgClass} border ${borderClass} rounded-xl p-4 mb-4 cursor-pointer flex items-center justify-between group ${isDark ? 'shadow-xl' : 'shadow-none'} transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Connect your channels to Olleey</span>
                  <div className="flex items-center -space-x-1">

                    <div className={`w-8 h-8 rounded-lg bg-red-500/20 border ${isDark ? "border-white/10" : "border-black/5"} flex items-center justify-center overflow-hidden`}>
                      <img src="https://cdn-icons-png.flaticon.com/512/174/174883.png" className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 ${isDark ? "text-gray-600 group-hover:text-gray-400" : "text-gray-400 group-hover:text-gray-600"} transition-colors`} />
              </motion.div>

              {/* Quick Actions */}
              <div className="px-4">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-500"} uppercase tracking-wider`}>Pick a task, any task</span>
                  <span className={`ml-auto text-xs ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-900"} cursor-pointer transition-colors`}>+ Customize with plugins</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAction(action)}
                        className={`${cardBgClass} border ${borderClass} rounded-lg p-4 text-left transition-all flex flex-col h-full ${isDark ? 'shadow-lg' : 'shadow-none'} group`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-white/5 border-white/5 group-hover:border-white/10 group-hover:bg-white/10' : 'bg-black/5 border-black/5 group-hover:border-black/10 group-hover:bg-black/10'} flex items-center justify-center mb-3 transition-colors`}>
                          <Icon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                        <div className={`font-semibold ${textClass} text-sm mb-0.5`}>{action.title}</div>
                        <div className={`text-xs ${textSecondaryClass}`}>
                          {action.description}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          <PromptInputBox
            onSend={handleSend}
            isLoading={isTyping}
            placeholder="How can I help you today?"
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Loader2,
  Video,
  Languages,
  Eye,
  Plus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Script from "next/script";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

import { PromptInputBox } from "../components/PromptInputBox";
import { youtubeAPI, agentAPI } from "@/lib/api";

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

interface RecentChat {
  id: string;
  title: string;
  snippet: string;
  prompt: string;
  updatedAt: number;
}

import Image from "next/image";

const RECENT_CHATS_STORAGE_KEY = "olleey_recent_chats";

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
  const [draft, setDraft] = useState("");
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RECENT_CHATS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as RecentChat[];
      if (Array.isArray(parsed)) {
        setRecentChats(parsed.slice(0, 8));
      }
    } catch {
      // Ignore malformed local storage and fallback to empty list.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RECENT_CHATS_STORAGE_KEY, JSON.stringify(recentChats));
  }, [recentChats]);

  const pushRecentChat = (input: string) => {
    const prompt = input.trim();
    if (!prompt) return;
    const title = prompt.length > 46 ? `${prompt.slice(0, 46)}...` : prompt;
    const snippet = prompt.length > 84 ? `${prompt.slice(0, 84)}...` : prompt;
    const entry: RecentChat = {
      id: Date.now().toString(),
      title,
      snippet,
      prompt,
      updatedAt: Date.now(),
    };
    setRecentChats((prev) => {
      const deduped = prev.filter((chat) => chat.prompt.toLowerCase() !== prompt.toLowerCase());
      return [entry, ...deduped].slice(0, 8);
    });
  };

  const formatRecentTime = (updatedAt: number) => {
    const diff = Date.now() - updatedAt;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleSend = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    pushRecentChat(trimmed);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Map existing messages to history format
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await agentAPI.chat(trimmed, history);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response || "I couldn't process that request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, there was an error: ${error.message || "Failed to get response"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = draft.trim();
    if (!next || isTyping) return;
    setDraft("");
    await handleSend(next);
  };

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${isDark ? "bg-[#0A0A0A]" : "bg-[#EBEBDC]"}`}>
      {messages.length === 0 ? (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto min-h-full flex flex-col justify-center py-10"
          >
            <div>
              <div className="mb-8">
                <Script
                  src="https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js"
                  strategy="afterInteractive"
                />
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 shrink-0">
                    {React.createElement("lottie-player", {
                      src: "/lotties/bubble-main-scene.json",
                      autoplay: true,
                      loop: true,
                      style: {
                        width: "64px",
                        height: "64px",
                        pointerEvents: "none",
                      },
                    })}
                  </div>
                  <h1 className={`text-4xl sm:text-6xl leading-tight tracking-tight ${textClass}`}>
                    Let&apos;s share stories
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleQuickAction(action)}
                      className={`${cardBgClass} border ${borderClass} rounded-xl p-5 text-left transition-all ${shadowClass} ${isDark ? "hover:bg-[#171717]" : "hover:bg-white"} group`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={`text-xl font-semibold tracking-tight ${textClass}`}>{action.title}</h3>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-white/10" : "bg-black/5"}`}>
                          <Icon className={`w-4 h-4 ${isDark ? "text-gray-300" : "text-gray-700"}`} />
                        </div>
                      </div>
                      <p className={`mt-2 text-sm leading-relaxed ${textSecondaryClass}`}>{action.description}</p>
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={async () => {
                  try {
                    const { auth_url } = await youtubeAPI.initiateConnection();
                    window.location.href = auth_url;
                  } catch (error) {
                    console.error("Failed to initiate YouTube connection:", error);
                  }
                }}
                className={`mb-5 inline-flex w-fit items-center gap-2 text-sm ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"} transition-colors`}
              >
                Connect your channels to Olleey
                <ChevronRight className="w-4 h-4" />
              </button>

              <form
                onSubmit={handleSubmitDraft}
                className={`${cardBgClass} border ${borderClass} rounded-2xl p-4 sm:p-5 ${shadowClass}`}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSubmitDraft(e);
                    }
                  }}
                  placeholder="How can I help you today?"
                  className={`w-full resize-none bg-transparent outline-none border-0 text-base sm:text-lg min-h-[72px] ${isDark ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-500"}`}
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={`text-xs px-2.5 py-1 rounded-md border ${isDark ? "border-white/10 bg-white/5 text-gray-300" : "border-black/10 bg-black/5 text-gray-700"}`}>
                      Olleey Assistant
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-8 px-2.5 gap-1.5 text-xs border ${isDark ? "border-white/10 hover:bg-white/5 text-gray-300" : "border-black/10 hover:bg-black/5 text-gray-700"}`}
                        >
                          Recent chats
                          <ChevronDown className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-72 max-h-72 overflow-y-auto">
                        <DropdownMenuLabel>Recent Chats</DropdownMenuLabel>
                        {recentChats.length === 0 ? (
                          <div className="px-2 py-3 text-xs text-muted-foreground">
                            No recent chats yet.
                          </div>
                        ) : (
                          recentChats.map((chat) => (
                            <DropdownMenuItem
                              key={chat.id}
                              onSelect={() => setDraft(chat.prompt)}
                              className="py-2"
                            >
                              <div className="flex flex-col gap-0.5 w-full">
                                <span className="text-xs font-medium truncate">{chat.title}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatRecentTime(chat.updatedAt)}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-black/5"}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!draft.trim() || isTyping}
                    className="h-9 w-9 rounded-full"
                  >
                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 z-10 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-end gap-3 sm:gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        message.role === "assistant"
                          ? "bg-[#D97757]/20 border border-[#D97757]/30"
                          : isDark
                            ? "bg-white/5 border border-white/10"
                            : "bg-black/5 border border-black/10"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <OlleeyLogo className="w-6 h-6" isDark={isDark} />
                      ) : (
                        <span className={`text-xs font-semibold ${textClass}`}>You</span>
                      )}
                    </div>

                    <div
                      className={cn(
                        "max-w-[88%] border px-4 py-3.5 sm:px-5 sm:py-4",
                        message.role === "user"
                          ? isDark
                            ? "bg-[#1A1A1A] border-white/10 rounded-2xl rounded-br-md shadow-sm"
                            : "bg-white border-black/10 rounded-2xl rounded-br-md shadow-sm"
                          : isDark
                            ? "bg-[#121212] border-white/10 rounded-2xl rounded-bl-md"
                            : "bg-[#F8F8F8] border-black/10 rounded-2xl rounded-bl-md"
                      )}
                    >
                      <div className={cn("prose prose-sm sm:prose-base max-w-none leading-relaxed", isDark ? "prose-invert" : "", textClass)}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <span className={cn("mt-2.5 block text-[10px] uppercase tracking-wide", textSecondaryClass, message.role === "user" ? "text-right" : "text-left")}>
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
                  className="flex items-end gap-3 sm:gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#D97757]/20 border border-[#D97757]/30 flex items-center justify-center">
                    <OlleeyLogo className="w-6 h-6" isDark={isDark} />
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl rounded-bl-md border px-4 py-3",
                      isDark ? "bg-[#121212] border-white/10" : "bg-[#F8F8F8] border-black/10"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-bounce [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-bounce [animation-delay:240ms]" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className={cn("border-t px-4 py-4 sm:px-8 sm:py-5 z-20 backdrop-blur", isDark ? "border-white/10 bg-[#0A0A0A]/90" : "border-black/10 bg-[#EBEBDC]/90")}>
            <div className="max-w-4xl mx-auto">
              <PromptInputBox
                onSend={handleSend}
                isLoading={isTyping}
                placeholder="How can I help you today?"
                theme={theme}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

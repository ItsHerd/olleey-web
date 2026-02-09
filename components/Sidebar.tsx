"use client";

import { useTheme } from "@/lib/useTheme";
import { Search, ChevronDown, Check, Plus, Zap, LayoutGrid, Grid3x3, Layers, Shield, Settings, Activity, MessageSquare, ExternalLink, PlaySquare, CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/lib/api";


type SidebarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLocked?: boolean;
  onLogout?: () => void;
  isOpen?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isSearchFocused?: boolean;
  onSearchFocusChange?: (focused: boolean) => void;
  filteredSearchResults?: { videos: any[]; jobs: any[] };
  videos?: any[];
};

export default function Sidebar({
  currentPage,
  onNavigate,
  isLocked = false,
  onLogout,
  isOpen = false,
  searchQuery = "",
  onSearchChange,
  isSearchFocused = false,
  onSearchFocusChange,
  filteredSearchResults = { videos: [], jobs: [] },
  videos = []
}: SidebarProps) {
  const { theme } = useTheme();

  // Sidebar is expanded only when forced open (pinned)
  const isExpanded = isOpen;

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-dark-bg/95 backdrop-blur-xl" : "bg-white/70 backdrop-blur-xl";
  const borderClass = isDark ? "border-white/5" : "border-slate-200";
  const cardClass = isDark ? "bg-white/5" : "bg-slate-100";
  const textClass = isDark ? "text-white" : "text-slate-900";
  const textSecondaryClass = isDark ? "text-white/40" : "text-slate-500";
  const hoverClass = isDark ? "hover:bg-white/10" : "hover:bg-olleey-yellow/10 hover:text-olleey-yellow";
  const activeClass = isDark ? "bg-olleey-yellow text-black" : "bg-olleey-yellow text-black shadow-lg shadow-olleey-yellow/20";

  const mainNavItems = [
    { name: "Dashboard", icon: <LayoutGrid className="w-5 h-5" /> },
    { name: "All Media", icon: <PlaySquare className="w-5 h-5" /> },
    { name: "Channels", icon: <Grid3x3 className="w-5 h-5" /> },
    { name: "Workflows", icon: <Activity className="w-5 h-5" /> },
    { name: "Guardrails", icon: <Shield className="w-5 h-5" /> },
  ];

  const comingSoonItems = [
    { name: "Dynamic Sponsors", icon: <SponsorIcon /> },
    { name: "Comment Mirroring", icon: <CommentsIcon /> }
  ];

  const bottomNavItems: { name: string; icon: React.ReactNode }[] = [
    { name: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside
      className={`${isExpanded ? "w-48 sm:w-56 md:w-60" : "w-14 sm:w-16"
        } ${bgClass} border ${borderClass} rounded-2xl m-3 flex flex-col h-[calc(100vh-1.5rem)] transition-all duration-200 ease-in-out relative shadow-xl z-30`}
    >
      {/* Logo Section at Top */}
      <div className="px-2 sm:px-3 pt-3 sm:pt-4 pb-3 sm:pb-4">
        <div className={`flex items-center ${isExpanded ? 'px-4 py-3 gap-3 justify-start' : 'justify-center p-2'} transition-all duration-200`}>
          <div className={`w-8 h-8 ${isDark ? 'bg-white' : 'bg-slate-900'} rounded-xl flex items-center justify-center p-1.5 shadow-sm shrink-0`}>
            <img
              src="/logo-transparent.png"
              alt="olleey"
              className={`w-full h-full object-contain ${isDark ? '' : 'invert'}`}
            />
          </div>
          {isExpanded && (
            <h1 className={`text-xl font-300 tracking-tight cursor-pointer ${textClass}`} onClick={() => onNavigate("dashboard")}>olleey.com</h1>
          )}
        </div>
      </div>

      {/* Replaced Project Selector with Search Bar */}
      <div className="px-2 sm:px-3 pb-3">
        {isExpanded ? (
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Search className={`h-3.5 w-3.5 ${textSecondaryClass} group-focus-within:text-olleey-yellow transition-colors opacity-50`} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onFocus={() => onSearchFocusChange?.(true)}
              onBlur={() => setTimeout(() => onSearchFocusChange?.(false), 200)}
              placeholder="Search..."
              className={`block w-full pl-9 pr-3 py-2 text-xs border ${isDark ? 'bg-white/[0.03] border-white/5 text-white placeholder-white/20' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'} rounded-xl focus:ring-1 focus:ring-olleey-yellow/50 focus:border-olleey-yellow/50 outline-none transition-all duration-300 font-mono`}
            />

            {/* Floating Search Results - Displaced to Right */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`fixed left-[240px] top-24 w-80 p-2 rounded-2xl border ${isDark ? 'bg-[#0f0f11]/95 border-white/10 shadow-2xl backdrop-blur-2xl' : 'bg-white border-gray-200 shadow-xl'} z-[110] overflow-hidden max-h-[500px] overflow-y-auto`}
                >
                  {filteredSearchResults.videos.length === 0 && filteredSearchResults.jobs.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${textSecondaryClass} opacity-40`}>Zero results</p>
                    </div>
                  ) : (
                    <div className="space-y-4 p-2">
                      {filteredSearchResults.jobs.length > 0 && (
                        <div>
                          <div className={`px-2 mb-2 text-[9px] font-black uppercase tracking-[0.2em] ${textSecondaryClass} opacity-40 font-mono`}>Operations</div>
                          <div className="space-y-1">
                            {filteredSearchResults.jobs.map(job => (
                              <button
                                key={job.job_id}
                                onClick={() => {
                                  onNavigate("Workflows");
                                  onSearchChange?.("");
                                }}
                                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} text-left truncate`}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-olleey-yellow animate-pulse shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-bold truncate ${textClass}`}>{job.job_id.slice(0, 12)}...</div>
                                  <div className={`text-[8px] ${textSecondaryClass} font-black uppercase tracking-tighter`}>{job.status}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredSearchResults.videos.length > 0 && (
                        <div>
                          <div className={`px-2 mb-2 text-[9px] font-black uppercase tracking-[0.2em] ${textSecondaryClass} opacity-40 font-mono`}>Library</div>
                          <div className="space-y-1">
                            {filteredSearchResults.videos.map(video => (
                              <button
                                key={video.video_id}
                                onClick={() => {
                                  onNavigate("All Media");
                                  onSearchChange?.("");
                                }}
                                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} text-left`}
                              >
                                {video.thumbnail_url ? (
                                  <img src={video.thumbnail_url} className="w-8 h-8 rounded-lg object-cover shrink-0 bg-white/5" alt="" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-olleey-yellow/10 shrink-0">
                                    <PlaySquare className="w-4 h-4 text-olleey-yellow" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-bold truncate ${textClass}`}>{video.title}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => onNavigate("Dashboard")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${cardClass} border ${borderClass} hover:text-olleey-yellow transition-colors shadow-sm`}
            >
              <Search className="w-4 h-4 opacity-50" />
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation - Moved Up */}
      <nav className="flex-1 px-2 sm:px-3 flex flex-col justify-start pt-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {mainNavItems.map((item) => (
          <button
            key={item.name}
            onClick={() => !isLocked && onNavigate(item.name)}
            disabled={isLocked}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLocked
              ? `${textSecondaryClass} cursor-not-allowed opacity-50`
              : currentPage === item.name
                ? `${activeClass}`
                : `${textSecondaryClass} ${hoverClass}`
              }`}
          >
            <span className={`${isExpanded ? "" : "mx-auto"} w-5 h-5 flex items-center justify-center flex-shrink-0`}>
              {item.icon}
            </span>
            {isExpanded && (
              <span className="truncate">{item.name}</span>
            )}
          </button>
        ))}

        {isExpanded ? (
          <div className="flex items-center gap-2 px-3 mt-8 mb-4">
            <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
            <span className={`text-[10px] font-medium ${textSecondaryClass} uppercase tracking-wider whitespace-nowrap`}>Alpha Previews</span>
            <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
          </div>
        ) : (
          <div className={`my-2 mx-3 border-t ${borderClass}`} />
        )}

        {comingSoonItems.map((item) => (
          <button
            key={item.name}
            onClick={() => !isLocked && onNavigate(item.name)}
            disabled={isLocked}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLocked
              ? `${textSecondaryClass} cursor-not-allowed opacity-50`
              : currentPage === item.name
                ? `${cardClass} ${textClass} font-medium`
                : `${textSecondaryClass} hover:${cardClass} hover:${textClass}`
              }`}
          >
            <span className={`${isExpanded ? "" : "mx-auto"} w-5 h-5 flex items-center justify-center flex-shrink-0`}>
              {item.icon}
            </span>
            {isExpanded && (
              <span className="truncate">{item.name}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Navigation - Settings & Account */}
      {bottomNavItems.length > 0 && (
        <div className={`px-3 pb-4 space-y-1 border-t ${borderClass} pt-4`}>
          {bottomNavItems.map((item) => (
            <button
              key={item.name}
              onClick={() => !isLocked && onNavigate(item.name)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLocked
                ? `${textSecondaryClass} cursor-not-allowed opacity-50`
                : currentPage === item.name
                  ? `${activeClass}`
                  : `${textSecondaryClass} ${hoverClass}`
                }`}
            >
              <span className={`${isExpanded ? "" : "mx-auto"} w-5 h-5 flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </span>
              {isExpanded && (
                <span className="truncate">{item.name}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Usage & Plan Section */}
      {isExpanded && (
        <div className={`px-3 pb-4 pt-2 border-t ${borderClass}`}>
          <div className={`${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'} rounded-xl p-3 border shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-olleey-yellow/20 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-olleey-yellow" />
                </div>
                <span className={`text-xs font-bold ${textClass}`}>Pro Plan</span>
              </div>
              <span className={`text-[10px] font-bold text-olleey-yellow uppercase tracking-tight`}>84% used</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-olleey-yellow rounded-full shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                style={{ width: '84%' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-[10px] ${textSecondaryClass}`}>842 / 1000 mins</span>
              <button className={`text-[10px] font-bold text-olleey-yellow hover:underline cursor-pointer`}>
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}

function SponsorIcon() {
  return <ExternalLink className="w-5 h-5" />;
}

function CommentsIcon() {
  return <MessageSquare className="w-5 h-5" />;
}

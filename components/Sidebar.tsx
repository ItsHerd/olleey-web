"use client";

import { useTheme } from "@/lib/useTheme";
import { ChevronDown, Check, Plus, Zap, LayoutGrid, Grid3x3, Layers, Shield, Settings, Activity, MessageSquare, ExternalLink, PlaySquare } from "lucide-react";
import { useState } from "react";
import type { Project } from "@/lib/api";


type SidebarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLocked?: boolean;
  onLogout?: () => void;
  isOpen?: boolean;
  projects?: Project[];
  selectedProject?: Project | null;
  selectedProjectChannelName?: string;
  onProjectSelect?: (project: Project) => void;
  onCreateProject?: () => void;
};

export default function Sidebar({
  currentPage,
  onNavigate,
  isLocked = false,
  onLogout,
  isOpen = false,
  projects = [],
  selectedProject,
  selectedProjectChannelName,
  onProjectSelect,
  onCreateProject
}: SidebarProps) {
  const { theme } = useTheme();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  // Sidebar is expanded only when forced open (pinned)
  const isExpanded = isOpen;

  const bgClass = theme === "light" ? "bg-gray-50" : "bg-dark-bg";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";

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
        } ${bgClass} border ${borderClass} rounded-2xl m-3 flex flex-col h-[calc(100vh-1.5rem)] transition-all duration-200 ease-in-out overflow-hidden shadow-xl z-30`}
    >
      {/* Logo Section at Top */}
      <div className="px-2 sm:px-3 pt-3 sm:pt-4 pb-3 sm:pb-4">
        {isExpanded ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className={`text-2xl font-300 ${textClass}`}>olleey.com</h1>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 bg-amber-50 rounded-lg p-1">
            <img
              src="/logo-transparent.png"
              alt="olleey"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain mx-auto"
            />
          </div>
        )}
      </div>

      {/* Project Selector */}
      {projects.length > 0 && (
        <div className="px-2 sm:px-3 pb-3">
          <div className="relative">
            <button
              onClick={() => isExpanded && setProjectDropdownOpen(!projectDropdownOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isExpanded
                ? `${cardClass} border ${borderClass} hover:shadow-md cursor-pointer transition-shadow`
                : 'justify-center'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-[12px] text-white font-bold shadow-sm flex-shrink-0`}>
                {selectedProject?.name?.charAt(0) || "P"}
              </div>
              {isExpanded && (
                <>
                  <div className="flex flex-col flex-1 text-left min-w-0">
                    <span className={`text-sm ${textClass} font-semibold truncate`}>
                      {selectedProject?.name || "Select Project"}
                    </span>
                    {selectedProjectChannelName && (
                      <span className={`text-[10px] ${textSecondaryClass} opacity-60 truncate font-medium`}>
                        {selectedProjectChannelName}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 ${textClass} opacity-50 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Project Dropdown */}
            {isExpanded && projectDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 ${cardClass} border ${borderClass} rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
                <div className="p-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onProjectSelect?.(project);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${selectedProject?.id === project.id
                        ? `${cardClass} ${textClass} font-medium`
                        : `${textSecondaryClass} hover:${cardClass} hover:${textClass}`
                        }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{project.name.charAt(0)}</span>
                      </div>
                      <span className="truncate flex-1 text-left">{project.name}</span>
                      {selectedProject?.id === project.id && (
                        <Check className="w-4 h-4 text-yellow-500" />
                      )}
                    </button>
                  ))}

                  {/* Divider */}
                  <div className={`my-1 border-t ${borderClass}`} />

                  {/* Add Project */}
                  <button
                    onClick={() => {
                      onCreateProject?.();
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${textSecondaryClass} hover:${cardClass} hover:${textClass} transition-colors`}
                  >
                    <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="flex-1 text-left">Add Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

        {isExpanded ? (
          <div className="flex items-center gap-2 px-3 mt-8 mb-4">
            <div className={`h-[1px] flex-1 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`} />
            <span className={`text-[10px] font-medium ${textSecondaryClass} uppercase tracking-wider whitespace-nowrap`}>Coming Soon</span>
            <div className={`h-[1px] flex-1 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`} />
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
        </div>
      )}

      {/* Usage & Plan Section */}
      {isExpanded && (
        <div className={`px-3 pb-4 pt-2 border-t ${borderClass}`}>
          <div className={`${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'} rounded-xl p-3 border shadow-sm`}>
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

      {/* Support Button - Bottom Anchor */}
      <div className={`mt-auto px-2 sm:px-3 pb-3 sm:pb-4`}>
        <button
          onClick={() => onNavigate("Support")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${cardClass} border ${borderClass} hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow group`}
        >
          <span className={`${isExpanded ? "" : "mx-auto"} flex-shrink-0 transition-colors`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          {isExpanded && <span className="font-bold truncate text-white">Support Center</span>}
        </button>
      </div>
    </aside>
  );
}

function SponsorIcon() {
  return <ExternalLink className="w-5 h-5" />;
}

function CommentsIcon() {
  return <MessageSquare className="w-5 h-5" />;
}

"use client";

import { useState } from "react";
import { useTheme } from "@/lib/useTheme";


type SidebarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLocked?: boolean;
  onLogout?: () => void;
  isOpen?: boolean;
};

export default function Sidebar({ currentPage, onNavigate, isLocked = false, onLogout, isOpen = false }: SidebarProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Sidebar is expanded when hovered or when forced open (pinned)
  const isExpanded = isOpen || isHovered;

  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";

  const mainNavItems = [
    { name: "Content", icon: <ContentIcon /> },
    { name: "Channels", icon: <ChannelsIcon /> },
    { name: "Queued Jobs", icon: <LanguagesIcon /> },
    { name: "Notifications", icon: <NotificationsIcon /> },
    { name: "Analytics", icon: <AnalyticsIcon /> }
  ];

  const bottomNavItems = [
    { name: "Accounts", icon: <AccountsIcon /> },
    { name: "Settings", icon: <SettingsIcon /> }
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${isExpanded ? "w-48 sm:w-56 md:w-60" : "w-14 sm:w-16"
        } ${bgClass} border-r ${borderClass} flex flex-col h-full transition-all duration-200 ease-in-out overflow-hidden`}
    >
      {/* Logo Section at Top */}
      <div className="px-3 sm:px-5 pt-4 sm:pt-6 pb-4 sm:pb-6">
        {isExpanded ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className={`text-2xl font-bold ${textClass}`}>olleey</h1>
          </div>
        ) : (
          <img
            src="/logo-transparent.png"
            alt="olleey"
            className="w-auto h-24 sm:w-auto sm:h-24 rounded-lg object-contain mx-auto"
          />
        )}
      </div>

      {/* Main Navigation - Centered Vertically */}
      <nav className="flex-1 px-2 sm:px-3 flex flex-col justify-center space-y-1 overflow-y-auto">
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
      </nav>

      {/* Bottom Navigation - Settings & Account */}
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
    </aside>
  );
}

function ContentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9l6 3-6 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChannelsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function AccountsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LanguagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function NotificationsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.4-6.4l-4.2 4.2m-4.2 4.2L5.6 18.4m12.8 0l-4.2-4.2m-4.2-4.2L5.6 5.6" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

"use client";

import { useState } from "react";


type SidebarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLocked?: boolean;
  onLogout?: () => void;
};

export default function Sidebar({ currentPage, onNavigate, isLocked = false, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNavItems = [
    { name: "Content", icon: <ContentIcon /> },
    { name: "Channels", icon: <ChannelsIcon /> },
    { name: "Languages", icon: <LanguagesIcon /> },
    { name: "Destinations", icon: <DestinationsIcon /> },
    { name: "Analytics", icon: <AnalyticsIcon /> }
  ];

  const bottomNavItems = [
    { name: "Accounts", icon: <AccountsIcon /> },
    { name: "Settings", icon: <SettingsIcon /> }
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-200 ease-in-out`}
    >
      {/* Logo Section at Top */}
      <div className="px-5 pt-6 pb-6">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Sheaperd"
              className="w-10 h-10 rounded-lg object-contain"
            />
              <span className="text-xl font-bold text-gray-900">Sheaperd</span>
          </div>
        ) : (
          <img 
            src="/logo.png" 
            alt="Sheaperd"
            className="w-10 h-10 rounded-lg object-contain mx-auto"
          />
        )}
      </div>

      {/* Main Navigation - Centered Vertically */}
      <nav className="flex-1 px-3 flex flex-col justify-center space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <button
            key={item.name}
            onClick={() => !isLocked && onNavigate(item.name)}
            disabled={isLocked}
            className={`w-full flex items-center gap-5 px-4 py-3 rounded-full text-xl font-normal transition-all ${
              isLocked
                ? "text-gray-400 cursor-not-allowed opacity-50"
                : currentPage === item.name
                ? "bg-gray-100 text-gray-900 font-bold"
                : "text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span className={`${isCollapsed ? "mx-auto" : ""} w-7 h-7 flex items-center justify-center flex-shrink-0`}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="truncate">{item.name}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Navigation - Settings & Account */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-200 pt-4">
        {bottomNavItems.map((item) => (
          <button
            key={item.name}
            onClick={() => !isLocked && onNavigate(item.name)}
            disabled={isLocked}
            className={`w-full flex items-center gap-5 px-4 py-3 rounded-full text-xl font-normal transition-all ${
              isLocked
                ? "text-gray-400 cursor-not-allowed opacity-50"
                : currentPage === item.name
                ? "bg-blue-50 text-blue-600 font-bold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className={`${isCollapsed ? "mx-auto" : ""} w-7 h-7 flex items-center justify-center flex-shrink-0`}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="truncate">{item.name}</span>
            )}
          </button>
        ))}
        
        {/* Profile Section */}
        <div className="mt-4 px-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-white">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Sidiq Moltafet</p>
                <p className="text-xs text-gray-600 truncate">@sidiqmoltafet</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
              <span className="text-sm font-semibold text-white">S</span>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-5 px-4 py-2 rounded-full text-sm font-normal text-gray-600 hover:bg-gray-100 transition-all mt-2"
        >
          <span className={`${isCollapsed ? "mx-auto" : ""} w-5 h-5 flex items-center justify-center flex-shrink-0`}>
            {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </span>
          {!isCollapsed && (
            <span className="truncate">Collapse</span>
          )}
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-5 px-4 py-2 rounded-full text-sm font-normal text-red-600 hover:bg-red-50 transition-all mt-2"
          >
            <span className={`${isCollapsed ? "mx-auto" : ""} w-5 h-5 flex items-center justify-center flex-shrink-0`}>
              <LogoutIcon />
            </span>
            {!isCollapsed && (
              <span className="truncate">Logout</span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}

function ContentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9l6 3-6 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChannelsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function AccountsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LanguagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function DestinationsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.4-6.4l-4.2 4.2m-4.2 4.2L5.6 18.4m12.8 0l-4.2-4.2m-4.2-4.2L5.6 5.6" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
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

"use client";

import React from "react";
import { Settings, Moon, Sun, Globe, Bell, Lock, Palette } from "lucide-react";

export function SettingsView({ theme }: { theme: string }) {
  const isDark = theme === "dark";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-400";
  const cardBgClass = isDark ? "bg-white/[0.03]" : "bg-gray-50";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";

  const settingsGroups = [
    {
      title: "Appearance",
      items: [
        { icon: Palette, label: "Theme", value: theme === 'dark' ? "Dark Mode" : "Light Mode" },
        { icon: Globe, label: "Language", value: "English (US)" },
      ]
    },
    {
      title: "Workspace",
      items: [
        { icon: Bell, label: "Push Notifications", value: "Enabled" },
        { icon: Lock, label: "Privacy and Safety", value: "Standard" },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className={`text-3xl font-serif ${textClass} mb-2`}>Settings</h1>
        <p className={mutedTextClass}>Customize your application experience and security</p>
      </div>

      <div className="space-y-10">
        {settingsGroups.map((group, idx) => (
          <div key={idx}>
            <h2 className={`text-xs font-bold uppercase tracking-widest ${mutedTextClass} mb-4`}>{group.title}</h2>
            <div className="space-y-3">
              {group.items.map((item, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border ${borderClass} ${cardBgClass} flex items-center justify-between ${isDark ? "hover:border-white/20" : "hover:border-gray-300 hover:bg-white"} transition-all cursor-pointer group`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${isDark ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"} border shadow-sm`}>
                      <item.icon className={`w-5 h-5 ${mutedTextClass}`} />
                    </div>
                    <span className={`font-medium ${textClass}`}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${mutedTextClass}`}>{item.value}</span>
                    <div className={mutedTextClass}>→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-12 p-6 rounded-2xl border border-dashed ${borderClass} text-center`}>
        <p className={`text-sm ${mutedTextClass}`}>More settings are available in the Legacy Dashboard.</p>
        <button className="mt-2 text-[#D97757] font-semibold hover:underline">
          Go to Global Settings
        </button>
      </div>
    </div>
  );
}

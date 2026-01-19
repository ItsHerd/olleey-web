"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [notifications, setNotifications] = useState({
    email: true,
    distribution: true,
    errors: true
  });

  return (
    <div className="flex-1 p-6 bg-[#f9fafb]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Settings</h2>
        <p className="text-sm text-[#6b7280] mt-1">Manage your product preferences</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Appearance</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#6b7280]">Theme</label>
              <div className="mt-2 flex gap-3">
                <button className="px-4 py-2 bg-[#111827] text-white rounded-lg text-sm font-medium">
                  Light
                </button>
                <button
                  disabled
                  className="px-4 py-2 bg-[#f3f4f6] text-[#9ca3af] rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Dark (Unavailable)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Timezone</h3>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-[#111827]">Email notifications</span>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, email: !prev.email }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.email ? "bg-[#111827]" : "bg-[#e5e7eb]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-[#111827]">Distribution updates</span>
              <button
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    distribution: !prev.distribution
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.distribution ? "bg-[#111827]" : "bg-[#e5e7eb]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.distribution ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-[#111827]">Error alerts</span>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, errors: !prev.errors }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.errors ? "bg-[#111827]" : "bg-[#e5e7eb]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.errors ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

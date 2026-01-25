"use client";

import { useEffect, useState } from "react";
import { settingsAPI, type UserSettings } from "@/lib/api";
import { useTheme } from "@/lib/useTheme";

interface NotificationSettings {
  email: boolean;
  distribution: boolean;
  errors: boolean;
}

export default function SettingsPage() {
  const { theme: currentTheme, setTheme: setThemeContext } = useTheme();
  const [theme, setTheme] = useState<"light" | "dark">(currentTheme);
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    distribution: true,
    errors: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "experimental">("settings");

  // Experimental features state
  const [experimentalFeatures, setExperimentalFeatures] = useState({
    aiVoiceCloning: false,
    autoTranslation: false,
    advancedAnalytics: false,
    betaFeatures: false,
  });

  // Sync local theme with context theme
  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  // Load settings from backend
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await settingsAPI.getSettings();
        // Theme is already loaded by ThemeProvider, but sync local state
        setTheme(data.theme);
        setTimezone(data.timezone);
        setNotifications({
          email: data.notifications.email_notifications,
          distribution: data.notifications.distribution_updates,
          errors: data.notifications.error_alerts,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load settings";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaveMessage(null);

      const payload: Partial<UserSettings> = {
        theme,
        timezone,
        notifications: {
          email_notifications: notifications.email,
          distribution_updates: notifications.distribution,
          error_alerts: notifications.errors,
        },
      };

      await settingsAPI.updateSettings(payload);
      // Update theme context after successful save
      setThemeContext(theme);
      setSaveMessage("Settings saved");
      // Auto-hide message after a few seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Theme-aware classes
  const bgClass = currentTheme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = currentTheme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = currentTheme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = currentTheme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = currentTheme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = currentTheme === "light" ? "border-light-border" : "border-dark-border";
  const accentClass = currentTheme === "light" ? "bg-light-accent" : "bg-dark-accent";

  return (
    <div className={`flex-1 p-6 ${bgClass}`}>
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-normal ${textClass}`}>Settings</h2>
            <p className={`text-sm ${textSecondaryClass} mt-1`}>Manage your product preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <div className={`px-3 py-1.5 rounded-full ${cardClass} border ${borderClass} text-xs ${textClass}`}>
                {saveMessage}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className={`px-4 py-2 ${cardClass} ${textClass} rounded-full text-sm font-normal border ${borderClass} hover:${cardAltClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-red-900/30 border border-red-700 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className={`mb-6 flex gap-2 border-b ${borderClass}`}>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-normal transition-colors border-b-2 ${activeTab === "settings"
              ? `border-indigo-500 ${textClass}`
              : `border-transparent ${textSecondaryClass} hover:${textClass}`
              }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("experimental")}
            className={`px-4 py-2 text-sm font-normal transition-colors border-b-2 ${activeTab === "experimental"
              ? `border-indigo-500 ${textClass}`
              : `border-transparent ${textSecondaryClass} hover:${textClass}`
              }`}
          >
            Experimental Features
          </button>
        </div>

        <div className="space-y-6 opacity-100">
          {/* Settings Tab Content */}
          {activeTab === "settings" && (
            <>
              {/* Appearance */}
              <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
                <h3 className={`text-lg font-normal ${textClass} mb-4`}>Appearance</h3>
                <div className="space-y-3">
                  <div>
                    <label className={`text-sm ${textSecondaryClass}`}>Theme</label>
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`px-4 py-2 rounded-full text-sm font-normal border transition-colors ${theme === "light"
                          ? "bg-light-accent text-white border-light-accent"
                          : `${cardClass} text-light-textSecondary border-light-border hover:text-light-text`
                          }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`px-4 py-2 rounded-full text-sm font-normal border transition-colors ${theme === "dark"
                          ? `${accentClass} text-white ${borderClass}`
                          : `${cardClass} ${textSecondaryClass} ${borderClass} hover:${textClass}`
                          }`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
                <h3 className={`text-lg font-normal ${textClass} mb-4`}>Timezone</h3>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={`w-full px-4 py-2 ${bgClass} border ${borderClass} rounded-full text-sm ${textClass} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
                <p className={`mt-2 text-xs ${textSecondaryClass}`}>
                  Used for scheduling distributions and reporting.
                </p>
              </div>

              {/* Notifications */}
              <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
                <h3 className={`text-lg font-normal ${textClass} mb-4`}>Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className={`block text-sm ${textClass}`}>Email notifications</span>
                      <span className={`block text-xs ${textSecondaryClass}`}>
                        Receive updates about new features and important account activity.
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({ ...prev, email: !prev.email }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.email ? "bg-indigo-500" : cardAltClass
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.email ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className={`block text-sm ${textClass}`}>Distribution updates</span>
                      <span className={`block text-xs ${textSecondaryClass}`}>
                        Alerts when dubbing jobs finish and videos are ready on destination channels.
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          distribution: !prev.distribution,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.distribution ? "bg-indigo-500" : cardAltClass
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.distribution ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className={`block text-sm ${textClass}`}>Error alerts</span>
                      <span className={`block text-xs ${textSecondaryClass}`}>
                        Get notified when a dubbing job fails or a channel connection breaks.
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({ ...prev, errors: !prev.errors }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.errors ? "bg-indigo-500" : cardAltClass
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.errors ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Experimental Features Tab */}
          {activeTab === "experimental" && (
            <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
              <h3 className={`text-lg font-normal ${textClass} mb-4`}>Experimental Features</h3>
              <p className={`text-sm ${textSecondaryClass} mb-6`}>
                Enable experimental features to try new functionality. These features may be unstable or change without notice.
              </p>

              <div className="space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className={`block text-sm ${textClass}`}>AI Voice Cloning</span>
                    <span className={`block text-xs ${textSecondaryClass}`}>
                      Use advanced AI to clone voices for dubbing. May produce more natural-sounding results.
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setExperimentalFeatures((prev) => ({ ...prev, aiVoiceCloning: !prev.aiVoiceCloning }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${experimentalFeatures.aiVoiceCloning ? "bg-indigo-500" : cardAltClass
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${experimentalFeatures.aiVoiceCloning ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className={`block text-sm ${textClass}`}>Auto Translation</span>
                    <span className={`block text-xs ${textSecondaryClass}`}>
                      Automatically translate and dub videos when they're uploaded to your channel.
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setExperimentalFeatures((prev) => ({ ...prev, autoTranslation: !prev.autoTranslation }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${experimentalFeatures.autoTranslation ? "bg-indigo-500" : cardAltClass
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${experimentalFeatures.autoTranslation ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className={`block text-sm ${textClass}`}>Advanced Analytics</span>
                    <span className={`block text-xs ${textSecondaryClass}`}>
                      Access detailed performance metrics and insights for your translated content.
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setExperimentalFeatures((prev) => ({ ...prev, advancedAnalytics: !prev.advancedAnalytics }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${experimentalFeatures.advancedAnalytics ? "bg-indigo-500" : cardAltClass
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${experimentalFeatures.advancedAnalytics ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className={`block text-sm ${textClass}`}>Beta Features</span>
                    <span className={`block text-xs ${textSecondaryClass}`}>
                      Get early access to new features before they're released to everyone.
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setExperimentalFeatures((prev) => ({ ...prev, betaFeatures: !prev.betaFeatures }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${experimentalFeatures.betaFeatures ? "bg-indigo-500" : cardAltClass
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${experimentalFeatures.betaFeatures ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

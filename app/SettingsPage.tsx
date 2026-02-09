"use client";

import { useEffect, useState } from "react";
import { settingsAPI, type UserSettings } from "@/lib/api";
import { useTheme } from "@/lib/useTheme";
import {
  Settings as SettingsIcon,
  FlaskConical,
  Moon,
  Sun,
  Clock,
  Bell,
  ShieldCheck,
  Cpu,
  Zap,
  Globe,
  Sparkles,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface NotificationSettings {
  email: boolean;
  distribution: boolean;
  errors: boolean;
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
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Loading timeout')), 5000)
        );
        const dataPromise = settingsAPI.getSettings();
        const data = await Promise.race([dataPromise, timeoutPromise]) as any;

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
      setThemeContext(theme);
      setSaveMessage("Protocol update successful");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save protocol";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const isDark = currentTheme === "dark";
  const bgClass = isDark ? "bg-dark-bg" : "bg-light-bg";
  const cardClass = isDark ? "bg-[#0c0c0c]" : "bg-white";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-white/40" : "text-gray-500";
  const borderClass = isDark ? "border-white/5" : "border-gray-200";

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${bgClass} p-8 animate-pulse`}>
        <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8">
          <SettingsIcon className={`h-10 w-10 animate-spin text-olleey-yellow stroke-[1.5px]`} />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Calibrating Workspace...</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 p-3 pr-6 pb-32 h-full ${bgClass} overflow-y-auto custom-scrollbar pt-8`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-12"
      >
        {/* Cinema Header */}
        <motion.div variants={itemVariants} className="relative group rounded-[2.5rem] overflow-hidden border border-white/5 min-h-[160px] flex items-end shadow-2xl bg-[#0c0c0c]">
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2000"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.25] group-hover:scale-105 transition-transform duration-[10000ms]"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent" />

          <div className="relative z-10 p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-olleey-yellow/10 backdrop-blur-3xl border border-olleey-yellow/20 text-[9px] font-black uppercase tracking-[0.3em] text-olleey-yellow mb-3 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                <SettingsIcon className="w-3.5 h-3.5 shadow-sm" /> Workspace Protocol
              </div>
              <h1 className="text-3xl md:text-4xl font-normal text-white tracking-tighter mb-2 leading-none">
                Environment
              </h1>
              <p className={`text-white/60 text-sm md:text-base max-w-xl font-light tracking-tight opacity-60 leading-relaxed`}>
                Configure your high-fidelity production environment, neural notification mapping, and experimental deployment protocols.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <AnimatePresence>
                {saveMessage && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500 backdrop-blur-md flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-14 px-10 bg-olleey-yellow text-black hover:bg-white transition-all font-black uppercase tracking-[0.2em] text-[11px] rounded-full shadow-[0_20px_40px_rgba(251,191,36,0.2)] disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Commit Changes</span>}
              </Button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="p-6 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 opacity-50">Protocol Fault Encountered</span>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants} className={`flex gap-2 p-1.5 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl w-fit backdrop-blur-xl`}>
          {[
            { id: 'settings', label: 'General Registry', icon: SettingsIcon },
            { id: 'experimental', label: 'Deep Lab', icon: FlaskConical }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative group ${activeTab === tab.id ? 'bg-olleey-yellow text-black shadow-lg shadow-olleey-yellow/20' : isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : isDark ? 'text-white/20 group-hover:text-white/60' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-glow" className="absolute inset-0 bg-white/10 rounded-xl pointer-events-none" />
              )}
            </button>
          ))}
        </motion.div>

        <div className="space-y-10">
          <AnimatePresence mode="wait">
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Appearance */}
                <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/[0.01]' : ''} backdrop-blur-3xl group`}>
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none transition-transform group-hover:scale-110">
                    <Sparkles className="w-40 h-40" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="space-y-2">
                      <h3 className={`text-2xl font-normal ${textClass} tracking-tighter`}>Surface Interface</h3>
                      <p className={`text-sm font-light ${textSecondaryClass} tracking-tight max-w-sm`}>Calibrate the visual aesthetics of your command workstation.</p>
                    </div>
                    <div className="flex gap-4 p-2 bg-white/5 border border-white/5 rounded-[2rem] shadow-inner">
                      <button
                        onClick={() => setThemeContext("light")}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${theme === "light" ? 'bg-white text-black shadow-2xl scale-105 ring-1 ring-black/5' : isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                      >
                        <Sun className="w-4 h-4" /> Light Mode
                      </button>
                      <button
                        onClick={() => setThemeContext("dark")}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${theme === "dark" ? 'bg-olleey-yellow text-black shadow-[0_0_30px_rgba(251,191,36,0.5)] scale-105' : isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                      >
                        <Moon className="w-4 h-4" /> Dark Mode
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timezone */}
                <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/[0.01]' : ''} backdrop-blur-3xl group`}>
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none transition-transform group-hover:scale-110">
                    <Clock className="w-40 h-40" />
                  </div>

                  <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                      <h3 className={`text-2xl font-normal ${textClass} tracking-tighter`}>Temporal Index</h3>
                      <p className={`text-sm font-light ${textSecondaryClass} tracking-tight`}>Set your local temporal reference for distribution orchestration.</p>
                    </div>
                    <div className="relative">
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className={`w-full h-20 ${isDark ? 'bg-white/[0.03] border-white/5 text-white/80 hover:bg-white/5' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'} border rounded-3xl px-10 text-[15px] font-medium focus:border-olleey-yellow outline-none transition-all appearance-none cursor-pointer shadow-2xl`}
                      >
                        <option value="America/Los_Angeles" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Pacific Time (PT) • GMT-8</option>
                        <option value="America/Denver" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Mountain Time (MT) • GMT-7</option>
                        <option value="America/Chicago" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Central Time (CT) • GMT-6</option>
                        <option value="America/New_York" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Eastern Time (ET) • GMT-5</option>
                        <option value="Europe/London" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>London (GMT) • GMT+0</option>
                        <option value="Europe/Paris" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Paris (CET) • GMT+1</option>
                        <option value="Asia/Tokyo" className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Tokyo (JST) • GMT+9</option>
                      </select>
                      <ChevronRight className={`absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 ${isDark ? 'text-white/20' : 'text-gray-400'} pointer-events-none rotate-90`} />
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/[0.01]' : ''} backdrop-blur-3xl group`}>
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none transition-transform group-hover:scale-110">
                    <Bell className="w-40 h-40" />
                  </div>

                  <div className="relative z-10 space-y-12">
                    <div className="space-y-2">
                      <h3 className={`text-2xl font-normal ${textClass} tracking-tighter`}>Neural Alerts</h3>
                      <p className={`text-sm font-light ${textSecondaryClass} tracking-tight`}>Map signal notifications to your primary communication hubs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { id: 'email', title: 'Comms Uplink', desc: 'Critical feature status', icon: Globe },
                        { id: 'distribution', title: 'Pipeline Sync', desc: 'Sync completion events', icon: Zap },
                        { id: 'errors', title: 'Fault Detector', desc: 'System exception alerts', icon: ShieldCheck }
                      ].map(item => (
                        <div
                          key={item.id}
                          onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof NotificationSettings] }))}
                          className={`group/notify flex flex-col p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${notifications[item.id as keyof NotificationSettings]
                            ? 'border-olleey-yellow/30 bg-olleey-yellow/[0.05] shadow-[0_20px_40px_-10px_rgba(251,191,36,0.1)]'
                            : isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'}`}
                        >
                          <div className="flex items-center justify-between mb-8">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${notifications[item.id as keyof NotificationSettings] ? 'bg-olleey-yellow text-black scale-110' : isDark ? 'bg-white/5 opacity-40 group-hover/notify:opacity-100 group-hover/notify:bg-white/10' : 'bg-gray-100 text-gray-400 group-hover/notify:bg-gray-200 group-hover/notify:text-gray-600'}`}>
                              <item.icon className="w-6 h-6" />
                            </div>
                            <div className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${notifications[item.id as keyof NotificationSettings] ? 'border-olleey-yellow bg-olleey-yellow' : isDark ? 'border-white/10' : 'border-gray-200'}`}>
                              {notifications[item.id as keyof NotificationSettings] && <CheckCircle2 className="w-4 h-4 text-black stroke-[3px]" />}
                            </div>
                          </div>
                          <span className={`text-[15px] font-bold tracking-tight leading-none mb-2 ${notifications[item.id as keyof NotificationSettings] ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/40 group-hover/notify:text-white/70' : 'text-gray-400 group-hover/notify:text-gray-900')}`}>{item.title}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "experimental" && (
              <motion.div
                key="experimental"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className={`${isDark ? 'bg-indigo-500/[0.02]' : 'bg-indigo-50/30'} border border-indigo-500/20 rounded-[2.5rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden backdrop-blur-3xl group`}>
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110">
                    <FlaskConical className="w-48 h-48 text-indigo-400" />
                  </div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-8">
                      <FlaskConical className="w-3.5 h-3.5" /> High-Density Lab
                    </div>

                    <div className="max-w-xl space-y-2 mb-12">
                      <h3 className="text-3xl font-normal text-white tracking-tighter">Deep Research Protocol</h3>
                      <p className="text-sm font-light text-white/40 tracking-tight leading-relaxed">
                        Authorize experimental alpha-grade neural nodes. These protocols are unstable and may experience stochastic resonance. Proceed with calibrated caution.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { id: 'aiVoiceCloning', title: 'Voice Cloner Alpha', desc: 'Authorize 1:1 linguistic vocal replication.', icon: Cpu },
                        { id: 'autoTranslation', title: 'Auto-Sync Engine', desc: 'Real-time pipeline triggering on asset arrival.', icon: Zap },
                        { id: 'advancedAnalytics', title: 'Deep Metrics XL', desc: 'Access sub-second tracking and AI-ROI logs.', icon: BarChart3 },
                        { id: 'betaFeatures', title: 'Global Early Access', desc: 'Deploy preview features before public registry.', icon: Sparkles }
                      ].map(feature => (
                        <div
                          key={feature.id}
                          onClick={() => setExperimentalFeatures(prev => ({ ...prev, [feature.id]: !prev[feature.id as keyof typeof experimentalFeatures] }))}
                          className={`group/lab flex items-start gap-6 p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${experimentalFeatures[feature.id as keyof typeof experimentalFeatures]
                            ? 'border-indigo-500/30 bg-indigo-500/[0.05] shadow-[0_20px_40px_-10px_rgba(99,102,241,0.1)]'
                            : isDark ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'}`}
                        >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${experimentalFeatures[feature.id as keyof typeof experimentalFeatures] ? 'bg-indigo-500 text-white scale-110 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : isDark ? 'bg-white/5 opacity-40 group-hover/lab:opacity-100 group-hover/lab:bg-white/10' : 'bg-gray-100 text-gray-400 group-hover/lab:text-gray-600 group-hover/lab:bg-gray-200'}`}>
                            <feature.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[15px] font-bold tracking-tight ${experimentalFeatures[feature.id as keyof typeof experimentalFeatures] ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/40 group-hover/lab:text-white/70' : 'text-gray-400 group-hover/lab:text-gray-900')}`}>{feature.title}</span>
                              <div className={`w-10 h-6 rounded-full relative transition-all duration-500 overflow-hidden ${experimentalFeatures[feature.id as keyof typeof experimentalFeatures] ? 'bg-indigo-500 shadow-inner' : isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-200 border border-gray-300'}`}>
                                <motion.div
                                  animate={{ x: experimentalFeatures[feature.id as keyof typeof experimentalFeatures] ? 18 : 2 }}
                                  className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-lg"
                                />
                              </div>
                            </div>
                            <p className={`text-[11px] font-medium ${isDark ? 'text-white/20' : 'text-gray-400'} leading-relaxed`}>{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

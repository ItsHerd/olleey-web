"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCircle,
  Clock3,
  Globe,
  Info,
  Loader2,
  Moon,
  PlayCircle,
  Rss,
  Shield,
  Sun,
  Workflow,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LottieThemeToggle } from "@/components/ui/lottie-theme-toggle";
import { useTheme } from "@/lib/useTheme";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSettings } from "@/lib/SettingsContext";
import { useToast } from "@/components/ui/use-toast";

type PreferenceCategory = "appearance" | "notifications" | "workflow" | "quality";

interface UserSettings {
  theme: "light" | "dark";
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
}

type Guardrail = {
  title: string;
  description: string;
  status: "active";
  stat: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "workflow" | "quality";
};

interface PreferencesViewProps {
  theme: string;
}

export function PreferencesView({ theme }: PreferencesViewProps) {
  const isDark = theme === "dark";
  const cardSurfaceClass = isDark ? "bg-[#111111] border-white/10" : "bg-[#E3E1D4] border-black/10";
  const blockSurfaceClass = isDark ? "bg-[#151515] border-white/10" : "bg-[#DCD9CB] border-black/10";
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const { detectedUploadWindow, updateDetectedUploadWindow, loading: settingsContextLoading } = useSettings();

  const [activeCategory, setActiveCategory] = useState<PreferenceCategory>("appearance");
  const [settings, setSettings] = useState<UserSettings>({
    theme: theme as "light" | "dark",
    language: "en",
    notifications_enabled: true,
    email_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updatingWindow, setUpdatingWindow] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("preferences")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.preferences) {
          setSettings({
            theme: data.preferences.theme || theme,
            language: data.preferences.language || "en",
            notifications_enabled: data.preferences.notifications_enabled ?? true,
            email_notifications: data.preferences.email_notifications ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.id, theme]);

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const { error } = await supabase
        .from("users")
        .update({ preferences: updatedSettings })
        .eq("user_id", user.id);

      if (error) throw error;

      setSettings(updatedSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    await saveSettings({ theme: newTheme });
  };

  const handleWindowChange = async (newWindow: "last_1_day" | "last_7_days" | "last_31_days") => {
    setUpdatingWindow(true);
    try {
      await updateDetectedUploadWindow(newWindow);
      toast("Upload detection window updated", "success");
    } catch (error: any) {
      toast(error?.message || "Failed to update window", "error");
    } finally {
      setUpdatingWindow(false);
    }
  };

  const detectedUploadWindowLabel =
    detectedUploadWindow === "last_1_day"
      ? "Last 1 day"
      : detectedUploadWindow === "last_31_days"
        ? "Last 31 days"
        : "Last 7 days";

  const guardrails: Guardrail[] = useMemo(
    () => [
      {
        title: "Detected Upload Window",
        description: "Only surfaces newly detected master-channel uploads inside the selected time window.",
        status: "active",
        icon: Rss,
        stat: detectedUploadWindowLabel,
        group: "workflow"
      },
      {
        title: "Pre-Processing Approval Gate",
        description: "Webhook-detected videos can be held before compute starts, so teams can approve or defer processing.",
        status: "active",
        icon: Clock3,
        stat: "Approval required",
        group: "workflow"
      },
      {
        title: "Manual Start Control",
        description: "Operators can trigger processing explicitly with Begin Processing when the video is ready.",
        status: "active",
        icon: PlayCircle,
        stat: "Operator controlled",
        group: "workflow"
      },
      {
        title: "Auto-Approve Policy",
        description: "Optional automation that auto-starts new detected uploads when enabled in workspace settings.",
        status: "active",
        icon: Workflow,
        stat: "Workspace setting",
        group: "workflow"
      },
      {
        title: "Content Safety",
        description: "Automatically detect and flag inappropriate, sensitive, or high-risk content using neural-linguistic analysis.",
        status: "active",
        icon: Shield,
        stat: "99.9% filtered",
        group: "quality"
      },
      {
        title: "Translation Accuracy",
        description: "Neural verification engine ensuring translations maintain semantic integrity and original intent.",
        status: "active",
        icon: CheckCircle,
        stat: "BLEU 0.94",
        group: "quality"
      },
      {
        title: "Brand Consistency",
        description: "Ensures specialized terminology, brand names, and slogans remain consistent across target markets.",
        status: "active",
        icon: AlertTriangle,
        stat: "324 terms synced",
        group: "quality"
      },
      {
        title: "Compliance Checks",
        description: "Automated verification against regional broadcast regulations and content policies.",
        status: "active",
        icon: Info,
        stat: "ISO 27001 ready",
        group: "quality"
      },
    ],
    [detectedUploadWindowLabel]
  );

  const workflowGuardrails = guardrails.filter((g) => g.group === "workflow");
  const qualityGuardrails = guardrails.filter((g) => g.group === "quality");

  const categories: Array<{ id: PreferenceCategory; label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "appearance", label: "Appearance", description: "Theme and language", icon: Sun },
    { id: "notifications", label: "Notifications", description: "Push and email delivery", icon: Bell },
    { id: "workflow", label: "Workflow Guardrails", description: "Detection and approval controls", icon: Workflow },
    { id: "quality", label: "Quality Guardrails", description: "Safety and compliance checks", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`h-full overflow-auto custom-scrollbar ${isDark ? "bg-[#0A0A0A]" : "bg-[#EBEBDC]"}`}>
      <div className="max-w-6xl mx-auto p-8 space-y-5">
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Preferences</CardTitle>
            <CardDescription>Manage workspace settings and guardrails in one place.</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          <Card className={`h-fit ${cardSurfaceClass}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isActive ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{category.label}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-5">
            {activeCategory === "appearance" && (
              <Card className={cardSurfaceClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sun className="w-4 h-4 text-muted-foreground" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Theme and language preferences.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className={`rounded-lg border p-4 flex items-center justify-between gap-4 ${blockSurfaceClass}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Theme</Label>
                      <p className="text-sm text-muted-foreground">Choose your preferred color scheme.</p>
                    </div>
                    <LottieThemeToggle
                      theme={settings.theme}
                      onThemeChange={handleThemeChange}
                      disabled={saving}
                    />
                  </div>

                  <div className={`rounded-lg border p-4 flex items-center justify-between gap-4 ${blockSurfaceClass}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        Language
                      </Label>
                      <p className="text-sm text-muted-foreground">Select your preferred language.</p>
                    </div>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => saveSettings({ language: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-[190px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeCategory === "notifications" && (
              <Card className={cardSurfaceClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Control how updates are delivered.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className={`rounded-lg border p-4 flex items-center justify-between gap-4 ${blockSurfaceClass}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about job status changes.</p>
                    </div>
                    <Switch
                      checked={settings.notifications_enabled}
                      onCheckedChange={(enabled) => saveSettings({ notifications_enabled: enabled })}
                      disabled={saving}
                    />
                  </div>

                  <div className={`rounded-lg border p-4 flex items-center justify-between gap-4 ${blockSurfaceClass}`}>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email updates for completed jobs.</p>
                    </div>
                    <Switch
                      checked={settings.email_notifications}
                      onCheckedChange={(enabled) => saveSettings({ email_notifications: enabled })}
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeCategory === "workflow" && (
              <Card className={cardSurfaceClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Workflow Guardrails</CardTitle>
                  <CardDescription>Detection, approval, and processing flow for incoming uploads.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {workflowGuardrails.map((guardrail) => {
                    const Icon = guardrail.icon;
                    return (
                      <div key={guardrail.title} className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                        <div className="flex items-start gap-3">
                          <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="space-y-1 w-full">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{guardrail.title}</p>
                              <Badge variant="secondary">{guardrail.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{guardrail.description}</p>
                            <p className="text-xs text-muted-foreground">{guardrail.stat}</p>
                            {guardrail.title === "Detected Upload Window" && (
                              <div className="pt-2">
                                <select
                                  value={detectedUploadWindow}
                                  onChange={(e) => handleWindowChange(e.target.value as "last_1_day" | "last_7_days" | "last_31_days")}
                                  disabled={settingsContextLoading || updatingWindow}
                                  className="h-8 rounded-md border bg-background px-2 text-xs disabled:opacity-50"
                                  aria-label="Detected upload window"
                                >
                                  <option value="last_1_day">Last 1 day</option>
                                  <option value="last_7_days">Last 7 days</option>
                                  <option value="last_31_days">Last 31 days</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {activeCategory === "quality" && (
              <Card className={cardSurfaceClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quality & Compliance</CardTitle>
                  <CardDescription>Translation quality, terminology consistency, and regulatory checks.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qualityGuardrails.map((guardrail) => {
                      const Icon = guardrail.icon;
                      return (
                        <div key={guardrail.title} className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                          <div className="flex items-start gap-3">
                            <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{guardrail.title}</p>
                                <Badge variant="secondary">{guardrail.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{guardrail.description}</p>
                              <p className="text-xs text-muted-foreground">{guardrail.stat}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className={cardSurfaceClass}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Preferences sync automatically.</p>
                  <div className="flex items-center gap-2 text-sm">
                    {(saving || updatingWindow) && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Saving...</span>
                      </>
                    )}
                    {!saving && !updatingWindow && saved && (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600">Changes saved</span>
                      </>
                    )}
                    {!saving && !updatingWindow && !saved && <span className="text-muted-foreground">Ready</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

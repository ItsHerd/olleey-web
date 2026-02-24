"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCircle,
  Globe,
  Info,
  Loader2,
  Rss,
  Shield,
  Sun,
  AlertTriangle,
  Rocket,
  FileCheck2,
  Send,
  RefreshCw,
  Workflow,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  workflow_automation: {
    require_review_approval: boolean;
    require_publish_approval: boolean;
    auto_retry_failed_jobs: boolean;
  };
  quality_thresholds: {
    auto_approve_by_quality: boolean;
    translation_accuracy_min: number;
    content_safety_min: number;
    brand_consistency_min: number;
    compliance_min: number;
  };
}

const DEFAULT_WORKFLOW_AUTOMATION = {
  require_review_approval: true,
  require_publish_approval: true,
  auto_retry_failed_jobs: true,
};

const DEFAULT_QUALITY_THRESHOLDS = {
  auto_approve_by_quality: false,
  translation_accuracy_min: 90,
  content_safety_min: 98,
  brand_consistency_min: 95,
  compliance_min: 97,
};

interface PreferencesViewProps {
  theme: string;
}

export function PreferencesView({ theme }: PreferencesViewProps) {
  const isDark = theme === "dark";
  const cardSurfaceClass = isDark ? "bg-[#111111] border-white/10" : "bg-white border-gray-200";
  const blockSurfaceClass = isDark ? "bg-[#151515] border-white/10" : "bg-gray-50 border-gray-200";
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    autoApproveJobs,
    detectedUploadWindow,
    updateAutoApproveJobs,
    updateDetectedUploadWindow,
    loading: settingsContextLoading
  } = useSettings();

  const [activeCategory, setActiveCategory] = useState<PreferenceCategory>("appearance");
  const [settings, setSettings] = useState<UserSettings>({
    theme: theme as "light" | "dark",
    language: "en",
    notifications_enabled: true,
    email_notifications: true,
    workflow_automation: DEFAULT_WORKFLOW_AUTOMATION,
    quality_thresholds: DEFAULT_QUALITY_THRESHOLDS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updatingWindow, setUpdatingWindow] = useState(false);
  const [updatingAutoApprove, setUpdatingAutoApprove] = useState(false);

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
          const preferences = data.preferences || {};
          setSettings({
            theme: preferences.theme || theme,
            language: preferences.language || "en",
            notifications_enabled: preferences.notifications_enabled ?? true,
            email_notifications: preferences.email_notifications ?? true,
            workflow_automation: {
              ...DEFAULT_WORKFLOW_AUTOMATION,
              ...(preferences.workflow_automation || {}),
            },
            quality_thresholds: {
              ...DEFAULT_QUALITY_THRESHOLDS,
              ...(preferences.quality_thresholds || {}),
            },
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
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      toast("Upload detection window updated", "success");
    } catch (error: any) {
      toast(error?.message || "Failed to update window", "error");
    } finally {
      setUpdatingWindow(false);
    }
  };

  const handleAutoApproveChange = async (enabled: boolean) => {
    setUpdatingAutoApprove(true);
    try {
      await updateAutoApproveJobs(enabled);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      toast(enabled ? "Auto-approve enabled" : "Manual approval required", "success");
    } catch (error: any) {
      toast(error?.message || "Failed to update auto-approve", "error");
    } finally {
      setUpdatingAutoApprove(false);
    }
  };

  const updateWorkflowAutomation = async (
    key: keyof UserSettings["workflow_automation"],
    value: boolean
  ) => {
    await saveSettings({
      workflow_automation: {
        ...settings.workflow_automation,
        [key]: value,
      },
    });
  };

  const updateQualityThreshold = async (
    key: keyof UserSettings["quality_thresholds"],
    value: boolean | number
  ) => {
    await saveSettings({
      quality_thresholds: {
        ...settings.quality_thresholds,
        [key]: value,
      },
    });
  };

  const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

  const qualityGuardrails = useMemo(
    () => [
      {
        title: "Content Safety",
        description: "Automatically detect and flag inappropriate, sensitive, or high-risk content using neural-linguistic analysis.",
        icon: Shield,
        key: "content_safety_min" as const,
      },
      {
        title: "Translation Accuracy",
        description: "Neural verification engine ensuring translations maintain semantic integrity and original intent.",
        icon: CheckCircle,
        key: "translation_accuracy_min" as const,
      },
      {
        title: "Brand Consistency",
        description: "Ensures specialized terminology, brand names, and slogans remain consistent across target markets.",
        icon: AlertTriangle,
        key: "brand_consistency_min" as const,
      },
      {
        title: "Compliance Checks",
        description: "Automated verification against regional broadcast regulations and content policies.",
        icon: Info,
        key: "compliance_min" as const,
      },
    ],
    []
  );

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
    <div className={`h-full overflow-auto custom-scrollbar ${isDark ? "bg-[#0A0A0A]" : "bg-[#F4F4F4]"}`}>
      <div className="max-w-6xl mx-auto p-8 space-y-5">
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
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${isActive ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"
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
                    <ThemeToggle
                      isDark={settings.theme === "dark"}
                      onToggle={(isDark) => handleThemeChange(isDark ? "dark" : "light")}
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
                  <div className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                    <div className="flex items-start gap-3">
                      <Rss className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Detected Upload Window</p>
                          <Badge variant="secondary">active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Only surface master-channel uploads published inside the selected time range.
                        </p>
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
                    </div>
                  </div>

                  <div className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                    <div className="flex items-start gap-3">
                      <Rocket className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Start Processing Approval</p>
                          <Badge variant="secondary">{autoApproveJobs ? "auto" : "manual"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Require explicit approval before processing starts for each detected upload.
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">Manual gate before processing</p>
                          <Switch
                            checked={!autoApproveJobs}
                            onCheckedChange={(enabled) => handleAutoApproveChange(!enabled)}
                            disabled={settingsContextLoading || updatingAutoApprove}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                    <div className="flex items-start gap-3">
                      <FileCheck2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Review Approval</p>
                          <Badge variant="secondary">{settings.workflow_automation.require_review_approval ? "required" : "auto"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Hold completed localizations in review until a reviewer approves.
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">Require review sign-off</p>
                          <Switch
                            checked={settings.workflow_automation.require_review_approval}
                            onCheckedChange={(enabled) => updateWorkflowAutomation("require_review_approval", enabled)}
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                    <div className="flex items-start gap-3">
                      <Send className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Publishing Approval</p>
                          <Badge variant="secondary">{settings.workflow_automation.require_publish_approval ? "required" : "auto"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Require final approval before posting to destination channels.
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">Require publish sign-off</p>
                          <Switch
                            checked={settings.workflow_automation.require_publish_approval}
                            onCheckedChange={(enabled) => updateWorkflowAutomation("require_publish_approval", enabled)}
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                    <div className="flex items-start gap-3">
                      <RefreshCw className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Auto Retry Failed Jobs</p>
                          <Badge variant="secondary">{settings.workflow_automation.auto_retry_failed_jobs ? "enabled" : "disabled"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Retry transient processing failures automatically before moving a job to failed.
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">Retry on transient errors</p>
                          <Switch
                            checked={settings.workflow_automation.auto_retry_failed_jobs}
                            onCheckedChange={(enabled) => updateWorkflowAutomation("auto_retry_failed_jobs", enabled)}
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeCategory === "quality" && (
              <Card className={cardSurfaceClass}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quality & Compliance</CardTitle>
                  <CardDescription>Set quality thresholds used for automated approvals.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Auto-Approve by Quality</p>
                        <p className="text-sm text-muted-foreground">
                          Skip manual review when all thresholds below pass for a localized output.
                        </p>
                      </div>
                      <Switch
                        checked={settings.quality_thresholds.auto_approve_by_quality}
                        onCheckedChange={(enabled) => updateQualityThreshold("auto_approve_by_quality", enabled)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qualityGuardrails.map((guardrail) => {
                      const Icon = guardrail.icon;
                      const threshold = settings.quality_thresholds[guardrail.key];
                      return (
                        <div key={guardrail.title} className={`rounded-lg border p-4 ${blockSurfaceClass}`}>
                          <div className="flex items-start gap-3">
                            <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="space-y-2 w-full">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{guardrail.title}</p>
                                <Badge variant="secondary">active</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{guardrail.description}</p>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground min-w-0">Auto-approve threshold</Label>
                                <div className="relative w-20">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={threshold}
                                    onChange={(e) => {
                                      const nextValue = clampPercent(Number(e.target.value || 0));
                                      updateQualityThreshold(guardrail.key, nextValue);
                                    }}
                                    className="h-8 pr-6 text-xs"
                                    disabled={saving}
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                </div>
                              </div>
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
                    {(saving || updatingWindow || updatingAutoApprove) && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Saving...</span>
                      </>
                    )}
                    {!saving && !updatingWindow && !updatingAutoApprove && saved && (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600">Changes saved</span>
                      </>
                    )}
                    {!saving && !updatingWindow && !updatingAutoApprove && !saved && <span className="text-muted-foreground">Ready</span>}
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

"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Globe, Bell, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/useTheme";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

interface UserSettings {
  theme: "light" | "dark";
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
}

export function SettingsView({ theme }: { theme: string }) {
  const { setTheme } = useTheme();
  const { user } = useAuth();

  const [settings, setSettings] = useState<UserSettings>({
    theme: theme as "light" | "dark",
    language: "en",
    notifications_enabled: true,
    email_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings from Supabase
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
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.id, supabase, theme]);

  // Save settings to Supabase
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
      console.log("Settings saved successfully");

      // Show saved indicator
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    await saveSettings({ theme: newTheme });
  };

  const handleLanguageChange = async (newLanguage: string) => {
    await saveSettings({ language: newLanguage });
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    await saveSettings({ notifications_enabled: enabled });
  };

  const handleEmailNotificationsToggle = async (enabled: boolean) => {
    await saveSettings({ email_notifications: enabled });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-5">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Settings</CardTitle>
          <CardDescription>Manage appearance and notification preferences for your workspace.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="w-4 h-4 text-muted-foreground" />
            Appearance
          </CardTitle>
          <CardDescription>Theme and language preferences.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="rounded-lg border p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={settings.theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("light")}
                disabled={saving}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={settings.theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
                disabled={saving}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Language
              </Label>
              <p className="text-sm text-muted-foreground">Select your preferred language.</p>
            </div>
            <Select
              value={settings.language}
              onValueChange={handleLanguageChange}
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            Notifications
          </CardTitle>
          <CardDescription>Control how updates are delivered.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="rounded-lg border p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates about job status changes.</p>
            </div>
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={handleNotificationsToggle}
              disabled={saving}
            />
          </div>

          <div className="rounded-lg border p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email updates for completed jobs.</p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={handleEmailNotificationsToggle}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Settings sync automatically.</p>
            <div className="flex items-center gap-2 text-sm">
              {saving && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Saving...</span>
                </>
              )}
              {!saving && saved && (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Changes saved</span>
                </>
              )}
              {!saving && !saved && <span className="text-muted-foreground">Ready</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

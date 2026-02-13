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
          .select("settings")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data?.settings) {
          setSettings({
            theme: data.settings.theme || theme,
            language: data.settings.language || "en",
            notifications_enabled: data.settings.notifications_enabled ?? true,
            email_notifications: data.settings.email_notifications ?? true,
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
        .update({ settings: updatedSettings })
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
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Olleey looks for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <div className="flex items-center gap-2">
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

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Language</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language
              </p>
            </div>
            <Select
              value={settings.language}
              onValueChange={handleLanguageChange}
              disabled={saving}
            >
              <SelectTrigger className="w-[180px]">
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

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about job status updates
              </p>
            </div>
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={handleNotificationsToggle}
              disabled={saving}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about completed jobs
              </p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={handleEmailNotificationsToggle}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Status */}
      {saving && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving changes...
        </div>
      )}
      {saved && (
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
          <Check className="w-4 h-4" />
          Changes saved
        </div>
      )}
    </div>
  );
}

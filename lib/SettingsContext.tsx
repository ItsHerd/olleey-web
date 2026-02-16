"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { settingsAPI, UserSettings } from "./api";

type DetectedUploadWindow = "last_1_day" | "last_7_days" | "last_31_days";

interface SettingsContextValue {
    settings: UserSettings | null;
    loading: boolean;
    error: string | null;
    autoApproveJobs: boolean;
    detectedUploadWindow: DetectedUploadWindow;
    updateAutoApproveJobs: (enabled: boolean) => Promise<void>;
    updateDetectedUploadWindow: (window: DetectedUploadWindow) => Promise<void>;
    refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await settingsAPI.getSettings();
            setSettings(data);
        } catch (err: any) {
            console.error("Failed to load settings:", err);
            setError(err.message || "Failed to load settings");
            // Set default settings on error
            setSettings({
                theme: "dark",
                timezone: "America/Los_Angeles",
                auto_approve_jobs: false,
                detected_upload_window: "last_7_days",
                notifications: {
                    email_notifications: true,
                    distribution_updates: true,
                    error_alerts: true,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const updateDetectedUploadWindow = async (window: DetectedUploadWindow) => {
        try {
            const updatedSettings = await settingsAPI.updateSettings({
                detected_upload_window: window,
            });
            setSettings(updatedSettings);
        } catch (err: any) {
            console.error("Failed to update detected upload window:", err);
            throw err;
        }
    };

    const updateAutoApproveJobs = async (enabled: boolean) => {
        try {
            const updatedSettings = await settingsAPI.updateSettings({
                auto_approve_jobs: enabled,
            });
            setSettings(updatedSettings);
        } catch (err: any) {
            console.error("Failed to update auto-approve setting:", err);
            throw err;
        }
    };

    const value: SettingsContextValue = {
        settings,
        loading,
        error,
        autoApproveJobs: Boolean(settings?.auto_approve_jobs),
        detectedUploadWindow: settings?.detected_upload_window || "last_7_days",
        updateAutoApproveJobs,
        updateDetectedUploadWindow,
        refetch: loadSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}

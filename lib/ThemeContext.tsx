"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI, tokenStorage } from '@/lib/api';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [isLoading, setIsLoading] = useState(true);

    // Initialize theme on mount
    useEffect(() => {
        const initTheme = async () => {
            let resolvedTheme: Theme = 'dark';

            // 1. Try localStorage
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("theme") as Theme;
                if (saved) {
                    resolvedTheme = saved;
                } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    resolvedTheme = 'dark';
                } else {
                    resolvedTheme = 'light';
                }
            }

            // 2. Try backend (async) - fire and forget update if authenticated
            if (tokenStorage.isAuthenticated()) {
                try {
                    const settings = await settingsAPI.getSettings();
                    if (settings.theme) {
                        resolvedTheme = settings.theme;
                    }
                } catch (error) {
                    // Ignore error, stick with local/system preference
                }
            }

            setThemeState(resolvedTheme);
            setIsLoading(false);

            // Apply to document
            if (typeof window !== "undefined") {
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                root.classList.add(resolvedTheme);
            }
        };

        initTheme();
    }, []);

    // Apply theme changes to document
    useEffect(() => {
        if (typeof window !== "undefined") {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
        }
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);

        // Persist to localStorage
        if (typeof window !== "undefined") {
            localStorage.setItem("theme", newTheme);
        }

        // Sync to backend if authenticated
        if (tokenStorage.isAuthenticated()) {
            settingsAPI.updateSettings({ theme: newTheme }).catch(() => {
                // Ignore backend sync errors
            });
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}

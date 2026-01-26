'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { initTheme } from '@/lib/store/features/uiSlice';

export function ThemeManager() {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((state) => state.ui.theme);
    const isInitialized = useAppSelector((state) => state.ui.isThemeInitialized);

    // Initialize theme on mount
    useEffect(() => {
        if (!isInitialized) {
            dispatch(initTheme());
        }
    }, [dispatch, isInitialized]);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light');
        } else {
            root.classList.remove('light');
            root.classList.add('dark');
        }
    }, [theme]);

    return null; // This component renders nothing, just handles side effects
}

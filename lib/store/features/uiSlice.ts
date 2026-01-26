import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsAPI, tokenStorage } from '@/lib/api';

interface UIState {
    theme: 'light' | 'dark';
    isSidebarOpen: boolean;
    activeModal: string | null;
    isThemeInitialized: boolean;
}

const initialState: UIState = {
    theme: 'dark', // Default fallback
    isSidebarOpen: true,
    activeModal: null,
    isThemeInitialized: false,
};

// Async Thunks
export const initTheme = createAsyncThunk(
    'ui/initTheme',
    async (_, { dispatch }) => {
        let theme: 'light' | 'dark' = 'dark'; // Default

        // 1. Try LocalStorage
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme") as 'light' | 'dark';
            if (saved) {
                theme = saved;
            } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                // 2. Try System Preference
                theme = 'dark';
            } else {
                theme = 'light';
            }
        }

        // 3. Try Backend (async) - fire and forget update if auth
        if (tokenStorage.isAuthenticated()) {
            try {
                const settings = await settingsAPI.getSettings();
                if (settings.theme) {
                    theme = settings.theme;
                }
            } catch (error) {
                // ignore error, stick with local/system
            }
        }

        return theme;
    }
);

export const syncTheme = createAsyncThunk(
    'ui/syncTheme',
    async (theme: 'light' | 'dark') => {
        localStorage.setItem("theme", theme);
        if (tokenStorage.isAuthenticated()) {
            try {
                await settingsAPI.updateSettings({ theme });
            } catch (error) {
                // failed to sync, but local state is updated
            }
        }
        return theme;
    }
);

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload;
        },
        openModal: (state, action: PayloadAction<string>) => {
            state.activeModal = action.payload;
        },
        closeModal: (state) => {
            state.activeModal = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(initTheme.fulfilled, (state, action) => {
            state.theme = action.payload;
            state.isThemeInitialized = true;
        });
        builder.addCase(syncTheme.fulfilled, (state, action) => {
            // nothing to do, theme is optimistically updated by setTheme usually
            // or we can dispatch setTheme from component
        });
    },
});

export const { setTheme, toggleSidebar, setSidebarOpen, openModal, closeModal } = uiSlice.actions;

export default uiSlice.reducer;

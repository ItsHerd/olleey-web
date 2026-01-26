import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './features/uiSlice';
import authReducer from './features/authSlice';
import projectReducer from './features/projectSlice';
import channelReducer from './features/channelSlice';
import videoReducer from './features/videoSlice';

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        auth: authReducer,
        project: projectReducer,
        channel: channelReducer,
        video: videoReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

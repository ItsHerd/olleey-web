import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Video, videosAPI } from '@/lib/api';

interface VideoState {
    videos: Video[];
    selectedVideo: Video | null;
    total: number;
    page: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: VideoState = {
    videos: [],
    selectedVideo: null,
    total: 0,
    page: 1,
    pageSize: 10,
    isLoading: false, // Init as false, set to true when fetching starts
    error: null,
};

// Async Thunks
export const fetchVideos = createAsyncThunk(
    'video/fetchVideos',
    async (params: { page?: number; page_size?: number; channel_id?: string; project_id?: string }, { rejectWithValue }) => {
        try {
            const response = await videosAPI.listVideos(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        setVideos: (state, action: PayloadAction<{ videos: Video[]; total: number }>) => {
            state.videos = action.payload.videos;
            state.total = action.payload.total;
            state.isLoading = false;
            state.error = null;
        },
        setSelectedVideo: (state, action: PayloadAction<Video | null>) => {
            state.selectedVideo = action.payload;
        },
        setVideoLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setVideoError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        updateVideo: (state, action: PayloadAction<Video>) => {
            const index = state.videos.findIndex(v => v.video_id === action.payload.video_id);
            if (index !== -1) {
                state.videos[index] = action.payload;
            }
            if (state.selectedVideo?.video_id === action.payload.video_id) {
                state.selectedVideo = action.payload;
            }
        },
        addVideo: (state, action: PayloadAction<Video>) => {
            state.videos.unshift(action.payload);
            state.total += 1;
        },
        removeVideo: (state, action: PayloadAction<string>) => {
            state.videos = state.videos.filter(v => v.video_id !== action.payload);
            state.total -= 1;
        }
    },
    extraReducers: (builder) => {
        // fetchVideos
        builder.addCase(fetchVideos.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchVideos.fulfilled, (state, action) => {
            state.isLoading = false;
            state.videos = action.payload.videos;
            state.total = action.payload.total;
            // Update page if provided in meta, or keep current? 
            // The API response has page/page_size potentially.
            if (action.payload.page) state.page = action.payload.page;
            if (action.payload.page_size) state.pageSize = action.payload.page_size;
        });
        builder.addCase(fetchVideos.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string || 'Failed to fetch videos';
        });
    },
});

export const {
    setVideos,
    setSelectedVideo,
    setVideoLoading,
    setVideoError,
    setPage,
    updateVideo,
    addVideo,
    removeVideo
} = videoSlice.actions;

export default videoSlice.reducer;

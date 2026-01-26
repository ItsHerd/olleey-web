import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { LanguageChannel, ChannelGraphResponse, channelsAPI, youtubeAPI } from '@/lib/api';

interface ChannelState {
    channels: LanguageChannel[];
    graph: ChannelGraphResponse | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ChannelState = {
    channels: [],
    graph: null,
    isLoading: true,
    error: null,
};

// Async Thunks
export const fetchChannels = createAsyncThunk(
    'channel/fetchChannels',
    async (projectId: string | undefined, { rejectWithValue }) => {
        try {
            // If no projectId is passed, API handles it (optional)
            const channels = await channelsAPI.listChannels(projectId);
            return channels;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchChannelGraph = createAsyncThunk(
    'channel/fetchChannelGraph',
    async (projectId: string | undefined, { rejectWithValue }) => {
        try {
            const graph = await youtubeAPI.getChannelGraph(projectId);
            return graph;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const channelSlice = createSlice({
    name: 'channel',
    initialState,
    reducers: {
        setChannels: (state, action: PayloadAction<LanguageChannel[]>) => {
            state.channels = action.payload;
            state.isLoading = false;
        },
        setChannelGraph: (state, action: PayloadAction<ChannelGraphResponse>) => {
            state.graph = action.payload;
        },
        setChannelLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setChannelError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        updateChannel: (state, action: PayloadAction<LanguageChannel>) => {
            const index = state.channels.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.channels[index] = action.payload;
            }
        },
        addChannel: (state, action: PayloadAction<LanguageChannel>) => {
            state.channels.push(action.payload);
        },
        removeChannel: (state, action: PayloadAction<string>) => {
            state.channels = state.channels.filter(c => c.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        // fetchChannels
        builder.addCase(fetchChannels.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchChannels.fulfilled, (state, action) => {
            state.isLoading = false;
            state.channels = action.payload;
        });
        builder.addCase(fetchChannels.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string || 'Failed to fetch channels';
        });

        // fetchChannelGraph
        builder.addCase(fetchChannelGraph.pending, (state) => {
            // Don't set global loading true if you want background refresh,
            // but typically fine for now
            state.error = null;
        });
        builder.addCase(fetchChannelGraph.fulfilled, (state, action) => {
            state.graph = action.payload;
        });
        builder.addCase(fetchChannelGraph.rejected, (state, action) => {
            state.error = action.payload as string || 'Failed to fetch channel graph';
        });
    },
});

export const {
    setChannels,
    setChannelGraph,
    setChannelLoading,
    setChannelError,
    updateChannel,
    addChannel,
    removeChannel
} = channelSlice.actions;

export default channelSlice.reducer;

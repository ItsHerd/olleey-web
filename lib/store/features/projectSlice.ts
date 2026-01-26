import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Project, projectsAPI } from '@/lib/api';

interface ProjectState {
    projects: Project[];
    selectedProject: Project | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    selectedProject: null,
    isLoading: true,
    error: null,
};

// Async Thunks
export const fetchProjects = createAsyncThunk(
    'project/fetchProjects',
    async (_, { rejectWithValue }) => {
        try {
            const projects = await projectsAPI.listProjects();
            return projects;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createProject = createAsyncThunk(
    'project/createProject',
    async (data: { name: string; master_connection_id?: string }, { rejectWithValue }) => {
        try {
            const project = await projectsAPI.createProject(data);
            return project;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setProjects: (state, action: PayloadAction<Project[]>) => {
            state.projects = action.payload;
            state.isLoading = false;
        },
        setSelectedProject: (state, action: PayloadAction<Project | null>) => {
            state.selectedProject = action.payload;
        },
        setProjectLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setProjectError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        addProject: (state, action: PayloadAction<Project>) => {
            state.projects.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        // fetchProjects
        builder.addCase(fetchProjects.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchProjects.fulfilled, (state, action) => {
            state.isLoading = false;
            state.projects = action.payload;
        });
        builder.addCase(fetchProjects.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string || 'Failed to fetch projects';
        });

        // createProject
        builder.addCase(createProject.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createProject.fulfilled, (state, action) => {
            state.isLoading = false;
            state.projects.push(action.payload);
            state.selectedProject = action.payload; // Auto-select new project
        });
        builder.addCase(createProject.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string || 'Failed to create project';
        });
    },
});

export const { setProjects, setSelectedProject, setProjectLoading, setProjectError, addProject } = projectSlice.actions;

export default projectSlice.reducer;

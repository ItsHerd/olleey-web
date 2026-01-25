import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectsAPI, type Project } from './api';
import { tokenStorage } from './api';

interface ProjectContextType {
    projects: Project[];
    selectedProject: Project | null;
    setSelectedProject: (project: Project) => void;
    isLoading: boolean;
    error: string | null;
    refreshProjects: () => Promise<void>;
    createProject: (name: string, masterConnectionId?: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setSelectedProject = useCallback((project: Project) => {
        setSelectedProjectState(project);
        // Optionally persist to localStorage if needed, or query param
        if (typeof window !== 'undefined') {
            localStorage.setItem('selected_project_id', project.id);
        }
    }, []);

    const refreshProjects = useCallback(async () => {
        if (!tokenStorage.isAuthenticated()) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const data = await projectsAPI.listProjects();
            setProjects(data);

            // Auto-select project logic
            if (data.length > 0) {
                // Try to restore from localStorage
                const storedId = typeof window !== 'undefined' ? localStorage.getItem('selected_project_id') : null;
                const found = data.find(p => p.id === storedId);

                if (found) {
                    setSelectedProjectState(found);
                } else {
                    // Default to first project
                    setSelectedProjectState(data[0]);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('selected_project_id', data[0].id);
                    }
                }
            } else {
                setSelectedProjectState(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
            console.error("Project fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createProject = useCallback(async (name: string, masterConnectionId?: string) => {
        try {
            const newProject = await projectsAPI.createProject({ name, master_connection_id: masterConnectionId });
            setProjects(prev => [...prev, newProject]);
            setSelectedProject(newProject);
        } catch (err) {
            throw err;
        }
    }, [setSelectedProject]);

    useEffect(() => {
        refreshProjects();
    }, [refreshProjects]);

    return (
        <ProjectContext.Provider value={{
            projects,
            selectedProject,
            setSelectedProject,
            isLoading,
            error,
            refreshProjects,
            createProject
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}

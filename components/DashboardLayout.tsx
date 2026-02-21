"use client";

import { useState, useEffect, useMemo, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAnimalAvatar } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import { useVideos } from "@/lib/useVideos";
import { Search, PanelLeft, ChevronDown, Check, Bell, User, Settings, Plus, ChevronRight, Zap, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tokenStorage, authAPI, youtubeAPI, type MasterNode } from "@/lib/api";
import { useDashboard } from "@/lib/useDashboard";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import { useAuth } from "@/lib/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CreateProjectModal } from "@/components/ui/create-project-modal";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string>();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem("sidebarOpen");
        if (savedState !== null) {
            setIsSidebarOpen(savedState === "true");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", String(isSidebarOpen));
    }, [isSidebarOpen]);

    const { projects, selectedProject, setSelectedProject } = useProject();
    const { dashboard, refetch: refetchDashboard } = useDashboard({ projectId: selectedProject?.id, enabled: isAuthenticated });
    const { videos, refetch: refetchVideos } = useVideos({ project_id: selectedProject?.id }, { enabled: isAuthenticated });

    useEffect(() => {
        const checkAuth = async () => {
            if (tokenStorage.isAuthenticated()) {
                try {
                    const me = await authAPI.getMe();
                    setIsAuthenticated(true);
                    setUserEmail(me.email || undefined);
                    const graph = await youtubeAPI.getChannelGraph();
                    setChannelGraph(graph.master_nodes || []);
                } catch (error) {
                    console.error("Auth verification failed:", error);
                }
            }
        };
        checkAuth();
    }, []);

    // Listen for global refresh events
    useEffect(() => {
        const handleRefresh = async () => {
            console.log('[DashboardLayout] Refresh event received');
            await Promise.all([
                refetchDashboard(),
                refetchVideos()
            ]);
        };

        window.addEventListener('olleey-refresh', handleRefresh);
        return () => window.removeEventListener('olleey-refresh', handleRefresh);
    }, [refetchDashboard, refetchVideos]);

    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
    const isDark = theme === "dark";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";

    const filteredSearchResults = useMemo(() => {
        if (!searchQuery.trim()) return { videos: [], jobs: [] };
        const query = searchQuery.toLowerCase();
        const matchingVideos = videos.filter(v =>
            v.title.toLowerCase().includes(query) ||
            v.channel_name?.toLowerCase().includes(query)
        ).slice(0, 5);
        const matchingJobs = (dashboard?.recent_jobs || []).filter(j => {
            const video = videos.find(v => v.video_id === j.source_video_id);
            return (video?.title.toLowerCase().includes(query) ||
                j.job_id.toLowerCase().includes(query) ||
                j.source_video_id.toLowerCase().includes(query));
        }).slice(0, 3);
        return { videos: matchingVideos, jobs: matchingJobs };
    }, [searchQuery, videos, dashboard?.recent_jobs]);

    const handleLogout = async () => {
        await signOut();
        authAPI.logout();
        setIsAuthenticated(false);
        router.push('/');
    };

    return (
        <div className={`h-screen ${bgClass} overflow-hidden`}>
            <div className={`flex h-full ${bgClass} overflow-hidden`}>
                {/* Sidebar */}
                <div className="flex-shrink-0 hidden sm:block">
                    <Sidebar
                        currentPage=""
                        onNavigate={(page) => {
                            router.push(`/app?page=${encodeURIComponent(page)}`, { scroll: false });
                        }}
                        isLocked={false}
                        onLogout={handleLogout}
                        isOpen={isSidebarOpen}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        isSearchFocused={isSearchFocused}
                        onSearchFocusChange={setIsSearchFocused}
                        filteredSearchResults={filteredSearchResults}
                        videos={videos}
                    />
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col overflow-hidden ${bgClass} relative min-w-0`}>
                    {/* Breadcrumb Header */}
                    <header className={`flex items-center h-16 px-6 border-b ${isDark ? 'border-white/5 bg-dark-bg/60' : 'border-black bg-white/60'} shrink-0 gap-4 backdrop-blur-xl z-20 sticky top-0`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`h-10 w-10 transition-all rounded-xl ${isSidebarOpen ? 'text-olleey-yellow bg-olleey-yellow/10 ring-1 ring-olleey-yellow/20' : `${isDark ? 'text-white hover:bg-white/5' : 'bg-slate-100 text-black border border-black hover:bg-black hover:text-white'}`}`}
                        >
                            <PanelLeft className="h-4 w-4" />
                        </Button>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 overflow-hidden py-1">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-100 border-black'} transition-all hover:bg-black hover:text-white group shadow-sm`}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? textSecondaryClass : 'text-black group-hover:text-white'} transition-colors truncate max-w-[140px] outline-none font-mono`}
                                            title={selectedProject?.name || "All Instances"}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${selectedProject ? 'bg-olleey-yellow shadow-[0_0_8px_rgba(251,191,36,0.5)]' : (isDark ? 'bg-slate-400 opacity-50' : 'bg-black group-hover:bg-white')}`} />
                                            <span className="truncate">{selectedProject?.name || "All Instances"}</span>
                                            <ChevronDown className={`h-3 w-3 ${isDark ? 'opacity-30 group-hover:opacity-100' : 'text-black group-hover:text-white'} transition-opacity shrink-0`} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className={`${isDark ? 'bg-[#0f0f0f]/95 backdrop-blur-xl border-white/5' : 'bg-white border-slate-200'} w-64 p-2 rounded-2xl shadow-2xl overflow-hidden z-[100] border`}>
                                        <DropdownMenuLabel className={`text-[9px] font-black ${isDark ? textSecondaryClass : 'text-slate-500'} uppercase tracking-[0.25em] px-3 py-3 font-mono opacity-70`}>
                                            Project Directory
                                        </DropdownMenuLabel>
                                        <div className="space-y-1">
                                            <DropdownMenuItem
                                                onClick={() => setSelectedProject(null)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${selectedProject === null
                                                    ? (isDark ? 'bg-olleey-yellow/10 text-olleey-yellow' : 'bg-olleey-yellow/10 text-amber-900 font-bold')
                                                    : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-black')
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${selectedProject === null ? 'bg-olleey-yellow shadow-[0_0_8px_rgba(251,191,36,0.6)]' : (isDark ? 'bg-white/10' : 'bg-slate-300')}`} />
                                                <span className={`truncate text-xs font-bold font-mono tracking-tight ${selectedProject === null ? (isDark ? 'text-olleey-yellow' : 'text-amber-900') : (isDark ? 'text-white' : 'text-slate-900')}`}>All Instances</span>
                                                {selectedProject === null && <Check className={`ml-auto w-3.5 h-3.5 ${isDark ? 'text-olleey-yellow' : 'text-amber-700'}`} />}
                                            </DropdownMenuItem>

                                            {projects.map((project) => (
                                                <DropdownMenuItem
                                                    key={project.id}
                                                    onClick={() => setSelectedProject(project)}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${selectedProject?.id === project.id
                                                        ? (isDark ? 'bg-olleey-yellow/10 text-olleey-yellow' : 'bg-olleey-yellow/10 text-amber-900 font-bold')
                                                        : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedProject?.id === project.id ? 'bg-olleey-yellow shadow-[0_0_8px_rgba(251,191,36,0.6)]' : (isDark ? 'bg-white/10' : 'bg-slate-300')}`} />
                                                    <span className={`truncate text-xs font-bold font-mono tracking-tight ${selectedProject?.id === project.id ? (isDark ? 'text-olleey-yellow' : 'text-amber-900') : (isDark ? 'text-white' : 'text-slate-900')}`}>{project.name}</span>
                                                    {selectedProject?.id === project.id && <Check className={`ml-auto w-3.5 h-3.5 ${isDark ? 'text-olleey-yellow' : 'text-amber-700'}`} />}
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                        <DropdownMenuSeparator className={`my-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                                        <DropdownMenuItem
                                            onClick={() => setIsCreateProjectModalOpen(true)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer ${isDark ? 'text-olleey-yellow hover:bg-olleey-yellow/10' : 'text-olleey-yellow hover:bg-olleey-yellow/5'} font-black transition-all group/new`}
                                        >
                                            <Plus className="w-4 h-4 group-hover/new:rotate-90 transition-transform" />
                                            <span className="text-[10px] uppercase tracking-widest font-mono">Create New Instance</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className={`${isDark ? 'text-white/10' : 'text-slate-200'} mx-0.5`}>
                                <ChevronRight className="w-3 h-3" />
                            </div>

                            {/* Navigation Trail */}
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-100 border-black'} shadow-sm backdrop-blur-md`}>
                                {(() => {
                                    const isWorkflowPath = pathname?.startsWith('/workflows/');
                                    const pathParts = pathname?.split('/') || [];
                                    const workflowType = pathParts[2];
                                    const videoId = pathParts[3];

                                    if (isWorkflowPath && workflowType && videoId) {
                                        return (
                                            <>
                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${textSecondaryClass} opacity-40 hover:opacity-100 transition-opacity cursor-default`}>
                                                    workflows
                                                </span>
                                                <div className={`${isDark ? 'text-white/10' : 'text-slate-200'} mx-0.5 select-none`}>
                                                    <span className="text-[10px] font-light">/</span>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${textSecondaryClass} opacity-40 hover:opacity-100 transition-opacity cursor-default`}>
                                                    {workflowType}
                                                </span>
                                                <div className={`${isDark ? 'text-white/10' : 'text-slate-200'} mx-0.5 select-none`}>
                                                    <span className="text-[10px] font-light">/</span>
                                                </div>
                                                <div className={`flex items-center gap-2 pr-1`}>
                                                    <div className={`w-1 h-1 rounded-full bg-olleey-yellow animate-pulse shrink-0`} />
                                                    <span className={`text-[10px] font-bold uppercase tracking-[0.1em] font-mono ${textClass} opacity-90 truncate max-w-[80px] sm:max-w-none`}>
                                                        {videoId.slice(0, 8)}
                                                    </span>
                                                </div>
                                            </>
                                        );
                                    }

                                    return (
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-mono ${textClass} opacity-90`}>
                                            Dashboard
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="flex-1" />

                        {/* Action Toolbar */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/app?page=Channels')}
                                className={`h-10 px-4 gap-2 rounded-xl group ${isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-black border border-black hover:bg-black hover:text-white transition-all'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-500' : 'bg-black group-hover:bg-white'} animate-pulse`} />
                                <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest transition-colors opacity-70 group-hover:opacity-100 ">Connect Account</span>
                            </Button>

                            <div className={`h-6 w-[1px] ${isDark ? 'bg-white/5' : 'bg-gray-200'} mx-2 hidden sm:block`} />

                            <div className="flex items-center gap-1">
                                {[
                                    { icon: RefreshCw, title: "Refresh", onClick: () => window.dispatchEvent(new CustomEvent('olleey-refresh')) },
                                    { icon: Bell, title: "Alerts", onClick: () => router.push('/app?page=Notifications') },
                                    { icon: Settings, title: "Config", onClick: () => router.push('/app?page=Settings') }
                                ].map((ctrl, i) => (
                                    <Button
                                        key={i}
                                        variant="ghost"
                                        size="icon"
                                        onClick={ctrl.onClick}
                                        className={`h-10 w-10 rounded-xl transition-all ${isDark ? `${textSecondaryClass} hover:${textClass} hover:bg-white/5` : 'bg-slate-100 text-black border border-black hover:bg-black hover:text-white'}`}
                                        title={ctrl.title}
                                    >
                                        <ctrl.icon className={`h-4 w-4 ${ctrl.icon === RefreshCw ? 'hover:rotate-180 transition-transform duration-500' : ''}`} />
                                    </Button>
                                ))}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-10 w-10 rounded-xl transition-all ${isDark ? `${textSecondaryClass} hover:${textClass} hover:bg-white/5` : 'bg-slate-100 text-black border border-black hover:bg-black hover:text-white'}`}
                                            title="Environment"
                                        >
                                            <User className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className={`${isDark ? 'bg-[#0f0f0f]/95 backdrop-blur-xl border-white/5' : 'bg-white/95 backdrop-blur-xl border-slate-200'} w-64 p-2 rounded-2xl shadow-2xl overflow-hidden z-[100] border`}>
                                        <DropdownMenuLabel className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-[0.25em] px-3 py-3 font-mono opacity-50`}>
                                            User Context
                                        </DropdownMenuLabel>
                                        <div className="space-y-1">
                                            <DropdownMenuItem
                                                onClick={() => router.push('/app?page=Accounts')}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isDark ? 'text-white/80 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-olleey-yellow/20 flex items-center justify-center text-olleey-yellow text-[10px] font-black">US</div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold leading-none mb-1">Account Dashboard</span>
                                                    <span className="text-[9px] opacity-40 uppercase tracking-tighter">View personal metrics</span>
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => router.push('/app?page=Usage')}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isDark ? 'text-white/80 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100'}`}
                                            >
                                                <Zap className="w-4 h-4 text-olleey-yellow" />
                                                <span className="text-xs font-bold">Resource Usage</span>
                                            </DropdownMenuItem>
                                        </div>
                                        <DropdownMenuSeparator className={`my-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-red-400 hover:bg-red-500/10 transition-all group/out`}
                                        >
                                            <LogOut className="w-4 h-4 group-hover/out:-translate-x-1 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest font-mono">Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    <main className={`flex-1 overflow-hidden ${bgClass} px-0 py-0 min-w-0`}>
                        {children}
                    </main>
                </div>
            </div>

            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
}

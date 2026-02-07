"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { getAnimalAvatar } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ActivityQueue from "@/components/ActivityQueue";
import DashboardPage from "../DashboardPage";
import ChannelsPage from "../ChannelsPage";
import AccountsPage from "../AccountsPage";
import AllMediaPage from "../AllMediaPage";
import { useVideos } from "@/lib/useVideos";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PanelLeft, ChevronDown, Check, Youtube, Bell, User, Settings, Plus, ChevronRight, Zap, LogOut, RefreshCw, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguagesPage from "../LanguagesPage";
import GuardrailsPage from "../GuardrailsPage";
import JobsPage from "../JobsPage";
import NotificationsPage from "../NotificationsPage";
import SettingsPage from "../SettingsPage";
import UsagePage from "../UsagePage";
import ManualUploadPage from "../ManualUploadPage";
import ReviewHubPage from "../ReviewHubPage";
import PreviewPage from "../PreviewPage";
import ProcessingPage from "../ProcessingPage";
import { tokenStorage, authAPI, dashboardAPI, youtubeAPI, type MasterNode } from "@/lib/api";
import { useDashboard } from "@/lib/useDashboard";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CreateProjectModal } from "@/components/ui/create-project-modal";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { DemoProvider } from "@/lib/DemoContext";
import { ReviewProvider, useReview } from "@/lib/ReviewContext";
import { QuickCheckModal } from "@/components/SmartTable/QuickCheckModal";
import { LANGUAGE_OPTIONS } from "@/lib/languages";

// function GlobalModals() removed as it's now a dedicated page

function AppContent() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState("Dashboard");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string>();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    const { dashboard } = useDashboard({ projectId: selectedProject?.id, enabled: isAuthenticated });
    const { videos } = useVideos({ project_id: selectedProject?.id }, { enabled: isAuthenticated });

    const projectAvatars = useMemo(() => {
        const map: Record<string, string> = {};
        projects.forEach(p => {
            if (p.master_connection_id) {
                const master = channelGraph.find(m => m.channel_id === p.master_connection_id);
                map[p.id] = master?.channel_avatar_url || getAnimalAvatar(p.master_connection_id);
            }
        });
        return map;
    }, [projects, channelGraph]);

    const selectedProjectMaster = useMemo(() =>
        channelGraph.find(m => m.connection_id === selectedProject?.master_connection_id),
        [channelGraph, selectedProject]);

    const selectedProjectChannelName = selectedProjectMaster?.channel_name;
    const selectedProjectChannelAvatar = useMemo(() =>
        selectedProjectMaster?.channel_avatar_url || (selectedProject?.master_connection_id ? getAnimalAvatar(selectedProject.master_connection_id) : undefined),
        [selectedProjectMaster, selectedProject]);

    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
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

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const urlHash = window.location.hash;
                const urlParams = new URLSearchParams(urlHash.replace(/^#/, '?'));
                const idToken = urlParams.get('id_token');
                if (idToken) {
                    try {
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                        await authAPI.googleAuth(idToken);
                    } catch (err) {
                        console.error("Google auth redirect failed:", err);
                    }
                }
                if (tokenStorage.isAuthenticated()) {
                    try {
                        const me = await authAPI.getMe();
                        setIsAuthenticated(true);
                        setUserEmail(me.email || undefined);
                        const graph = await youtubeAPI.getChannelGraph();
                        setChannelGraph(graph.master_nodes || []);
                    } catch (error) {
                        console.error("Auth verification failed:", error);
                        tokenStorage.clearTokens();
                        setIsAuthenticated(false);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const pageParam = searchParams?.get("page");
        if (pageParam) {
            setCurrentPage(pageParam);
        }
    }, [searchParams]);

    const handleLogout = () => {
        authAPI.logout();
        setIsAuthenticated(false);
        setCurrentPage("Dashboard");
        setIsSidebarOpen(false);
    };

    const renderPage = () => {
        switch (currentPage) {
            case "Dashboard": return <DashboardPage />;
            case "Channels": return <ChannelsPage />;
            case "Accounts": return <AccountsPage onLogout={handleLogout} />;
            case "Usage": return <UsagePage />;
            case "Workflows": return <JobsPage />;
            case "Guardrails": return <GuardrailsPage />;
            case "Languages": return <LanguagesPage />;
            case "Notifications": return <NotificationsPage />;
            case "Dynamic Sponsors": return (
                <ComingSoonPage
                    title="Dynamic Sponsors"
                    description="Automatically swap brand segments for local sponsors in target countries."
                    value=""
                    features={["AI-Powered Segment Detection", "Seamless Asset Replacement", "Regional Ad-Network Integration", "Automated ROI Reporting"]}
                />
            );
            case "Comment Mirroring": return (
                <ComingSoonPage
                    title="AI Comment Mirroring"
                    description="Automatically translate viewer comments and your replies to maintain engagement across languages."
                    value=""
                    features={["Context-Aware Translation", "Sentiment Preservation", "Creator Reply Sync", "Community Health Monitoring"]}
                />
            );
            case "Settings": return <SettingsPage />;
            case "Manual Upload": return <ManualUploadPage channelGraph={channelGraph} />;
            case "All Media": return <AllMediaPage channelGraph={channelGraph} />;
            case "Review Hub": return <ReviewHubPage />;
            case "Preview": return <PreviewPage />;
            case "Processing": return <ProcessingPage />;
            default: return <DashboardPage />;
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (typeof window !== 'undefined') window.location.href = '/?auth=login';
        return null;
    }

    return (
        <DemoProvider userEmail={userEmail}>
            <ReviewProvider>
                <div className={`h-screen ${bgClass} overflow-hidden`}>
                    <div className={`flex h-full ${bgClass} overflow-hidden`}>
                        {/* Sidebar */}
                        <div className="flex-shrink-0 hidden sm:block">
                            <Sidebar
                                currentPage={currentPage}
                                onNavigate={(page) => {
                                    setCurrentPage(page);
                                    router.push(`/app?page=${encodeURIComponent(page)}`, { scroll: false });
                                }}
                                isLocked={false}
                                onLogout={handleLogout}
                                isOpen={isSidebarOpen}
                                projects={projects}
                                selectedProject={selectedProject}
                                selectedProjectChannelName={selectedProjectChannelName}
                                selectedProjectChannelAvatar={selectedProjectChannelAvatar}
                                projectAvatars={projectAvatars}
                                onProjectSelect={setSelectedProject}
                                onCreateProject={() => setIsCreateProjectModalOpen(true)}
                            />
                        </div>

                        {/* Main Content Area */}
                        <div className={`flex-1 flex flex-col overflow-hidden ${bgClass} relative min-w-0`}>

                            {/* Breadcrumb Header */}
                            <header className={`flex items-center h-16 px-6 border-b ${isDark ? 'border-white/5 bg-dark-bg/60' : 'border-gray-200 bg-white/60'} shrink-0 gap-4 backdrop-blur-xl z-20 sticky top-0`}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className={`h-10 w-10 transition-all rounded-xl ${isSidebarOpen ? 'text-olleey-yellow bg-olleey-yellow/10 ring-1 ring-olleey-yellow/20' : `${textClass} hover:bg-white/5`}`}
                                >
                                    <PanelLeft className="h-4 w-4" />
                                </Button>

                                {/* Breadcrumbs - High Fidelity Capsule Design */}
                                <div className="flex items-center gap-2 overflow-hidden py-1">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-100'} transition-all hover:border-white/10 group shadow-sm`}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${textSecondaryClass} hover:${textClass} transition-colors truncate max-w-[140px] outline-none font-mono`}
                                                    title={selectedProject?.name || "All Projects"}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${selectedProject ? 'bg-olleey-yellow shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-white/20'}`} />
                                                    <span className="truncate">{selectedProject?.name || "Standard Project"}</span>
                                                    <ChevronDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className={`${isDark ? 'bg-[#0f0f0f]/95 backdrop-blur-xl border-white/5' : 'bg-white border-gray-200'} w-64 p-2 rounded-2xl shadow-2xl overflow-hidden z-[100] border`}>
                                                <DropdownMenuLabel className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-[0.25em] px-3 py-3 font-mono opacity-50`}>
                                                    Project Directory
                                                </DropdownMenuLabel>
                                                <div className="space-y-1">
                                                    {projects.map((project) => (
                                                        <DropdownMenuItem
                                                            key={project.id}
                                                            onClick={() => setSelectedProject(project)}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${selectedProject?.id === project.id
                                                                ? (isDark ? 'bg-olleey-yellow/10 text-olleey-yellow' : 'bg-olleey-yellow/5 text-olleey-yellow')
                                                                : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-black')
                                                                }`}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedProject?.id === project.id ? 'bg-olleey-yellow shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-white/10'}`} />
                                                            <span className="truncate text-xs font-bold font-mono tracking-tight">{project.name}</span>
                                                            {selectedProject?.id === project.id && <Check className="ml-auto w-3.5 h-3.5 text-olleey-yellow" />}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>
                                                <DropdownMenuSeparator className={`my-2 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
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

                                    <div className={`${isDark ? 'text-white/10' : 'text-gray-200'} mx-0.5`}>
                                        <ChevronRight className="w-3 h-3" />
                                    </div>

                                    <div className={`flex items-center gap-3 px-4 py-1.5 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-100'} shadow-sm`}>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-mono ${textClass} opacity-90`}>
                                            {currentPage}
                                        </span>
                                    </div>
                                </div>

                                {/* Search Bar - Quick Command Center */}
                                <div className="hidden md:flex flex-1 max-w-md mx-6 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <Search className={`h-3.5 w-3.5 ${textSecondaryClass} group-focus-within:text-olleey-yellow transition-colors opacity-50`} />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                        placeholder="Search library, jobs or documentation..."
                                        className={`block w-full pl-11 pr-12 py-2.5 text-xs border ${isDark ? 'bg-white/[0.03] border-white/5 text-white placeholder-white/20' : 'bg-gray-100 border-gray-200 text-black placeholder-gray-400'} rounded-xl focus:ring-0 focus:border-olleey-yellow/30 focus:bg-olleey-yellow/[0.02] outline-none transition-all duration-300 font-mono`}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <kbd className={`hidden lg:inline-flex items-center px-2 py-1 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white/30' : 'border-gray-200 bg-white text-gray-400'} text-[9px] font-black tracking-tighter font-mono`}>
                                            ⌘K
                                        </kbd>
                                    </div>

                                    {/* Search Results Overlay */}
                                    <AnimatePresence>
                                        {(isSearchFocused && searchQuery.trim().length > 0) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className={`absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl border ${isDark ? 'bg-[#121212]/95 border-white/5 shadow-2xl backdrop-blur-2xl' : 'bg-white border-gray-200 shadow-xl'} z-[110] overflow-hidden max-h-[400px] overflow-y-auto`}
                                            >
                                                {filteredSearchResults.videos.length === 0 && filteredSearchResults.jobs.length === 0 ? (
                                                    <div className="p-8 text-center">
                                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                                            <Search className="w-5 h-5 opacity-20" />
                                                        </div>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${textSecondaryClass}`}>No matching records found</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4 p-2">
                                                        {filteredSearchResults.jobs.length > 0 && (
                                                            <div>
                                                                <div className={`px-2 mb-2 text-[9px] font-black uppercase tracking-[0.2em] ${textSecondaryClass} opacity-50 font-mono`}>Active Processes</div>
                                                                <div className="space-y-1">
                                                                    {filteredSearchResults.jobs.map(job => {
                                                                        const video = videos.find(v => v.video_id === job.source_video_id);
                                                                        return (
                                                                            <button
                                                                                key={job.job_id}
                                                                                onClick={() => {
                                                                                    setCurrentPage("Workflows");
                                                                                    setSearchQuery("");
                                                                                }}
                                                                                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} text-left group`}
                                                                            >
                                                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                                                    <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-black'}`}>{video?.title || 'Unknown Video'}</span>
                                                                                        <span className={`text-[8px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 font-black uppercase tracking-tighter`}>{job.status}</span>
                                                                                    </div>
                                                                                    <div className={`text-[9px] ${isDark ? 'text-white/40' : 'text-black/40'} font-mono truncate`}>{job.job_id}</div>
                                                                                </div>
                                                                                <ExternalLink className={`w-3.5 h-3.5 ${isDark ? 'text-white/40' : 'text-black/40'} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`} />
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {filteredSearchResults.videos.length > 0 && (
                                                            <div>
                                                                <div className={`px-2 mb-2 text-[9px] font-black uppercase tracking-[0.2em] ${textSecondaryClass} opacity-50 font-mono`}>Media Library</div>
                                                                <div className="space-y-1">
                                                                    {filteredSearchResults.videos.map(video => (
                                                                        <button
                                                                            key={video.video_id}
                                                                            onClick={() => {
                                                                                setCurrentPage("All Media");
                                                                                setSearchQuery("");
                                                                            }}
                                                                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} text-left group`}
                                                                        >
                                                                            {video.thumbnail_url ? (
                                                                                <div className={`w-12 aspect-video ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-md overflow-hidden shrink-0`}>
                                                                                    <img src={video.thumbnail_url} className="w-full h-full object-cover" alt="" />
                                                                                </div>
                                                                            ) : (
                                                                                <div className={`w-12 aspect-video ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-md flex items-center justify-center shrink-0`}>
                                                                                    <Youtube className="w-4 h-4 text-olleey-yellow" />
                                                                                </div>
                                                                            )}
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-black'}`}>{video.title}</div>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex-1" />

                                {/* Action Toolbar */}
                                <div className="flex items-center gap-2">


                                    <Button
                                        variant="ghost"
                                        onClick={() => setCurrentPage("Channels")}
                                        className={`h-10 px-4 gap-2 rounded-xl group ${isDark ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-900'}`}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest transition-colors opacity-70 group-hover:opacity-100 italic">Connect Account</span>
                                    </Button>

                                    <div className={`h-6 w-[1px] ${isDark ? 'bg-white/5' : 'bg-gray-200'} mx-2 hidden sm:block`} />

                                    {/* Control Group */}
                                    <div className="flex items-center gap-1">
                                        {[
                                            { icon: RefreshCw, title: "Refresh", onClick: () => window.dispatchEvent(new CustomEvent('olleey-refresh')) },
                                            { icon: Bell, title: "Alerts", onClick: () => setCurrentPage("Notifications"), active: currentPage === "Notifications" },
                                            { icon: Settings, title: "Config", onClick: () => setCurrentPage("Settings"), active: currentPage === "Settings" }
                                        ].map((ctrl, i) => (
                                            <Button
                                                key={i}
                                                variant="ghost"
                                                size="icon"
                                                onClick={ctrl.onClick}
                                                className={`h-10 w-10 rounded-xl transition-all ${ctrl.active ? 'bg-olleey-yellow/10 text-olleey-yellow ring-1 ring-olleey-yellow/20' : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`}`}
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
                                                    className={`h-10 w-10 rounded-xl transition-all ${currentPage === "Accounts" ? 'bg-olleey-yellow/10 text-olleey-yellow ring-1 ring-olleey-yellow/20' : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`}`}
                                                    title="Environment"
                                                >
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className={`${isDark ? 'bg-[#0f0f0f]/95 backdrop-blur-xl border-white/5' : 'bg-white border-gray-200'} w-64 p-2 rounded-2xl shadow-2xl overflow-hidden z-[100] border`}>
                                                <DropdownMenuLabel className={`text-[9px] font-black ${textSecondaryClass} uppercase tracking-[0.25em] px-3 py-3 font-mono opacity-50`}>
                                                    User Context
                                                </DropdownMenuLabel>
                                                <div className="space-y-1">
                                                    <DropdownMenuItem
                                                        onClick={() => setCurrentPage("Accounts")}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isDark ? 'text-white/80 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-olleey-yellow/20 flex items-center justify-center text-olleey-yellow text-[10px] font-black">US</div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold leading-none mb-1">Account Dashboard</span>
                                                            <span className="text-[9px] opacity-40 uppercase tracking-tighter">View personal metrics</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setCurrentPage("Usage")}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isDark ? 'text-white/80 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        <Zap className="w-4 h-4 text-olleey-yellow" />
                                                        <span className="text-xs font-bold">Resource Usage</span>
                                                    </DropdownMenuItem>
                                                </div>
                                                <DropdownMenuSeparator className={`my-2 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
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
                                {renderPage()}
                            </main>
                        </div>
                    </div>

                    {/* Global Modals */}
                    {/* <GlobalModals /> - Removed in favor of ReviewHubPage */}

                    {/* Create Project Modal */}
                    <CreateProjectModal
                        isOpen={isCreateProjectModalOpen}
                        onClose={() => setIsCreateProjectModalOpen(false)}
                        onSuccess={() => {
                            // Reload dashboard to show new project
                            window.location.reload();
                        }}
                    />
                </div>
            </ReviewProvider>
        </DemoProvider>
    );
}

export default function App() {
    return (
        <Suspense fallback={null}>
            <AppContent />
        </Suspense>
    );
}

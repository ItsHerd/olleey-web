"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ActivityQueue from "@/components/ActivityQueue";
import DashboardPage from "../DashboardPage";
import ChannelsPage from "../ChannelsPage";
import AccountsPage from "../AccountsPage";
import { PanelLeft, ChevronDown, Check, Youtube, Bell, User, Settings, Plus, ChevronRight, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguagesPage from "../LanguagesPage";
import GuardrailsPage from "../GuardrailsPage";
import JobsPage from "../JobsPage";
import NotificationsPage from "../NotificationsPage";
import SettingsPage from "../SettingsPage";
import LoginPage from "../LoginPage";
import UsagePage from "../UsagePage";
import SupportPage from "../SupportPage";
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

function AppContent() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState("Dashboard");
    // Determine if authenticated from token storage initially
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Always treat onboarding as complete to allow access to dashboard
    const [onboardingComplete, setOnboardingComplete] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    // Persist sidebar state
    useEffect(() => {
        const savedState = localStorage.getItem("sidebarOpen");
        if (savedState !== null) {
            setIsSidebarOpen(savedState === "true");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", String(isSidebarOpen));
    }, [isSidebarOpen]);

    // Use the dashboard hook for data - only enabled when authenticated
    const { dashboard, loading: dashboardLoading } = useDashboard({ enabled: isAuthenticated });
    const { projects, selectedProject, setSelectedProject } = useProject();

    // Get theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
    const isDark = theme === "dark";
    const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";

    const getChannelAvatar = (channelId?: string) => {
        if (!channelId) return undefined;
        const masterNode = channelGraph.find(m => m.channel_id === channelId);
        return masterNode?.channel_avatar_url;
    };

    const syncOnboardingFromBackend = async () => {
        // Removed mandatory onboarding check
        setOnboardingComplete(true);

        const params = new URLSearchParams(window.location.search);
        const pageParam = params.get("page");
        if (!pageParam) {
            setCurrentPage("Dashboard");
        }
    };

    // Load channel graph for avatars
    useEffect(() => {
        const loadChannelGraph = async () => {
            if (isAuthenticated) {
                try {
                    const graph = await youtubeAPI.getChannelGraph();
                    setChannelGraph(graph.master_nodes || []);
                } catch (error) {
                    console.error("Failed to load channel graph", error);
                }
            }
        };
        loadChannelGraph();
    }, [isAuthenticated]);

    // Check authentication and onboarding status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 1. Check for Google OAuth ID Token in URL (Handle Redirects)
                const urlHash = window.location.hash;
                const urlParams = new URLSearchParams(urlHash.replace(/^#/, '?'));
                const idToken = urlParams.get('id_token');

                if (idToken) {
                    try {
                        // Clear the hash from the URL for a cleaner look
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);

                        // Authenticate with the ID token
                        await authAPI.googleAuth(idToken);
                    } catch (err) {
                        console.error("Google auth redirect failed:", err);
                    }
                }

                // 2. Check if user has tokens (either from step 1 or existing)
                if (tokenStorage.isAuthenticated()) {
                    // Verify token is valid by fetching user info
                    try {
                        await authAPI.getMe();
                        setIsAuthenticated(true);
                        await syncOnboardingFromBackend();
                    } catch (error) {
                        console.error("Auth verification failed:", error);
                        // Token invalid, clear it
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

    // Read page query parameter to sync internal state
    useEffect(() => {
        const pageParam = searchParams?.get("page");
        if (pageParam) {
            // Map page param to valid page names
            const validPages = ["Dashboard", "Channels", "Accounts", "Workflows", "Notifications", "Dynamic Sponsors", "Comment Mirroring", "Settings", "Usage", "Support"];
            if (validPages.includes(pageParam)) {
                setCurrentPage(pageParam);
            } else if (pageParam === "Languages" || pageParam === "Queued Jobs") {
                // Handle legacy page names
                setCurrentPage("Workflows");
            }
        }
    }, [searchParams]);

    const handleLoginSuccess = async () => {
        setIsAuthenticated(true);
        setIsLoading(true);
        try {
            await syncOnboardingFromBackend();
        } catch (error) {
            console.error("Failed to sync onboarding state after login:", error);
            // Default to allowed even on error
            setOnboardingComplete(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOnboardingComplete = () => {
        setOnboardingComplete(true);
        setCurrentPage("Accounts");
    };

    const handleLogout = () => {
        authAPI.logout();
        setIsAuthenticated(false);
        setOnboardingComplete(false);
        setCurrentPage("Dashboard");
        setIsSidebarOpen(false);
    };

    const renderPage = () => {
        // Pass selectedChannelId to the page if needed, though they might read from URL independently
        switch (currentPage) {
            case "Dashboard":
                return <DashboardPage />;
            case "Channels":
                return <ChannelsPage />;
            case "Accounts":
                return <AccountsPage onLogout={handleLogout} />;
            case "Usage":
                return <UsagePage />;
            case "Workflows":
                return <JobsPage />;
            case "Guardrails":
                return <GuardrailsPage />;
            case "Languages":
                return <LanguagesPage />;
            case "Notifications":
                return <NotificationsPage />;
            case "Dynamic Sponsors":
                return (
                    <ComingSoonPage
                        title="Dynamic Sponsors"
                        description="Automatically swap brand segments for local sponsors in target countries."
                        value=""
                        features={[
                            "AI-Powered Segment Detection",
                            "Seamless Asset Replacement",
                            "Regional Ad-Network Integration",
                            "Automated ROI Reporting"
                        ]}
                    />
                );
            case "Comment Mirroring":
                return (
                    <ComingSoonPage
                        title="AI Comment Mirroring"
                        description="Automatically translate viewer comments and your replies to maintain engagement across languages."
                        value=""
                        features={[
                            "Context-Aware Translation",
                            "Sentiment Preservation",
                            "Creator Reply Sync",
                            "Community Health Monitoring"
                        ]}
                    />
                );
            case "Settings":
                return <SettingsPage />;
            case "Support":
                return <SupportPage />;
            default:
                return <DashboardPage />;
        }
    };

    // Show loading state (use static classes to avoid hydration mismatch)
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

    // Show login page if not authenticated
    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    const selectedProjectChannelName = channelGraph.find(m => m.connection_id === selectedProject?.master_connection_id)?.channel_name;

    // Show main app (with onboarding or content)
    return (
        <div className={`h-screen ${bgClass} overflow-hidden`}>
            <div className={`flex h-full ${bgClass} overflow-hidden`}>
                {/* Sidebar */}
                <div className="flex-shrink-0 hidden sm:block">
                    <Sidebar
                        currentPage={currentPage}
                        onNavigate={setCurrentPage}
                        isLocked={false}
                        onLogout={handleLogout}
                        isOpen={isSidebarOpen}
                        projects={projects}
                        selectedProject={selectedProject}
                        selectedProjectChannelName={selectedProjectChannelName}
                        onProjectSelect={setSelectedProject}
                        onCreateProject={() => setIsCreateProjectModalOpen(true)}
                    />
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col overflow-hidden ${bgClass} relative min-w-0`}>

                    {/* Breadcrumb Header */}
                    <header className={`flex items-center h-14 px-4 border-b ${isDark ? 'border-dark-border bg-dark-bg/80' : 'border-light-border bg-white/80'} shrink-0 gap-2 backdrop-blur-md z-20`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`h-9 w-9 rounded-none transition-all ${isSidebarOpen ? 'text-olleey-yellow bg-olleey-yellow/10' : `${textClass} hover:bg-white/5`}`}
                        >
                            <PanelLeft className="h-4 w-4" />
                        </Button>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-1 sm:gap-2 ml-2 overflow-hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={`flex items-center gap-1 text-sm font-medium ${textSecondaryClass} hover:${textClass} transition-colors truncate max-w-[150px] outline-none group`}
                                        title={selectedProject?.name || "All Projects"}
                                    >
                                        <span className="truncate">{selectedProject?.name || "All Projects"}</span>
                                        <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} w-56 p-1 rounded-none shadow-xl overflow-hidden z-[100]`}>
                                    <DropdownMenuLabel className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest px-3 py-2`}>
                                        Select Project
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className={`${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                    {projects.map((project) => (
                                        <DropdownMenuItem
                                            key={project.id}
                                            onClick={() => setSelectedProject(project)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-none cursor-pointer transition-colors ${selectedProject?.id === project.id
                                                ? (isDark ? 'bg-olleey-yellow/10 text-olleey-yellow' : 'bg-olleey-yellow/5 text-olleey-yellow font-bold')
                                                : (isDark ? 'text-dark-textSecondary hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-black')
                                                }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedProject?.id === project.id ? 'bg-olleey-yellow shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-transparent'}`} />
                                            <span className="truncate text-sm">{project.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuItem
                                        onClick={() => setIsCreateProjectModalOpen(true)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-none cursor-pointer ${isDark ? 'text-olleey-yellow hover:bg-olleey-yellow/10' : 'text-olleey-yellow hover:bg-olleey-yellow/5'} font-bold transition-colors`}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span className="text-sm">New Project</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <ChevronRight className={`h-3 w-3 ${textSecondaryClass} opacity-40 shrink-0`} />

                            <h1 className={`text-sm sm:text-base font-bold ${textClass} truncate`}>
                                {currentPage}
                            </h1>
                        </div>

                        <div className="ml-auto flex items-center gap-1 sm:gap-2">
                            {/* Manual Process Button */}
                            <Button
                                onClick={() => {
                                    setCurrentPage("Dashboard");
                                    router.push("/app?page=Dashboard&action=manual");
                                }}
                                className={`h-9 px-4 gap-2 bg-olleey-yellow hover:bg-white text-black font-black uppercase tracking-wider text-[10px] rounded-none transition-all shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] mr-2`}
                            >
                                <Zap className="h-4 w-4" />
                                <span className="hidden md:inline">Manual Process</span>
                            </Button>

                            {/* Add Channel Button - Compact */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/connections/add")}
                                className={`h-9 px-3 gap-2 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-olleey-yellow' : 'bg-white border-gray-200 text-black hover:border-olleey-yellow'} transition-all rounded-none group`}
                                title="Add Channel"
                            >
                                <div className="relative">
                                    <Youtube className="h-4 w-4 text-olleey-yellow" />
                                    <div className="absolute -top-1 -right-1 bg-olleey-yellow rounded-none w-2 h-2 border border-black flex items-center justify-center">
                                        <Plus className="h-1.5 w-1.5 text-black" />
                                    </div>
                                </div>
                                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest transition-colors group-hover:text-olleey-yellow">Add Connection</span>
                            </Button>

                            <div className={`h-4 w-[1px] ${borderClass} mx-1 hidden sm:block`} />

                            {/* Notifications Link */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentPage("Notifications")}
                                className={`h-9 w-9 rounded-none transition-all ${currentPage === "Notifications" ? 'bg-olleey-yellow/10 text-olleey-yellow' : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`}`}
                                title="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                            </Button>

                            {/* Settings Link */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentPage("Settings")}
                                className={`h-9 w-9 rounded-none transition-all ${currentPage === "Settings" ? 'bg-olleey-yellow/10 text-olleey-yellow' : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`}`}
                                title="Settings"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>

                            {/* Account/User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-9 w-9 rounded-none transition-all ${currentPage === "Accounts" ? 'bg-olleey-yellow/10 text-olleey-yellow' : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`}`}
                                        title="Account"
                                    >
                                        <User className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} w-56 p-1 rounded-none shadow-xl overflow-hidden z-[100]`}>
                                    <DropdownMenuLabel className={`text-[10px] font-bold ${textSecondaryClass} uppercase tracking-widest px-3 py-2 text-white/40`}>
                                        Manage Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className={`${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                    <DropdownMenuItem
                                        onClick={() => setCurrentPage("Accounts")}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-none cursor-pointer transition-colors ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <User className="w-4 h-4 text-olleey-yellow" />
                                        <span className="text-sm">Account Page</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setCurrentPage("Usage")}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-none cursor-pointer transition-colors ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Zap className="w-4 h-4 text-olleey-yellow" />
                                        <span className="text-sm">See Usage</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className={`${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-none cursor-pointer text-red-500 hover:bg-red-500/10 transition-colors`}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm font-bold">Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <main className={`flex-1 overflow-hidden ${bgClass} px-0 py-0 min-w-0`}>
                        {renderPage()}
                    </main>
                </div>
            </div>

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
    );
}

export default function App() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400">Initializing...</p>
                </div>
            </div>
        }>
            <AppContent />
        </Suspense>
    );
}

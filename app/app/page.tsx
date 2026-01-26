"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ActivityQueue from "@/components/ActivityQueue";
import ContentPage from "../ContentPage";
import ChannelsPage from "../ChannelsPage";
import AccountsPage from "../AccountsPage";
import { PanelLeft, ChevronDown, Check, Youtube, Bell, User, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguagesPage from "../LanguagesPage";
import JobsPage from "../JobsPage";
import NotificationsPage from "../NotificationsPage";
import SettingsPage from "../SettingsPage";
import LoginPage from "../LoginPage";
import { tokenStorage, authAPI, dashboardAPI, youtubeAPI, type MasterNode } from "@/lib/api";
import { useDashboard } from "@/lib/useDashboard";
import { useTheme } from "@/lib/useTheme";
import { useProject } from "@/lib/ProjectContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectModal } from "@/components/ui/create-project-modal";
import { ComingSoonPage } from "@/components/ComingSoonPage";

function AppContent() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState("Content");
    // Determine if authenticated from token storage initially
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Always treat onboarding as complete to allow access to dashboard
    const [onboardingComplete, setOnboardingComplete] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    // Use the dashboard hook for data - only enabled when authenticated
    const { dashboard, loading: dashboardLoading } = useDashboard({ enabled: isAuthenticated });
    const { projects, selectedProject, setSelectedProject } = useProject();

    // Get theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";

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
            setCurrentPage("Content");
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
            const validPages = ["Content", "Channels", "Accounts", "Queued Jobs", "Notifications", "Dynamic Sponsors", "Comment Mirroring", "Settings"];
            if (validPages.includes(pageParam)) {
                setCurrentPage(pageParam);
            } else if (pageParam === "Languages") {
                // Handle legacy "Languages" page name
                setCurrentPage("Queued Jobs");
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
        setCurrentPage("Content");
        setIsSidebarOpen(false);
    };

    const renderPage = () => {
        // Pass selectedChannelId to the page if needed, though they might read from URL independently
        switch (currentPage) {
            case "Content":
                return <ContentPage />;
            case "Channels":
                return <ChannelsPage />;
            case "Accounts":
                return <AccountsPage onLogout={handleLogout} />;
            case "Queued Jobs":
                return <JobsPage />;
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
                        features={[]}
                    />
                );
            case "Comment Mirroring":
                return (
                    <ComingSoonPage
                        title="AI Comment Mirroring"
                        description="Automatically translate viewer comments and your replies to maintain engagement across languages."
                        value=""
                        features={[]}
                    />
                );
            case "Settings":
                return <SettingsPage />;
            default:
                return <ContentPage />;
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
                        onProjectSelect={setSelectedProject}
                        onCreateProject={() => setIsCreateProjectModalOpen(true)}
                    />
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col overflow-hidden ${bgClass} relative min-w-0`}>

                    {/* Breadcrumb Header */}
                    <header className={`flex items-center h-14 px-4 border-b ${theme === 'light' ? 'border-gray-200 bg-white/50' : 'border-gray-800 bg-[#0f0f0f]/50'} shrink-0 gap-2 backdrop-blur-sm z-10`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`h-9 w-9 ${isSidebarOpen ? 'text-olleey-yellow bg-olleey-yellow/10' : ''}`}
                        >
                            <PanelLeft className="h-4 w-4" />
                        </Button>

                        {/* Page Name */}
                        <h2 className={`text-lg font-semibold ${textClass} ml-2`}>
                            {currentPage}
                        </h2>

                        <div className="ml-auto flex items-center gap-1 sm:gap-2">
                            {/* Add Channel Button */}
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/connections/add")}
                                className="gap-2 px-3"
                                title="Add Channel"
                            >
                                <div className="relative">
                                    <Youtube className="h-4 w-4 flex-shrink-0" />
                                    <div className="absolute -top-1 -right-1 bg-indigo-500 rounded-full w-2 h-2 border border-white dark:border-black flex items-center justify-center">
                                        <Plus className="h-1.5 w-1.5 text-white" />
                                    </div>
                                </div>
                                <span className="hidden md:inline text-sm font-medium">Add Channel</span>
                            </Button>

                            {/* Notifications Link */}
                            <Button
                                variant={currentPage === "Notifications" ? "secondary" : "ghost"}
                                onClick={() => setCurrentPage("Notifications")}
                                className={`gap-2 p-2 ${currentPage === "Notifications" ? 'text-olleey-yellow' : ''}`}
                                title="Notifications"
                            >
                                <Bell className="h-4 w-4 flex-shrink-0" />
                                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${currentPage === "Notifications" ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'}`}>
                                    Notifications
                                </span>
                            </Button>

                            {/* Settings Link */}
                            <Button
                                variant={currentPage === "Settings" ? "secondary" : "ghost"}
                                onClick={() => setCurrentPage("Settings")}
                                className={`gap-2 p-2 ${currentPage === "Settings" ? 'text-olleey-yellow' : ''}`}
                                title="Settings"
                            >
                                <Settings className="h-4 w-4 flex-shrink-0" />
                                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${currentPage === "Settings" ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'}`}>
                                    Settings
                                </span>
                            </Button>

                            {/* Account/User Link */}
                            <Button
                                variant={currentPage === "Accounts" ? "secondary" : "ghost"}
                                onClick={() => setCurrentPage("Accounts")}
                                className={`gap-2 p-2 ${currentPage === "Accounts" ? 'text-olleey-yellow' : ''}`}
                                title="Account"
                            >
                                <User className="h-4 w-4 flex-shrink-0" />
                                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${currentPage === "Accounts" ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'}`}>
                                    Account
                                </span>
                            </Button>
                        </div>
                    </header>

                    <main className={`flex-1 overflow-y-auto ${bgClass} px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 min-w-0`}>
                        {renderPage()}
                    </main>

                    {/* Onboarding Overlay - REMOVED */}
                </div>

                {/* Activity Queue - Hidden on smaller screens, shown on xl+ */}
                <div className="flex-shrink-0 hidden xl:block">
                    <ActivityQueue />
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

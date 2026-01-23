"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ActivityQueue from "@/components/ActivityQueue";
import ContentPage from "../ContentPage";
import ChannelsPage from "../ChannelsPage";
import AccountsPage from "../AccountsPage";
import { PanelLeft, ChevronDown, Check, Youtube } from "lucide-react";
import LanguagesPage from "../LanguagesPage";
import NotificationsPage from "../NotificationsPage";
import AnalyticsPage from "../AnalyticsPage";
import SettingsPage from "../SettingsPage";
import OnboardingPage from "../OnboardingPage";
import LoginPage from "../LoginPage";
import { tokenStorage, authAPI, dashboardAPI, youtubeAPI, type MasterNode } from "@/lib/api";
import { useDashboard } from "@/lib/useDashboard";
import { useTheme } from "@/lib/useTheme";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AppContent() {
    const { theme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState("Content");
    // Determine if authenticated from token storage initially
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [channelGraph, setChannelGraph] = useState<MasterNode[]>([]);

    // Use the dashboard hook for data - only enabled when authenticated
    const { dashboard, loading: dashboardLoading } = useDashboard({ enabled: isAuthenticated });

    // Get theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
    const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
    const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";

    // Determine current project from URL or defaults
    const currentChannelId = searchParams?.get("channel_id");

    // Find the currently selected project object
    const selectedProject = dashboard?.youtube_connections?.find(c => c.youtube_channel_id === currentChannelId) ||
        dashboard?.youtube_connections?.find(c => c.is_primary) ||
        dashboard?.youtube_connections?.[0];

    const getChannelAvatar = (channelId?: string) => {
        if (!channelId) return undefined;
        const masterNode = channelGraph.find(m => m.channel_id === channelId);
        return masterNode?.channel_avatar_url;
    };

    const syncOnboardingFromBackend = async () => {
        const dashboardData = await dashboardAPI.getDashboard();
        const hasConnection =
            dashboardData.has_youtube_connection || dashboardData.youtube_connections.length > 0;
        setOnboardingComplete(hasConnection);

        if (hasConnection) {
            const params = new URLSearchParams(window.location.search);
            const pageParam = params.get("page");
            if (!pageParam) {
                setCurrentPage("Content");
            }
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
            const validPages = ["Content", "Channels", "Accounts", "Queued Jobs", "Notifications", "Analytics", "Settings"];
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
            setOnboardingComplete(false);
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

    const handleProjectSelect = (channelId: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set("channel_id", channelId);
        // Build the full URL path with /app prefix
        const newUrl = `/app?${params.toString()}`;
        router.push(newUrl);
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
            case "Languages":
                return <LanguagesPage />;
            case "Notifications":
                return <NotificationsPage />;
            case "Analytics":
                return <AnalyticsPage />;
            case "Settings":
                return <SettingsPage />;
            default:
                return <ContentPage />;
        }
    };

    // Show loading state
    if (isLoading) {
        const loadingTextClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
        return (
            <div className={`h-screen ${bgClass} flex items-center justify-center`}>
                <div className="text-center">
                    <svg className={`animate-spin h-8 w-8 ${textClass} mx-auto mb-4`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className={loadingTextClass}>Loading...</p>
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
                        isLocked={!onboardingComplete}
                        onLogout={handleLogout}
                        isOpen={isSidebarOpen}
                    />
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col overflow-hidden ${bgClass} relative min-w-0`}>

                    {/* Breadcrumb Header */}
                    <header className={`flex items-center h-14 px-4 border-b ${theme === 'light' ? 'border-gray-200 bg-white/50' : 'border-gray-800 bg-[#0f0f0f]/50'} shrink-0 gap-2 backdrop-blur-sm z-10`}>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`p-2 rounded-md hover:${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}
                        >
                            <PanelLeft className={`h-4 w-4 ${textClass} transition-colors ${isSidebarOpen ? 'text-indigo-500' : ''}`} />
                        </button>

                        <div className={`h-4 w-[1px] ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'} mx-1`} />

                        {/* Project Breadcrumb / Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-1 group cursor-pointer outline-none">
                                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md hover:${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'} transition-colors`}>
                                        {selectedProject && getChannelAvatar(selectedProject.youtube_channel_id) ? (
                                            <img
                                                src={getChannelAvatar(selectedProject.youtube_channel_id)}
                                                alt={selectedProject.youtube_channel_name}
                                                className="w-4 h-4 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                {selectedProject?.youtube_channel_name?.charAt(0) || "P"}
                                            </div>
                                        )}
                                        <span className={`text-sm ${textClass} font-medium truncate max-w-[150px] sm:max-w-xs`}>
                                            {selectedProject?.youtube_channel_name || "Select Project"}
                                        </span>
                                        <ChevronDown className={`h-3 w-3 ${textClass} opacity-50 w-3 h-3 ml-0.5`} />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[240px]">
                                {dashboard?.youtube_connections?.map((connection) => (
                                    <DropdownMenuItem
                                        key={connection.youtube_channel_id}
                                        onClick={() => handleProjectSelect(connection.youtube_channel_id)}
                                        className="gap-2 cursor-pointer"
                                    >
                                        {getChannelAvatar(connection.youtube_channel_id) ? (
                                            <img
                                                src={getChannelAvatar(connection.youtube_channel_id)}
                                                alt={connection.youtube_channel_name}
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                                <Youtube className="w-3 h-3 text-indigo-500" />
                                            </div>
                                        )}
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="truncate text-sm font-medium">{connection.youtube_channel_name}</span>
                                            {connection.is_primary && (
                                                <span className="text-[10px] text-muted-foreground">Primary Channel</span>
                                            )}
                                        </div>
                                        {selectedProject?.youtube_channel_id === connection.youtube_channel_id && (
                                            <Check className="w-4 h-4 text-indigo-500 ml-auto" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                                {(!dashboard?.youtube_connections || dashboard.youtube_connections.length === 0) && (
                                    <div className="p-2 text-xs text-muted-foreground text-center">
                                        No projects found
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <span className={`${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>/</span>

                        {/* Current Page Breadcrumb */}
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm ${textClass}`}>
                            {currentPage}
                        </div>
                    </header>

                    <main className={`flex-1 overflow-y-auto ${bgClass} px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 min-w-0`}>
                        {renderPage()}
                    </main>

                    {/* Onboarding Overlay */}
                    {!onboardingComplete && (
                        <OnboardingPage
                            onComplete={handleOnboardingComplete}
                        />
                    )}
                </div>

                {/* Activity Queue - Hidden on smaller screens, shown on xl+ */}
                {onboardingComplete && (
                    <div className="flex-shrink-0 hidden xl:block">
                        <ActivityQueue />
                    </div>
                )}
            </div>
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

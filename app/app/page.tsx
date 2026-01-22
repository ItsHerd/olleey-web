"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ActivityQueue from "@/components/ActivityQueue";
import ContentPage from "../ContentPage";
import ChannelsPage from "../ChannelsPage";
import AccountsPage from "../AccountsPage";
import LanguagesPage from "../LanguagesPage";
import NotificationsPage from "../NotificationsPage";
import AnalyticsPage from "../AnalyticsPage";
import SettingsPage from "../SettingsPage";
import OnboardingPage from "../OnboardingPage";
import LoginPage from "../LoginPage";
import { tokenStorage, authAPI, dashboardAPI } from "@/lib/api";
import { useTheme } from "@/lib/useTheme";

export default function App() {
    const { theme } = useTheme();
    const [currentPage, setCurrentPage] = useState("Content");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Get theme-aware classes
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const textClass = theme === "light" ? "text-light-text" : "text-dark-text";

    const syncOnboardingFromBackend = async () => {
        const dashboard = await dashboardAPI.getDashboard();
        const hasConnection =
            dashboard.has_youtube_connection || dashboard.youtube_connections.length > 0;
        setOnboardingComplete(hasConnection);
        // If the user already has a connection, land them on the Content page (home).
        if (hasConnection) {
            setCurrentPage("Content");
        }
    };

    // Check authentication and onboarding status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if user has tokens
                if (tokenStorage.isAuthenticated()) {
                    // Verify token is valid by fetching user info
                    try {
                        await authAPI.getMe();
                        setIsAuthenticated(true);
                        await syncOnboardingFromBackend();
                    } catch (error) {
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

    // Read page query parameter from URL (e.g., from /channels redirect)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const pageParam = params.get("page");
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
        }
    }, []);

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
    };

    const renderPage = () => {
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
                {/* Sidebar - Fixed width, hidden on very small screens if needed */}
                <div className="flex-shrink-0 hidden sm:block">
                    <Sidebar
                        currentPage={currentPage}
                        onNavigate={setCurrentPage}
                        isLocked={!onboardingComplete}
                        onLogout={handleLogout}
                    />
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col sm:flex-row overflow-hidden ${bgClass} relative min-w-0`}>
                    <main className={`flex-1 overflow-y-auto ${bgClass} px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 min-w-0`}>
                        {renderPage()}
                    </main>

                    {/* Onboarding Overlay - only covers the main content area */}
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

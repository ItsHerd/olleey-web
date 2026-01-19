"use client";
// Updated sidebar with Statsig-like design
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ContentPage from "./pages/ContentPage";
import ChannelsPage from "./pages/ChannelsPage";
import AccountsPage from "./pages/AccountsPage";
import LanguagesPage from "./pages/LanguagesPage";
import DestinationsPage from "./pages/DestinationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import OnboardingPage from "./pages/OnboardingPage";
import LoginPage from "./pages/LoginPage";
import { tokenStorage, authAPI } from "@/lib/api";

export default function App() {
  const [currentPage, setCurrentPage] = useState("Content");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
            
            // Check onboarding status
            const saved = localStorage.getItem("onboardingComplete");
            if (saved === "true") {
              setOnboardingComplete(true);
            }
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

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // Check onboarding status after login
    const saved = localStorage.getItem("onboardingComplete");
    if (saved === "true") {
      setOnboardingComplete(true);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboardingComplete", "true");
    setOnboardingComplete(true);
  };

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem("onboardingComplete");
    setIsAuthenticated(false);
    setOnboardingComplete(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "Content":
        return <ContentPage />;
      case "Channels":
        return <ChannelsPage />;
      case "Accounts":
        return <AccountsPage />;
      case "Languages":
        return <LanguagesPage />;
      case "Destinations":
        return <DestinationsPage />;
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
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-900 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
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
    <div className="h-screen bg-gray-50 px-8">
      <div className="flex h-full bg-white overflow-hidden">
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
          isLocked={!onboardingComplete}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <main className="flex-1 overflow-auto bg-white p-12">
            {!onboardingComplete ? (
              <OnboardingPage 
                onComplete={handleOnboardingComplete}
                onYouTubeConnected={() => {
                  // Refresh dashboard to check for YouTube connection
                  // This will be called when returning from success page
                  setOnboardingComplete(false); // Will trigger re-check
                }}
              />
            ) : (
              renderPage()
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

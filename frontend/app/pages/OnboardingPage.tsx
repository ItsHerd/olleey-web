"use client";

import { useState, useEffect } from "react";
import { Check, ArrowRight, Globe, Languages, Target } from "lucide-react";
import { dashboardAPI, youtubeAPI } from "@/lib/api";
import { logger } from "@/lib/logger";

type OnboardingStep = "youtube" | "preferences";

interface OnboardingProps {
  onComplete: () => void;
  onYouTubeConnected?: () => void;
}

export default function OnboardingPage({ onComplete, onYouTubeConnected }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("youtube");
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check if YouTube is already connected via dashboard
  // Note: OAuth callback is now handled by /youtube/connect/success route
  // The backend processes OAuth and redirects to success/error pages
  useEffect(() => {
    const checkYouTubeConnection = async () => {
      try {
        // Check dashboard for existing connection
        logger.debug("YouTube Onboarding", "Checking dashboard for YouTube connection");
        const dashboard = await dashboardAPI.getDashboard();
        logger.debug("YouTube Onboarding", "Dashboard response", {
          has_youtube_connection: dashboard.has_youtube_connection,
          connections_count: dashboard.youtube_connections.length,
        });
        if (dashboard.has_youtube_connection) {
          logger.info("YouTube Onboarding", "YouTube already connected, skipping to preferences");
          setYoutubeConnected(true);
          // Skip to preferences if YouTube is already connected
          setCurrentStep("preferences");
        }
      } catch (error) {
        logger.error("YouTube Onboarding", "Failed to check YouTube connection", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkYouTubeConnection();
  }, []);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];

  const destinations = [
    { id: "youtube", name: "YouTube", icon: "📺" },
    { id: "tiktok", name: "TikTok", icon: "🎵" },
    { id: "instagram", name: "Instagram", icon: "📷" },
    { id: "facebook", name: "Facebook", icon: "👥" },
    { id: "x", name: "X (Twitter)", icon: "🐦" },
  ];

  const handleConnectYouTube = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Get current frontend URL for redirect back after OAuth
      // Use the dedicated success route
      const currentOrigin = window.location.origin; // http://localhost:3000
      const successRedirectUri = `${currentOrigin}/youtube/connect/success`;
      const currentHref = window.location.href;
      
      // DEBUG: Log current location values
      logger.debug("YouTube OAuth", "handleConnectYouTube called");
      logger.debug("YouTube OAuth", "currentOrigin", currentOrigin);
      logger.debug("YouTube OAuth", "successRedirectUri", successRedirectUri);
      logger.debug("YouTube OAuth", "currentHref", currentHref);
      logger.debug("YouTube OAuth", "window.location", {
        origin: window.location.origin,
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
      });
      
      // Get OAuth URL from backend using GET /youtube/connect
      // Pass redirect_uri pointing to the success route
      const { auth_url } = await youtubeAPI.initiateConnection(successRedirectUri);
      
      logger.debug("YouTube OAuth", "auth_url received", auth_url);
      
      // Redirect user to YouTube OAuth (or backend endpoint if backend handles redirect)
      // If auth_url is the backend endpoint, we need to pass the token
      const token = localStorage.getItem("access_token");
      if (auth_url.includes("/youtube/connect") && token && !auth_url.includes("token=")) {
        // Pass token as query param for backend to authenticate
        // Backend should then redirect to Google OAuth
        const separator = auth_url.includes("?") ? "&" : "?";
        const finalUrl = `${auth_url}${separator}token=${encodeURIComponent(token)}`;
        logger.debug("YouTube OAuth", "Redirecting to (with token)", finalUrl);
        window.location.href = finalUrl;
      } else {
        // Direct OAuth URL from backend (or already has token)
        logger.debug("YouTube OAuth", "Redirecting to (direct)", auth_url);
        window.location.href = auth_url;
      }
    } catch (error) {
      logger.error("YouTube OAuth", "Error in handleConnectYouTube", error);
      // If fetch fails, try redirecting directly to backend with redirect_uri
      const token = localStorage.getItem("access_token");
      const currentOrigin = window.location.origin;
      const successRedirectUri = `${currentOrigin}/youtube/connect/success`;
      logger.debug("YouTube OAuth", "Fallback redirect - successRedirectUri", successRedirectUri);
      if (token) {
        const fallbackUrl = `http://10.0.0.15:8000/youtube/connect?token=${encodeURIComponent(token)}&redirect_uri=${encodeURIComponent(successRedirectUri)}`;
        logger.debug("YouTube OAuth", "Fallback redirect URL", fallbackUrl);
        window.location.href = fallbackUrl;
      } else {
        setConnectionError(error instanceof Error ? error.message : "Failed to connect YouTube. Please try again.");
        setIsConnecting(false);
      }
    }
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const toggleDestination = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentStep === "youtube" && youtubeConnected) {
      setCurrentStep("preferences");
    }
  };

  const handleComplete = () => {
    if (selectedLanguages.length > 0 && selectedDestinations.length > 0) {
      onComplete();
    }
  };

  const canProceedFromYoutube = youtubeConnected;
  const canCompletePreferences = selectedLanguages.length > 0 && selectedDestinations.length > 0;

  // Show loading state while checking dashboard
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-8">
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

  return (
    <div className="w-full h-full flex items-center justify-center py-8">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`flex items-center gap-2 ${currentStep === "youtube" ? "text-gray-900" : "text-green-600"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "youtube" ? "bg-gray-900 text-white" : "bg-green-600 text-white"
              }`}>
                {currentStep === "youtube" ? "1" : <Check className="w-5 h-5" />}
              </div>
              <span className="font-semibold">Connect YouTube</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentStep === "preferences" ? "text-gray-900" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "preferences" ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                2
              </div>
              <span className="font-semibold">Set Preferences</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {currentStep === "youtube" && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Connect Your Main YouTube Account
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Connect your primary YouTube channel to start managing and distributing your content across multiple languages and platforms.
                </p>
              </div>

              {!youtubeConnected ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-full max-w-md bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300">
                    <div className="text-center space-y-4">
                      <div className="text-4xl mb-4">📺</div>
                      <p className="text-gray-600">
                        Your YouTube account will be securely connected using OAuth 2.0
                      </p>
                      <ul className="text-left text-sm text-gray-500 space-y-2 mt-4">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Read your channel information</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Upload and manage videos</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Access analytics data</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {connectionError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {connectionError}
                    </div>
                  )}

                  <button
                    onClick={handleConnectYouTube}
                    disabled={isConnecting}
                    className="w-full max-w-md bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Connect YouTube Account
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">Successfully Connected!</h3>
                        <p className="text-sm text-gray-600">Your YouTube account is now connected and ready to use.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!canProceedFromYoutube}
                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
                  >
                    Continue to Preferences
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === "preferences" && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Set Your Preferences
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Choose your preferred languages and destinations for content distribution.
                </p>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Languages className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">Select Languages</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedLanguages.includes(lang.code)
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{lang.flag}</div>
                      <div className="font-medium">{lang.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destinations Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">Select Destinations</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {destinations.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => toggleDestination(dest.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedDestinations.includes(dest.id)
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{dest.icon}</div>
                      <div className="font-medium">{dest.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep("youtube")}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!canCompletePreferences}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  Complete Setup
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

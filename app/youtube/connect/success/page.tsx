"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";

function YouTubeConnectSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme(); // Use theme hook for consistent styling
  const [channelName, setChannelName] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");

  // Theme-aware classes matching ManualProcessModal
  const bgClass = theme === "light" ? "bg-gray-100/50" : "bg-dark-bg"; // Slightly different page bg
  const cardClass = theme === "light" ? "bg-white" : "bg-dark-card";
  const textClass = theme === "light" ? "text-gray-900" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-gray-500" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-gray-200" : "border-dark-border";

  useEffect(() => {
    // Extract connection details from URL parameters
    const connectionIdParam = searchParams.get("connection_id");
    const channelIdParam = searchParams.get("channel_id");
    const channelNameParam = searchParams.get("channel_name");
    const typeParam = searchParams.get("type") || searchParams.get("connection_type");
    const masterConnectionIdParam = searchParams.get("master_connection_id");

    logger.debug("YouTube Connect Success", "Connection details received", {
      connection_id: connectionIdParam,
      channel_id: channelIdParam,
      channel_name: channelNameParam,
      type: typeParam,
      master_connection_id: masterConnectionIdParam,
    });

    if (connectionIdParam) setConnectionId(connectionIdParam);
    if (channelIdParam) setChannelId(channelIdParam);
    if (channelNameParam) setChannelName(decodeURIComponent(channelNameParam));

    // Redirect logic
    const redirectTo = searchParams.get("redirect_to") || "/channels";
    const redirectUrl = new URL(redirectTo, window.location.origin);

    if (connectionIdParam) redirectUrl.searchParams.set("connection_id", connectionIdParam);
    if (channelIdParam) redirectUrl.searchParams.set("channel_id", channelIdParam);

    const finalType = typeParam || searchParams.get("connection_type");
    if (finalType) {
      redirectUrl.searchParams.set("type", finalType);
      redirectUrl.searchParams.set("connection_type", finalType);
    }

    if (masterConnectionIdParam) {
      redirectUrl.searchParams.set("master_connection_id", masterConnectionIdParam);
    }

    const timer = setTimeout(() => {
      router.push(redirectUrl.pathname + redirectUrl.search);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${bgClass} backdrop-blur-sm`}>
      {/* Modal Container */}
      <div className={`relative ${cardClass} border ${borderClass} rounded-2xl shadow-2xl max-w-2xl w-full p-12 text-center`}>
        <div className="space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className={`text-2xl font-semibold ${textClass}`}>
              YouTube Channel Connected
            </h1>

            <div className="py-2">
              {channelName && (
                <p className={`text-lg font-medium ${textClass}`}>
                  {channelName}
                </p>
              )}
              {channelId && !channelName && (
                <p className={`text-sm ${textSecondaryClass}`}>
                  ID: {channelId}
                </p>
              )}
            </div>

            <p className={`${textSecondaryClass} max-w-lg mx-auto`}>
              Your YouTube channel has been successfully connected to your account. You can now manage your videos and dubbing settings.
            </p>

            <p className={`text-sm ${textSecondaryClass} pt-4 animate-pulse`}>
              Redirecting you back to the dashboard...
            </p>
          </div>

          <button
            onClick={() => {
              const redirectTo = searchParams.get("redirect_to") || "/channels";
              // Quick reconstruction of redirect URL for the button
              const url = new URL(redirectTo, window.location.origin);
              searchParams.forEach((value, key) => url.searchParams.set(key, value));
              router.push(url.pathname + url.search);
            }}
            className={`mt-6 bg-black text-white hover:bg-gray-800 font-medium py-3 px-8 rounded-full transition-all`}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function YouTubeConnectSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-gray-900">Finalizing connection...</div>
        </div>
      </div>
    }>
      <YouTubeConnectSuccessContent />
    </Suspense>
  );
}

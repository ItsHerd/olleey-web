"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { logger } from "@/lib/logger";

function YouTubeConnectSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [channelName, setChannelName] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const connectionType = searchParams.get("type") || searchParams.get("connection_type") || "channel";

  useEffect(() => {
    // Extract connection details from URL parameters
    // Backend redirects here with: connection_id, channel_id, channel_name, type, master_connection_id
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
      all_params: Object.fromEntries(searchParams.entries()),
      current_url: window.location.href,
    });

    if (connectionIdParam) {
      setConnectionId(connectionIdParam);
    }
    if (channelIdParam) {
      setChannelId(channelIdParam);
    }
    if (channelNameParam) {
      // URL decode the channel name
      setChannelName(decodeURIComponent(channelNameParam));
    }

    // Always redirect to /channels to show the assign channel modal
    const redirectTo = searchParams.get("redirect_to") || "/channels";

    // Build redirect URL with connection info for refresh
    const redirectUrl = new URL(redirectTo, window.location.origin);
    if (connectionIdParam) {
      redirectUrl.searchParams.set("connection_id", connectionIdParam);
    }
    if (channelIdParam) {
      redirectUrl.searchParams.set("channel_id", channelIdParam);
    }
    // Always pass type parameter - use typeParam if available, otherwise check connection_type
    const finalType = typeParam || searchParams.get("connection_type");
    if (finalType) {
      redirectUrl.searchParams.set("type", finalType);
      // Also set connection_type for consistency
      redirectUrl.searchParams.set("connection_type", finalType);
    }
    // IMPORTANT: Pass master_connection_id so ChannelsPage can re-select the correct master
    // Note: For master channels, master_connection_id will be null (which is correct)
    if (masterConnectionIdParam) {
      redirectUrl.searchParams.set("master_connection_id", masterConnectionIdParam);
    }

    // Auto-redirect after 2 seconds
    const timer = setTimeout(() => {
      router.push(redirectUrl.pathname + redirectUrl.search);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-normal text-gray-900 mb-2">
                {connectionType === "master"
                  ? "Master Channel Synced!"
                  : connectionType === "satellite"
                    ? "Satellite Channel Linked!"
                    : "YouTube Channel Connected!"}
              </h1>
              {channelName && (
                <p className="text-lg text-gray-700 mb-2">
                  <strong>Channel:</strong> {channelName}
                </p>
              )}
              {channelId && !channelName && (
                <p className="text-lg text-gray-700 mb-2">
                  <strong>Channel ID:</strong> {channelId}
                </p>
              )}
              <p className="text-dark-textSecondary mt-4">
                {connectionType === "master"
                  ? "Your primary channel is now connected. Continue to set up satellite channels."
                  : connectionType === "satellite"
                    ? "Your target channel has been added to your distribution network."
                    : "Your YouTube account has been successfully connected."}
              </p>
              <p className="text-sm text-dark-textSecondary mt-4">
                Redirecting you back...
              </p>
            </div>
            <button
              onClick={() => {
                const redirectTo = searchParams.get("redirect_to") || "/channels";
                const masterConnectionId = searchParams.get("master_connection_id");
                const typeParam = searchParams.get("type") || searchParams.get("connection_type");
                const redirectUrl = new URL(redirectTo, window.location.origin);
                if (connectionId) {
                  redirectUrl.searchParams.set("connection_id", connectionId);
                }
                if (channelId) {
                  redirectUrl.searchParams.set("channel_id", channelId);
                }
                // Always pass type parameter
                if (typeParam) {
                  redirectUrl.searchParams.set("type", typeParam);
                  redirectUrl.searchParams.set("connection_type", typeParam);
                }
                // IMPORTANT: Pass master_connection_id so ChannelsPage can re-select the correct master
                // Note: For master channels, master_connection_id will be null (which is correct)
                if (masterConnectionId) {
                  redirectUrl.searchParams.set("master_connection_id", masterConnectionId);
                }
                router.push(redirectUrl.pathname + redirectUrl.search);
              }}
              className="mt-4 bg-dark-card hover:bg-dark-cardAlt text-dark-text font-normal py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard Now
            </button>
          </div>
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

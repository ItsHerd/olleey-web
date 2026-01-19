"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { logger } from "@/lib/logger";

export default function YouTubeConnectSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [channelName, setChannelName] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");

  useEffect(() => {
    // Extract connection details from URL parameters
    // Backend redirects here with: connection_id, channel_id, channel_name
    const connectionIdParam = searchParams.get("connection_id");
    const channelIdParam = searchParams.get("channel_id");
    const channelNameParam = searchParams.get("channel_name");

    logger.debug("YouTube Connect Success", "Connection details received", {
      connection_id: connectionIdParam,
      channel_id: channelIdParam,
      channel_name: channelNameParam,
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

    // Auto-redirect to main app after 3 seconds
    // The app will check dashboard and show onboarding if needed
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                YouTube Channel Connected!
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
              <p className="text-gray-600 mt-4">
                Your YouTube account has been successfully connected.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Redirecting you back...
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

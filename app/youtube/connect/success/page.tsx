"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowRight, Youtube, Layout } from "lucide-react";
import { logger } from "@/lib/logger";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";

function YouTubeConnectSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [channelName, setChannelName] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(true);

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#050505]" : "bg-gray-50";
  const cardClass = isDark ? "bg-white/5 backdrop-blur-xl" : "bg-white shadow-2xl";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-white/60" : "text-gray-500";
  const borderClass = isDark ? "border-white/10" : "border-gray-100";

  useEffect(() => {
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
    });

    if (channelIdParam) setChannelId(channelIdParam);
    if (channelNameParam) setChannelName(decodeURIComponent(channelNameParam));

    // Redirect logic
    const redirectTo = searchParams.get("redirect_to") || "/app?page=Channels";
    const redirectUrl = new URL(redirectTo, window.location.origin);

    if (connectionIdParam) redirectUrl.searchParams.set("connection_id", connectionIdParam);
    if (channelIdParam) redirectUrl.searchParams.set("channel_id", channelIdParam);
    if (typeParam) redirectUrl.searchParams.set("type", typeParam);
    if (masterConnectionIdParam) redirectUrl.searchParams.set("master_connection_id", masterConnectionIdParam);

    const timer = setTimeout(() => {
      router.push(redirectUrl.pathname + redirectUrl.search);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const handleManualRedirect = () => {
    setIsRedirecting(false);
    const redirectTo = searchParams.get("redirect_to") || "/app?page=Channels";
    const url = new URL(redirectTo, window.location.origin);
    searchParams.forEach((value, key) => url.searchParams.set(key, value));
    router.push(url.pathname + url.search);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${bgClass}`}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-olleey-yellow/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`relative ${cardClass} border ${borderClass} rounded-[2.5rem] max-w-xl w-full p-10 md:p-16 text-center overflow-hidden`}>
        {/* Subtle Inner Glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="relative space-y-10">
          {/* Success Icon Animation */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-25" />
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full scale-125" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Check className="w-12 h-12 text-white stroke-[3px]" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Youtube className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Connection Verified</span>
              </div>
              <h1 className={`text-4xl font-300 ${textClass} tracking-tighter`}>
                YouTube <span className="font-semibold text-emerald-500">Connected</span>
              </h1>
            </div>

            <div className="py-4">
              <div className={`inline-flex items-center gap-3 px-6 py-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-2xl border ${borderClass}`}>
                <div className="w-10 h-10 rounded-full bg-rolleey-yellow/20 flex items-center justify-center shrink-0">
                  <Youtube className="w-5 h-5 text-rolleey-yellow" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${textClass}`}>
                    {channelName || "Connected Channel"}
                  </p>
                  <p className={`text-[10px] ${textSecondaryClass} font-medium`}>
                    Channel ID: {channelId ? `${channelId.substring(0, 10)}...` : "Verified"}
                  </p>
                </div>
              </div>
            </div>

            <p className={`text-sm ${textSecondaryClass} max-w-md mx-auto leading-relaxed`}>
              Your international broadcast hub is now synchronized. You can begin distributing content to localized channels immediately.
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center gap-6">
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/3 animate-[progress_3s_linear]" />
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${textSecondaryClass} animate-pulse`}>
                Redirecting to Command Center
              </p>

              <Button
                onClick={handleManualRedirect}
                className="bg-olleey-yellow text-black hover:bg-white transition-all rounded-full h-12 px-10 font-bold group"
              >
                Enter Dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YouTubeConnectSuccessPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-olleey-yellow/20 border-t-olleey-yellow rounded-full animate-spin" />
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Synchronizing Fleet...</p>
        </div>
      </div>
    }>
      <YouTubeConnectSuccessContent />
    </Suspense>
  );
}

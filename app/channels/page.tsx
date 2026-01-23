"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Component that handles the redirection logic using search params
 */
function ChannelsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve all query parameters and add page=channels to indicate which page to show
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "channels");
    router.replace(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen bg-dark-bg">
      <div className="text-dark-text">Redirecting...</div>
    </div>
  );
}

/**
 * Route handler for /channels
 * Redirects to main app with query params preserved
 * The main app will handle setting the current page to "Channels"
 */
export default function ChannelsRoute() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="text-dark-text">Loading...</div>
      </div>
    }>
      <ChannelsRedirect />
    </Suspense>
  );
}

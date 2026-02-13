"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
/**
 * Legacy route redirect
 * This page redirects /app to the new /dashboard route
 */
export default function LegacyAppPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

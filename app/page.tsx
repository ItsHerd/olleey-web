"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPage";

function LandingPageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const authTrigger = searchParams.get('auth');

  useEffect(() => {
    // Redirect to /app if already authenticated
    if (!loading && user) {
      router.push("/app");
    }
  }, [user, loading, router]);

  const handleNavigation = () => {
    router.push("/app");
  };

  return (
    <LandingPage
      onNavigation={handleNavigation}
      initialAuthMode={authTrigger === 'register' ? 'register' : 'login'}
      autoShowAuth={!!authTrigger}
    />
  );
}

export default function Index() {
  return (
    <Suspense fallback={null}>
      <LandingPageWrapper />
    </Suspense>
  );
}

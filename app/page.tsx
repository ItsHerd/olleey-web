"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tokenStorage } from "@/lib/api";
import LandingPage from "@/components/LandingPage/LandingPage";

export default function Index() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authTrigger = searchParams.get('auth');

  useEffect(() => {
    // Redirect to /app if already authenticated
    if (tokenStorage.isAuthenticated()) {
      router.push("/app");
    }
  }, [router]);

  const handleNavigation = () => {
    router.push("/app");
  };

  return <Suspense fallback={null}>
    <LandingPage
      onNavigation={handleNavigation}
      initialAuthMode={authTrigger === 'register' ? 'register' : 'login'}
      autoShowAuth={!!authTrigger}
    />
  </Suspense>;
}

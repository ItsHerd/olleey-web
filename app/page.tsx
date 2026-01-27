"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/api";
import LandingPage from "@/components/LandingPage/LandingPage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /app if already authenticated
    if (tokenStorage.isAuthenticated()) {
      router.push("/app");
    }
  }, [router]);

  const handleNavigation = () => {
    router.push("/app");
  };

  return <LandingPage onNavigation={handleNavigation} />;
}

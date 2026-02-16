"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPage";

export default function LandingClient() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/app");
    }
  }, [user, loading, router]);

  const handleNavigation = () => {
    router.push("/app");
  };

  return <LandingPage onNavigation={handleNavigation} />;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPage";

export default function LandingClient() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Removed auto-redirect to allow users to stay on the landing page

  const handleNavigation = () => {
    router.push("/app");
  };

  return <LandingPage onNavigation={handleNavigation} />;
}

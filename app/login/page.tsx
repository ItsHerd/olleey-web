"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import LoginPage from "../LoginPage";

export default function Login() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to /dashboard if already authenticated
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  const handleLoginSuccess = () => {
    router.push("/dashboard");
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

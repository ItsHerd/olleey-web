"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import LoginPage from "../LoginPage";

export default function Login() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to /app if already authenticated
    if (!loading && user) {
      router.push("/app");
    }
  }, [loading, user, router]);

  const handleLoginSuccess = () => {
    router.push("/app");
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

"use client";

import RegisterPage from "../RegisterPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function Register() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        // Redirect to /app if already authenticated
        if (!loading && user) {
            router.push("/app");
        }
    }, [loading, user, router]);

    const handleRegisterSuccess = () => {
        // Redirect to app after successful registration
        router.push("/app");
    };

    return <RegisterPage onRegisterSuccess={handleRegisterSuccess} />;
}

"use client";

import RegisterPage from "../RegisterPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function Register() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        // Redirect to /dashboard if already authenticated
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [loading, user, router]);

    const handleRegisterSuccess = () => {
        // Redirect to dashboard after successful registration
        router.push("/dashboard");
    };

    return <RegisterPage onRegisterSuccess={handleRegisterSuccess} />;
}

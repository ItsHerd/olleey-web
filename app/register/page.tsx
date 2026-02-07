"use client";

import RegisterPage from "../RegisterPage";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/api";
import { useEffect } from "react";

export default function Register() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to /app if already authenticated
        if (tokenStorage.isAuthenticated()) {
            router.push("/app");
        }
    }, [router]);

    const handleRegisterSuccess = () => {
        // Redirect to app after successful registration
        router.push("/app");
    };

    return <RegisterPage onRegisterSuccess={handleRegisterSuccess} />;
}

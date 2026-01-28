"use client";

import { useState, useRef, useEffect } from "react";
import { authAPI, type RegisterData } from "@/lib/api";
import { getUserFriendlyErrorMessage, isNetworkError } from "@/lib/errorMessages";
import { SignUpPage, type Testimonial } from "@/components/ui/sign-in";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface RegisterPageProps {
    onRegisterSuccess: () => void;
}

const sampleTestimonials: Testimonial[] = [
    {
        avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        name: "Sarah Jenkins",
        handle: "@sarahj_content",
        text: "olleey helped me reach 5 new countries in just 48 hours. The quality is insane!"
    },
    {
        avatarSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
        name: "David Chen",
        handle: "@dchen_tech",
        text: "The translation is so natural, my viewers couldn't even tell it was AI dubbed."
    }
];

export default function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Basic client-side validation
        if (!email || !email.trim()) {
            setError("Please enter your email address.");
            setIsLoading(false);
            return;
        }

        if (!password || !password.trim()) {
            setError("Please enter a password.");
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            const registerData: RegisterData = {
                email: email.trim(),
                password,
                name: name?.trim() || undefined,
            };
            await authAPI.register(registerData);
            onRegisterSuccess();
        } catch (err) {
            const friendlyMessage = getUserFriendlyErrorMessage(err);
            setError(friendlyMessage);

            // Only show alert for network errors
            if (isNetworkError(err)) {
                alert(friendlyMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
        if (GOOGLE_CLIENT_ID) {
            const authUrl = authAPI.getGoogleAuthUrl(GOOGLE_CLIENT_ID);
            window.location.href = authUrl;
        } else {
            setError("Google Sign-In is not configured.");
        }
    };

    const handleSignInClick = () => {
        router.push("/app");
    };

    return (
        <div className="bg-background text-foreground">
            {/* Back to Home Button */}
            <Link
                href="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-background/80 border border-border/50"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>

            <SignUpPage
                heroImageSrc="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=2160&q=80"
                testimonials={sampleTestimonials}
                onSignUp={handleRegister}
                onGoogleSignUp={handleGoogleSignUp}
                onSignInClick={handleSignInClick}
            />

            {/* Error display overlay */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm shadow-lg z-50 max-w-md">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <p className="font-medium mb-1">Registration failed</p>
                            <p className="text-sm leading-relaxed">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors flex-shrink-0"
                            aria-label="Close error message"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-4">
                        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-foreground">Creating account...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

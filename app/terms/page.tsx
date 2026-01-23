"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
            <div className="max-w-3xl mx-auto px-6 py-20">
                {/* Navigation */}
                <Link
                    href="/app"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Login
                </Link>

                {/* Header */}
                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Terms of Service</h1>
                    <p className="text-muted-foreground">Last updated: January 22, 2026</p>
                </header>

                {/* Content */}
                <div className="space-y-12 prose prose-invert prose-violet">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using Olleey's services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Olleey provides AI-driven video content processing and localization tools. We reserve the right to modify or discontinue any part of the service with or without notice at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You are responsible for maintaining the confidentiality of your account credentials (email, password, or Google session). You are fully responsible for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Acceptable Use</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You agree not to use Olleey to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Upload content that violates any third-party rights</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Engage in any activity that interferes with or disrupts the service</li>
                            <li>Reverse engineer or misuse's AI models</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You retain all ownership rights to the content you upload. However, by using our services, you grant Olleey a license to process and modify your content solely for the purpose of provide the service requested.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Olleey shall not be liable for any indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, or data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Governing Law</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Olleey is headquartered, without regard to its conflict of law provisions.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-24 pt-8 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground italic">
                        Connecting stories across borders. &copy; 2026 Olleey Inc.
                    </p>
                </footer>
            </div>
        </div>
    );
}

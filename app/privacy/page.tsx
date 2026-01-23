"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
            <div className="max-w-4xl mx-auto px-6 py-20">
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
                    <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last updated: January 23, 2026</p>
                    <p className="text-muted-foreground mt-2">Effective date: January 23, 2026</p>
                </header>

                {/* Content */}
                <div className="space-y-12 prose prose-invert prose-violet max-w-none">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Welcome to Olleey ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains in detail how we collect, use, disclose, and safeguard your information when you use our AI-powered video localization and dubbing platform.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            By accessing or using Olleey, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. Any changes or modifications will be effective immediately upon posting the updated Privacy Policy, and you waive the right to receive specific notice of each such change or modification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We collect several types of information from and about users of our service, including:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">2.1 Personal Information</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Information that identifies you as an individual or relates to an identifiable individual:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Account Information:</strong> Full name, email address, username, and password (encrypted)</li>
                            <li><strong>Profile Information:</strong> Profile picture, bio, preferences, and settings</li>
                            <li><strong>Contact Information:</strong> Email address for communications and notifications</li>
                            <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through third-party payment processors)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">2.2 Content and Media</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Information related to the content you upload and process:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Video Files:</strong> Original videos you upload for processing, including metadata</li>
                            <li><strong>Audio Files:</strong> Audio tracks extracted from your videos for dubbing</li>
                            <li><strong>Transcripts:</strong> Text transcriptions generated from your video content</li>
                            <li><strong>Processed Content:</strong> Dubbed videos, translated subtitles, and localized versions</li>
                            <li><strong>YouTube Data:</strong> Channel information, video metadata, and analytics when you connect your YouTube account</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">2.3 Usage Data</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Information automatically collected when you use our service:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Device Information:</strong> IP address, browser type and version, operating system, device identifiers</li>
                            <li><strong>Log Data:</strong> Access times, pages viewed, time spent on pages, links clicked</li>
                            <li><strong>Performance Data:</strong> Processing times, error logs, system performance metrics</li>
                            <li><strong>Feature Usage:</strong> Which features you use, how often, and your interaction patterns</li>
                            <li><strong>Preferences:</strong> Language preferences, theme settings, notification preferences</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">2.4 Communication Data</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Information from your communications with us, including support tickets, feedback, survey responses, and any other correspondence.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Google OAuth and Third-Party Authentication</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            When you choose to authenticate using Google Sign-In, we implement OAuth 2.0 protocol to securely access your Google account information. Here's what happens:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Information Received:</strong> We receive your email address, full name, and profile picture from Google</li>
                            <li><strong>Purpose:</strong> This information is used solely for account creation, authentication, and personalization</li>
                            <li><strong>Scope Limitations:</strong> We only request the minimum necessary permissions (email and basic profile)</li>
                            <li><strong>No Password Storage:</strong> We never receive or store your Google password</li>
                            <li><strong>YouTube Integration:</strong> If you connect your YouTube channel, we request additional permissions to access channel data, video metadata, and analytics</li>
                            <li><strong>Revocation:</strong> You can revoke our access to your Google account at any time through your Google Account settings</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed">
                            We do not access your Gmail, Google Drive, or other Google services without explicit additional permission. Our use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-violet-400 hover:text-violet-300 underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">4. How We Use Your Information</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We use the information we collect for various purposes, including:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">4.1 Service Provision</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Create and manage your account</li>
                            <li>Process your video content for dubbing and localization</li>
                            <li>Generate transcripts, translations, and dubbed audio</li>
                            <li>Sync lip movements with dubbed audio</li>
                            <li>Deliver processed content back to you</li>
                            <li>Manage your YouTube channel connections and integrations</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">4.2 Communication</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Send you service-related notifications and updates</li>
                            <li>Respond to your inquiries and support requests</li>
                            <li>Send you technical notices, security alerts, and administrative messages</li>
                            <li>Notify you about processing status and job completions</li>
                            <li>Send marketing communications (with your consent, where required)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">4.3 Improvement and Analytics</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Analyze usage patterns to improve our AI models and algorithms</li>
                            <li>Monitor and analyze trends, usage, and activities</li>
                            <li>Develop new features and services</li>
                            <li>Conduct research and development</li>
                            <li>Optimize performance and user experience</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">4.4 Security and Compliance</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Detect, prevent, and address technical issues and security threats</li>
                            <li>Protect against fraud, abuse, and illegal activity</li>
                            <li>Enforce our Terms of Service and other policies</li>
                            <li>Comply with legal obligations and regulatory requirements</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We implement comprehensive security measures to protect your information:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">5.1 Technical Safeguards</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using TLS/SSL protocols</li>
                            <li><strong>Data at Rest:</strong> Sensitive data is encrypted when stored in our databases</li>
                            <li><strong>Password Protection:</strong> Passwords are hashed using industry-standard algorithms (bcrypt)</li>
                            <li><strong>Access Controls:</strong> Role-based access controls limit who can access your data</li>
                            <li><strong>Secure Infrastructure:</strong> Our servers are hosted in secure, certified data centers</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">5.2 Organizational Safeguards</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Regular security audits and penetration testing</li>
                            <li>Employee training on data protection and privacy</li>
                            <li>Strict confidentiality agreements with all personnel</li>
                            <li>Incident response procedures for data breaches</li>
                            <li>Regular backups to prevent data loss</li>
                        </ul>

                        <p className="text-muted-foreground leading-relaxed mt-4">
                            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. In the event of a data breach, we will notify affected users in accordance with applicable laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Third-Party Services</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We integrate with the following third-party services to provide our functionality. Each service has its own privacy policy governing the use of your data:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">6.1 Google Services</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Google OAuth:</strong> For secure authentication and account creation</li>
                            <li><strong>YouTube API:</strong> To access and manage your YouTube channels, videos, and analytics</li>
                            <li><strong>Data Shared:</strong> Authentication tokens, channel IDs, video metadata</li>
                            <li><strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" className="text-violet-400 hover:text-violet-300 underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">6.2 ElevenLabs</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Purpose:</strong> AI-powered voice synthesis and dubbing</li>
                            <li><strong>Data Shared:</strong> Audio files, transcripts, target language preferences</li>
                            <li><strong>Processing:</strong> Audio is processed to generate natural-sounding dubbed voices</li>
                            <li><strong>Privacy Policy:</strong> <a href="https://elevenlabs.io/privacy" className="text-violet-400 hover:text-violet-300 underline" target="_blank" rel="noopener noreferrer">ElevenLabs Privacy Policy</a></li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">6.3 SyncLabs</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Purpose:</strong> Video lip-sync processing to match dubbed audio</li>
                            <li><strong>Data Shared:</strong> Video files, dubbed audio tracks</li>
                            <li><strong>Processing:</strong> Visual lip movements are synchronized with new audio</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">6.4 Payment Processors</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Purpose:</strong> Secure payment processing for subscriptions</li>
                            <li><strong>Data Shared:</strong> Billing information, payment method details</li>
                            <li><strong>Security:</strong> PCI-DSS compliant payment processing</li>
                            <li><strong>Note:</strong> We do not store your complete credit card information</li>
                        </ul>

                        <p className="text-muted-foreground leading-relaxed mt-4">
                            We carefully vet all third-party service providers and require them to maintain appropriate security measures. However, we are not responsible for the privacy practices of these third parties. We recommend reviewing their privacy policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Data Retention</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We retain your personal information for different periods depending on the type of data and purpose:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">7.1 Account Data</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Your account information is retained for as long as your account is active. When you delete your account:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Personal information is deleted within 30 days</li>
                            <li>Processed content is deleted within 30 days unless you've downloaded it</li>
                            <li>Some data may be retained longer if required by law or for legitimate business purposes</li>
                            <li>Anonymized usage data may be retained for analytics</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">7.2 Content Data</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Uploaded Videos:</strong> Stored during processing and for 30 days after completion</li>
                            <li><strong>Processed Content:</strong> Available for download for 90 days, then automatically deleted</li>
                            <li><strong>Temporary Files:</strong> Deleted immediately after processing completion</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">7.3 Legal Retention</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We may retain certain information longer when required by law, such as:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>Financial records for tax and accounting purposes (typically 7 years)</li>
                            <li>Data related to legal disputes until resolution</li>
                            <li>Information necessary to comply with regulatory requirements</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Cookies and Tracking Technologies</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We use cookies and similar tracking technologies to enhance your experience:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">8.1 Types of Cookies We Use</h3>
                        <ul className="list-disc pl-5 space-y-3 text-muted-foreground mb-4">
                            <li>
                                <strong>Essential Cookies:</strong> Required for basic site functionality, including:
                                <ul className="list-circle pl-5 mt-2 space-y-1">
                                    <li>Session management and authentication</li>
                                    <li>Security features and fraud prevention</li>
                                    <li>Load balancing and performance optimization</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Preference Cookies:</strong> Remember your settings and preferences:
                                <ul className="list-circle pl-5 mt-2 space-y-1">
                                    <li>Theme preferences (light/dark mode)</li>
                                    <li>Language settings</li>
                                    <li>Dashboard layout preferences</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Analytics Cookies:</strong> Help us understand how you use our service:
                                <ul className="list-circle pl-5 mt-2 space-y-1">
                                    <li>Page views and navigation patterns</li>
                                    <li>Feature usage statistics</li>
                                    <li>Performance metrics</li>
                                </ul>
                            </li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">8.2 Managing Cookies</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You have several options for managing cookies:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies</li>
                            <li><strong>Opt-Out Tools:</strong> You can opt out of analytics cookies through our settings</li>
                            <li><strong>Impact:</strong> Disabling certain cookies may limit functionality of our service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Your Privacy Rights</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Depending on your location, you may have the following rights regarding your personal data:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">9.1 Access and Portability</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you</li>
                            <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                            <li><strong>How to Request:</strong> Email privacy@olleey.com with your request</li>
                            <li><strong>Response Time:</strong> We will respond within 30 days</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">9.2 Correction and Deletion</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                            <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                            <li><strong>Account Settings:</strong> Update most information directly in your account settings</li>
                            <li><strong>Limitations:</strong> We may retain certain data if required by law</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">9.3 Processing Rights</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Right to Object:</strong> Object to processing of your personal data for certain purposes</li>
                            <li><strong>Right to Restriction:</strong> Request restriction of processing in certain circumstances</li>
                            <li><strong>Withdrawal of Consent:</strong> Withdraw consent for processing at any time</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">9.4 Regional Rights</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Additional rights may apply based on your location:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>GDPR (EU/EEA):</strong> Right to lodge a complaint with supervisory authority</li>
                            <li><strong>CCPA (California):</strong> Right to opt-out of sale of personal information (we don't sell data)</li>
                            <li><strong>Other Jurisdictions:</strong> Rights as provided by applicable local laws</li>
                        </ul>

                        <p className="text-muted-foreground leading-relaxed mt-4">
                            To exercise any of these rights, please contact us at <a href="mailto:privacy@olleey.com" className="text-violet-400 hover:text-violet-300 underline">privacy@olleey.com</a>. We may need to verify your identity before processing your request.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Children's Privacy</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Our service is not intended for children under the age of 13 (or the applicable age of digital consent in your jurisdiction). We do not knowingly collect personal information from children.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Age Requirement:</strong> You must be at least 13 years old to use Olleey</li>
                            <li><strong>Parental Consent:</strong> Users between 13-18 should have parental consent</li>
                            <li><strong>Discovery of Child Data:</strong> If we learn we've collected data from a child under 13, we will delete it immediately</li>
                            <li><strong>Parent Rights:</strong> Parents can request deletion of their child's data by contacting us</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed">
                            If you believe we have collected information from a child under 13, please contact us immediately at <a href="mailto:privacy@olleey.com" className="text-violet-400 hover:text-violet-300 underline">privacy@olleey.com</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">11. International Data Transfers</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Olleey operates globally, and your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your jurisdiction.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">11.1 Transfer Mechanisms</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            When we transfer your data internationally, we use appropriate safeguards:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Standard Contractual Clauses:</strong> EU-approved data transfer agreements</li>
                            <li><strong>Adequacy Decisions:</strong> Transfers to countries deemed adequate by regulatory authorities</li>
                            <li><strong>Encryption:</strong> All data is encrypted during transfer</li>
                            <li><strong>Data Processing Agreements:</strong> Contracts with third-party processors ensuring data protection</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">11.2 Data Locations</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Your data may be processed in the following regions:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>United States (primary data centers)</li>
                            <li>European Union (for EU users)</li>
                            <li>Third-party service provider locations (Google, ElevenLabs, SyncLabs)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Data Sharing and Disclosure</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We do not sell, rent, or trade your personal information. We may share your information only in the following limited circumstances:
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">12.1 Service Providers</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We share data with trusted third-party service providers who assist in operating our platform:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Cloud hosting and storage providers</li>
                            <li>AI processing services (ElevenLabs, SyncLabs)</li>
                            <li>Payment processors</li>
                            <li>Email and communication services</li>
                            <li>Analytics and monitoring tools</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            These providers are contractually obligated to protect your data and use it only for specified purposes.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">12.2 Legal Requirements</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We may disclose your information when required by law or to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li>Comply with legal obligations, court orders, or government requests</li>
                            <li>Enforce our Terms of Service and other agreements</li>
                            <li>Protect the rights, property, or safety of Olleey, our users, or others</li>
                            <li>Detect, prevent, or address fraud, security, or technical issues</li>
                            <li>Respond to claims of content violation</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">12.3 Business Transfers</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email and/or prominent notice on our service of any change in ownership or use of your personal information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Changes to This Privacy Policy</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">13.1 Notification of Changes</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-4">
                            <li><strong>Material Changes:</strong> We will notify you via email or prominent notice on our service</li>
                            <li><strong>Minor Changes:</strong> Updated "Last updated" date at the top of this policy</li>
                            <li><strong>Review Period:</strong> Material changes will take effect 30 days after notification</li>
                            <li><strong>Continued Use:</strong> Your continued use after changes constitutes acceptance</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-foreground mt-6">13.2 Version History</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We maintain a history of significant policy changes. You can request previous versions by contacting us at <a href="mailto:privacy@olleey.com" className="text-violet-400 hover:text-violet-300 underline">privacy@olleey.com</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-1">Privacy Inquiries</p>
                                <a href="mailto:privacy@olleey.com" className="text-violet-400 hover:text-violet-300 underline">privacy@olleey.com</a>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-1">General Support</p>
                                <a href="mailto:support@olleey.com" className="text-violet-400 hover:text-violet-300 underline">support@olleey.com</a>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-1">Data Protection Officer</p>
                                <a href="mailto:dpo@olleey.com" className="text-violet-400 hover:text-violet-300 underline">dpo@olleey.com</a>
                            </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mt-6">
                            We aim to respond to all legitimate requests within 30 days. Occasionally, it may take us longer if your request is particularly complex or you have made multiple requests. In this case, we will notify you and keep you updated.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-24 pt-8 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground italic">
                        Expanding horizons, securely. © 2026 Olleey Inc.
                    </p>
                </footer>
            </div>
        </div>
    );
}

import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import ThemeProviderWrapper from "./ThemeProviderWrapper";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ToastProvider } from "@/components/ui/use-toast";
import { ToastListener } from "@/components/ToastListener";
import { AuthProvider } from "@/lib/AuthContext";
import { AuthInitializer } from "@/components/AuthInitializer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://olleey.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Olleey | AI-Powered Global Content Automation",
    template: "%s | Olleey",
  },
  description:
    "Clone your voice, translate your videos, and reach a global audience with automated content workflows.",
  applicationName: "Olleey",
  keywords: [
    "AI video translation",
    "YouTube dubbing",
    "multilingual video localization",
    "lip sync AI",
    "content automation",
  ],
  authors: [{ name: "Olleey" }],
  creator: "Olleey",
  publisher: "Olleey",
  category: "technology",
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Olleey",
    title: "Olleey | AI-Powered Global Content Automation",
    description:
      "Automate multilingual video workflows with translation, dubbing, review guardrails, and publishing.",
    images: [
      {
        url: "/favicon/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Olleey logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olleey | AI-Powered Global Content Automation",
    description:
      "Automate multilingual video workflows with translation, dubbing, review guardrails, and publishing.",
    images: ["/favicon/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <ThemeProvider>
          <ThemeProviderWrapper>
            <ToastProvider>
              <AuthProvider>
                <AuthInitializer />
                <ToastListener />
                {children}
              </AuthProvider>
            </ToastProvider>
          </ThemeProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

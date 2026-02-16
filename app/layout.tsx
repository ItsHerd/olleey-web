import "./globals.css";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Olleey | AI-Powered Global Content Automation",
  description: "Clone your voice, translate your videos, and reach a global audience with automated content workflows.",
  manifest: "/favicon/site.webmanifest",
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

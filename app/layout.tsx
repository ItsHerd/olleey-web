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
  icons: {
    icon: "/logo-transparent.png",
    shortcut: "/logo-transparent.png",
    apple: "/logo-transparent.png",
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

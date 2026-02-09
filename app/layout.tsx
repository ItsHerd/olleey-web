import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import ThemeProviderWrapper from "./ThemeProviderWrapper";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ToastProvider } from "@/components/ui/use-toast";
import { AuthProvider } from "@/lib/AuthContext";
import { AuthInitializer } from "@/components/AuthInitializer";

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
      <body className={GeistSans.className}>
        <ThemeProvider>
          <ThemeProviderWrapper>
            <ToastProvider>
              <AuthProvider>
                <AuthInitializer />
                {children}
              </AuthProvider>
            </ToastProvider>
          </ThemeProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

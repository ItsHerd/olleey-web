import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import ThemeProviderWrapper from "./ThemeProviderWrapper";

import { ReduxProvider } from "@/components/ReduxProvider";
import { ToastProvider } from "@/components/ui/use-toast";

export const metadata: Metadata = {
  title: "Olleey | AI-Powered Global Content Automation",
  description: "Clone your voice, translate your videos, and reach a global audience with automated content workflows."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <ReduxProvider>
          <ThemeProviderWrapper>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}

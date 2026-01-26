import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import ThemeProviderWrapper from "./ThemeProviderWrapper";

import { ReduxProvider } from "@/components/ReduxProvider";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Olleey Dashboard",
  description: "Multi-language content management platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <ReduxProvider>
          <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}

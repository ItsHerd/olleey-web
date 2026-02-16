import type { Metadata } from "next";
import LandingClient from "./landing-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://olleey.com";
const title = "Olleey | AI-Powered Global Content Automation";
const description =
  "Clone your voice, translate your videos, and publish globally with automated multilingual workflows.";
const ogImage = "/favicon/android-chrome-512x512.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "Olleey",
    images: [
      {
        url: ogImage,
        width: 512,
        height: 512,
        alt: "Olleey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export default function IndexPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Olleey",
    url: siteUrl,
    logo: `${siteUrl}/favicon/android-chrome-512x512.png`,
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "hello@olleey.com",
        contactType: "customer support",
        areaServed: "Global",
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Olleey",
    url: siteUrl,
    description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <LandingClient />
    </>
  );
}

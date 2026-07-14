import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import VisitorTracker from "@/components/VisitorTracker";
import RealtimeNotifications from "@/components/RealtimeNotifications";
import KBOAI from "@/components/KBOAI";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://kbo.example.com"),
  title: {
    default: "Khairi Bouzakher | Full Stack Developer & AI Specialist",
    template: "%s | Khairi Bouzakher",
  },
  description: "Portfolio of Khairi Bouzakher — Full Stack Developer, AI enthusiast, and creative technologist from Tunisia. Building modern, performant web experiences.",
  keywords: ["Khairi Bouzakher", "Full Stack Developer", "Web Developer", "AI Developer", "Portfolio", "Next.js", "React", "TypeScript", "Tunisia"],
  authors: [{ name: "Khairi Bouzakher" }],
  creator: "Khairi Bouzakher",
  publisher: "Khairi Bouzakher",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/photo/khairibo.png", sizes: "32x32", type: "image/png" },
      { url: "/photo/khairibo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/photo/khairibo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kbo.example.com",
    title: "Khairi Bouzakher | Full Stack Developer & AI Specialist",
    description: "Portfolio of Khairi Bouzakher — Full Stack Developer, AI enthusiast, and creative technologist from Tunisia.",
    siteName: "KBO Portfolio",
    images: [
      {
        url: "/photo/khairibo.png",
        width: 1200,
        height: 630,
        alt: "Khairi Bouzakher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khairi Bouzakher | Full Stack Developer & AI Specialist",
    description: "Portfolio of Khairi Bouzakher — Full Stack Developer, AI enthusiast, and creative technologist from Tunisia.",
    images: ["/photo/khairibo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://kbo.example.com",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Khairi Bouzakher",
              url: "https://kbo.example.com",
              image: "https://kbo.example.com/photo/khairibo.png",
              jobTitle: "Full Stack Developer",
              description: "Full Stack Developer and AI enthusiast building modern web experiences.",
              sameAs: [
                "https://github.com/KHAIRIBO",
                "https://www.linkedin.com/in/khairi-bouzakher/",
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Tunisia",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900 selection:bg-blue-100`}>
        <VisitorTracker />
        <RealtimeNotifications />
        <KBOAI />
        {children}
      </body>
    </html>
  );
}

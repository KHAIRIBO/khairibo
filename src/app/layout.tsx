import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import VisitorTracker from "@/components/VisitorTracker";
import RealtimeNotifications from "@/components/RealtimeNotifications";
import KBOAI from "@/components/KBOAI";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "KHAIRI | Premium Portfolio",
  description: "Senior Full Stack Developer & UI Designer",
  icons: {
    icon: [
      { url: "/photo/khairibo.png" },
    ],
    apple: [
      { url: "/photo/khairibo.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900 selection:bg-blue-100`}>
        <VisitorTracker />
        <RealtimeNotifications />
        <KBOAI />
        {children}
      </body>
    </html>
  );
}

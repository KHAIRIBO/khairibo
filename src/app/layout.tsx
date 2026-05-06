import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Khairi Bouzakher | Web & AI Developer",
  description: "Modern portfolio of Khairi Bouzakher, showcasing Web Development and AI integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900 selection:bg-blue-100`}>
        {children}
      </body>
    </html>
  );
}

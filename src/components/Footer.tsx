"use client";

import { Mail, Heart } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/BrandIcons";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <h2 className="text-2xl font-bold tracking-tight mb-3">Khairi.</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full Stack Developer & AI Enthusiast. Building fast, modern, and beautiful digital experiences from Tunisia.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-3">
            {["About", "Skills", "Projects", "Services", "Contact"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                {link}
              </a>
            ))}
            <a
              href="/Khairi_Bouzakher_CV.pdf"
              download
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Download CV
            </a>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Let's Connect</p>
            <div className="flex gap-4">
              <a
                href="https://github.com/KHAIRIBO"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-white transition-all hover:-translate-y-1"
              >
                <GitHubIcon size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/khairi-bouzakher/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-all hover:-translate-y-1"
              >
                <LinkedInIcon size={18} />
              </a>
              <a
                href="mailto:khairibo32@gmail.com"
                className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:border-red-400 hover:text-red-400 transition-all hover:-translate-y-1"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} Khairi Bouzakher. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart size={14} className="text-red-400 fill-red-400 animate-pulse" /> using Next.js & Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
}

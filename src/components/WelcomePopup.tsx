"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, FolderGit2, Bot, ArrowRight, Sun, Thermometer, ExternalLink } from "lucide-react";
import { GitHubIcon } from "@/components/BrandIcons";

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Automatically trigger pop-up on page refresh/mount after loading screen
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99990] flex items-center justify-center p-4"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[99995] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200/80 relative overflow-hidden text-slate-900"
            >
              {/* Background Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors z-10"
                title="Close modal"
              >
                <X size={20} />
              </button>

              {/* Header Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100">
                <Sparkles size={13} className="text-amber-500" />
                <span>Welcome to KBO Developer Hub</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
                Explore Projects & Live Weather
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed font-medium">
                Welcome! Check out live weather forecasting, GitHub repositories, and AI assistant integration.
              </p>

              {/* Feature Highlights Grid */}
              <div className="space-y-2.5 mb-6">
                {/* Highlight 1: Live Weather */}
                <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Thermometer size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">Live Weather Tracking</h4>
                      <p className="text-[11px] text-slate-500">Tunisia 🇹🇳 • Paris 🇫🇷 • New York 🇺🇸 • Germany 🇩🇪</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                    LIVE
                  </span>
                </div>

                {/* Highlight 2: GitHub Showcase */}
                <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <GitHubIcon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">Official GitHub Repositories</h4>
                      <p className="text-[11px] text-slate-500">Live Weather, Dbrtna Cuisine 🇹🇳, Budget Analytics</p>
                    </div>
                  </div>
                  <a
                    href="#projects"
                    onClick={handleClose}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    View <ArrowRight size={12} />
                  </a>
                </div>

                {/* Highlight 3: AI Assistant */}
                <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">KBO AI Assistant</h4>
                      <p className="text-[11px] text-slate-500">Interactive digital twin to answer developer questions</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                    AI Ready
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Explore Portfolio</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

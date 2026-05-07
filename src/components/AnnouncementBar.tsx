"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="relative z-[101] bg-slate-900 text-white py-2 px-6 overflow-hidden border-b border-white/5"
    >
      {/* Ultra-subtle Animated Gradient */}
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,#3b82f6,#8b5cf6,#ec4899,#3b82f6)] bg-[length:200%_200%] animate-gradient-slow" />
      
      <div className="max-w-7xl mx-auto relative flex items-center justify-center gap-6 text-[13px] font-bold tracking-tight">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
          <p className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-300" />
            <span className="opacity-90">Experience the all-new</span>
            <span className="text-white font-black underline decoration-blue-500/50 underline-offset-4">KBO Private Dashboard</span>
          </p>
        </div>
        
        <a 
          href="#projects" 
          className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white text-slate-900 sm:text-white sm:hover:text-slate-900 rounded-full transition-all group border border-white/10 hover:border-white shadow-sm active:scale-95"
        >
          <span>Launch Center</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-0 p-1.5 hover:bg-white/10 rounded-full transition-all text-white/30 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}

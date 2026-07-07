"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";

interface OmokaClientPageProps {
  htmlContent: string;
}

export default function OmokaClientPage({ htmlContent }: OmokaClientPageProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsSubmitting(true);

    // Short timeout to create a premium verification feeling
    setTimeout(() => {
      if (password === "omoka2026") {
        setIsAuthenticated(true);
      } else {
        setError(true);
        setIsSubmitting(false);
      }
    }, 800);
  };

  if (isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-screen h-screen overflow-hidden bg-[#1c1611]"
      >
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full border-none"
          title="Omoka Amsterdam"
        />
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#1c1611] text-[#f2e8d5] overflow-hidden font-serif selection:bg-[#a8452f] selection:text-[#f2e8d5]">
      {/* Decorative textured backdrop matching proposal */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(115deg, #c89b3c 0px, #c89b3c 2px, transparent 2px, transparent 46px),
              repeating-linear-gradient(25deg, #a8452f 0px, #a8452f 2px, transparent 2px, transparent 60px)
            `
          }}
        />
      </div>

      {/* Floating abstract glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a8452f]/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c89b3c]/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />

      <main className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-[#241d16]/90 border border-[#f2e8d5]/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle gold line on top */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#c89b3c] to-transparent" />

          {/* Header section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1c1611] border border-[#c89b3c]/30 text-[#c89b3c] mb-4 relative"
            >
              <Lock className="w-6 h-6" />
              <motion.div 
                className="absolute inset-0 rounded-full border border-[#a8452f]/40"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <span className="block text-xs uppercase tracking-[0.25em] text-[#c89b3c] mb-1 font-sans">
              Secure Access
            </span>
            <h1 className="text-3xl font-normal text-[#f2e8d5] tracking-tight">
              Project Num 25
            </h1>
            <p className="text-xs text-[#d8c8a8]/60 mt-2 font-sans">
              Please enter the password to view this proposal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-xs uppercase tracking-wider text-[#d8c8a8]/80 font-sans"
              >
                Password
              </label>
              
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  disabled={isSubmitting}
                  className={`w-full bg-[#1c1611] border ${
                    error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-[#f2e8d5]/15 focus:border-[#c89b3c] focus:ring-[#c89b3c]/20"
                  } rounded-lg py-3 pl-4 pr-12 text-[#f2e8d5] placeholder-[#d8c8a8]/30 font-sans text-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="••••••••••••"
                  autoFocus
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d8c8a8]/50 hover:text-[#f2e8d5] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-400 text-xs font-sans bg-red-950/20 border border-red-900/30 rounded-md p-3"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Incorrect password. Access denied.</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="w-full relative group overflow-hidden bg-[#a8452f] disabled:bg-[#a8452f]/45 disabled:cursor-not-allowed hover:bg-[#b94e36] text-[#f2e8d5] font-sans text-sm font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#f2e8d5] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  <span>Decrypt Proposal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}

              {/* Decorative hover sparkle effect */}
              {!isSubmitting && password && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#f2e8d5]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-[10px] tracking-widest uppercase text-[#d8c8a8]/40 mt-8 font-sans">
          Omoka Amsterdam • Confidential Draft
        </p>
      </main>
    </div>
  );
}

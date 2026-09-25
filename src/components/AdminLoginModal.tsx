"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const ACCESS_CODE = "6cc4aca9df";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setIsSuccess(true);
      setError(false);
      // Store session and token
      localStorage.setItem("admin_session", "active");
      localStorage.setItem("admin_token", code);
      setTimeout(() => {
        router.push("/admin");
        onClose();
      }, 1000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setCode("");
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                <ShieldCheck size={24} />
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 pt-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Private Access</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Enter your secure access code to manage the KBO control center.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <motion.input
                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter access code..."
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border transition-all outline-none text-lg font-medium tracking-widest ${
                      error 
                        ? "border-red-500 ring-4 ring-red-500/10" 
                        : "border-slate-100 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
                    } ${isSuccess ? "border-green-500 text-green-600" : "text-slate-900"}`}
                  />
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm font-medium px-2"
                  >
                    <AlertCircle size={16} />
                    Invalid access code. Please try again.
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSuccess}
                  className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group ${
                    isSuccess 
                      ? "bg-green-500 shadow-green-500/20" 
                      : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
                  }`}
                >
                  {isSuccess ? (
                    "Access Granted"
                  ) : (
                    <>
                      Verify Identity
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

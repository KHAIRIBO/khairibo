"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: code }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        setErrorMsg(null);
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_session", "active");
          if (data.token) localStorage.setItem("admin_token", data.token);
        }
        setTimeout(() => {
          router.push("/admin");
          onClose();
          setIsSuccess(false);
          setCode("");
        }, 900);
      } else {
        setIsSuccess(false);
        setErrorMsg(data.error || "Authentication failed. Check your password.");
        if (res.status === 429 || data.locked) {
          setIsLocked(true);
        }
        setCode("");
      }
    } catch {
      setErrorMsg("Network error connecting to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Top gradient accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#b8ff4d] via-[#64d9ff] to-[#b8ff4d]" />

            {/* Header */}
            <div className="p-7 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-[#b8ff4d] shadow-lg shadow-black/20 border border-slate-800">
                <ShieldCheck size={24} />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-7 pt-5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                Control Center
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Enter your administrative key to unlock the SaaS management dashboard.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <motion.input
                    animate={errorMsg ? { x: [-10, 10, -8, 8, 0] } : {}}
                    type="password"
                    disabled={isLoading || isLocked}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter access code..."
                    autoFocus
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border transition-all outline-none text-base font-medium tracking-wider ${
                      errorMsg
                        ? "border-red-500 ring-4 ring-red-500/10 text-red-600 dark:text-red-400"
                        : "border-slate-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-white focus:ring-4 focus:ring-slate-900/5 text-slate-900 dark:text-white"
                    } ${isSuccess ? "border-emerald-500 text-emerald-600" : ""}`}
                  />
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 text-red-500 text-xs font-semibold px-2 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isLocked || isSuccess}
                  className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                    isSuccess
                      ? "bg-emerald-500 shadow-emerald-500/20"
                      : isLocked
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-[#101312] hover:bg-slate-800 shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-[#b8ff4d]" />
                      <span>Verifying...</span>
                    </>
                  ) : isSuccess ? (
                    "Access Granted ✓"
                  ) : (
                    <>
                      <span>Unlock Dashboard</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

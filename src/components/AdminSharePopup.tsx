"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Download, Ban, Eye, FileText, File, FileCode, ImageIcon, Check, Copy } from "lucide-react";

interface SharedItem {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  content?: string;
  allow_download?: boolean;
  created_at: string;
}

export default function AdminSharePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [latestItem, setLatestItem] = useState<SharedItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLatestAdminShare();
  }, []);

  const fetchLatestAdminShare = async () => {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const newest = data[0];
        // Check if user has already seen this specific file id in this session
        const seenId = sessionStorage.getItem("kbo_seen_share_id");
        if (seenId !== newest.id) {
          setLatestItem(newest);
          // Show popup 1s after page load
          const timer = setTimeout(() => setIsOpen(true), 1000);
          return () => clearTimeout(timer);
        }
      }
    } catch (e) {
      console.error("Failed to check admin share popup", e);
    }
  };

  const handleClose = () => {
    if (latestItem) {
      sessionStorage.setItem("kbo_seen_share_id", latestItem.id);
    }
    setIsOpen(false);
  };

  const copyContent = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (type: string = "") => {
    if (type.startsWith("image/")) return <ImageIcon size={28} className="text-blue-500" />;
    if (type.includes("pdf") || type.includes("text")) return <FileText size={28} className="text-emerald-500" />;
    if (type.includes("json") || type.includes("javascript")) return <FileCode size={28} className="text-amber-500" />;
    return <File size={28} className="text-slate-500" />;
  };

  if (!latestItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[99990] flex items-center justify-center p-4"
          />

          {/* Modal Card */}
          <div className="fixed inset-0 z-[99995] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md sm:max-w-lg w-full shadow-2xl border border-slate-200 relative overflow-hidden text-slate-900 flex flex-col max-h-[85vh]"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors z-10"
                title="Close"
              >
                <X size={20} />
              </button>

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100 w-fit">
                <Share2 size={13} className="text-blue-600" />
                <span>Admin Shared a Resource</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1 truncate">
                {latestItem.name}
              </h2>

              <p className="text-xs text-slate-400 font-medium mb-4">
                Shared on {new Date(latestItem.created_at).toLocaleDateString()} • {latestItem.size}
              </p>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto my-2 space-y-3 pr-1">
                {/* Permission status banner */}
                {latestItem.allow_download === false ? (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-amber-900 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Ban size={14} className="text-amber-600" />
                      View Only Mode — Download Disabled
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] uppercase font-bold">Read Only</span>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-between text-blue-900 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Download size={14} className="text-blue-600" />
                      Download Allowed
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] uppercase font-bold">Permitted</span>
                  </div>
                )}

                {/* Content preview if text or image */}
                {latestItem.content ? (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shared Text Note</span>
                      <button
                        onClick={() => copyContent(latestItem.content)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {latestItem.content}
                    </pre>
                  </div>
                ) : latestItem.url && latestItem.type?.startsWith("image/") ? (
                  <div className="rounded-xl overflow-hidden bg-slate-900 p-2">
                    <img src={latestItem.url} alt={latestItem.name} className="w-full h-auto max-h-56 object-contain rounded-lg" />
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-xs">
                      {getFileIcon(latestItem.type)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{latestItem.name}</p>
                      <p className="text-[11px] text-slate-400">{latestItem.size}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5 mt-2">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors ml-auto"
                >
                  Close
                </button>

                {latestItem.allow_download !== false && latestItem.url && (
                  <a
                    href={latestItem.url}
                    download={latestItem.name}
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    Download File
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

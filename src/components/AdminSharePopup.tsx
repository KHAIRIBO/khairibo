"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Download,
  Ban,
  Eye,
  FileText,
  File,
  FileCode,
  ImageIcon,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SharedItem {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  content?: string;
  allow_download?: boolean;
  share_in_popup?: boolean;
  public?: boolean;
  created_at: string;
}

export default function AdminSharePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [popupItems, setPopupItems] = useState<SharedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    fetchAdminSharesForPopup();
  }, []);

  const fetchAdminSharesForPopup = async () => {
    try {
      // Query ONLY files configured to share in index pop-up
      const res = await fetch("/api/files?popup=true");
      const data = await res.json();

      if (Array.isArray(data)) {
        // Strict filter: only items where share_in_popup is explicitly true and public is not false
        const activeItems = data.filter(
          (item: SharedItem) => item.share_in_popup === true && item.public !== false
        );

        if (activeItems.length > 0) {
          setPopupItems(activeItems);
          const current = activeItems[0];
          const seenId = sessionStorage.getItem("kbo_seen_share_id");

          // Only auto-open if user hasn't dismissed this specific item in this session
          if (seenId !== current.id) {
            const timer = setTimeout(() => setIsOpen(true), 1200);
            return () => clearTimeout(timer);
          } else {
            setHasDismissed(true);
          }
        } else {
          // If no item is shared to index popup, ensure popup stays closed
          setPopupItems([]);
          setIsOpen(false);
        }
      }
    } catch (e) {
      console.error("Failed to check admin share popup", e);
    }
  };

  const currentItem: SharedItem | undefined = popupItems[currentIndex];

  const handleClose = () => {
    if (currentItem) {
      sessionStorage.setItem("kbo_seen_share_id", currentItem.id);
    }
    setHasDismissed(true);
    setIsOpen(false);
  };

  const handleReopen = () => {
    setIsOpen(true);
  };

  const copyContent = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentItem || currentItem.allow_download === false) return;

    // If text snippet without separate URL, download as text file blob
    if (currentItem.content && (!currentItem.url || currentItem.type?.includes("text"))) {
      const blob = new Blob([currentItem.content], { type: currentItem.type || "text/plain" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = currentItem.name.includes(".") ? currentItem.name : `${currentItem.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      return;
    }

    // If file has URL (data URL or storage link)
    if (currentItem.url) {
      const link = document.createElement("a");
      link.href = currentItem.url;
      link.download = currentItem.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (type: string = "") => {
    if (type.startsWith("image/")) return <ImageIcon size={26} className="text-blue-500" />;
    if (type.includes("pdf") || type.includes("text")) return <FileText size={26} className="text-emerald-500" />;
    if (type.includes("json") || type.includes("javascript")) return <FileCode size={26} className="text-amber-500" />;
    return <File size={26} className="text-slate-500" />;
  };

  // If no items are configured by admin to share in popup, render nothing!
  if (!popupItems || popupItems.length === 0 || !currentItem) {
    return null;
  }

  return (
    <>
      {/* Floating pill activator when popup is closed so visitor can reopen if they want */}
      <AnimatePresence>
        {!isOpen && hasDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[99980]"
          >
            <button
              onClick={handleReopen}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/50 text-xs font-bold transition-all hover:scale-105 active:scale-95 group"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <Share2 size={14} className="text-blue-400" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {currentItem.name}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px]">
                {currentItem.allow_download === false ? "See Only" : "Download"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[99990] flex items-center justify-center p-4"
            />

            {/* Modal Card */}
            <div className="fixed inset-0 z-[99995] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto bg-white rounded-3xl p-5 sm:p-7 max-w-md sm:max-w-lg w-full shadow-2xl border border-slate-200/90 relative overflow-hidden text-slate-900 flex flex-col max-h-[88vh]"
              >
                {/* Top Accent Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors z-10"
                  title="Close popup"
                >
                  <X size={20} />
                </button>

                {/* Top Header Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 w-fit">
                    <Sparkles size={13} className="text-blue-600" />
                    <span>Resource Shared by Admin</span>
                  </div>

                  {popupItems.length > 1 && (
                    <span className="text-xs text-slate-400 font-semibold">
                      {currentIndex + 1} of {popupItems.length}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mb-1 truncate pr-8">
                  {currentItem.name}
                </h2>

                <p className="text-xs text-slate-400 font-medium mb-3">
                  {currentItem.size} • Shared on {new Date(currentItem.created_at).toLocaleDateString()}
                </p>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto my-2 space-y-3 pr-1">
                  {/* Permission Mode Banner */}
                  {currentItem.allow_download === false ? (
                    <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between text-amber-950 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <Ban size={13} className="text-amber-700" />
                        </div>
                        <span>See Only Mode — Download Disabled</span>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded-md text-[10px] uppercase font-black">
                        View Only
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200/90 rounded-2xl flex items-center justify-between text-blue-950 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Download size={13} className="text-blue-700" />
                        </div>
                        <span>Download Allowed — You can save this file</span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-200/70 text-blue-900 rounded-md text-[10px] uppercase font-black">
                        Downloadable
                      </span>
                    </div>
                  )}

                  {/* Content Preview */}
                  {currentItem.content ? (
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Shared Content Preview
                        </span>
                        <button
                          onClick={() => copyContent(currentItem.content)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto border border-slate-800 shadow-inner">
                        {currentItem.content}
                      </pre>
                    </div>
                  ) : currentItem.url && currentItem.type?.startsWith("image/") ? (
                    <div className="rounded-2xl overflow-hidden bg-slate-950 p-2 flex items-center justify-center border border-slate-200">
                      <img
                        src={currentItem.url}
                        alt={currentItem.name}
                        className="w-full h-auto max-h-56 object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3.5">
                      <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100">
                        {getFileIcon(currentItem.type)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentItem.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{currentItem.size} • {currentItem.type || "Document"}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multi-item pagination footer if admin shared more than 1 item */}
                {popupItems.length > 1 && (
                  <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : popupItems.length - 1))}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <div className="flex gap-1">
                      {popupItems.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentIndex === i ? "bg-blue-600 w-4" : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentIndex((prev) => (prev < popupItems.length - 1 ? prev + 1 : 0))}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Action Buttons: strictly check allow_download */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-1">
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Close
                  </button>

                  {/* ONLY show download button if allow_download is NOT false */}
                  {currentItem.allow_download !== false ? (
                    <button
                      onClick={handleDownload}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer hover:shadow-blue-500/25 active:scale-95"
                    >
                      <Download size={15} />
                      Download {currentItem.content && (!currentItem.url || currentItem.type?.includes("text")) ? "Note" : "File"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-[11px] text-slate-500 font-bold">
                      <Eye size={13} />
                      View Only Enabled
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

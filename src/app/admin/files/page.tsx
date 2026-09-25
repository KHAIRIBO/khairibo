"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Image as ImageIcon,
  FileText,
  X,
  Trash2,
  Eye,
  Cloud,
  FileCode,
  Download,
  Globe,
  Lock,
  Share2,
  Check,
  Ban,
  Copy,
  Type,
  Paperclip,
  Sparkles,
  ShieldCheck,
  Database,
  Terminal,
  ExternalLink,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface SharedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  content?: string;
  created_at: string;
  public: boolean;
  allow_download: boolean;
  share_in_popup: boolean;
  is_text?: boolean;
}

export default function FilesPage() {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Unified share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTab, setShareTab] = useState<"text" | "file">("file");
  const [allowDownload, setAllowDownload] = useState(true);
  const [shareInPopup, setShareInPopup] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Text snippet fields
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetText, setSnippetText] = useState("");

  // File upload fields
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Preview Popup Modal
  const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Retrieve admin token
  const getAdminHeaders = (): HeadersInit => {
    const token =
      (typeof window !== "undefined" && localStorage.getItem("admin_token")) ||
      "6cc4aca9df";
    const session =
      (typeof window !== "undefined" && localStorage.getItem("admin_session")) ||
      "active";

    return {
      "Content-Type": "application/json",
      "x-admin-key": token,
      "x-admin-session": session,
      Authorization: `Bearer ${token}`,
    };
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Pass all=true with admin auth so admin gets all files including private ones
      const res = await fetch("/api/files?all=true", {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setFiles(data);
        setLoading(false);
        return;
      }
    } catch {
      /* fallback */
    }

    if (supabase) {
      try {
        const { data } = await supabase
          .from("files")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) {
          setFiles(
            data.map((item: any) => ({
              ...item,
              public: item.public !== false,
              allow_download: item.allow_download !== false,
              share_in_popup: item.share_in_popup === true,
            }))
          );
        }
      } catch (err) {
        console.warn("Supabase fetch fallback:", err);
      }
    }
    setLoading(false);
  };

  const openShareModal = () => {
    setShareTab("file");
    setSnippetTitle("");
    setSnippetText("");
    setPickedFile(null);
    setAllowDownload(true);
    setShareInPopup(false);
    setIsPublic(true);
    setIsShareModalOpen(true);
  };

  // ── TOGGLE: Public / Private in Downloads ──────────────────────────────────
  const togglePublic = async (id: string, currentPublic: boolean) => {
    const nextVal = !currentPublic;
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, public: nextVal } : f))
    );

    try {
      await fetch("/api/files", {
        method: "PATCH",
        headers: getAdminHeaders(),
        body: JSON.stringify({ id, public: nextVal }),
      });
      showToast(nextVal ? "Visible on Downloads page" : "Set to Private");
    } catch (e) {
      console.error(e);
    }
  };

  // ── TOGGLE: Download vs See Only ──────────────────────────────────────────
  const toggleAllowDownload = async (id: string, current: boolean) => {
    const nextVal = !current;
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, allow_download: nextVal } : f))
    );

    try {
      await fetch("/api/files", {
        method: "PATCH",
        headers: getAdminHeaders(),
        body: JSON.stringify({ id, allow_download: nextVal }),
      });
      showToast(
        nextVal ? "Downloads Allowed for users" : "Set to See Only (Download Disabled)"
      );
    } catch (e) {
      console.error(e);
    }
  };

  // ── TOGGLE: Share with users in Index Pop-up ───────────────────────────────
  const toggleShareInPopup = async (id: string, currentPopup: boolean) => {
    const nextVal = !currentPopup;
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, share_in_popup: nextVal } : f))
    );

    try {
      await fetch("/api/files", {
        method: "PATCH",
        headers: getAdminHeaders(),
        body: JSON.stringify({ id, share_in_popup: nextVal }),
      });
      showToast(
        nextVal
          ? "🌟 Now sharing with users in Index Pop-up!"
          : "Removed from Index Pop-up"
      );
    } catch (e) {
      console.error(e);
    }
  };

  // ── SUBMIT: Text snippet ───────────────────────────────────────────────────
  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetText.trim()) return;

    const payload = {
      name: snippetTitle.endsWith(".txt") ? snippetTitle : `${snippetTitle}.txt`,
      size: `${(snippetText.length / 1024).toFixed(2)} KB`,
      type: "text/plain",
      url: "",
      content: snippetText,
      public: isPublic,
      allow_download: allowDownload,
      share_in_popup: shareInPopup,
      is_text: true,
    };

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.id) {
        setFiles((prev) => [data, ...prev]);
        showToast("Note successfully saved to database!");
      }
    } catch (err) {
      console.error(err);
    }

    setIsShareModalOpen(false);
  };

  // ── SUBMIT: File upload to database ───────────────────────────────────────
  const handleSubmitFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedFile) return;

    setUploading(true);
    setProgress(15);

    try {
      // 1. Convert file to Base64 Data URL so it is 100% saved in database even without Supabase storage
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(pickedFile);
      });

      setProgress(45);

      // 2. If Supabase storage is configured, also attempt direct storage upload
      let publicUrl = fileDataUrl;
      const fileExt = pickedFile.name.split(".").pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      if (supabase) {
        try {
          const { data: storageData } = await supabase.storage
            .from("assets")
            .upload(uniqueFileName, pickedFile);

          if (storageData) {
            const { data: urlData } = supabase.storage
              .from("assets")
              .getPublicUrl(uniqueFileName);
            if (urlData?.publicUrl) {
              publicUrl = urlData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn("Storage upload fallback to Data URL:", storageErr);
        }
      }

      setProgress(75);

      const fileItem = {
        name: pickedFile.name,
        size:
          pickedFile.size < 1024 * 1024
            ? `${(pickedFile.size / 1024).toFixed(1)} KB`
            : `${(pickedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        type: pickedFile.type || "application/octet-stream",
        url: publicUrl,
        content: pickedFile.type.startsWith("text/") ? "" : "",
        public: isPublic,
        allow_download: allowDownload,
        share_in_popup: shareInPopup,
      };

      // 3. Post to API with Admin security headers
      const res = await fetch("/api/files", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify(fileItem),
      });

      const saved = await res.json();
      if (saved?.id) {
        setFiles((prev) => [saved, ...prev]);
        showToast("File uploaded and saved to database successfully!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Error saving file. Check connection.");
    } finally {
      setProgress(100);
      setUploading(false);
      setPickedFile(null);
      setIsShareModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource from the database?"))
      return;

    // Optimistically remove from UI
    setFiles((prev) => prev.filter((f) => f.id !== id));

    try {
      await fetch(`/api/files?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      showToast("Deleted from database");
    } catch (err) {
      console.error("Failed to delete file", err);
    }
  };

  const getFileIcon = (type: string, size = 22) => {
    if (type.startsWith("image/")) return <ImageIcon size={size} className="text-blue-500" />;
    if (type.includes("pdf") || type.includes("text")) return <FileText size={size} className="text-emerald-500" />;
    if (type.includes("json") || type.includes("javascript")) return <FileCode size={size} className="text-amber-500" />;
    return <File size={size} className="text-slate-500" />;
  };

  const copyShareLink = (file: SharedFile) => {
    navigator.clipboard.writeText(`${window.location.origin}/downloads`);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copySqlCode = () => {
    const sql = `-- Supabase Postgres Setup for files
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT DEFAULT '',
  content TEXT DEFAULT '',
  public BOOLEAN DEFAULT true,
  allow_download BOOLEAN DEFAULT true,
  share_in_popup BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table is already present:
ALTER TABLE files ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT true;
ALTER TABLE files ADD COLUMN IF NOT EXISTS share_in_popup BOOLEAN DEFAULT false;`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setPickedFile(f);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[300] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 text-xs font-bold"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/80">
              <ShieldCheck size={12} /> Admin Database Access Only
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            File &amp; Text Sharing Center
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Upload to database (only you) • Share in Index Pop-up • Control Download vs See-Only permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-xs transition-all shadow-xs"
            title="View Supabase SQL schema"
          >
            <Database size={15} className="text-blue-600" />
            Database Setup
          </button>

          <button
            onClick={openShareModal}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-blue-500/25 active:scale-95"
          >
            <Share2 size={18} />
            Share Resource
          </button>
        </div>
      </div>

      {/* Database Status Info Banner */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 p-4 sm:p-5 rounded-3xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Cloud size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Secure Cloud &amp; Local Database
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              Only you as authenticated admin can upload or change file visibility. Files persist in database and sync instantly.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>{files.length} Resources Stored</span>
        </div>
      </div>

      {/* Shared Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
            <Cloud size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Nothing shared yet</h3>
          <p className="text-slate-400 text-xs font-medium max-w-sm">
            Click &quot;Share Resource&quot; to upload your first file or code/text note to the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                file.share_in_popup
                  ? "border-blue-300 ring-2 ring-blue-500/10"
                  : "border-slate-200"
              }`}
            >
              <div>
                {/* Top action row */}
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-700 shrink-0">
                    {getFileIcon(file.type)}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Public / Private toggle */}
                    <button
                      onClick={() => togglePublic(file.id, file.public)}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        file.public
                          ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          : "text-slate-400 bg-slate-100 hover:bg-slate-200"
                      }`}
                      title={file.public ? "Public on /downloads" : "Private (Hidden from downloads)"}
                    >
                      {file.public ? <Globe size={15} /> : <Lock size={15} />}
                    </button>

                    {/* Download vs See Only toggle */}
                    <button
                      onClick={() =>
                        toggleAllowDownload(file.id, file.allow_download !== false)
                      }
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        file.allow_download !== false
                          ? "bg-blue-50 text-blue-700 border border-blue-200/90 hover:bg-blue-100"
                          : "bg-amber-50 text-amber-700 border border-amber-200/90 hover:bg-amber-100"
                      }`}
                      title="Click to toggle between Download Allowed and See Only"
                    >
                      {file.allow_download !== false ? (
                        <>
                          <Download size={12} />
                          <span>Download</span>
                        </>
                      ) : (
                        <>
                          <Ban size={12} />
                          <span>See Only</span>
                        </>
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete from database"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Index Pop-up Toggle Button */}
                <div className="mb-3.5">
                  <button
                    onClick={() =>
                      toggleShareInPopup(file.id, file.share_in_popup === true)
                    }
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      file.share_in_popup
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/80"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className={file.share_in_popup ? "text-amber-300" : "text-slate-400"} />
                      {file.share_in_popup ? "Live in Index Pop-up" : "Share in Index Pop-up"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                        file.share_in_popup
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {file.share_in_popup ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>

                <h4
                  className="font-bold text-slate-900 truncate mb-1 text-sm"
                  title={file.name}
                >
                  {file.name}
                </h4>
                <p className="text-slate-400 text-xs font-medium mb-3">
                  {file.size} • {new Date(file.created_at).toLocaleDateString()}
                </p>

                {file.content && (
                  <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 font-mono line-clamp-3 mb-4 border border-slate-100">
                    {file.content}
                  </div>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setPreviewFile(file)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                  Test Pop-up Preview
                </button>
                <button
                  onClick={() => copyShareLink(file)}
                  className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  title="Copy share link"
                >
                  {copiedId === file.id ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Unified Share Modal (Upload File or Text Snippet) ── */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Accent top stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Share2 size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Upload Resource to Database
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Admin only • Set download permission &amp; index pop-up visibility
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex bg-slate-100 rounded-2xl p-1 mb-5 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShareTab("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    shareTab === "file"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Paperclip size={14} />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setShareTab("text")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    shareTab === "text"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Type size={14} />
                  Text / Snippet
                </button>
              </div>

              {/* Scrollable form body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* ── FILE TAB ── */}
                {shareTab === "file" && (
                  <form onSubmit={handleSubmitFile} id="file-form" className="space-y-4">
                    {/* Drop zone */}
                    <div
                      ref={dropRef}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-blue-500 bg-blue-50"
                          : pickedFile
                          ? "border-emerald-400 bg-emerald-50/50"
                          : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) =>
                          e.target.files?.[0] && setPickedFile(e.target.files[0])
                        }
                        className="hidden"
                      />

                      {pickedFile ? (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
                            {getFileIcon(pickedFile.type, 24)}
                          </div>
                          <p className="font-bold text-sm text-slate-900 truncate max-w-full px-4">
                            {pickedFile.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {(pickedFile.size / 1024).toFixed(1)} KB • Ready to save
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPickedFile(null);
                            }}
                            className="mt-2 text-xs text-red-500 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                            <Upload size={24} />
                          </div>
                          <p className="font-bold text-sm text-slate-700">
                            Drop file here or click to browse
                          </p>
                          <p className="text-xs text-slate-400 mt-1 font-medium">
                            PDF, Images, ZIP, DOC, Code, etc.
                          </p>
                        </>
                      )}

                      {/* Progress overlay */}
                      {uploading && (
                        <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4">
                          <p className="text-sm font-bold text-slate-900 mb-2">
                            Saving to Database… {progress}%
                          </p>
                          <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                )}

                {/* ── TEXT TAB ── */}
                {shareTab === "text" && (
                  <form onSubmit={handleSubmitText} id="text-form" className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Snippet Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Instructions.txt or API-Notes"
                        value={snippetTitle}
                        onChange={(e) => setSnippetTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Text / Code Content
                      </label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Paste text, code, or announcement notes here..."
                        value={snippetText}
                        onChange={(e) => setSnippetText(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      />
                    </div>
                  </form>
                )}

                {/* ── PERMISSION 1: Download vs See Only ── */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      User Permission
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Can download or see only
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setAllowDownload(true)}
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all text-left ${
                        allowDownload
                          ? "bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60"
                      }`}
                    >
                      <Download size={16} className={allowDownload ? "text-blue-600" : "text-slate-400"} />
                      <div>
                        <div className="text-xs font-bold">Allow Download</div>
                        <div className="text-[10px] text-slate-400 font-normal">Users can save file</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAllowDownload(false)}
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all text-left ${
                        !allowDownload
                          ? "bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60"
                      }`}
                    >
                      <Ban size={16} className={!allowDownload ? "text-amber-600" : "text-slate-400"} />
                      <div>
                        <div className="text-xs font-bold">See Only</div>
                        <div className="text-[10px] text-slate-400 font-normal">View only, no download</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ── PERMISSION 2: Share in Index Pop-up (Only if I want) ── */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-blue-600" />
                        <span>Share in Index Pop-up</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Show immediately in the visitor pop-up on the home page
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShareInPopup(!shareInPopup)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        shareInPopup ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                          shareInPopup ? "left-6.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* ── Public in Downloads Page ── */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe size={14} className="text-emerald-600" />
                    <span>List on Public Downloads Page</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isPublic ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                        isPublic ? "left-6.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal footer submit */}
              <div className="pt-4 border-t border-slate-100 mt-2">
                <button
                  type="submit"
                  form={shareTab === "file" ? "file-form" : "text-form"}
                  disabled={shareTab === "file" ? !pickedFile || uploading : !snippetTitle || !snippetText}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={16} />
                  {uploading
                    ? "Saving to Database…"
                    : shareTab === "file"
                    ? "Upload & Save to Database"
                    : "Save Note to Database"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pop-up Preview Modal (Simulates Index Pop-up) ── */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[85vh]"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    {getFileIcon(previewFile.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                      Index Pop-up Simulation
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-xs">
                      {previewFile.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto my-3 space-y-3">
                {/* Permission banner */}
                {previewFile.allow_download !== false ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-blue-900 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Download size={14} className="text-blue-600" /> Download Allowed for Users
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 rounded text-[10px] uppercase font-bold">
                      Permitted
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Ban size={14} className="text-amber-600" /> See Only Mode (Download Disabled)
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 rounded text-[10px] uppercase font-bold">
                      View Only
                    </span>
                  </div>
                )}

                {/* Content */}
                {previewFile.content ? (
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                    {previewFile.content}
                  </pre>
                ) : previewFile.url && previewFile.type.startsWith("image/") ? (
                  <div className="rounded-2xl overflow-hidden bg-slate-950 p-2 flex items-center justify-center">
                    <img
                      src={previewFile.url}
                      alt={previewFile.name}
                      className="w-full h-auto max-h-60 object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <File size={36} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-800">{previewFile.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{previewFile.size}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-1">
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Close Preview
                </button>

                {previewFile.allow_download !== false ? (
                  <button
                    onClick={() => showToast("Simulated: User downloaded the resource")}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Download size={14} /> Download File (Active)
                  </button>
                ) : (
                  <div className="text-xs text-amber-700 font-bold px-3 py-2 bg-amber-50 rounded-xl flex items-center gap-1">
                    <Ban size={13} /> Download Button Hidden
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Supabase SQL Setup Helper Modal ── */}
      <AnimatePresence>
        {isSqlModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Database size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Supabase SQL Schema</h3>
                    <p className="text-xs text-slate-400 font-medium">Postgres table definition for files</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSqlModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="my-4 space-y-3">
                <p className="text-xs text-slate-600 font-medium">
                  Copy and run this in your{" "}
                  <strong className="text-slate-900">Supabase SQL Editor</strong> to ensure the{" "}
                  <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">files</code> table has both{" "}
                  <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">share_in_popup</code> and{" "}
                  <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">allow_download</code> columns:
                </p>

                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`-- Create table if not exists:
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT DEFAULT '',
  content TEXT DEFAULT '',
  public BOOLEAN DEFAULT true,
  allow_download BOOLEAN DEFAULT true,
  share_in_popup BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist:
ALTER TABLE files ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT true;
ALTER TABLE files ADD COLUMN IF NOT EXISTS share_in_popup BOOLEAN DEFAULT false;`}
                </pre>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setIsSqlModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close
                </button>

                <button
                  onClick={copySqlCode}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {copiedSql ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                  {copiedSql ? "Copied SQL!" : "Copy SQL Code"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  Paperclip
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
}

export default function FilesPage() {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Unified share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTab, setShareTab] = useState<"text" | "file">("text");
  const [allowDownload, setAllowDownload] = useState(true);

  // Text snippet fields
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetText, setSnippetText] = useState("");

  // File upload fields
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Preview Popup Modal
  const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchFiles(); }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (Array.isArray(data)) { setFiles(data); return; }
    } catch { /* fallback */ }
    const { data } = await supabase.from('files').select('*').order('created_at', { ascending: false });
    if (data) setFiles(data);
  };

  const openShareModal = () => {
    setShareTab("text");
    setSnippetTitle("");
    setSnippetText("");
    setPickedFile(null);
    setAllowDownload(true);
    setIsShareModalOpen(true);
  };

  const togglePublic = async (id: string, currentPublic: boolean) => {
    setFiles(files.map(f => f.id === id ? { ...f, public: !currentPublic } : f));
    await supabase.from('files').update({ public: !currentPublic }).eq('id', id);
  };

  const toggleAllowDownload = async (id: string, current: boolean) => {
    setFiles(files.map(f => f.id === id ? { ...f, allow_download: !current } : f));
    await supabase.from('files').update({ allow_download: !current }).eq('id', id);
  };

  /* ── Text snippet submit ── */
  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetText.trim()) return;

    const payload = {
      name: snippetTitle.endsWith('.txt') ? snippetTitle : `${snippetTitle}.txt`,
      size: `${(snippetText.length / 1024).toFixed(2)} KB`,
      type: "text/plain",
      url: "",
      content: snippetText,
      public: true,
      allow_download: allowDownload,
      is_text: true,
    };

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.id) setFiles(prev => [data, ...prev]);
    } catch (err) { console.error(err); }

    setIsShareModalOpen(false);
  };

  /* ── File upload submit ── */
  const handleSubmitFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedFile) return;
    setUploading(true);
    setProgress(0);

    const fileExt = pickedFile.name.split('.').pop();
    const uniqueFileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    let publicUrl = "";

    try {
      const { data: storageData } = await supabase.storage.from('assets').upload(uniqueFileName, pickedFile);
      if (storageData) {
        const { data: urlData } = supabase.storage.from('assets').getPublicUrl(uniqueFileName);
        publicUrl = urlData.publicUrl;
      }
    } catch {
      publicUrl = URL.createObjectURL(pickedFile);
    }

    setProgress(60);

    const fileItem = {
      id: "file-" + Date.now(),
      name: pickedFile.name,
      size: (pickedFile.size / (1024 * 1024)).toFixed(2) + " MB",
      type: pickedFile.type || "file",
      url: publicUrl || URL.createObjectURL(pickedFile),
      content: "",
      public: true,
      allow_download: allowDownload,
      created_at: new Date().toISOString(),
    };

    try {
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileItem),
      });
    } catch {}

    setFiles(prev => [fileItem, ...prev]);
    setProgress(100);
    setUploading(false);
    setPickedFile(null);
    setIsShareModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    // Optimistically remove from UI
    setFiles(prev => prev.filter(f => f.id !== id));

    try {
      await fetch(`/api/files?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
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

  /* ── Drop zone handlers inside modal ── */
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setPickedFile(f);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">File &amp; Text Sharing Center</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Share files or text snippets — control download permissions per item.</p>
        </div>

        <button
          onClick={openShareModal}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md"
        >
          <Share2 size={18} />
          Share Resource
        </button>
      </div>

      {/* Shared Items Grid */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
            <Cloud size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">Nothing shared yet</h3>
          <p className="text-slate-400 text-sm">Click &quot;Share Resource&quot; to add your first file or text note.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
                    {getFileIcon(file.type)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Public toggle */}
                    <button
                      onClick={() => togglePublic(file.id, file.public)}
                      className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                        file.public ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"
                      }`}
                      title={file.public ? "Visible on Downloads Page" : "Private"}
                    >
                      {file.public ? <Globe size={16} /> : <Lock size={16} />}
                    </button>

                    {/* Download toggle */}
                    <button
                      onClick={() => toggleAllowDownload(file.id, file.allow_download !== false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        file.allow_download !== false
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                      title="Toggle Download vs View Only"
                    >
                      {file.allow_download !== false ? (
                        <><Download size={12} />Downloadable</>
                      ) : (
                        <><Ban size={12} />View Only</>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 truncate mb-1 text-sm" title={file.name}>{file.name}</h4>
                <p className="text-slate-400 text-xs font-medium mb-3">
                  {file.size} • {new Date(file.created_at).toLocaleDateString()}
                </p>

                {file.content && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-mono line-clamp-3 mb-4 border border-slate-100">
                    {file.content}
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setPreviewFile(file)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye size={14} />
                  Pop-up Preview
                </button>
                <button
                  onClick={() => copyShareLink(file)}
                  className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
                  title="Copy share link"
                >
                  {copiedId === file.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Unified Share Modal ── */}
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative"
            >
              {/* Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5 mt-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Share2 size={18} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Share Resource</h3>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab switcher */}
              <div className="flex bg-slate-100 rounded-2xl p-1 mb-6 gap-1">
                <button
                  onClick={() => setShareTab("text")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    shareTab === "text"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Type size={14} />
                  Text / Snippet
                </button>
                <button
                  onClick={() => setShareTab("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    shareTab === "file"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Paperclip size={14} />
                  Upload File
                </button>
              </div>

              {/* ── TEXT TAB ── */}
              {shareTab === "text" && (
                <form onSubmit={handleSubmitText} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Snippet Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Instructions.txt or API Key Notes"
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
                      rows={6}
                      required
                      placeholder="Enter text or code to share in the user pop-up..."
                      value={snippetText}
                      onChange={(e) => setSnippetText(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  <PermissionPicker value={allowDownload} onChange={setAllowDownload} />

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-all shadow-md"
                  >
                    Share to Users
                  </button>
                </form>
              )}

              {/* ── FILE TAB ── */}
              {shareTab === "file" && (
                <form onSubmit={handleSubmitFile} className="space-y-4">
                  {/* Drop zone */}
                  <div
                    ref={dropRef}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : pickedFile
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && setPickedFile(e.target.files[0])}
                      className="hidden"
                    />

                    {pickedFile ? (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                          {getFileIcon(pickedFile.type, 24)}
                        </div>
                        <p className="font-bold text-sm text-slate-900 truncate max-w-full px-4">{pickedFile.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{(pickedFile.size / 1024).toFixed(1)} KB</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPickedFile(null); }}
                          className="mt-3 text-xs text-red-500 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                          <Upload size={24} />
                        </div>
                        <p className="font-bold text-sm text-slate-700">Drop file here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-1">Any file type supported</p>
                      </>
                    )}

                    {/* Upload progress overlay */}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center">
                        <p className="text-sm font-bold text-slate-900 mb-2">Uploading… {progress}%</p>
                        <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <PermissionPicker value={allowDownload} onChange={setAllowDownload} />

                  <button
                    type="submit"
                    disabled={!pickedFile || uploading}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    {uploading ? "Uploading…" : "Upload & Share"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pop-up Preview Modal ── */}
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
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {getFileIcon(previewFile.type)}
                  <h3 className="text-lg font-bold text-slate-900 truncate max-w-xs">{previewFile.name}</h3>
                </div>
                <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-slate-900">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto my-4 space-y-4">
                {previewFile.allow_download !== false ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                    <Download size={12} /> Users Allowed to Download
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                    <Ban size={12} /> Just See (Download Disabled)
                  </span>
                )}

                {previewFile.content ? (
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    {previewFile.content}
                  </pre>
                ) : previewFile.url && previewFile.type.startsWith("image/") ? (
                  <img src={previewFile.url} alt={previewFile.name} className="w-full h-auto max-h-80 object-contain rounded-2xl bg-slate-900" />
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    File URL: {previewFile.url || "In-memory file"}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Reusable Permission Picker Component ── */
function PermissionPicker({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        User Download Permission
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <label className={`flex-1 p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
          value ? "bg-blue-50 border-blue-500 text-blue-900 font-bold" : "bg-white border-slate-200 text-slate-600"
        }`}>
          <input type="radio" name="perm" checked={value} onChange={() => onChange(true)} className="hidden" />
          <Download size={16} />
          <span className="text-xs">Allow Download</span>
        </label>

        <label className={`flex-1 p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
          !value ? "bg-amber-50 border-amber-500 text-amber-900 font-bold" : "bg-white border-slate-200 text-slate-600"
        }`}>
          <input type="radio" name="perm" checked={!value} onChange={() => onChange(false)} className="hidden" />
          <Ban size={16} />
          <span className="text-xs">Just See (View Only)</span>
        </label>
      </div>
    </div>
  );
}

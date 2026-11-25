"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  FolderOpen,
  FileText,
  Star,
  Clock,
  Trash2,
  RefreshCw,
  Folder,
  Download,
  Eye,
  RotateCcw,
  AlertTriangle,
  Search,
  ExternalLink,
  ChevronRight,
  HardDrive,
  FileCode,
  Image as ImageIcon,
  Music,
  Video,
  Archive,
  File,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SaaSFile {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: string;
  extension: string;
  url: string;
  folderId: string | null;
  isFavorite: boolean;
  isTrash: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SaaSFolder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
}

interface SaaSNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isTrash: boolean;
  createdAt: string;
  updatedAt: string;
}

type WorkspaceTab = "files" | "documents" | "notes" | "favorites" | "recent" | "trash";

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("files");
  const [files, setFiles] = useState<SaaSFile[]>([]);
  const [folders, setFolders] = useState<SaaSFolder[]>([]);
  const [notes, setNotes] = useState<SaaSNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Preview file modal
  const [previewFile, setPreviewFile] = useState<SaaSFile | null>(null);

  // ── Fetch All Workspace Data ───────────────────────────────────────────────
  const fetchWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, foldersRes, notesRes] = await Promise.all([
        fetch("/api/saas/files"),
        fetch("/api/saas/folders"),
        fetch("/api/saas/notes"),
      ]);

      if (filesRes.ok) setFiles(await filesRes.json());
      if (foldersRes.ok) setFolders(await foldersRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
    } catch {
      toast.error("Failed to load workspace data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  // ── Restore Action (Trash) ────────────────────────────────────────────────
  const handleRestoreFile = async (file: SaaSFile) => {
    try {
      const res = await fetch("/api/saas/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: file.id, isTrash: false }),
      });
      if (res.ok) {
        toast.success(`Restored "${file.name}"`);
        fetchWorkspace();
      }
    } catch {
      toast.error("Failed to restore file");
    }
  };

  const handleRestoreNote = async (note: SaaSNote) => {
    try {
      const res = await fetch("/api/saas/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, isTrash: false }),
      });
      if (res.ok) {
        toast.success(`Restored note "${note.title}"`);
        fetchWorkspace();
      }
    } catch {
      toast.error("Failed to restore note");
    }
  };

  // ── Permanent Delete ──────────────────────────────────────────────────────
  const handlePermanentDeleteFile = async (id: string) => {
    if (!confirm("Permanently delete this file? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/saas/files?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("File permanently deleted");
        fetchWorkspace();
      }
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const handlePermanentDeleteNote = async (id: string) => {
    if (!confirm("Permanently delete this note? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/saas/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Note permanently deleted");
        fetchWorkspace();
      }
    } catch {
      toast.error("Failed to delete note");
    }
  };

  // ── Empty Trash Action ─────────────────────────────────────────────────────
  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to permanently empty the entire trash? All trashed items will be erased forever.")) return;

    try {
      const [fRes, nRes] = await Promise.all([
        fetch("/api/saas/files?emptyTrash=true", { method: "DELETE" }),
        fetch("/api/saas/notes?emptyTrash=true", { method: "DELETE" }),
      ]);

      if (fRes.ok && nRes.ok) {
        toast.success("Trash emptied successfully");
        fetchWorkspace();
      } else {
        toast.error("Error emptying trash");
      }
    } catch {
      toast.error("Failed to empty trash");
    }
  };

  // ── Toggle Favorite ───────────────────────────────────────────────────────
  const handleToggleFavoriteFile = async (file: SaaSFile, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/saas/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: file.id, isFavorite: !file.isFavorite }),
      });
      if (res.ok) {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, isFavorite: !f.isFavorite } : f))
        );
        toast.success(file.isFavorite ? "Removed from favorites" : "Added to favorites");
      }
    } catch {
      toast.error("Error toggling favorite");
    }
  };

  const handleToggleFavoriteNote = async (note: SaaSNote, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/saas/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, isFavorite: !note.isFavorite }),
      });
      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n))
        );
        toast.success(note.isFavorite ? "Removed from favorites" : "Added to favorites");
      }
    } catch {
      toast.error("Error toggling favorite");
    }
  };

  // ── Helper Icon ────────────────────────────────────────────────────────────
  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-indigo-400" />;
      case "video":
        return <Video className="w-5 h-5 text-pink-400" />;
      case "audio":
        return <Music className="w-5 h-5 text-amber-400" />;
      case "code":
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case "archive":
        return <Archive className="w-5 h-5 text-purple-400" />;
      case "document":
        return <FileText className="w-5 h-5 text-blue-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  // ── Filtered Datasets ──────────────────────────────────────────────────────
  const activeFiles = useMemo(() => files.filter((f) => !f.isTrash), [files]);
  const activeNotes = useMemo(() => notes.filter((n) => !n.isTrash), [notes]);
  const trashedFiles = useMemo(() => files.filter((f) => f.isTrash), [files]);
  const trashedNotes = useMemo(() => notes.filter((n) => n.isTrash), [notes]);

  const documentFiles = useMemo(
    () => activeFiles.filter((f) => f.type === "document" || f.type === "code" || f.extension === "pdf"),
    [activeFiles]
  );

  const favoriteFiles = useMemo(() => activeFiles.filter((f) => f.isFavorite), [activeFiles]);
  const favoriteNotes = useMemo(() => activeNotes.filter((n) => n.isFavorite), [activeNotes]);

  const recentItems = useMemo(() => {
    const combined = [
      ...activeFiles.map((f) => ({ ...f, itemType: "file" as const })),
      ...activeNotes.map((n) => ({ ...n, itemType: "note" as const, name: n.title, size: "Note" })),
    ];
    return combined.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [activeFiles, activeNotes]);

  // Tab definitions
  const tabs = [
    { id: "files", label: "My Files", icon: FolderOpen, count: activeFiles.length },
    { id: "documents", label: "My Documents", icon: FileText, count: documentFiles.length },
    { id: "notes", label: "My Notes", icon: FileCode, count: activeNotes.length },
    { id: "favorites", label: "Favorites", icon: Star, count: favoriteFiles.length + favoriteNotes.length },
    { id: "recent", label: "Recently Opened", icon: Clock, count: recentItems.length },
    { id: "trash", label: "Trash", icon: Trash2, count: trashedFiles.length + trashedNotes.length },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-[#b8ff4d]" />
            Personal Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            All your files, personal notes, documents, and starred assets in one unified hub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/files"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
          >
            <FolderOpen className="w-4 h-4 text-blue-400" />
            <span>Open File Manager</span>
          </Link>
          <Link
            href="/admin/notes"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black shadow-lg shadow-[#b8ff4d]/10 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </Link>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkspaceTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#b8ff4d] text-black font-bold shadow-md shadow-[#b8ff4d]/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? "bg-black/20 text-black font-bold" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">
        {/* TAB 1: MY FILES */}
        {activeTab === "files" && (
          <div className="space-y-4">
            {folders.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Folders</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {folders.map((f) => (
                    <Link
                      key={f.id}
                      href={`/admin/files?folderId=${f.id}`}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-400 flex items-center gap-2.5 transition-all group"
                    >
                      <Folder className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{f.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Files</h3>
              {activeFiles.length === 0 ? (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">No files uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {activeFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setPreviewFile(file)}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-[#b8ff4d]/50 cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <button
                          onClick={(e) => handleToggleFavoriteFile(file, e)}
                          className={`p-1 rounded ${file.isFavorite ? "text-amber-400" : "text-slate-400 opacity-0 group-hover:opacity-100"}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{file.size}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY DOCUMENTS */}
        {activeTab === "documents" && (
          <div>
            {documentFiles.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold">No document files found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {documentFiles.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setPreviewFile(doc)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{doc.size} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY NOTES */}
        {activeTab === "notes" && (
          <div>
            {activeNotes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <FileCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold">No notes created yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/admin/notes?id=${note.id}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-[#b8ff4d]/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                          {note.category}
                        </span>
                        <button
                          onClick={(e) => handleToggleFavoriteNote(note, e)}
                          className={`p-1 rounded ${note.isFavorite ? "text-amber-400" : "text-slate-400 opacity-0 group-hover:opacity-100"}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#b8ff4d]">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {note.content || "Empty content"}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FAVORITES */}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            {favoriteFiles.length === 0 && favoriteNotes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
                <p className="text-xs font-bold">No starred items</p>
                <p className="text-[11px] text-slate-500">Star important files and notes to easily access them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favoriteFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setPreviewFile(file)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{file.size} • File</p>
                      </div>
                    </div>
                    <Star className="w-4 h-4 text-amber-400 fill-current shrink-0" />
                  </div>
                ))}

                {favoriteNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/admin/notes?id=${note.id}`}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{note.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Note in {note.category}</p>
                      </div>
                    </div>
                    <Star className="w-4 h-4 text-amber-400 fill-current shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RECENTLY OPENED */}
        {activeTab === "recent" && (
          <div className="space-y-3">
            {recentItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold">No recent activity</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
                {recentItems.slice(0, 15).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.itemType === "file") setPreviewFile(item as unknown as SaaSFile);
                    }}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {item.itemType === "file" ? getFileIcon((item as any).type) : <FileText className="w-4 h-4 text-[#b8ff4d]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.itemType === "file" ? `File • ${(item as any).size}` : "Note"} • Modified{" "}
                          {new Date(item.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: TRASH */}
        {activeTab === "trash" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-red-400">Trash Bin</h4>
                  <p className="text-[11px] text-slate-400">
                    Items in trash can be restored back to your workspace or permanently destroyed.
                  </p>
                </div>
              </div>

              {(trashedFiles.length > 0 || trashedNotes.length > 0) && (
                <button
                  onClick={handleEmptyTrash}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empty Entire Trash</span>
                </button>
              )}
            </div>

            {trashedFiles.length === 0 && trashedNotes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                <p className="text-xs font-bold">Trash is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trashedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate line-through">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">File • {file.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreFile(file)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#b8ff4d]" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteFile(file.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {trashedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#b8ff4d]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate line-through">
                          {note.title}
                        </p>
                        <p className="text-[10px] text-slate-400">Note in {note.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreNote(note)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#b8ff4d]" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteNote(note.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-[#12161a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {getFileIcon(previewFile.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{previewFile.name}</h3>
                    <p className="text-xs text-slate-400">{previewFile.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {previewFile.type === "image" && previewFile.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-[50vh] max-w-full rounded-2xl mx-auto object-contain"
                />
              )}

              <div className="mt-6 flex justify-end gap-3">
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="px-4 py-2 rounded-xl bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


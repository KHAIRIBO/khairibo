"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderPlus,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Code2,
  Download,
  Trash2,
  Edit3,
  Star,
  Eye,
  MoreVertical,
  Search,
  Grid,
  List as ListIcon,
  ChevronRight,
  UploadCloud,
  Move,
  Check,
  X,
  ExternalLink,
  Copy,
  Plus,
  RefreshCw,
  FolderOpen,
  ArrowUpDown,
  FileCode,
  HardDrive,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface SaaSFile {
  id: string;
  name: string;
  originalName: string;
  size: string;
  sizeBytes: number;
  type: "document" | "image" | "video" | "audio" | "code" | "archive" | "other";
  mimeType: string;
  extension: string;
  url: string;
  content?: string;
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
  createdAt: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<SaaSFile[]>([]);
  const [folders, setFolders] = useState<SaaSFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals & Popups
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#b8ff4d");

  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string; isFolder: boolean } | null>(null);
  const [renameInput, setRenameInput] = useState("");

  const [moveTarget, setMoveTarget] = useState<SaaSFile | null>(null);
  const [selectedTargetFolder, setSelectedTargetFolder] = useState<string | null>(null);

  const [previewFile, setPreviewFile] = useState<SaaSFile | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch Files & Folders ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        fetch("/api/saas/files"),
        fetch("/api/saas/folders"),
      ]);

      if (filesRes.ok) {
        const fileData = await filesRes.json();
        setFiles(fileData.filter((f: SaaSFile) => !f.isTrash));
      }
      if (foldersRes.ok) {
        const folderData = await foldersRes.json();
        setFolders(folderData);
      }
    } catch {
      toast.error("Failed to load files and folders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Click outside to close context menu
  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // ── Breadcrumbs computation ───────────────────────────────────────────────
  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: "Root" }];
    let curr = currentFolderId;
    const trail: { id: string; name: string }[] = [];

    while (curr) {
      const folder = folders.find((f) => f.id === curr);
      if (folder) {
        trail.unshift({ id: folder.id, name: folder.name });
        curr = folder.parentId;
      } else {
        break;
      }
    }
    return [...crumbs, ...trail];
  }, [currentFolderId, folders]);

  // ── Filtered & Sorted Data ─────────────────────────────────────────────────
  const currentFolders = useMemo(() => {
    return folders.filter((f) => {
      const matchesParent = f.parentId === currentFolderId;
      const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesParent && matchesSearch;
    });
  }, [folders, currentFolderId, searchQuery]);

  const currentFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Folder match
        const matchesFolder = file.folderId === currentFolderId;
        // Search match
        const matchesSearch = !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase());
        // Type filter
        const matchesType = filterType === "all" || file.type === filterType;
        return matchesFolder && matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          const comp = a.name.localeCompare(b.name);
          return sortOrder === "asc" ? comp : -comp;
        }
        if (sortBy === "size") {
          const comp = a.sizeBytes - b.sizeBytes;
          return sortOrder === "asc" ? comp : -comp;
        }
        // Date
        const comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? comp : -comp;
      });
  }, [files, currentFolderId, searchQuery, filterType, sortBy, sortOrder]);

  // ── File Upload Handler ───────────────────────────────────────────────────
  const handleFileUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    setUploadProgress(10);

    let successCount = 0;
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolderId) {
        formData.append("folderId", currentFolderId);
      }

      try {
        const res = await fetch("/api/saas/files", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          successCount++;
        } else {
          const err = await res.json();
          toast.error(err.error || `Failed to upload ${file.name}`);
        }
      } catch {
        toast.error(`Error uploading ${file.name}`);
      }

      setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
    }

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? "s" : ""}`);
      fetchData();
    }

    setUploadProgress(null);
    setUploadFiles([]);
    setIsUploadModalOpen(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileUpload(droppedFiles);
    }
  };

  // ── Folder Creation ───────────────────────────────────────────────────────
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/saas/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: currentFolderId,
          color: newFolderColor,
        }),
      });

      if (res.ok) {
        toast.success(`Folder "${newFolderName}" created`);
        setNewFolderName("");
        setIsFolderModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create folder");
      }
    } catch {
      toast.error("Network error creating folder");
    }
  };

  // ── Rename Action ─────────────────────────────────────────────────────────
  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameInput.trim()) return;

    try {
      const endpoint = renameTarget.isFolder ? "/api/saas/folders" : "/api/saas/files";
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: renameTarget.id, name: renameInput.trim() }),
      });

      if (res.ok) {
        toast.success("Renamed successfully");
        setRenameTarget(null);
        fetchData();
      } else {
        toast.error("Failed to rename");
      }
    } catch {
      toast.error("Error renaming item");
    }
  };

  // ── Move File Action ───────────────────────────────────────────────────────
  const handleMoveFile = async () => {
    if (!moveTarget) return;

    try {
      const res = await fetch("/api/saas/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: moveTarget.id, folderId: selectedTargetFolder }),
      });

      if (res.ok) {
        toast.success(`Moved "${moveTarget.name}"`);
        setMoveTarget(null);
        fetchData();
      } else {
        toast.error("Failed to move file");
      }
    } catch {
      toast.error("Error moving file");
    }
  };

  // ── Delete / Trash Action ─────────────────────────────────────────────────
  const handleTrashFile = async (file: SaaSFile) => {
    try {
      const res = await fetch("/api/saas/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: file.id, isTrash: true }),
      });

      if (res.ok) {
        toast.success(`Moved "${file.name}" to Trash`);
        fetchData();
      } else {
        toast.error("Failed to move to trash");
      }
    } catch {
      toast.error("Error deleting file");
    }
  };

  const handleDeleteFolder = async (folder: SaaSFolder) => {
    if (!confirm(`Are you sure you want to delete folder "${folder.name}"?`)) return;

    try {
      const res = await fetch(`/api/saas/folders?id=${folder.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Folder "${folder.name}" deleted`);
        fetchData();
      } else {
        toast.error("Failed to delete folder");
      }
    } catch {
      toast.error("Error deleting folder");
    }
  };

  // ── Favorite Toggle ───────────────────────────────────────────────────────
  const handleToggleFavorite = async (file: SaaSFile, e: React.MouseEvent) => {
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
      toast.error("Failed to toggle favorite");
    }
  };

  // ── Download File ─────────────────────────────────────────────────────────
  const handleDownload = (file: SaaSFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading ${file.name}`);
    } catch {
      toast.error("Failed to start download");
    }
  };

  // Helper for file type icon
  const getFileIcon = (type: string, ext?: string) => {
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

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#b8ff4d]/10 backdrop-blur-md border-4 border-dashed border-[#b8ff4d] flex flex-col items-center justify-center p-6 pointer-events-none"
          >
            <UploadCloud className="w-20 h-20 text-[#b8ff4d] animate-bounce mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Drop files anywhere to upload</h3>
            <p className="text-slate-300 text-sm">Files will be placed in the current folder</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-[#b8ff4d]" />
            File Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Secure cloud storage, folder organization, and instant file previewing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black shadow-lg shadow-[#b8ff4d]/10 flex items-center gap-2 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={crumb.id || "root"} className="flex items-center gap-1.5 shrink-0">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              <button
                onClick={() => setCurrentFolderId(crumb.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  isLast
                    ? "text-[#b8ff4d] font-bold bg-[#b8ff4d]/10"
                    : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                {crumb.id === null ? <HardDrive className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />}
                <span>{crumb.name}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Toolbar: Search, Filters, Sort & View Toggle */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#b8ff4d]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["all", "document", "image", "video", "audio", "code", "archive"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors font-medium ${
                filterType === type
                  ? "bg-[#b8ff4d] text-black font-bold"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort & View Modes */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => {
                if (sortBy === "date") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else {
                  setSortBy("date");
                  setSortOrder("desc");
                }
              }}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold ${
                sortBy === "date" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400"
              }`}
            >
              <span>Date</span>
              {sortBy === "date" && <ArrowUpDown className="w-3 h-3 text-[#b8ff4d]" />}
            </button>

            <button
              onClick={() => {
                if (sortBy === "name") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else {
                  setSortBy("name");
                  setSortOrder("asc");
                }
              }}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold ${
                sortBy === "name" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400"
              }`}
            >
              <span>Name</span>
              {sortBy === "name" && <ArrowUpDown className="w-3 h-3 text-[#b8ff4d]" />}
            </button>

            <button
              onClick={() => {
                if (sortBy === "size") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else {
                  setSortBy("size");
                  setSortOrder("desc");
                }
              }}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold ${
                sortBy === "size" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400"
              }`}
            >
              <span>Size</span>
              {sortBy === "size" && <ArrowUpDown className="w-3 h-3 text-[#b8ff4d]" />}
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white dark:bg-slate-900 text-[#b8ff4d] shadow-sm" : "text-slate-400"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-white dark:bg-slate-900 text-[#b8ff4d] shadow-sm" : "text-slate-400"
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : currentFolders.length === 0 && currentFiles.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-16 h-16 rounded-2xl bg-[#b8ff4d]/10 border border-[#b8ff4d]/20 flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8 text-[#b8ff4d]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">This folder is empty</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            Drag and drop files here, or click below to upload documents, photos, audio, videos, and archives.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
            >
              New Folder
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black shadow-lg shadow-[#b8ff4d]/10"
            >
              Upload Files
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders Section */}
          {currentFolders.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                Folders ({currentFolders.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {currentFolders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="group relative p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-amber-400/50 hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${folder.color || "#eab308"}20` }}
                      >
                        <Folder className="w-5 h-5" style={{ color: folder.color || "#eab308" }} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-400">
                        {folder.name}
                      </span>
                    </div>

                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setRenameTarget({ id: folder.id, name: folder.name, isFolder: true });
                          setRenameInput(folder.name);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Rename"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder)}
                        className="p-1 text-slate-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {currentFiles.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <File className="w-3.5 h-3.5 text-blue-400" />
                Files ({currentFiles.length})
              </h2>

              {viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {currentFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setPreviewFile(file)}
                      className="group relative rounded-2xl bg-white dark:bg-[#12161a] border border-slate-200 dark:border-slate-800/80 hover:border-[#b8ff4d]/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top thumbnail or preview icon */}
                      <div className="h-32 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center relative overflow-hidden border-b border-slate-100 dark:border-slate-800/40">
                        {file.type === "image" && file.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
                            {getFileIcon(file.type, file.extension)}
                          </div>
                        )}

                        {/* Favorite button */}
                        <button
                          onClick={(e) => handleToggleFavorite(file, e)}
                          className={`absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                            file.isFavorite
                              ? "bg-amber-400/20 text-amber-400"
                              : "bg-black/40 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* Quick preview hover badge */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-black/80 text-black dark:text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                            <Eye className="w-3.5 h-3.5 text-[#b8ff4d]" />
                            Preview
                          </span>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="p-3">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                          <span>{file.size}</span>
                          <span className="uppercase text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {file.extension || file.type}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions Menu */}
                      <div
                        className="px-3 pb-2 pt-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity border-t border-slate-100 dark:border-slate-800/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleDownload(file, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setMoveTarget(file);
                            setSelectedTargetFolder(file.folderId);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Move"
                        >
                          <Move className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setRenameTarget({ id: file.id, name: file.name, isFolder: false });
                            setRenameInput(file.name);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTrashFile(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List / Table View */
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-900/40">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4 hidden sm:table-cell">Type</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4 hidden md:table-cell">Uploaded</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {currentFiles.map((file) => (
                        <tr
                          key={file.id}
                          onClick={() => setPreviewFile(file)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={(e) => handleToggleFavorite(file, e)}
                                className={`p-1 rounded ${
                                  file.isFavorite ? "text-amber-400" : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                {getFileIcon(file.type, file.extension)}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs group-hover:text-[#b8ff4d]">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell uppercase font-mono text-[10px] text-slate-400">
                            {file.extension || file.type}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{file.size}</td>
                          <td className="py-3 px-4 hidden md:table-cell text-slate-500 dark:text-slate-400">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => handleDownload(file, e)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setMoveTarget(file);
                                  setSelectedTargetFolder(file.folderId);
                                }}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                                title="Move"
                              >
                                <Move className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setRenameTarget({ id: file.id, name: file.name, isFolder: false });
                                  setRenameInput(file.name);
                                }}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                                title="Rename"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleTrashFile(file)}
                                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10"
                                title="Move to Trash"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: Upload Files ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#12161a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#b8ff4d]/10 border border-[#b8ff4d]/20 flex items-center justify-center text-[#b8ff4d]">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Files</h3>
                  <p className="text-xs text-slate-400">
                    Upload to {breadcrumbs[breadcrumbs.length - 1]?.name || "Root"}
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#b8ff4d] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setUploadFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />
                <UploadCloud className="w-12 h-12 text-[#b8ff4d] mb-3" />
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  Click to select files, or drag and drop
                </p>
                <p className="text-xs text-slate-400">Images, PDFs, Videos, ZIP, Audio, Code (up to 100MB)</p>
              </div>

              {/* Selected Files List */}
              {uploadFiles.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
                  <p className="text-xs font-bold text-slate-400">Selected ({uploadFiles.length}):</p>
                  {uploadFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs"
                    >
                      <span className="truncate max-w-[280px] font-medium text-slate-800 dark:text-white">
                        {f.name}
                      </span>
                      <span className="text-slate-400 font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress Bar */}
              {uploadProgress !== null && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#b8ff4d] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUploadFiles([]);
                    setIsUploadModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploadFiles.length === 0 || uploadProgress !== null}
                  onClick={() => handleFileUpload(uploadFiles)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black disabled:opacity-50"
                >
                  Start Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Create Folder ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#12161a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Folder</h3>
                  <p className="text-xs text-slate-400">Organize your workspace</p>
                </div>
              </div>

              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. Design Assets, Documents"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#b8ff4d]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Folder Color
                  </label>
                  <div className="flex gap-2">
                    {["#b8ff4d", "#38bdf8", "#ec4899", "#eab308", "#a855f7", "#f97316"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewFolderColor(color)}
                        className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                          newFolderColor === color ? "scale-110 border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFolderModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Rename Item ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {renameTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#12161a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Rename {renameTarget.isFolder ? "Folder" : "File"}
              </h3>
              <p className="text-xs text-slate-400 mb-4">Enter a new name for this item</p>

              <form onSubmit={handleRename} className="space-y-4">
                <input
                  type="text"
                  required
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#b8ff4d]"
                  autoFocus
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRenameTarget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Move File ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {moveTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#12161a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Move File</h3>
              <p className="text-xs text-slate-400 mb-4">
                Choose a destination for &quot;{moveTarget.name}&quot;
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                <div
                  onClick={() => setSelectedTargetFolder(null)}
                  className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    selectedTargetFolder === null
                      ? "bg-[#b8ff4d]/10 border-[#b8ff4d] text-slate-900 dark:text-white font-bold"
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <HardDrive className="w-4 h-4 text-[#b8ff4d]" />
                  <span>Root Directory</span>
                </div>

                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedTargetFolder(folder.id)}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      selectedTargetFolder === folder.id
                        ? "bg-[#b8ff4d]/10 border-[#b8ff4d] text-slate-900 dark:text-white font-bold"
                        : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Folder className="w-4 h-4 text-amber-400" />
                    <span>{folder.name}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMoveTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMoveFile}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black"
                >
                  Move Here
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Rich File Preview ───────────────────────────────────────── */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#12161a] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Preview Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getFileIcon(previewFile.type, previewFile.extension)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {previewFile.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {previewFile.size} • {new Date(previewFile.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className="px-3 py-1.5 rounded-xl bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview Body */}
              <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-100 dark:bg-[#0c0f12]">
                {previewFile.type === "image" && previewFile.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl"
                  />
                ) : previewFile.type === "video" && previewFile.url ? (
                  <video controls className="max-h-[65vh] max-w-full rounded-2xl shadow-2xl">
                    <source src={previewFile.url} type={previewFile.mimeType} />
                    Your browser does not support video playback.
                  </video>
                ) : previewFile.type === "audio" && previewFile.url ? (
                  <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
                      <Music className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">{previewFile.name}</p>
                    <audio controls className="w-full">
                      <source src={previewFile.url} type={previewFile.mimeType} />
                    </audio>
                  </div>
                ) : previewFile.type === "code" || previewFile.extension === "txt" || previewFile.extension === "json" ? (
                  <div className="w-full max-h-[65vh] overflow-auto bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs border border-slate-800">
                    <pre className="whitespace-pre-wrap font-mono">
                      {previewFile.content || "Content preview not available directly. Use download to inspect."}
                    </pre>
                  </div>
                ) : previewFile.extension === "pdf" && previewFile.url ? (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-[65vh] rounded-2xl border border-slate-800 shadow-xl"
                  />
                ) : (
                  /* Fallback preview */
                  <div className="text-center p-8 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{previewFile.name}</h4>
                    <p className="text-xs text-slate-400">
                      No inline preview available for this file format ({previewFile.mimeType}). You can download it directly to view on your device.
                    </p>
                    <button
                      onClick={() => handleDownload(previewFile)}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

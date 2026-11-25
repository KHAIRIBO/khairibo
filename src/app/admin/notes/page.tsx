"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  FileText,
  Pin,
  Tag,
  Folder,
  Calendar,
  Check,
  Clock,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Share2,
  Sparkles,
  ChevronRight,
  Filter,
  X,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface SaaSNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  folderId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  isTrash: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["All", "Work", "Personal", "Ideas", "Projects", "Todo", "Snippets"];

export default function NotesPage() {
  const searchParams = useSearchParams();
  const requestedNoteId = searchParams.get("id");

  const [notes, setNotes] = useState<SaaSNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SaaSNote | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Editor states
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("Work");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch Notes ────────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/saas/notes");
      if (res.ok) {
        const data: SaaSNote[] = await res.json();
        const activeNotes = data.filter((n) => !n.isTrash);
        setNotes(activeNotes);

        if (requestedNoteId) {
          const match = activeNotes.find((n) => n.id === requestedNoteId);
          if (match) {
            selectNote(match);
            return;
          }
        }

        if (activeNotes.length > 0 && !selectedNote) {
          selectNote(activeNotes[0]);
        }
      }
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [requestedNoteId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Select Note ────────────────────────────────────────────────────────────
  const selectNote = (note: SaaSNote) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category || "General");
    setEditTags(note.tags || []);
    setSaveStatus("idle");
  };

  // ── Debounced Autosave ─────────────────────────────────────────────────────
  const triggerAutosave = useCallback(
    (title: string, content: string, category: string, tags: string[]) => {
      if (!selectedNote) return;

      setSaveStatus("saving");
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/saas/notes", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedNote.id,
              title: title.trim() || "Untitled Note",
              content,
              category,
              tags,
            }),
          });

          if (res.ok) {
            const updated = await res.json();
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
            setSelectedNote(updated);
            setSaveStatus("saved");
            const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            setLastSavedAt(timeStr);
          }
        } catch {
          setSaveStatus("idle");
        }
      }, 600);
    },
    [selectedNote]
  );

  // Field change handlers
  const handleTitleChange = (val: string) => {
    setEditTitle(val);
    triggerAutosave(val, editContent, editCategory, editTags);
  };

  const handleContentChange = (val: string) => {
    setEditContent(val);
    triggerAutosave(editTitle, val, editCategory, editTags);
  };

  const handleCategoryChange = (cat: string) => {
    setEditCategory(cat);
    triggerAutosave(editTitle, editContent, cat, editTags);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      const cleanTag = newTagInput.trim().toLowerCase().replace(/^#/, "");
      if (!editTags.includes(cleanTag)) {
        const nextTags = [...editTags, cleanTag];
        setEditTags(nextTags);
        triggerAutosave(editTitle, editContent, editCategory, nextTags);
      }
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = editTags.filter((t) => t !== tagToRemove);
    setEditTags(nextTags);
    triggerAutosave(editTitle, editContent, editCategory, nextTags);
  };

  // ── Create New Note ────────────────────────────────────────────────────────
  const handleCreateNote = async () => {
    try {
      const res = await fetch("/api/saas/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          category: selectedCategory === "All" ? "Work" : selectedCategory,
          tags: [],
        }),
      });

      if (res.ok) {
        const newNote: SaaSNote = await res.json();
        setNotes([newNote, ...notes]);
        selectNote(newNote);
        toast.success("New note created");
      }
    } catch {
      toast.error("Failed to create note");
    }
  };

  // ── Pin / Unpin Note ───────────────────────────────────────────────────────
  const handleTogglePin = async (note: SaaSNote, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch("/api/saas/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, isPinned: !note.isPinned }),
      });

      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, isPinned: !note.isPinned } : n))
        );
        if (selectedNote?.id === note.id) {
          setSelectedNote({ ...selectedNote, isPinned: !note.isPinned });
        }
        toast.success(note.isPinned ? "Unpinned note" : "Pinned to top");
      }
    } catch {
      toast.error("Error pinning note");
    }
  };

  // ── Delete / Trash Note ────────────────────────────────────────────────────
  const handleTrashNote = async (note: SaaSNote, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch("/api/saas/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, isTrash: true }),
      });

      if (res.ok) {
        const remaining = notes.filter((n) => n.id !== note.id);
        setNotes(remaining);
        toast.success(`Moved "${note.title}" to trash`);
        if (selectedNote?.id === note.id) {
          setSelectedNote(remaining[0] || null);
          if (remaining[0]) selectNote(remaining[0]);
        }
      }
    } catch {
      toast.error("Failed to delete note");
    }
  };

  // ── Rich Text Toolbar helpers ──────────────────────────────────────────────
  const insertFormat = (prefix: string, suffix: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selection = text.substring(start, end);

    const replacement = `${prefix}${selection || "text"}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setEditContent(newContent);
    triggerAutosave(editTitle, newContent, editCategory, editTags);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selection.length || 4));
    }, 50);
  };

  // ── Filter Notes ───────────────────────────────────────────────────────────
  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || note.category === selectedCategory;
      const matchesTag = !tagFilter || note.tags?.includes(tagFilter);
      return matchesSearch && matchesCat && matchesTag;
    })
    .sort((a, b) => {
      // Pinned notes always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  // Collect all unique tags for tag filter list
  const allUniqueTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-[#0c0f12]">
      {/* ── LEFT SIDEBAR: Notes List ───────────────────────────────────────── */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101418] shrink-0 h-full">
        {/* Header & New Note Button */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#b8ff4d]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Notes</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                {notes.length}
              </span>
            </div>

            <button
              onClick={handleCreateNote}
              className="px-3 py-1.5 rounded-xl bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in notes..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#b8ff4d]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#b8ff4d] text-black font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tag Filter Pills */}
          {allUniqueTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400 pt-1">
              <Tag className="w-3 h-3 shrink-0" />
              {tagFilter && (
                <button
                  onClick={() => setTagFilter(null)}
                  className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 flex items-center gap-1"
                >
                  Clear #{tagFilter}
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
              {allUniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    tagFilter === tag
                      ? "bg-[#b8ff4d]/20 text-[#b8ff4d] font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes List Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`p-3.5 cursor-pointer transition-all relative group ${
                    isSelected
                      ? "bg-[#b8ff4d]/5 dark:bg-[#b8ff4d]/10 border-l-4 border-[#b8ff4d]"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        {note.isPinned && <Pin className="w-3 h-3 text-[#b8ff4d] fill-current shrink-0" />}
                        <h4
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-[#b8ff4d]" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {note.title || "Untitled Note"}
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {note.content || "Empty note"}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {note.category}
                        </span>
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        {note.tags && note.tags.length > 0 && (
                          <span className="text-slate-400 truncate max-w-[100px]">
                            #{note.tags.join(" #")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick actions on hover */}
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleTogglePin(note, e)}
                        className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                          note.isPinned ? "text-[#b8ff4d]" : "text-slate-400"
                        }`}
                        title={note.isPinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleTrashNote(note, e)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Note Editor ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#0c0f12]">
        {selectedNote ? (
          <>
            {/* Top Editor Toolbar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap bg-slate-50/50 dark:bg-slate-900/30">
              {/* Category picker & Tag indicator */}
              <div className="flex items-center gap-2">
                <select
                  value={editCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none focus:outline-none focus:ring-1 focus:ring-[#b8ff4d]"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleTogglePin(selectedNote)}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    selectedNote.isPinned
                      ? "bg-[#b8ff4d]/10 text-[#b8ff4d]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                  title={selectedNote.isPinned ? "Unpin Note" : "Pin to Top"}
                >
                  <Pin className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">{selectedNote.isPinned ? "Pinned" : "Pin"}</span>
                </button>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <button
                  onClick={() => insertFormat("**", "**")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertFormat("*", "*")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertFormat("~~", "~~")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />
                <button
                  onClick={() => insertFormat("# ", "")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Heading 1"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertFormat("## ", "")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />
                <button
                  onClick={() => insertFormat("- ", "")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertFormat("1. ", "")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertFormat("> ", "")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Quote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertFormat("```\n", "\n```")}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Autosave Indicator & Delete */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  {saveStatus === "saving" ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : saveStatus === "saved" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#b8ff4d]" />
                      <span className="text-[#b8ff4d]">Saved {lastSavedAt}</span>
                    </>
                  ) : (
                    <span>Last updated {new Date(selectedNote.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  )}
                </div>

                <button
                  onClick={() => handleTrashNote(selectedNote)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  title="Move to Trash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Title Input */}
            <div className="px-6 pt-6 pb-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note Title"
                className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Tags Ribbon */}
            <div className="px-6 py-2 flex items-center gap-1.5 flex-wrap border-b border-slate-100 dark:border-slate-800/40">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {editTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#b8ff4d]/10 text-[#b8ff4d]"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ Add tag (Press Enter)"
                className="text-xs bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none w-36"
              />
            </div>

            {/* Note Content Textarea */}
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write your note in Markdown or plain text..."
                className="w-full h-full resize-none bg-transparent text-slate-800 dark:text-slate-200 text-sm leading-relaxed focus:outline-none font-sans"
              />
            </div>
          </>
        ) : (
          /* Empty Selection State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No note selected</h3>
            <p className="text-xs max-w-sm mb-4">
              Choose a note from the left sidebar or create a new one to start writing.
            </p>
            <button
              onClick={handleCreateNote}
              className="px-4 py-2 rounded-xl bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  Save, 
  X,
  MoreVertical,
  CheckCircle2
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  category: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Fetch notes from Supabase
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (data) setNotes(data);
  };

  const handleCreateNote = async () => {
    const newNote = {
      title: "Untitled Note",
      content: "",
      category: "General",
    };
    
    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
      .select()
      .single();

    if (data) {
      setNotes([data, ...notes]);
      setCurrentNote(data);
      setIsEditing(true);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotes(notes.filter(n => n.id !== id));
      if (currentNote?.id === id) {
        setIsEditing(false);
        setCurrentNote(null);
      }
    }
  };

  const handleUpdateNote = async (field: keyof Note, value: string) => {
    if (!currentNote) return;
    const updatedNote = { ...currentNote, [field]: value, updated_at: new Date().toISOString() };
    setCurrentNote(updatedNote);
    
    const { error } = await supabase
      .from('notes')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', updatedNote.id);

    if (!error) {
      setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Personal Notes</h1>
          <p className="text-slate-500 font-medium">Capture ideas and store information securely.</p>
        </div>
        <button 
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          Create Note
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden min-h-[600px]">
        {/* Notes List Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layoutId={note.id}
                onClick={() => {
                  setCurrentNote(note);
                  setIsEditing(true);
                }}
                className={`p-5 rounded-3xl cursor-pointer border transition-all ${
                  currentNote?.id === note.id 
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" 
                    : "bg-white text-slate-900 border-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold truncate pr-4">{note.title}</h3>
                  <button 
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      currentNote?.id === note.id ? "hover:bg-white/10 text-white/60" : "hover:bg-red-50 text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className={`text-sm line-clamp-2 mb-3 font-medium ${
                  currentNote?.id === note.id ? "text-white/60" : "text-slate-500"
                }`}>
                  {note.content || "No content yet..."}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    currentNote?.id === note.id ? "text-white/40" : "text-slate-400"
                  }`}>
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    currentNote?.id === note.id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {note.category}
                  </span>
                </div>
              </motion.div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No notes found</p>
              </div>
            )}
          </div>
        </div>

        {/* Note Editor Area */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {isEditing && currentNote ? (
              <motion.div 
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* Editor Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <select 
                      value={currentNote.category}
                      onChange={(e) => handleUpdateNote("category", e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                    >
                      <option>General</option>
                      <option>Personal</option>
                      <option>Work</option>
                      <option>Ideas</option>
                    </select>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Last saved: {new Date(currentNote.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 2000);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <Save size={20} />
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 flex flex-col p-8 space-y-6">
                  <input 
                    type="text" 
                    value={currentNote.title}
                    onChange={(e) => handleUpdateNote("title", e.target.value)}
                    placeholder="Enter note title..."
                    className="text-4xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none tracking-tight bg-transparent"
                  />
                  <textarea 
                    value={currentNote.content}
                    onChange={(e) => handleUpdateNote("content", e.target.value)}
                    placeholder="Start writing your thoughts here..."
                    className="flex-1 w-full text-lg text-slate-600 placeholder:text-slate-200 focus:outline-none resize-none bg-transparent font-medium leading-relaxed"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-20 text-center"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-8">
                  <Edit3 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Editor Ready</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Select a note from the sidebar or create a new one to start editing.</p>
                <button 
                  onClick={handleCreateNote}
                  className="px-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all"
                >
                  Create Your First Note
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Auto-save Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-2xl z-[100]"
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="font-bold text-sm">Note saved automatically</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

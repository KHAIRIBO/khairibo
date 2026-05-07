"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, 
  Search, 
  Trash2, 
  Mail, 
  User, 
  Clock,
  CheckCircle2,
  X,
  Reply,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  status: string;
  created_at: string;
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'read' ? 'unread' : 'read';
    const { error } = await supabase
      .from('messages')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Messaging Inbox</h1>
        <p className="text-slate-500 font-medium">Manage and respond to client inquiries in real-time.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden min-h-[600px]">
        {/* Message List Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredMessages.map((msg) => (
              <motion.div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-5 rounded-3xl cursor-pointer border transition-all relative ${
                  selectedMessage?.id === msg.id 
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" 
                    : "bg-white text-slate-900 border-slate-100 hover:border-slate-300"
                }`}
              >
                {msg.status === 'unread' && (
                  <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    selectedMessage?.id === msg.id ? "bg-white/10" : "bg-slate-100"
                  }`}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold truncate pr-4">{msg.name}</h3>
                </div>
                <p className={`text-sm line-clamp-2 mb-3 font-medium ${
                  selectedMessage?.id === msg.id ? "text-white/60" : "text-slate-500"
                }`}>
                  {msg.content}
                </p>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  selectedMessage?.id === msg.id ? "text-white/40" : "text-slate-400"
                }`}>
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
            {filteredMessages.length === 0 && !loading && (
              <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                <Inbox className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Viewer area */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div 
                key="viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleToggleStatus(selectedMessage.id, selectedMessage.status)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedMessage.status === 'read' 
                          ? "bg-slate-200 text-slate-600" 
                          : "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      }`}
                    >
                      {selectedMessage.status === 'read' ? 'Mark Unread' : 'Mark as Read'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => setSelectedMessage(null)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-12 overflow-y-auto">
                  <div className="max-w-2xl">
                    <div className="flex items-start gap-6 mb-12">
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-2xl font-black">
                        {selectedMessage.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{selectedMessage.name}</h2>
                        <div className="flex items-center gap-3 text-slate-500 font-medium">
                          <Mail size={16} />
                          <span>{selectedMessage.email}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <Clock size={16} />
                          <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[2.5rem] text-slate-700 text-lg font-medium leading-relaxed mb-12">
                      {selectedMessage.content}
                    </div>

                    <div className="flex gap-4">
                      <a 
                        href={`mailto:${selectedMessage.email}`}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                      >
                        <Reply size={20} />
                        Reply via Email
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-8">
                  <Mail size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Select a Message</h3>
                <p className="text-slate-500 max-w-xs mx-auto font-medium">Click on a message from the sidebar to view full details and reply.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

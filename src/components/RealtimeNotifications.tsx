"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RealtimeNotifications() {
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    
    // Listen for new notes as a proxy for "new content"
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes' },
        (payload: any) => {
          setNotification({
            title: "New Content Added!",
            message: `A new note "${payload.new.title}" was just published.`
          });
          setTimeout(() => setNotification(null), 5000);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          setNotification({
            title: "New Message Received!",
            message: `${payload.new.name} just sent you a message.`
          });
          setTimeout(() => setNotification(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed bottom-8 right-8 z-[1000] w-80 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <div className="flex items-start justify-between">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Bell size={20} className="animate-bounce" />
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-slate-900 transition-all"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-amber-400" />
              <h4 className="font-black text-slate-900 tracking-tight">{notification.title}</h4>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {notification.message}
            </p>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Just now</span>
            <button className="text-xs font-bold text-blue-600 hover:underline">View Update</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

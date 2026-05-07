"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, Send, CheckCircle2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { GitHubIcon, LinkedInIcon, TwitterXIcon } from "@/components/BrandIcons";
import { supabase } from "@/lib/supabase";
import { toast, Toaster } from "sonner";
import confetti from "canvas-confetti";

export default function Contact() {
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic Validation
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const content = formData.get('message') as string;

    if (!name || !email || !content) {
      toast.error("Please fill in all fields", {
        icon: <AlertCircle className="text-red-500" />
      });
      return;
    }

    setIsSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ name, email, content }]);

      if (error) throw error;
      
      // Success Sequence
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899']
      });

      setShowSuccess(true);
      toast.success("Message sent successfully! 🚀", {
        description: "Thank you for contacting me. I will reply soon."
      });
      
      formRef.current?.reset();
      
      // Auto-reset UI after 6 seconds
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error("Something went wrong. Please try again.", {
        description: error.message
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <Toaster position="bottom-center" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-3xl rounded-[4rem] p-1 md:p-2 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative group">
          
          <div className="bg-white rounded-[3.8rem] p-8 md:p-16 flex flex-col md:flex-row gap-16 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Left Column: Info */}
            <div className="flex-1 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-widest mb-8"
              >
                <MessageSquare size={14} />
                Available for projects
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]"
              >
                Let's build something <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">incredible.</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-500 mb-12 font-medium leading-relaxed max-w-md"
              >
                Have a vision? Let's turn it into a high-performance reality. I'm currently taking on new projects.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Direct Contact</span>
                  <a href="mailto:khairibo32@gmail.com" className="group flex items-center gap-5 text-slate-900 hover:text-blue-600 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-500">
                      <Mail size={24} />
                    </div>
                    <span className="font-black text-xl tracking-tight">khairibo32@gmail.com</span>
                  </a>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Social Connect</span>
                  <div className="flex gap-4">
                    {[
                      { icon: GitHubIcon, href: "https://github.com/KHAIRIBO", color: "hover:bg-slate-900" },
                      { icon: LinkedInIcon, href: "https://www.linkedin.com/in/khairi-bouzakher/", color: "hover:bg-[#0A66C2]" },
                      { icon: TwitterXIcon, href: "#", color: "hover:bg-slate-900" }
                    ].map((social, i) => (
                      <a 
                        key={i} 
                        href={social.href} 
                        target="_blank" 
                        rel="noreferrer" 
                        className={`w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 ${social.color} hover:text-white transition-all duration-500 hover:-translate-y-2 hover:shadow-xl shadow-slate-200`}
                      >
                        <social.icon size={24} />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Form */}
            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-[3rem] border-2 border-emerald-50 shadow-2xl shadow-emerald-500/5"
                  >
                    <div className="relative mb-8">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10"
                      >
                        <CheckCircle2 size={48} />
                      </motion.div>
                      <motion.div 
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-emerald-500 rounded-full"
                      />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Message sent successfully! 🚀</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                      Thank you for contacting me. I will reply as soon as possible.
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSuccess(false)}
                      className="mt-12 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2 group"
                    >
                      <Sparkles size={16} className="group-hover:animate-spin" />
                      Send Another
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    ref={formRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 w-full" 
                    onSubmit={handleSubmit}
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Name</label>
                      <div className="group relative">
                        <input 
                          name="name" 
                          required 
                          type="text" 
                          placeholder="What's your name?" 
                          className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50/50 hover:bg-white font-medium text-slate-900 placeholder:text-slate-300"
                          disabled={isSending} 
                        />
                        <div className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email Address</label>
                      <div className="group relative">
                        <input 
                          name="email" 
                          required 
                          type="email" 
                          placeholder="Where can I reach you?" 
                          className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50/50 hover:bg-white font-medium text-slate-900 placeholder:text-slate-300"
                          disabled={isSending} 
                        />
                        <div className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Your Message</label>
                      <div className="group relative">
                        <textarea 
                          name="message" 
                          required 
                          rows={5} 
                          placeholder="Tell me about your project..." 
                          className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50/50 hover:bg-white font-medium text-slate-900 placeholder:text-slate-300 resize-none"
                          disabled={isSending}
                        />
                        <div className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                      </div>
                    </div>

                    <motion.button 
                      type="submit" 
                      disabled={isSending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-2xl shadow-slate-900/10 active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <div className="flex items-center gap-3">
                          <RefreshCw className="animate-spin" size={20} />
                          <span>Syncing...</span>
                        </div>
                      ) : (
                        <>
                          <span className="relative z-10">Launch Message</span>
                          <Send size={18} className="relative z-10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

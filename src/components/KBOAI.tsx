"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  User, 
  Mic, 
  Trash2, 
  ArrowRight,
  Maximize2,
  Minimize2,
  Terminal,
  Code,
  Zap,
  RefreshCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "Who is Khairi?",
  "What are Khairi's main skills?",
  "Tell me about his recent projects.",
  "How can I contact Khairi?",
  "What is his tech stack?"
];

export default function KBOAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kbo_chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: "ai", text: "Hii! I'm **KBO AI**, Khairi's digital twin. How can I help you build something amazing today?" }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("kbo_chat_history", JSON.stringify(messages));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input.trim();
    if (!userMsg || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg,
          history: messages.slice(-6) // Send last 6 messages for context
        }),
      });

      if (!res.body) throw new Error("No body");
      
      const reader = res.body.getReader();
      const decoder = new TextEncoder().encode("");
      let aiText = "";

      // Add placeholder message
      setMessages((prev) => [...prev, { role: "ai", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        aiText += chunk;
        
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = aiText;
          return newMsgs;
        });
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "I'm having a small technical glitch. Let's try that again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const clearChat = () => {
    localStorage.removeItem("kbo_chat_history");
    setMessages([{ role: "ai", text: "Chat history cleared. How can I help you now?" }]);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 40, filter: "blur(20px)" }}
            className={`bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col overflow-hidden relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              isExpanded ? "w-[900px] h-[750px]" : "w-[420px] h-[650px]"
            }`}
          >
            {/* Elite Animated Auras */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between relative z-10 bg-white/40">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/30">
                    <Bot size={28} className={isLoading ? "animate-pulse" : ""} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">KBO AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personal Assistant</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all hidden md:flex shadow-sm border border-transparent hover:border-slate-100">
                  {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button onClick={clearChat} title="Clear Chat" className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100">
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10 bg-slate-50/20"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-5 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      msg.role === "user" ? "bg-white border border-slate-100" : "bg-slate-900 text-white"
                    }`}>
                      {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={`p-6 rounded-[2.5rem] text-[15px] font-medium leading-relaxed shadow-xl shadow-slate-900/5 ${
                      msg.role === "user" 
                        ? "bg-slate-900 text-white rounded-tr-none" 
                        : "bg-white text-slate-700 border border-slate-50 rounded-tl-none"
                    }`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({node, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !match ? (
                              <code className={`${className} bg-slate-100 px-2 py-0.5 rounded-lg text-blue-600 font-bold`} {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          pre({children}) {
                            return (
                              <div className="relative group/code my-6">
                                <pre className="bg-slate-900 text-slate-100 p-6 rounded-[2rem] overflow-x-auto text-xs font-mono leading-loose shadow-2xl">
                                  {children}
                                </pre>
                              </div>
                            )
                          }
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-50 p-6 rounded-[2.5rem] rounded-tl-none flex gap-2 shadow-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {messages.length < 2 && (
                <div className="pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2 flex items-center gap-2">
                    <Zap size={12} className="text-blue-500" />
                    Recommended Queries
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSend(q)}
                        className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] transition-all text-left flex items-center justify-between group shadow-sm active:scale-95"
                      >
                        <span className="truncate pr-4">{q}</span>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-8 bg-white/40 backdrop-blur-2xl border-t border-slate-100 relative z-10">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-4"
              >
                <div className="flex-1 relative group">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message KBO AI..."
                    className="w-full pl-8 pr-28 py-5 bg-white border border-slate-200 rounded-3xl focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-900 shadow-sm"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={toggleVoice}
                      className={`p-3 rounded-2xl transition-all ${
                        isListening ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Mic size={20} />
                    </button>
                    <button 
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/20 active:scale-95"
                    >
                      {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group ${
          isOpen ? "bg-white text-slate-900" : "bg-slate-900 text-white"
        }`}
      >
        {/* Pulsing Aura */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-2xl bg-blue-600/20 blur-xl animate-pulse group-hover:scale-110 transition-transform duration-700" />
        )}
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 180, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="relative z-10 flex flex-col items-center">
              <Bot size={28} />
              <div className="absolute -top-1 -right-1">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

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
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([{ role: "ai", text: "Hii! I'm **KBO AI**, Khairi's digital twin. How can I help you build something amazing today?" }]);
      }
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
  }, [messages, isLoading]);

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
          history: messages.slice(-6)
        }),
      });

      if (!res.body) throw new Error("No body");
      
      const reader = res.body.getReader();
      let aiText = "";

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
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "I'm having a small technical glitch. Let's try asking again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
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
    <>
      {/* Mobile Backdrop Mask when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end gap-3 max-w-full">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden relative transition-all duration-500 ease-out z-[95] ${
                isExpanded 
                  ? "w-[calc(100vw-24px)] sm:w-[650px] md:w-[820px] h-[calc(100vh-80px)] sm:h-[700px]" 
                  : "w-[calc(100vw-24px)] sm:w-[420px] md:w-[460px] h-[calc(100vh-90px)] sm:h-[600px] max-h-[640px]"
              }`}
            >
              {/* Decorative Background Ambient Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Mobile Drag Indicator Bar */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

              {/* Header */}
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between relative z-10 bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shadow-slate-900/20">
                      <Bot size={20} className={`sm:w-6 sm:h-6 ${isLoading ? "animate-pulse text-blue-400" : ""}`} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                      KBO AI
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Online Assistant
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors hidden sm:flex"
                    title={isExpanded ? "Minimize Window" : "Expand Window"}
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>

                  <button 
                    onClick={clearChat} 
                    title="Clear Chat History" 
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Close Chat"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10 bg-slate-50/40 scrollbar-thin"
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-2.5 sm:gap-3 max-w-[88%] sm:max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5 text-xs ${
                        msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-900 text-white"
                      }`}>
                        {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                      </div>

                      <div className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                        msg.role === "user" 
                          ? "bg-slate-900 text-white rounded-tr-none" 
                          : "bg-white text-slate-800 border border-slate-200/70 rounded-tl-none"
                      }`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({node, className, children, ...props}) {
                              const match = /language-(\w+)/.exec(className || "");
                              return !match ? (
                                <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono text-[11px]" {...props}>
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
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto text-[11px] font-mono my-2 shadow-inner">
                                  {children}
                                </pre>
                              );
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
                    <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}

                {messages.length < 2 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <Zap size={11} className="text-amber-500" />
                      Suggested Questions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button 
                          key={i}
                          onClick={() => handleSend(q)}
                          className="p-3 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-xs transition-all text-left flex items-center justify-between group"
                        >
                          <span className="truncate pr-2">{q}</span>
                          <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-blue-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-100 relative z-10">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask KBO AI..."
                      className="w-full pl-4 pr-20 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400"
                      disabled={isLoading}
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={toggleVoice}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        }`}
                        title="Voice Input"
                      >
                        <Mic size={15} />
                      </button>

                      <button 
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40 shrink-0"
                      >
                        {isLoading ? <RefreshCw className="animate-spin" size={15} /> : <Send size={15} />}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating AI Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xl relative transition-all duration-300 group z-[100] ${
            isOpen ? "bg-white text-slate-900 border border-slate-200" : "bg-slate-900 text-white"
          }`}
          title="Toggle KBO AI Assistant"
        >
          {!isOpen && (
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-md animate-pulse group-hover:scale-110 transition-transform" />
          )}
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div key="bot" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="relative z-10 flex items-center justify-center">
                <Bot size={24} />
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-900"></span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}

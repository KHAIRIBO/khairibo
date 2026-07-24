"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ArrowUpRight, Clock, RefreshCw, Sparkles } from "lucide-react";

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

export default function TechNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 font-semibold text-xs sm:text-sm mb-3 sm:mb-4"
            >
              <Newspaper size={14} className="sm:w-4 sm:h-4" />
              Live Tech Pulse
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight"
            >
              Latest in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Technology & AI</span>
            </motion.h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchNews}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-blue-600 transition-colors shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shrink-0 w-fit"
            title="Refresh news feed"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : ""} />
            <span>Refresh Feed</span>
          </motion.button>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-6 sm:p-8 animate-pulse shadow-xs">
                <div className="w-full h-44 sm:h-52 bg-slate-100 rounded-2xl mb-6"></div>
                <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
              </div>
            ))
          ) : (
            articles.map((article, i) => (
              <motion.a
                key={i}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 hover:border-blue-500/30 transition-all flex flex-col justify-between hover:-translate-y-1 shadow-xs hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div>
                  {article.urlToImage && (
                    <div className="relative w-full h-44 sm:h-52 rounded-xl sm:rounded-2xl overflow-hidden mb-5 bg-slate-900">
                      <img 
                        src={article.urlToImage} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[10px] sm:text-xs font-bold text-white shadow-md border border-white/10">
                        {article.source?.name || "Tech News"}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-semibold mb-3">
                    <Clock size={12} className="text-blue-500" />
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6">
                    {article.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-blue-600 group-hover:text-blue-700">
                  <span>Read Full Article</span>
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </motion.a>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

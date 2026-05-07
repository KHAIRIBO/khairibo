"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ArrowUpRight, Clock, RefreshCw } from "lucide-react";

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
    <section className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium mb-6"
            >
              <Newspaper size={16} />
              Tech Pulse
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
            >
              Latest in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Technology</span>
            </motion.h2>
          </div>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            onClick={fetchNews}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
          >
            <RefreshCw size={20} />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[3rem] border border-slate-100 p-8 animate-pulse shadow-sm">
                <div className="w-full h-56 bg-slate-50 rounded-[2.5rem] mb-8"></div>
                <div className="h-7 bg-slate-50 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-50 rounded-full w-full mb-3"></div>
                <div className="h-4 bg-slate-50 rounded-full w-2/3"></div>
              </div>
            ))
          ) : (
            articles.map((article, i) => (
              <motion.a
                key={i}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white rounded-[3rem] border border-slate-100 p-8 hover:border-blue-500/20 transition-all flex flex-col hover:-translate-y-3 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {article.urlToImage && (
                  <div className="relative w-full h-56 rounded-[2.5rem] overflow-hidden mb-8 shadow-inner bg-slate-50">
                    <img 
                      src={article.urlToImage} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 shadow-xl border border-white/50">
                      {article.source.name}
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black mb-5 uppercase tracking-[0.2em]">
                    <Clock size={14} className="text-blue-500" />
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-[1.2] tracking-tight">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 text-[15px] font-medium line-clamp-3 leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                    {article.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest pt-6 border-t border-slate-50">
                  Read full story
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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

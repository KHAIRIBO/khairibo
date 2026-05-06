"use client";

import { motion } from "framer-motion";
import { Layout, Server, Database, Sparkles } from "lucide-react";

const skillCategories = [
  {
    title: "Frontend Development",
    icon: <Layout className="text-blue-500" size={24} />,
    color: "bg-blue-50 border-blue-100",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Vue.js"]
  },
  {
    title: "Backend Engineering",
    icon: <Server className="text-emerald-500" size={24} />,
    color: "bg-emerald-50 border-emerald-100",
    skills: ["Node.js", "Express", "Python", "RESTful APIs", "GraphQL"]
  },
  {
    title: "Database & Cloud",
    icon: <Database className="text-orange-500" size={24} />,
    color: "bg-orange-50 border-orange-100",
    skills: ["PostgreSQL", "MongoDB", "Firebase", "Supabase", "Docker"]
  },
  {
    title: "AI & Tools",
    icon: <Sparkles className="text-purple-500" size={24} />,
    color: "bg-purple-50 border-purple-100",
    skills: ["OpenAI API", "LangChain", "Git", "GitHub Actions", "Vercel"]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 -z-10 opacity-30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-b from-blue-100 to-transparent rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            Technical Arsenal
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            A curated stack of modern technologies chosen for performance, scalability, and developer experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center mb-6`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, i) => (
                  <span 
                    key={i}
                    className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium border border-slate-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

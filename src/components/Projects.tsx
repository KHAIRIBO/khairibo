"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, FolderGit2, Star, GitFork, Sparkles, Code2 } from "lucide-react";
import { GitHubIcon } from "@/components/BrandIcons";

interface Project {
  id: string;
  title: string;
  repoName: string;
  description: string;
  tags: string[];
  category: "all" | "web" | "tools" | "featured";
  demoUrl?: string;
  githubUrl: string;
  stars: number;
  forks: number;
  gradient: string;
  imageUrl: string;
  badge?: string;
}

const projects: Project[] = [
  {
    id: "live-weather",
    title: "Live Weather Intelligence",
    repoName: "Live-Weather-Intelligence",
    description: "Real-time global weather intelligence & meteorological analytics platform with live radar mapping, city forecast tracking, and interactive climate widgets.",
    tags: ["TypeScript", "Next.js", "Open-Meteo", "Tailwind CSS"],
    category: "featured",
    githubUrl: "https://github.com/KHAIRIBO/Live-Weather-Intelligence",
    stars: 1,
    forks: 0,
    gradient: "from-blue-600 to-cyan-500",
    imageUrl: "https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=800&q=80",
    badge: "New Release",
  },
  {
    id: "dbrtna",
    title: "Dbrtna - Tunisian Cuisine 🇹🇳",
    repoName: "dbrtna",
    description: "Tunisian culinary showcase featuring traditional & modern dishes from across Tunisia like Couscous, Brik, Lablabi, and Slata Mechouia. Rich recipe database & culture hub.",
    tags: ["JavaScript", "React", "Tunisian Culture", "Tailwind CSS"],
    category: "featured",
    githubUrl: "https://github.com/KHAIRIBO/dbrtna",
    stars: 1,
    forks: 0,
    gradient: "from-red-600 to-amber-500",
    imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
  },
  {
    id: "budget-analyse",
    title: "Budget Analytics App",
    repoName: "budget-analyse",
    description: "Interactive financial budget analysis app with visual data charts, transaction categorization, monthly expense tracking, and goal planning.",
    tags: ["TypeScript", "Next.js", "Vercel", "Tailwind CSS"],
    category: "web",
    demoUrl: "https://budget-analyse.vercel.app",
    githubUrl: "https://github.com/KHAIRIBO/budget-analyse",
    stars: 1,
    forks: 0,
    gradient: "from-emerald-600 to-teal-500",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    badge: "Live App",
  },
  {
    id: "murox-studio",
    title: "Murox Studio",
    repoName: "murox.studio",
    description: "Modern creative design studio portfolio and agency showcase featuring 3D interactive elements, dark mode aesthetics, and glassmorphic micro-animations.",
    tags: ["TypeScript", "Next.js", "Framer Motion", "Three.js"],
    category: "web",
    demoUrl: "https://muroxstudio.vercel.app",
    githubUrl: "https://github.com/KHAIRIBO/murox.studio",
    stars: 1,
    forks: 0,
    gradient: "from-purple-600 to-pink-500",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    badge: "Live App",
  },
  {
    id: "modern-restaurant",
    title: "Modern Restaurant Site",
    repoName: "modern-restaurant-website",
    description: "Elegant fine-dining restaurant web app with digital interactive menu, table reservation system, order cart, and customer reviews.",
    tags: ["JavaScript", "React", "Tailwind CSS", "Node.js"],
    category: "web",
    githubUrl: "https://github.com/KHAIRIBO/modern-restaurant-website",
    stars: 1,
    forks: 0,
    gradient: "from-amber-600 to-orange-500",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "iptv-hub",
    title: "IPTV Streaming Media Hub",
    repoName: "iptv",
    description: "Web IPTV streaming media hub and player dashboard for live television channels, movie library catalog, and high-definition video playback.",
    tags: ["JavaScript", "HLS.js", "Video.js", "CSS3"],
    category: "tools",
    githubUrl: "https://github.com/KHAIRIBO/iptv",
    stars: 1,
    forks: 0,
    gradient: "from-indigo-600 to-violet-500",
    imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "edropo",
    title: "Edropo Educational System",
    repoName: "edropo",
    description: "Educational management system and e-learning platform with course enrollment, file drop solutions, and student administration tools.",
    tags: ["PHP", "MySQL", "Bootstrap", "JavaScript"],
    category: "tools",
    githubUrl: "https://github.com/KHAIRIBO/edropo",
    stars: 0,
    forks: 0,
    gradient: "from-sky-600 to-indigo-500",
    imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "restaurant-websites",
    title: "Restaurant Digital Suite",
    repoName: "restaurant-websites",
    description: "Comprehensive multi-concept digital web suite for restaurants, cafes, and food delivery businesses with online menus and POS integration.",
    tags: ["TypeScript", "Next.js", "React", "Tailwind CSS"],
    category: "web",
    githubUrl: "https://github.com/KHAIRIBO/restaurant-websites",
    stars: 1,
    forks: 0,
    gradient: "from-rose-600 to-red-500",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "to-do-app",
    title: "Productivity Task Master",
    repoName: "to-do-app",
    description: "Sleek task management and productivity suite with project boards, deadline reminders, task priority flags, and progress statistics.",
    tags: ["JavaScript", "HTML5", "CSS3", "LocalStorage"],
    category: "tools",
    githubUrl: "https://github.com/KHAIRIBO/to-do-app",
    stars: 0,
    forks: 0,
    gradient: "from-cyan-600 to-blue-500",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Projects() {
  const [activeTab, setActiveTab] = useState<"all" | "featured" | "web" | "tools">("all");

  const filteredProjects = activeTab === "all"
    ? projects
    : projects.filter((p) => p.category === activeTab || (activeTab === "featured" && p.badge));

  return (
    <section id="projects" className="py-16 sm:py-24 relative bg-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 font-semibold text-xs sm:text-sm mb-3 sm:mb-4"
            >
              <FolderGit2 size={14} className="sm:w-4 sm:h-4" />
              GitHub Repositories Showcase
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight"
            >
              Crafted Projects & Code Repositories.
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 sm:mt-4"
            >
              Explore my official public projects directly synced from my GitHub account{" "}
              <a
                href="https://github.com/KHAIRIBO?tab=repositories"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-medium hover:text-blue-800"
              >
                @KHAIRIBO
              </a>.
            </motion.p>
          </div>

          {/* Filter Pills - Responsive mobile scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full md:w-auto">
            {[
              { key: "all", label: "All Projects" },
              { key: "featured", label: "Featured" },
              { key: "web", label: "Web Apps" },
              { key: "tools", label: "Tools" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${
                  activeTab === tab.key
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid - Fully responsive grid for mobile, tablet, and desktop */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo Preview Container */}
                <div className="h-44 sm:h-52 relative overflow-hidden bg-slate-900">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${project.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  {/* Badge if available */}
                  {project.badge && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-slate-900/90 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-md">
                      <Sparkles size={11} className="text-amber-400" />
                      {project.badge}
                    </div>
                  )}

                  {/* GitHub Repository Star & Fork Counter */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/80 text-slate-200 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg backdrop-blur-md border border-slate-700/80 flex items-center gap-2.5">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star size={11} className="fill-amber-400" />
                      {project.stars}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <GitFork size={11} />
                      {project.forks}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm mb-5 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {project.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] sm:text-xs font-medium border border-slate-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer Action Links */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
                      {project.demoUrl ? (
                        <a 
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ExternalLink size={13} />
                          Live Demo
                        </a>
                      ) : (
                        <span className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-1 truncate">
                          <Code2 size={13} className="shrink-0" />
                          <span className="truncate">{project.repoName}</span>
                        </span>
                      )}

                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shrink-0"
                      >
                        <GitHubIcon size={13} />
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All on GitHub Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden text-center md:text-left"
        >
          <div className="relative z-10 max-w-xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Want to see more repositories & commits?
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base">
              Visit my official GitHub profile to see all my contributions, open-source projects, and source codes.
            </p>
          </div>

          <a
            href="https://github.com/KHAIRIBO?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="relative z-10 px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl flex items-center justify-center gap-2.5 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 shrink-0 w-full sm:w-auto"
          >
            <GitHubIcon size={18} />
            Visit GitHub @KHAIRIBO
            <ExternalLink size={15} />
          </a>

          {/* Background Decorative Element */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>

      </div>
    </section>
  );
}

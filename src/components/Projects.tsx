"use client";

import { motion } from "framer-motion";
import { ExternalLink, FolderGit2 } from "lucide-react";
import { GitHubIcon } from "@/components/BrandIcons";

const projects = [
  {
    title: "Modern E-Commerce",
    description: "High-performance storefront with headless CMS integration, smooth cart animations, and instant checkout flows.",
    tags: ["React", "Node.js", "Stripe", "Framer Motion"],
    demoUrl: "#",
    githubUrl: "https://github.com/KHAIRIBO",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Real-time Dashboard",
    description: "Financial data visualization dashboard with WebSocket integration for live updates and customizable widget layouts.",
    tags: ["Vue.js", "PostgreSQL", "Tailwind CSS", "Socket.io"],
    demoUrl: "#",
    githubUrl: "https://github.com/KHAIRIBO",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Developer Portfolio",
    description: "Premium personal website with glassmorphism design, smooth scroll interactions, and optimized performance.",
    tags: ["Next.js", "Framer Motion", "Tailwind CSS"],
    demoUrl: "#",
    githubUrl: "https://github.com/KHAIRIBO",
    color: "from-emerald-500 to-teal-500",
  }
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-medium mb-6"
          >
            <FolderGit2 size={16} />
            Selected Work
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            Crafted with precision.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            A collection of projects showcasing my focus on clean UI, robust architecture, and seamless user experiences.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-3xl bg-white border border-slate-200 overflow-hidden hover-lift"
            >
              {/* Decorative Header */}
              <div className="h-48 relative overflow-hidden bg-slate-50 flex items-center justify-center border-b border-slate-100">
                <div className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${project.color}`}></div>
                <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <FolderGit2 className="text-slate-400" size={32} />
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-600 mb-6 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <a 
                    href={project.demoUrl}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Live Demo
                  </a>
                  <a 
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <GitHubIcon size={16} />
                    Source Code
                  </a>
                </div>
              </div>

              {/* Animated Border Glow Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/10 rounded-3xl transition-colors duration-500 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

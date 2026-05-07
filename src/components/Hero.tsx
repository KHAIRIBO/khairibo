"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Code2 } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/BrandIcons";
import Image from "next/image";

const roles = [
  "Web Developer",
  "Creative Developer",
  "AI Developer",
  "Frontend"
];

export default function Hero() {
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="blob bg-blue-300 w-96 h-96 top-20 -left-20"></div>
        <div className="blob bg-purple-300 w-80 h-80 bottom-20 -right-10" style={{ animationDelay: "2s" }}></div>
        <div className="blob bg-pink-200 w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" style={{ animationDelay: "4s" }}></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Available for new opportunities
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
              Hi, I'm <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Khairi Bouzakher</span>
            </h1>
            
            <div className="h-12 lg:h-16 mb-6">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentRole}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl lg:text-4xl font-semibold text-gradient"
                >
                  {roles[currentRole]}
                </motion.h2>
              </AnimatePresence>
            </div>

            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
              I build clean, modern, and highly performant digital experiences. Passionate about bridging the gap between beautiful design and robust engineering.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
              <a href="#projects" className="group px-8 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 hover-lift flex items-center gap-2 w-full sm:w-auto justify-center">
                View Projects
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/Khairi_Bouzakher_CV.pdf" download className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-medium hover:border-slate-300 hover:bg-slate-50 hover-lift w-full sm:w-auto justify-center flex">
                Download CV
              </a>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start">
              <a href="https://github.com/KHAIRIBO" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 transition-colors hover:-translate-y-1 transform duration-300">
                <GitHubIcon size={24} />
              </a>
              <a href="https://www.linkedin.com/in/khairi-bouzakher/" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors hover:-translate-y-1 transform duration-300">
                <LinkedInIcon size={24} />
              </a>
              <a href="mailto:khairibo32@gmail.com" className="text-slate-500 hover:text-red-500 transition-colors hover:-translate-y-1 transform duration-300">
                <Mail size={24} />
              </a>
            </div>
          </motion.div>

          {/* Visual Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative max-w-md mx-auto lg:max-w-none"
          >
            <div className="relative w-72 h-72 lg:w-[450px] lg:h-[450px] mx-auto">
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute inset-0 rounded-3xl overflow-hidden glass p-2"
              >
                <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-100">
                  <Image 
                    src="/photo/khairibo.png" 
                    alt="Khairi Bouzakher" 
                    fill 
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>

              {/* Floating Decorative Element */}
              <motion.div 
                animate={{ y: [10, -10, 10] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 glass px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl"
              >
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <Code2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clean Code</p>
                  <p className="text-sm font-semibold text-slate-800">Modern Stack</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

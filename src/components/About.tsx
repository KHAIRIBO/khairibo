"use client";

import { motion } from "framer-motion";
import { User, Code, Lightbulb, Zap } from "lucide-react";
import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Image & Stats Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full relative"
          >
            <div className="relative w-full max-w-md mx-auto aspect-square rounded-[3rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 z-0"></div>
              <Image 
                src="/photo/khairibo.png"
                alt="Khairi Bouzakher"
                fill
                className="object-cover relative z-10"
              />
            </div>

            {/* Floating Stat Card */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-4 lg:-right-12 glass p-6 rounded-3xl shadow-xl border border-white/50 hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3+
                </div>
                <div>
                  <p className="font-bold text-slate-900">Years</p>
                  <p className="text-sm text-slate-500">Experience</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Text Content Column */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 font-medium mb-6">
              <User size={16} />
              About Me
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Driven by curiosity, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                built for performance.
              </span>
            </h2>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              I'm Khairi Bouzakher, a Full Stack Developer and Computer Science student. I specialize in building highly interactive, accessible, and performant web applications. 
              <br/><br/>
              My passion lies in blending clean, modern design with robust engineering principles. Whether it's crafting a pixel-perfect frontend or architecting a scalable backend, I approach every problem with a creative mindset and technical rigor.
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                <Code className="text-blue-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Clean Code</h4>
                  <p className="text-sm text-slate-500">Maintainable architecture</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                <Lightbulb className="text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Problem Solver</h4>
                  <p className="text-sm text-slate-500">Creative solutions</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                <Zap className="text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Fast Learner</h4>
                  <p className="text-sm text-slate-500">Adapting to new tech</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

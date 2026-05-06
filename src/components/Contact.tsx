"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Send } from "lucide-react";
import { GitHubIcon, LinkedInIcon, TwitterXIcon } from "@/components/BrandIcons";

export default function Contact() {
  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-full opacity-50"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-16">
            
            {/* Contact Info */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium mb-6"
              >
                <MessageSquare size={16} />
                Get in Touch
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
              >
                Let's build something <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">amazing together.</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-600 mb-10"
              >
                Whether you have a project in mind, need a developer for your team, or just want to say hi, my inbox is always open.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <a href="mailto:khairibo32@gmail.com" className="group flex items-center gap-4 text-slate-600 hover:text-blue-600 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Mail size={20} />
                  </div>
                  <span className="font-medium text-lg">khairibo32@gmail.com</span>
                </a>

                <div className="flex gap-4 pt-4">
                  <a href="https://github.com/KHAIRIBO" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all hover:-translate-y-1">
                    <GitHubIcon size={20} />
                  </a>
                  <a href="https://www.linkedin.com/in/khairi-bouzakher/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all hover:-translate-y-1">
                    <LinkedInIcon size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all hover:-translate-y-1">
                    <TwitterXIcon size={20} />
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Form Placeholder */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex-1 bg-slate-50 rounded-3xl p-8"
            >
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea rows={4} placeholder="How can I help you?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white resize-none"></textarea>
                </div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 group">
                  Send Message
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

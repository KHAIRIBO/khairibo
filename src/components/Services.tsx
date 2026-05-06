"use client";

import { motion } from "framer-motion";
import { MonitorSmartphone, Palette, BrainCircuit, Blocks } from "lucide-react";

const services = [
  {
    title: "Website Development",
    description: "Building fast, responsive, and SEO-friendly websites using modern frameworks like Next.js and React. Focusing on performance and accessibility.",
    icon: <MonitorSmartphone size={32} className="text-blue-500" />,
    bg: "bg-blue-50"
  },
  {
    title: "UI/UX Design",
    description: "Crafting beautiful, intuitive interfaces with clean aesthetics. Implementing modern design systems and smooth micro-interactions.",
    icon: <Palette size={32} className="text-pink-500" />,
    bg: "bg-pink-50"
  },
  {
    title: "AI Integration",
    description: "Empowering applications with artificial intelligence. Integrating LLMs, custom prompt pipelines, and automated AI workflows.",
    icon: <BrainCircuit size={32} className="text-purple-500" />,
    bg: "bg-purple-50"
  },
  {
    title: "API Development",
    description: "Designing robust, scalable backend architectures. Developing RESTful APIs and seamless third-party integrations.",
    icon: <Blocks size={32} className="text-emerald-500" />,
    bg: "bg-emerald-50"
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            Capabilities
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Delivering end-to-end digital solutions that combine beautiful design with powerful engineering.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-20 h-20 rounded-2xl ${service.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {service.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

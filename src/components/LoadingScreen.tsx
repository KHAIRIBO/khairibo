"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles
    setParticles([...Array(6)].map((_, i) => ({
      id: i,
      x: Math.random() * 40 - 20,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 2,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    })));

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    // Snappy loading completion: finishes smoothly after 1.2s max so users are never kept waiting
    const timer = setTimeout(() => setIsLoading(false), 1200);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, [mouseX, mouseY]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center overflow-hidden px-4"
        >
          {/* Mouse Light Glow Effect */}
          <motion.div 
            style={{
              left: springX,
              top: springY,
              x: "-50%",
              y: "-50%",
            }}
            className="absolute pointer-events-none w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-blue-100/40 rounded-full blur-[100px] sm:blur-[120px] z-0"
          />

          {/* Background Ambient Blobs */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                x: [0, 30, 0], 
                y: [0, -20, 0],
                scale: [1, 1.1, 1] 
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-[10%] left-[10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-purple-100/50 rounded-full blur-[80px] sm:blur-[100px]"
            />
            <motion.div 
              animate={{ 
                x: [0, -30, 0], 
                y: [0, 40, 0],
                scale: [1, 1.2, 1] 
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
              className="absolute bottom-[10%] right-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-100/50 rounded-full blur-[90px] sm:blur-[120px]"
            />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.2, 0.6, 0.2],
                  y: [0, -60, 0],
                  x: [0, particle.x, 0]
                }}
                transition={{ 
                  duration: particle.duration, 
                  repeat: Infinity, 
                  delay: particle.delay 
                }}
                className="absolute w-1 h-1 bg-slate-400 rounded-full"
                style={{
                  top: particle.top,
                  left: particle.left,
                }}
              />
            ))}
          </div>

          {/* Content Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center text-center max-w-xs sm:max-w-md"
          >
            {/* Logo */}
            <div className="relative">
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-none">
                KBO<span className="text-blue-600">.</span>
              </h1>
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 blur-2xl text-blue-500 select-none pointer-events-none"
              >
                <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter">KBO.</h1>
              </motion.div>
            </div>

            {/* Loading Bar */}
            <div className="mt-8 sm:mt-12 flex flex-col items-center gap-4 sm:gap-6 w-full">
              <div className="w-48 sm:w-64 h-[3px] bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 origin-left rounded-full"
                />
              </div>

              <p className="text-[10px] sm:text-xs text-slate-400 font-extrabold tracking-[0.3em] sm:tracking-[0.4em] uppercase">
                Loading Experience
              </p>
            </div>
          </motion.div>

          {/* Glass Outer Border */}
          <div className="absolute inset-3 sm:inset-6 md:inset-8 border border-slate-200/50 rounded-2xl sm:rounded-[3rem] pointer-events-none z-20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

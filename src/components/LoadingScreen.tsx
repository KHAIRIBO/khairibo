"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse reactive motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring physics for the light effect
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setParticles([...Array(6)].map((_, i) => ({
      id: i,
      x: Math.random() * 40 - 20,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    })));
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    const timer = setTimeout(() => setIsLoading(false), 3000);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, [mouseX, mouseY]);


  const logoVariants = {
    initial: { opacity: 0, filter: "blur(20px)", scale: 0.8, letterSpacing: "-0.1em" },
    animate: { 
      opacity: 1, 
      filter: "blur(0px)", 
      scale: 1, 
      letterSpacing: "0.05em",
      transition: { 
        duration: 1.2, 
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for Apple-like feel
        delay: 0.2
      } 
    }
  };

  const lineVariants = {
    initial: { scaleX: 0, opacity: 0 },
    animate: { 
      scaleX: 1, 
      opacity: 1,
      transition: { 
        duration: 2.5, 
        ease: "easeInOut",
        delay: 0.5
      } 
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            transition: { duration: 0.8, ease: "easeInOut" } 
          }}
          className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Noise Texture Overlay */}
          <div className="noise-overlay" />

          {/* Mouse Reactive Light Effect */}
          <motion.div 
            style={{
              left: springX,
              top: springY,
              x: "-50%",
              y: "-50%",
            }}
            className="absolute pointer-events-none w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] z-0"
          />

          {/* Background Gradient Blobs */}
          <div className="absolute inset-0 z-0">
            <motion.div 
              animate={{ 
                x: [0, 50, 0], 
                y: [0, -30, 0],
                scale: [1, 1.1, 1] 
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] opacity-60"
            />
            <motion.div 
              animate={{ 
                x: [0, -40, 0], 
                y: [0, 60, 0],
                scale: [1, 1.2, 1] 
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
              className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-50"
            />
          </div>

          {/* Floating Abstract Particles */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {mounted && particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.2, 0.5, 0.2],
                  y: [0, -100, 0],
                  x: [0, particle.x, 0]
                }}
                transition={{ 
                  duration: particle.duration, 
                  repeat: Infinity, 
                  delay: particle.delay 
                }}
                className="absolute w-1 h-1 bg-slate-300 rounded-full"
                style={{
                  top: particle.top,
                  left: particle.left,
                }}
              />
            ))}
          </div>

          {/* Content Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo Section */}
            <motion.div
              variants={logoVariants}
              initial="initial"
              animate="animate"
              className="flex flex-col items-center"
            >
              <div className="relative">
                <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter">
                  KBO<span className="text-blue-600">.</span>
                </h1>
                {/* Logo Reflection/Glow */}
                <motion.div 
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 blur-2xl text-blue-400 opacity-30 select-none pointer-events-none"
                >
                  <h1 className="text-7xl md:text-9xl font-black tracking-tighter">KBO.</h1>
                </motion.div>
              </div>

              {/* Loading Bar Section */}
              <div className="mt-12 flex flex-col items-center gap-6">
                <div className="w-64 h-[2px] bg-slate-100 rounded-full overflow-hidden relative">
                  <motion.div
                    variants={lineVariants}
                    initial="initial"
                    animate="animate"
                    className="h-full bg-slate-900 origin-left"
                  />
                  {/* Glowing Pulse Effect on Bar */}
                  <motion.div 
                    animate={{ 
                      left: ["-100%", "200%"],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: 0.5
                    }}
                    className="absolute top-0 w-20 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
                  />
                </div>

                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="text-[10px] text-slate-400 font-bold tracking-[0.5em] uppercase"
                >
                  Refining the future
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* Glassmorphism Subtle Frame */}
          <div className="absolute inset-8 border border-white/20 rounded-[3rem] pointer-events-none z-20 backdrop-blur-[1px]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

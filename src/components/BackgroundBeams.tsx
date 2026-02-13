"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function BackgroundBeams() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dynamic gradient blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute -bottom-[20%] left-[20%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]"
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
        }}
      />

      {/* Shooting stars effect */}
      <ShootingStars />
    </div>
  );
}

function ShootingStars() {
  const [mounted, setMounted] = useState(false);
  const stars = Array.from({ length: 6 });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 1000 - 500, // Random start X
            y: -100, // Start above screen
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: Math.random() * 1000 + 500, // Move right
            y: 1000, // Move down
            opacity: [0, 1, 0], // Fade in/out
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 3 + 2, // Random duration 2-5s
            repeat: Infinity,
            delay: Math.random() * 5, // Random delay
            ease: "linear",
          }}
          className="absolute h-1 w-1 rounded-full bg-white shadow-[0_0_20px_2px_rgba(255,255,255,0.4)]"
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

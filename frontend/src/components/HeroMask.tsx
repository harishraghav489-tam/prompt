"use client";

import { motion } from "framer-motion";

export function HeroMask() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative">
        <div className="absolute -bottom-8 left-1/2 h-8 w-48 -translate-x-1/2 rounded-[100%] bg-primary/20 blur-xl" />
        <div className="absolute -bottom-4 left-1/2 h-4 w-32 -translate-x-1/2 rounded-[100%] border border-primary/30 bg-primary/5" />
        <motion.div
          className="relative flex h-56 w-56 items-center justify-center rounded-[2rem] border border-primary/40 bg-gradient-to-b from-primary/20 to-transparent neon-glow md:h-72 md:w-72"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 200 200"
            className="h-40 w-40 text-primary md:h-52 md:w-52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M100 20 L170 70 L145 170 L55 170 L30 70 Z"
              stroke="currentColor"
              strokeWidth="4"
              fill="rgba(74,222,128,0.08)"
            />
            <path
              d="M70 85 C70 70 85 60 100 60 C115 60 130 70 130 85 C130 105 100 125 100 125 C100 125 70 105 70 85 Z"
              stroke="currentColor"
              strokeWidth="4"
              fill="rgba(74,222,128,0.12)"
            />
            <circle cx="85" cy="82" r="6" fill="currentColor" />
            <circle cx="115" cy="82" r="6" fill="currentColor" />
            <path
              d="M82 105 Q100 118 118 105"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

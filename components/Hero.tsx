"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import HeroBackground from "@/components/HeroBackground";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center">
      {/* Sports Abstract Gradient Vector Background - Hero Section Only */}
      <HeroBackground />
      
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-20 relative z-10">
        <div className="text-center max-w-5xl mx-auto flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-block"
          >
            <h1
              className="grunge-text-enhanced text-6xl md:text-8xl lg:text-9xl mb-2 inline-block"
              data-text="SPORTSTRIBE UNITED"
              style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontWeight: 400, letterSpacing: '0.12em' }}
            >
              <span className="text-st-white hero-title-white">SPORTS</span>
              <span className="text-[#FF3B3B] hero-title-red">TRIBE</span>
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontWeight: 400, letterSpacing: '0.15em' }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A3D] via-[#E94057] to-[#FF934F] hero-title-red">
                UNITED
              </span>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-8"
          >
            {["JOIN", "PLAY", "COMPETE", "CONNECT"].map((word, idx) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                className="relative inline-block"
              >
                <span className="text-xl md:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A3D] via-[#E94057] to-[#FF934F] tracking-wider">
                  {word}
                </span>
                {idx < 3 && (
                  <span className="mx-2 text-[#FF6A3D] text-xl md:text-2xl lg:text-3xl font-bold animate-pulse">•</span>
                )}
              </motion.span>
            ))}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-st-text/90 mb-8 max-w-2xl mx-auto"
          >
            Your community for all things sports.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, delay: 0.5 }} 
            className="mt-8"
          >
            <Link 
              href="/communities" 
              className="st-cta st-cta-glow px-8 py-4 rounded-full text-st-white font-bold text-lg inline-block hover:scale-105 transition-transform"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



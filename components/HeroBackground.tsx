"use client";
import { motion } from "framer-motion";

export default function HeroBackground() {
  // Floating sports icons data with increased sizes
  const floatingIcons = [
    { id: 1, icon: "⚽", delay: 0, duration: 8, x: "8%", y: "25%" },
    { id: 2, icon: "🏀", delay: 1, duration: 10, x: "88%", y: "20%" },
    { id: 3, icon: "🎾", delay: 2, duration: 9, x: "12%", y: "65%" },
    { id: 4, icon: "🏏", delay: 1.5, duration: 11, x: "85%", y: "70%" },
    { id: 5, icon: "🏐", delay: 0.5, duration: 8.5, x: "48%", y: "40%" },
    { id: 6, icon: "🏸", delay: 2.5, duration: 9.5, x: "72%", y: "55%" },
    { id: 7, icon: "⚾", delay: 1.8, duration: 8.8, x: "55%", y: "75%" },
    { id: 8, icon: "🏓", delay: 2.2, duration: 9.2, x: "35%", y: "30%" },
    { id: 9, icon: "🥎", delay: 0.8, duration: 9.8, x: "92%", y: "58%" },
    { id: 10, icon: "🏃", delay: 3, duration: 10, x: "22%", y: "50%" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlay matching existing palette */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A063B]/80 via-[#2C0C5B]/85 to-[#1A063B]/80" />
      
      {/* Sports-themed gradient accents using existing palette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(122,31,162,0.15),transparent_60%),radial-gradient(ellipse_at_top_right,rgba(233,64,87,0.12),transparent_60%),radial-gradient(ellipse_at_bottom_center,rgba(255,106,61,0.1),transparent_60%)]" />

      {/* Floating Animated Sports Icons - Increased Size */}
      {floatingIcons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute text-5xl md:text-6xl lg:text-7xl opacity-[0.15]"
          style={{
            left: icon.x,
            top: icon.y,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, 12, 0],
            rotate: [0, 8, -8, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: icon.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: icon.delay,
          }}
        >
          {icon.icon}
        </motion.div>
      ))}

      {/* Abstract Sports Elements - Subtle patterns */}
      <div className="absolute inset-0 opacity-[0.08]">
        {/* Abstract football/net pattern */}
        <svg className="absolute top-1/3 right-1/4 w-40 h-40 md:w-48 md:h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="currentColor" className="text-white" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
          <path d="M10 50 L90 50 M50 10 L50 90" stroke="currentColor" className="text-white" strokeWidth="1"/>
        </svg>

        {/* Basketball court lines */}
        <svg className="absolute bottom-1/4 left-1/3 w-48 h-48 md:w-56 md:h-56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 50 L90 50" stroke="currentColor" className="text-white" strokeWidth="2"/>
          <circle cx="50" cy="50" r="25" stroke="currentColor" className="text-white" strokeWidth="1" fill="none"/>
        </svg>

        {/* Tennis court lines */}
        <svg className="absolute top-2/3 left-1/2 -translate-x-1/2 w-44 h-44 md:w-52 md:h-52" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="60" height="60" stroke="currentColor" className="text-white" strokeWidth="1" fill="none"/>
          <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" className="text-white" strokeWidth="1"/>
        </svg>
      </div>

      {/* Additional gradient mesh for smooth transitions */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(233,64,87,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,106,61,0.08),transparent_50%),radial-gradient(circle_at_50%_50%,rgba(122,31,162,0.06),transparent_60%)]" />
    </div>
  );
}


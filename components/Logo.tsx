"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "header" | "footer" | "default";
  className?: string;
  logoImagePath?: string; // Path to logo image file in public folder
  showTextWithImage?: boolean; // Whether to show text when using image (default: false, as image likely contains text)
}

export default function Logo({ 
  showTagline = false, 
  size = "md",
  variant = "default",
  className = "",
  logoImagePath = "/logo.png", // Default logo path, can be overridden
  showTextWithImage = false // Hide text by default when using image (image likely contains text)
}: LogoProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      iconSize: 50,
      logoHeight: 110, // Significantly increased for better visibility
      textSize: "text-lg",
      taglineSize: "text-xs",
      gap: "gap-2"
    },
    md: {
      iconSize: 58,
      logoHeight: 180, // Significantly increased for optimal display
      textSize: "text-xl",
      taglineSize: "text-sm",
      gap: "gap-3"
    },
    lg: {
      iconSize: 74,
      logoHeight: 240, // Dramatically increased for maximum visibility in header
      textSize: "text-2xl",
      taglineSize: "text-base",
      gap: "gap-4"
    }
  };

  const config = sizeConfig[size];

  // Variant styling
  const variantStyles = {
    header: "text-st-white",
    footer: "text-st-white",
    default: "text-st-white"
  };

  const textColor = variantStyles[variant];

  return (
    <Link href="/" className={`inline-flex items-center ${showTextWithImage ? config.gap : ''} group ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative"
      >
        {/* Logo Image - Using uploaded logo file */}
        <div className="relative" style={{ height: config.logoHeight, width: 'auto' }}>
          <Image
            src={logoImagePath}
            alt="SportsTribe Logo"
            width={400}
            height={config.logoHeight}
            className="h-full w-auto object-contain drop-shadow-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            priority
            style={{ maxWidth: 'none', height: config.logoHeight }}
            quality={95}
          />
        </div>
      </motion.div>

      {/* Text Content - Only show if showTextWithImage is true */}
      {showTextWithImage && (
        <div className="flex flex-col">
          {/* Brand Name */}
          <motion.div
            className={`font-bold tracking-wide ${config.textSize} ${textColor}`}
            style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontWeight: 600 }}
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Sports<span className="text-[#FF6A3D] group-hover:text-[#FF934F] transition-colors">Tribe</span>.
          </motion.div>
          
          {/* Tagline */}
          {showTagline && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${config.taglineSize} font-semibold tracking-wider text-st-text/70 mt-0.5`}
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              UNITE - PLAY - THRIVE!
            </motion.div>
          )}
        </div>
      )}
    </Link>
  );
}


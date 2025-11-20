"use client";
import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallback?: string;
}

/**
 * SafeImage component that gracefully handles images from any domain
 * Falls back to regular img tag if Next.js Image optimization fails
 */
export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  sizes,
  priority = false,
  fallback = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop",
}: SafeImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [imageError, setImageError] = useState(false);

  // If Next.js Image fails or domain not allowed, use regular img tag
  if (useFallback || imageError) {
    return (
      <img
        src={imageError ? fallback : src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
        onError={() => setImageError(true)}
      />
    );
  }

  // Try to use Next.js Image component first
  try {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
          onError={() => setUseFallback(true)}
        />
      );
    } else {
      return (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 300}
          className={className}
          priority={priority}
          onError={() => setUseFallback(true)}
        />
      );
    }
  } catch (error) {
    // If Image component fails, fall back to regular img tag
    return (
      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
        onError={() => setImageError(true)}
      />
    );
  }
}


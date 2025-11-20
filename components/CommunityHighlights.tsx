"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import {
  fetchCommunityHighlights,
  CommunityHighlight as Highlight,
} from "@/lib/communityHighlightsService";

type HighlightCard = {
  id: number | string;
  title: string;
  description?: string;
  date?: string;
  mediaUrl: string | null;
  mediaType: "image" | "video";
  isPlaceholder?: boolean;
};

export default function CommunityHighlights() {
  const [rawHighlights, setRawHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHighlights() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCommunityHighlights();
        setRawHighlights(data);
      } catch (err) {
        console.error("Failed to load community highlights:", err);
        setError("Failed to load community highlights. Please check your Supabase connection.");
      } finally {
        setIsLoading(false);
      }
    }

    loadHighlights();
  }, []);

  const highlights = useMemo<HighlightCard[]>(() => {
    if (!rawHighlights || rawHighlights.length === 0) {
      return [];
    }
    
    const processed = rawHighlights
      .map((item, index) => {
        if (!item || typeof item !== "object") {
          console.log(`⚠️ Invalid item at index ${index}:`, item);
          return null;
        }

        const title = typeof item.title === "string" && item.title.trim().length > 0
          ? item.title.trim()
          : `Community Highlight ${index + 1}`;

        const description = typeof item.description === "string" && item.description.trim().length > 0
          ? item.description.trim()
          : undefined;

        const date = typeof item.date === "string" && item.date.trim().length > 0
          ? item.date.trim()
          : undefined;

        // Allow null/empty mediaUrl - highlights can exist without media
        const mediaUrl = typeof item.mediaUrl === "string" && item.mediaUrl.trim().length > 0
          ? item.mediaUrl.trim()
          : null;

        const mediaTypeRaw = typeof item.mediaType === "string" ? item.mediaType.toLowerCase() : "image";
        const mediaType = mediaTypeRaw === "video" ? "video" : "image";

        const processedItem: HighlightCard = {
          id: item.id ?? index + 1,
          title,
          description,
          date,
          mediaUrl,
          mediaType,
        };
        
        console.log(`✅ Processed highlight ${index + 1}:`, processedItem);
        return processedItem;
      })
      .filter(Boolean) as HighlightCard[];
    
    console.log(`✅ Total processed highlights: ${processed.length}`);
    return processed;
  }, [rawHighlights]);
  const [imageErrors, setImageErrors] = useState<Set<number | string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [rawHighlights, highlights.length]);

  if (isLoading) {
    return (
      <section className="relative z-10 px-6 md:px-10 lg:px-16 py-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-st-white mb-6">Community Highlights</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4 text-st-text/70">Loading highlights...</p>
        </div>
      </section>
    );
  }

  // Show placeholder cards when no highlights
  const displayHighlights = highlights.length > 0 ? highlights : Array(4).fill(null).map((_, i) => ({
    id: i + 1,
    title: "",
    description: undefined,
    date: undefined,
    mediaUrl: null,
    mediaType: "image" as const,
    isPlaceholder: true
  }));

  return (
    <section className="relative z-10 px-6 md:px-10 lg:px-16 py-12" key={`section-${refreshKey}`}>
      <h2 className="text-3xl md:text-4xl font-extrabold text-st-white mb-8">Community Highlights</h2>
      {error && (
        <div className="mb-4 text-center text-red-400">
          {error}
        </div>
      )}
      {highlights.length > 0 && (
        <div className="mb-4 text-sm text-st-text/70">
          Showing {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
        </div>
      )}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" 
        key={`highlights-grid-${refreshKey}-${displayHighlights.length}-${JSON.stringify(displayHighlights.map(h => h.id))}`}
      >
        {displayHighlights.map((item, i) => {
          const isPlaceholder = 'isPlaceholder' in item && item.isPlaceholder;
          return (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.4, delay: i * 0.03 }}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transition-all duration-500 aspect-square ${
              isPlaceholder 
                ? 'cursor-default' 
                : 'cursor-pointer hover:border-[#FF6A3D]/50 hover:shadow-[0_8px_30px_rgba(255,106,61,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
            }`}
          >
            {/* Media Container */}
            <div className="absolute inset-0 relative overflow-hidden">
              {isPlaceholder ? (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md">
                  {/* Empty placeholder - clean frosted glass effect matching the image */}
                </div>
              ) : item.mediaUrl ? (
                item.mediaType === "video" ? (
                  <video
                    src={item.mediaUrl}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <Image
                    src={imageErrors.has(item.id) ? "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop" : item.mediaUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    onError={() => setImageErrors(prev => new Set([...prev, item.id]))}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#270841] via-[#3C0E63] to-[#270841] text-white/80">
                  <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                  <span className="text-sm font-semibold text-center px-4">No media added yet</span>
                </div>
              )}
              
              {/* Base gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Enhanced overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Top left corner accent */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#FF6A3D]/30 to-transparent rounded-br-full" />
              
              {/* Bottom right accent */}
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#E94057]/20 to-transparent rounded-tl-full" />
              
              {/* Content overlay - always visible but enhanced on hover */}
              {!isPlaceholder && (
                <>
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white text-sm font-bold mb-1 line-clamp-1 drop-shadow-lg">
                        {item.title}
                      </h3>
                      {item.description && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-20 overflow-hidden">
                          <p className="text-white/90 text-xs mt-2 line-clamp-2 drop-shadow-md">
                            {item.description}
                          </p>
                        </div>
                      )}
                      {item.date && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                          <span className="text-white/80 text-xs font-medium">{item.date}</span>
                          <span className="w-1 h-1 rounded-full bg-[#FF6A3D]" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* View button overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="text-white text-sm font-semibold px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] backdrop-blur-sm rounded-full border border-white/30 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      View Highlight →
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Glow effect on hover - only for non-placeholder */}
            {!isPlaceholder && (
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6A3D] via-[#E94057] to-[#FF934F] rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
            )}
          </motion.div>
        );
        })}
      </div>
    </section>
  );
}

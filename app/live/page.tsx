"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchLiveMatches, LiveMatch } from "@/lib/liveMatchesService";

// Helper function to normalize YouTube URLs
const normalizeYouTubeUrl = (url: string): string => {
  if (!url) return "";
  
  // Handle youtu.be format
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  
  // Handle youtube.com format
  if (url.includes("youtube.com/watch?v=")) {
    return url;
  }
  
  // If already a valid URL, return as is
  if (url.startsWith("http")) {
    return url;
  }
  
  return url;
};

export default function Live() {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number | string>>(new Set());

  useEffect(() => {
    async function loadLiveMatches() {
      try {
        setIsLoading(true);
        const data = await fetchLiveMatches();
        setLiveMatches(data);
      } catch (error) {
        console.error("Failed to load live matches:", error);
        // On error, set empty array to show "no matches" message
        setLiveMatches([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadLiveMatches();
  }, []);

  const handleWatchLive = (match: any) => {
    if (!match.streamUrl) {
      alert("No YouTube link available for this stream.");
      return;
    }

    // Normalize and open YouTube URL in new tab
    const youtubeUrl = normalizeYouTubeUrl(match.streamUrl);
    window.open(youtubeUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
      <h1 className="text-4xl font-extrabold text-st-white">Live Matches</h1>
      <p className="mt-2 text-st-text/85">Watch live and upcoming streams.</p>
      {isLoading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D]" />
          <p className="text-st-text/70 text-lg">Loading live matches...</p>
        </div>
      ) : liveMatches.length === 0 ? (
        <div className="mt-12">
          <div className="rounded-2xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
            <h2 className="text-2xl font-bold text-st-white mb-3">No live matches yet</h2>
            <p className="text-st-text/70">
              Live streams added from the admin panel will appear here instantly.
            </p>
          </div>
        </div>
      ) : (
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {liveMatches.map((match) => (
          <div 
            key={match.id} 
            onClick={() => handleWatchLive(match)}
            className="relative rounded-2xl border-2 border-white/20 bg-white/5 overflow-hidden group hover:border-[#E94057] hover:shadow-[0_0_30px_rgba(233,64,87,0.4)] transition-all duration-300 cursor-pointer"
          >
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#1A063B] to-[#2C0C5B]">
              {/* Status badge */}
              {match.status === "LIVE" && (
                <div className="absolute left-4 top-4 z-10 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 rounded-full shadow-lg border border-white/30">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              )}
              {match.status === "Upcoming" && (
                <div className="absolute left-4 top-4 z-10 bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 rounded-full shadow-lg border border-white/30">
                  <span className="text-white text-xs font-bold">UPCOMING</span>
                </div>
              )}
              {match.status === "Completed" && (
                <div className="absolute left-4 top-4 z-10 bg-gradient-to-r from-gray-600 to-gray-500 px-3 py-1.5 rounded-full shadow-lg border border-white/30">
                  <span className="text-white text-xs font-bold">COMPLETED</span>
                </div>
              )}
              <Image
                src={imageErrors.has(match.id) ? "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop" : match.image}
                alt={match.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImageErrors(prev => new Set([...prev, match.id]))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              {/* Play button overlay - Always visible for LIVE, visible on hover for others */}
              <div className={`absolute inset-0 flex items-center justify-center ${match.status === "LIVE" ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-300 z-10`}>
                <div className="w-20 h-20 bg-red-600/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 hover:bg-red-600 hover:scale-110 transition-all duration-300 shadow-2xl">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-5 bg-gradient-to-b from-white/10 to-white/5">
              <div className="font-bold text-st-white text-lg mb-2">{match.title}</div>
              <div className="flex items-center gap-2 text-st-text/80 text-sm">
                {match.status === "LIVE" ? (
                  <>
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                    <span>Click to watch live on YouTube</span>
                  </>
                ) : match.status === "Upcoming" ? (
                  <>
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Click to view on YouTube</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Click to watch on YouTube</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

"use client";
import { useRef, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { fetchSports, Sport } from "@/lib/sportsService";

export default function SportsOffered() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start", dragFree: true });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number | string>>(new Set());

  useEffect(() => {
    async function loadSports() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSports();
        setSports(data);
      } catch (err) {
        console.error("Failed to load sports:", err);
        setError("Failed to load sports. Please check your Supabase connection.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSports();
  }, []);

  useEffect(() => {
    if (!embla) return;
    const id = setInterval(() => embla.scrollNext(), 2200);
    intervalRef.current = id;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [embla]);

  const handleImageError = (sportId: number | string) => {
    setFailedImages(prev => new Set([...prev, sportId]));
  };

  const validSports = sports.filter(s => !failedImages.has(s.id));

  if (isLoading) {
    return (
      <section className="relative z-10 px-6 md:px-10 lg:px-16 py-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-st-white mb-6">Sports Offered</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4 text-st-text/70">Loading sports...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 px-6 md:px-10 lg:px-16 py-12">
      <h2 className="text-3xl md:text-4xl font-extrabold text-st-white mb-6">Sports Offered</h2>
      {error && (
        <div className="text-center py-4 text-red-400">
          {error}
        </div>
      )}
      {validSports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-st-text/70">No sports available at the moment.</p>
        </div>
      ) : (
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex gap-4">
            {validSports.map((s) => (
              <div key={s.id} className="embla__slide shrink-0 basis-[68%] sm:basis-[40%] md:basis-[26%] lg:basis-[22%]">
                <div className="relative rounded-2xl border-l-4 border-l-[#FF6A3D] bg-white/5 p-6 backdrop-blur hover:bg-white/10 transition-all duration-300 overflow-hidden group shadow-lg hover:shadow-[#FF6A3D]/20">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#FF6A3D]/20 to-transparent rounded-bl-full" />
                  <div className="h-32 rounded-xl relative overflow-hidden bg-white/5 border border-white/10">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 68vw, (max-width: 768px) 40vw, (max-width: 1024px) 26vw, 22vw"
                      onError={() => handleImageError(s.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="mt-4 font-bold text-st-white text-lg">{s.name}</div>
                  <div className="mt-1 text-xs text-[#FF6A3D] font-medium">Explore →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { formatTournamentDate } from "@/lib/adminDataHook";
import TournamentRegistrationModal from "@/components/TournamentRegistrationModal";
import { fetchFeaturedTournaments, Tournament } from "@/lib/tournamentsService";

export default function FeaturedTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number | string>>(new Set());
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadFeaturedTournaments() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchFeaturedTournaments(6); // Limit to 6 featured tournaments
        setTournaments(data);
      } catch (err) {
        console.error("Failed to load featured tournaments:", err);
        setError("Unable to load featured tournaments. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFeaturedTournaments();
  }, []);

  const handleRegisterClick = (tournament: any) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);
  };
  return (
    <section className="relative z-10 px-6 md:px-10 lg:px-16 py-12">
      <div className="flex items-end justify-between">
        <h2 className="text-3xl md:text-4xl font-extrabold text-st-white">Featured Tournaments</h2>
      </div>
      {error && (
        <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="mt-6 text-center text-st-text/70 py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4">Loading tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="mt-6 text-center text-st-text/70 py-12">
          <p>No featured tournaments available at the moment.</p>
          <p className="text-sm text-st-text/50 mt-2">Check back soon for exciting tournaments!</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t, idx) => {
            const fallbackImage = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=450&fit=crop";
            const formattedDate = formatTournamentDate(t.date);
            
            return (
              <motion.div 
                key={t.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: idx * 0.05 }} 
                className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-[#E94057] hover:shadow-[0_0_30px_rgba(233,64,87,0.3)] transition-all duration-300 overflow-hidden group backdrop-blur-sm"
              >
                {/* Premium badge ribbon */}
                <div className="absolute top-4 right-0 bg-gradient-to-r from-[#E94057] to-[#FF6A3D] px-4 py-1 text-white text-xs font-bold shadow-lg z-10">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#E94057] -skew-x-12" />
                  {t.status.toUpperCase()}
                </div>
                <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-[#1A063B] to-[#2C0C5B]">
                  <Image
                    src={imageErrors.has(t.id) ? fallbackImage : t.image}
                    alt={t.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={() => setImageErrors(prev => new Set([...prev, t.id]))}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  {/* Date badge overlay on image */}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                    <div className="text-white text-xs font-semibold">{formattedDate}</div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-b from-transparent to-white/5">
                  <div className="text-st-white font-bold text-lg mb-2">{t.name}</div>
                  <div className="flex items-center gap-2 text-st-text/80 text-sm mb-3">
                    <svg className="w-4 h-4 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t.location}</span>
                  </div>
                  <button onClick={() => handleRegisterClick(t)} className="mt-3 text-st-white px-5 py-2.5 rounded-full text-sm font-semibold w-full hover:scale-105 transition-transform bg-gradient-to-r from-[#FF6A3D] to-[#E94057] hover:shadow-[0_0_15px_rgba(255,106,61,0.4)]">
                    Register Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tournament Registration Modal */}
      <TournamentRegistrationModal
        tournament={selectedTournament}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTournament(null);
        }}
        onSuccess={() => {
          // Modal can handle its own state
        }}
      />
    </section>
  );
}



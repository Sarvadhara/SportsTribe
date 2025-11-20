"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { formatTournamentDate } from "@/lib/adminDataHook";
import { fetchTournaments, Tournament } from "@/lib/tournamentsService";
import TournamentRegistrationModal from "@/components/TournamentRegistrationModal";

export default function TournamentsHub() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number | string>>(new Set());
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadTournaments() {
      try {
        setIsLoading(true);
        const data = await fetchTournaments();
        setTournaments(data);
      } catch (error) {
        console.error("Failed to load tournaments:", error);
        // On error, set empty array to show "no tournaments" message
        setTournaments([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadTournaments();
  }, []);

  const handleRegisterClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
        <h1 className="text-4xl font-extrabold text-st-white">Tournaments Hub</h1>
        <p className="mt-2 text-st-text/85">Active, upcoming and highlights.</p>
        <div className="mt-8 text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4 text-st-text/70">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
      <h1 className="text-4xl font-extrabold text-st-white">Tournaments Hub</h1>
      <p className="mt-2 text-st-text/85">Active, upcoming and highlights.</p>
      
      {tournaments.length === 0 ? (
        <div className="mt-8 text-center py-12">
          <p className="text-st-text/70">No tournaments available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => {
            const fallbackImage = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=450&fit=crop";
            const formattedDate = formatTournamentDate(t.date);
            const statusColors = {
              active: "from-green-500 via-green-600 to-transparent",
              upcoming: "from-blue-500 via-blue-600 to-transparent",
              completed: "from-gray-500 via-gray-600 to-transparent",
            };
            const statusColor = statusColors[t.status as keyof typeof statusColors] || "from-[#FF6A3D] via-[#E94057] to-transparent";
            
            return (
              <div key={t.id} className="relative rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border-2 border-white/20 overflow-hidden group hover:border-[#FF6A3D] hover:shadow-[0_0_30px_rgba(255,106,61,0.3)] transition-all duration-300">
                {/* Timeline/Event indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${statusColor} z-10`} />
                
                {/* Status badge */}
                <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                  <div className="text-[#FF6A3D] text-xs font-bold">{formattedDate}</div>
                </div>
                
                {/* Status label */}
                <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  t.status === "active"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : t.status === "upcoming"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                }`}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </div>
                
                <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-[#1A063B] to-[#2C0C5B]">
                  <Image
                    src={imageErrors.has(t.id) ? fallbackImage : t.image}
                    alt={t.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={() => setImageErrors(prev => new Set([...prev, t.id]))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
                <div className="p-5 bg-gradient-to-b from-transparent to-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-st-white text-lg pr-2">{t.name}</div>
                    {/* Calendar icon */}
                    <svg className="w-5 h-5 text-[#FF6A3D] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 text-st-text/80 text-sm mb-4">
                    <svg className="w-4 h-4 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t.location}</span>
                  </div>
                  {t.status !== "completed" && (
                    <button 
                      onClick={() => handleRegisterClick(t)}
                      className="w-full text-st-white px-4 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform bg-gradient-to-r from-[#FF6A3D] to-[#E94057] hover:shadow-[0_0_15px_rgba(255,106,61,0.4)]"
                    >
                      Register Now
                    </button>
                  )}
                  {t.status === "completed" && (
                    <button 
                      disabled
                      className="w-full text-st-text/50 px-4 py-2.5 rounded-full text-sm font-semibold bg-gray-500/20 border border-gray-500/30 cursor-not-allowed"
                    >
                      Completed
                    </button>
                  )}
                </div>
              </div>
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
    </div>
  );
}



"use client";
import Image from "next/image";
import { useEffect } from "react";

interface PlayerDetailModalProps {
  player: {
    id: number;
    name: string;
    city: string;
    state: string;
    sport: string;
    image: string;
    position?: string;
    age?: number;
    matchesPlayed?: number;
    matches?: number;
    email?: string;
    phone?: string;
    bio?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerDetailModal({ player, isOpen, onClose }: PlayerDetailModalProps) {
  // Handle body overflow and keyboard events
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !player) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicking the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] rounded-2xl border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Enhanced Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-12 h-12 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] hover:from-[#FF8A65] hover:to-[#FF6A3D] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.6)] hover:scale-110 active:scale-95 group"
          aria-label="Close player profile"
        >
          <svg 
            className="w-6 h-6 text-white transition-transform group-hover:rotate-90" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="relative mb-8">
            {/* Player Image Background */}
            <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-[#FF6A3D] to-[#E94057]">
              <Image
                src={player.image}
                alt={player.name}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              {/* Player Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <h2 className="text-4xl font-black text-white mb-2 uppercase">{player.name}</h2>
                    <div className="flex items-center gap-4 text-white/90 flex-wrap">
                      {player.position && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                          {player.position}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                        {player.sport}
                      </span>
                      <span className="text-sm">{player.city}, {player.state}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-st-white mb-4">Personal Information</h3>
              <div className="space-y-3">
                {player.age && (
                  <div className="flex justify-between">
                    <span className="text-st-text/70">Age</span>
                    <span className="text-st-white font-semibold">{player.age} years</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-st-text/70">Location</span>
                  <span className="text-st-white font-semibold">{player.city}, {player.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-st-text/70">Sport</span>
                  <span className="text-st-white font-semibold">{player.sport}</span>
                </div>
                {player.position && (
                  <div className="flex justify-between">
                    <span className="text-st-text/70">Position/Role</span>
                    <span className="text-st-white font-semibold">{player.position}</span>
                  </div>
                )}
                {player.email && (
                  <div className="flex justify-between">
                    <span className="text-st-text/70">Email</span>
                    <span className="text-st-white font-semibold">{player.email}</span>
                  </div>
                )}
                {player.phone && (
                  <div className="flex justify-between">
                    <span className="text-st-text/70">Phone</span>
                    <span className="text-st-white font-semibold">{player.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-st-white mb-4">Career Statistics</h3>
              <div className="space-y-3">
                {(player.matchesPlayed || player.matches) && (
                  <div className="flex justify-between">
                    <span className="text-st-text/70">Matches Played</span>
                    <span className="text-st-white font-semibold">{player.matchesPlayed || player.matches}</span>
                  </div>
                )}
                {!(player.matchesPlayed || player.matches) && (
                  <div className="text-center py-8">
                    <p className="text-st-text/50 text-sm">No career statistics available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {player.bio && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-st-white mb-4">About</h3>
              <p className="text-st-text/80 leading-relaxed">
                {player.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


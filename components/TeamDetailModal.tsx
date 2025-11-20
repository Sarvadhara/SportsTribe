"use client";
import Image from "next/image";
import { useEffect } from "react";

interface TeamDetailModalProps {
  team: {
    id: number;
    name: string;
    city: string;
    state: string;
    sport: string;
    image: string;
    founded?: number;
    coach?: string;
    captain?: string;
    members?: number;
    wins?: number;
    losses?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamDetailModal({ team, isOpen, onClose }: TeamDetailModalProps) {
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

  if (!isOpen || !team) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicking the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const members = team.members || 20;
  const wins = team.wins || 50;
  const losses = team.losses || 15;
  const winRate = Math.round((wins / (wins + losses)) * 100);
  const matches = wins + losses;

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
          className="absolute top-4 right-4 z-50 w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#60A5FA] hover:to-[#3B82F6] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:scale-110 active:scale-95 group"
          aria-label="Close team profile"
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
            {/* Team Image Background */}
            <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-[#3B82F6] to-[#2563EB]">
              <Image
                src={team.image}
                alt={team.name}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              {/* Team Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <h2 className="text-4xl font-black text-white mb-2 uppercase">{team.name}</h2>
                    <div className="flex items-center gap-4 text-white/90">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                        {team.sport}
                      </span>
                      <span className="text-sm">{team.city}, {team.state}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-white">{winRate}%</div>
                    <div className="text-sm text-white/80 font-semibold">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-black text-[#3B82F6] mb-2">{members}</div>
              <div className="text-sm font-semibold text-st-text/70 uppercase">Team Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-black text-[#10B981] mb-2">{wins}</div>
              <div className="text-sm font-semibold text-st-text/70 uppercase">Total Wins</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-black text-[#F59E0B] mb-2">{matches}</div>
              <div className="text-sm font-semibold text-st-text/70 uppercase">Total Matches</div>
            </div>
          </div>

          {/* Team Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-st-white mb-4">Team Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-st-text/70">Location</span>
                  <span className="text-st-white font-semibold">{team.city}, {team.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-st-text/70">Sport</span>
                  <span className="text-st-white font-semibold">{team.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-st-text/70">Founded</span>
                  <span className="text-st-white font-semibold">{team.founded || 2015}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-st-text/70">Team Members</span>
                  <span className="text-st-white font-semibold">{members}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-st-white mb-4">Leadership</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-st-text/70">Coach</span>
                  <span className="text-st-white font-semibold">{team.coach || "Not Assigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-st-text/70">Captain</span>
                  <span className="text-st-white font-semibold">{team.captain || "Not Assigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-st-text/70">Win Rate</span>
                  <span className="text-st-white font-semibold">{winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-st-text/70">Record</span>
                  <span className="text-st-white font-semibold">{wins}W - {losses}L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Bio Section */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-st-white mb-4">About</h3>
            <p className="text-st-text/80 leading-relaxed">
              {team.name} is a competitive {team.sport.toLowerCase()} team based in {team.city}, {team.state}. 
              Founded in {team.founded || 2015}, the team has established itself as a formidable force in the sport, 
              with {wins} wins and an impressive {winRate}% win rate. The team is led by Coach {team.coach || "TBD"} 
              and Captain {team.captain || "TBD"}, who together bring years of experience and strategic leadership to 
              the squad. Known for their dedication, teamwork, and passion for the game, {team.name} continues to 
              strive for excellence both on and off the field.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


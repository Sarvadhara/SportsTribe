"use client";
import Image from "next/image";
import { useState } from "react";

interface TeamCardProps {
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
  };
  onViewProfile: (team: any) => void;
  accentColor?: "blue" | "green" | "yellow";
}

export default function TeamCard({ team, onViewProfile, accentColor = "blue" }: TeamCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Team color schemes - different from players
  const colorSchemes = {
    blue: {
      accent: "#3B82F6",
      accentDark: "#2563EB",
      gradient: "from-[#3B82F6] via-[#60A5FA] to-[#2563EB]",
      light: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.3)",
    },
    green: {
      accent: "#10B981",
      accentDark: "#059669",
      gradient: "from-[#10B981] via-[#34D399] to-[#059669]",
      light: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.3)",
    },
    yellow: {
      accent: "#F59E0B",
      accentDark: "#D97706",
      gradient: "from-[#F59E0B] via-[#FBBF24] to-[#D97706]",
      light: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.3)",
    },
  };
  
  const colors = colorSchemes[accentColor];
  const founded = team.founded || 2015;
  const members = team.members || 18 + (team.id % 7); // 18-24 members
  const wins = team.wins || 45 + (team.id * 5);
  const losses = team.losses || 12 + (team.id * 2);
  const winRate = Math.round((wins / (wins + losses)) * 100);
  
  return (
    <div 
      onClick={() => onViewProfile(team)}
      className="relative cursor-pointer group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
      style={{ maxWidth: '280px', width: '100%', minHeight: '420px' }}
    >
      {/* Team Card with different design */}
      <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: '420px' }}>
        {/* Gradient border effect */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
            padding: '3px',
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#0A0E27] via-[#1A063B] to-[#2C0C5B] rounded-2xl border border-white/20"></div>
        </div>
        
        {/* Inner card content */}
        <div className="relative h-full bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] p-4 flex flex-col" style={{ minHeight: '420px' }}>
          {/* Header with sport badge */}
          <div className="flex items-start justify-between mb-3 flex-shrink-0">
            <div className="px-3 py-1 bg-gradient-to-r from-[#1A063B] via-[#2C0C5B] to-[#1A063B] border border-white/20 rounded-full">
              <span className="text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {team.sport.toUpperCase()}
              </span>
            </div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse flex-shrink-0"></div>
          </div>
          
          {/* Team Image */}
          <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex-shrink-0">
            {!imageError ? (
              <Image
                src={team.image}
                alt={team.name}
                fill
                className="object-cover opacity-90"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B]">
                <span className="text-4xl text-white font-black">{team.name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
          
          {/* Team Name */}
          <div className="mb-3 flex-shrink-0">
            <h3 className="text-lg font-black text-white uppercase leading-tight mb-1 line-clamp-2 min-h-[3rem]">
              {team.name}
            </h3>
            <p className="text-xs text-white/70 font-semibold line-clamp-1">
              {team.city}, {team.state}
            </p>
          </div>
          
          {/* Team Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10">
              <div className="text-lg font-black text-white">{members}</div>
              <div className="text-[10px] text-white/70 font-semibold uppercase">Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10">
              <div className="text-lg font-black text-white">{wins}</div>
              <div className="text-[10px] text-white/70 font-semibold uppercase">Wins</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10">
              <div className="text-lg font-black text-white">{winRate}%</div>
              <div className="text-[10px] text-white/70 font-semibold uppercase">Rate</div>
            </div>
          </div>
          
          {/* Footer with Founded Year - Fixed at bottom */}
          <div className="pt-3 border-t border-white/10 mt-auto flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/60 font-semibold uppercase">Founded</div>
                <div className="text-sm font-black text-white">{founded}</div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(team);
                }}
                className="px-4 py-1.5 bg-white text-[#1A063B] text-xs font-bold rounded-full border border-white/30 hover:bg-white/90 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                VIEW PROFILE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


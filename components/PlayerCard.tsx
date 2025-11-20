"use client";
import Image from "next/image";
import { useState } from "react";

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    city: string;
    state: string;
    sport: string;
    image: string;
    rating?: number;
    position?: string;
    batting?: number;
    bowling?: number;
    fielding?: number;
    team?: string;
    country?: string;
    playerNumber?: number;
    title1?: number;
    title2?: number;
    title3?: number;
    matchesPlayed?: number;
    matches?: number;
  };
  onViewProfile: (player: any) => void;
  accentColor?: "orange" | "purple" | "pink";
}

export default function PlayerCard({ player, onViewProfile, accentColor = "orange" }: PlayerCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Stylish color schemes
  const colorSchemes = {
    orange: {
      accent: "#FF6A3D",
      accentDark: "#E94057",
      gradient: "from-[#FF6A3D] via-[#FF8A65] to-[#E94057]",
      light: "rgba(255, 106, 61, 0.1)",
      border: "rgba(255, 106, 61, 0.3)",
    },
    purple: {
      accent: "#7A1FA2",
      accentDark: "#9333EA",
      gradient: "from-[#7A1FA2] via-[#9333EA] to-[#A855F7]",
      light: "rgba(122, 31, 162, 0.1)",
      border: "rgba(122, 31, 162, 0.3)",
    },
    pink: {
      accent: "#E94057",
      accentDark: "#FF6A3D",
      gradient: "from-[#E94057] via-[#FF6A3D] to-[#FF8A65]",
      light: "rgba(233, 64, 87, 0.1)",
      border: "rgba(233, 64, 87, 0.3)",
    },
  };
  
  const colors = colorSchemes[accentColor];
  
  return (
    <div 
      onClick={() => onViewProfile(player)}
      className="relative cursor-pointer group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
      style={{ maxWidth: '260px', width: '100%' }}
    >
      {/* Card with stylish design */}
      <div className="relative w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Gradient border effect */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{ 
            padding: '4px',
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        ></div>
        
        {/* Glow effect on hover */}
        <div 
          className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
          style={{ backgroundColor: colors.accent }}
        ></div>
        
        {/* Inner border - Dark Blue with gradient */}
        <div className="absolute inset-[6px] rounded-xl border-2 border-[#1A063B] opacity-90 pointer-events-none"></div>
        
        {/* Header - Dark Blue Bar with gradient */}
        <div className="relative z-10 bg-gradient-to-r from-[#1A063B] via-[#2C0C5B] to-[#1A063B] px-4 py-2 shadow-inner">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-black uppercase tracking-wider">{player.sport}</h3>
            <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse"></div>
          </div>
        </div>

        {/* Main Content Area - White Background with subtle gradient */}
        <div className="relative bg-gradient-to-br from-white via-white to-gray-50">
          {/* Decorative corner elements */}
          <div 
            className="absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-full"
            style={{ background: `linear-gradient(135deg, ${colors.accent}, transparent)` }}
          ></div>
          
          {/* Player Illustration Area */}
          <div className="relative flex items-center justify-center p-6 min-h-[200px]">
            {/* Center - Player Image with stylish frame */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-32 h-40 group/image">
                {/* Image frame with gradient border */}
                <div 
                  className="absolute -inset-1 rounded-lg opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
                    filter: 'blur(8px)'
                  }}
                ></div>
                <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-white shadow-xl">
                  <Image
                    src={imageError ? "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop" : player.image}
                    alt={player.name}
                    fill
                    className="object-cover group-hover/image:scale-110 transition-transform duration-500"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Badge and Flag - Minimalistic */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {/* Badge - Shield shape with gradient */}
              <div 
                className="relative w-10 h-12 bg-gradient-to-b from-[#1A063B] to-[#2C0C5B] rounded-b-lg flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110"
                style={{ 
                  clipPath: 'polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)',
                  borderBottom: `2px solid ${colors.accent}`
                }}
              >
                <span className="text-white text-[10px] font-black">SK</span>
              </div>
              
              {/* Country Flag */}
              <div className="w-10 h-6 bg-gradient-to-b from-orange-500 via-white to-green-600 rounded-md relative overflow-hidden border border-white shadow-md transform transition-all duration-300 group-hover:scale-110">
                <div className="absolute top-0 left-0 w-full h-1/3 bg-orange-500"></div>
                <div className="absolute top-1/3 left-0 w-full h-1/3 bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-green-600"></div>
              </div>
            </div>
          </div>

          {/* Player Name Banner - Minimalistic */}
          <div 
            className="relative z-10 px-3 py-2 overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`
            }}
          >
            <h4 className="text-white text-xs font-black uppercase tracking-wide text-center relative z-10 drop-shadow-md">
              {player.name}
            </h4>
          </div>
        </div>

        {/* Footer - Matches Played Only */}
        <div className="relative bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] px-4 py-4">
          {/* Decorative top border */}
          <div 
            className="absolute top-0 left-0 right-0 h-px"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`
            }}
          ></div>
          
          {/* Matches Played - Prominently displayed */}
          {(player.matchesPlayed || player.matches) ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" style={{ color: colors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex flex-col items-center">
                <span 
                  className="text-2xl font-black"
                  style={{ 
                    color: colors.accent,
                    textShadow: `0 0 15px ${colors.accent}50`,
                  }}
                >
                  {player.matchesPlayed || player.matches || 0}
                </span>
                <span className="text-xs text-white/70 uppercase tracking-wider mt-1">Matches Played</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-xs text-white/50">No match data</span>
            </div>
          )}
        </div>

        {/* Hover Overlay - Enhanced */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 pointer-events-none rounded-2xl"
          style={{ 
            background: `radial-gradient(circle at center, ${colors.light} 0%, transparent 70%)`
          }}
        >
          <div 
            className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border-2 shadow-2xl transform transition-all duration-300 scale-90 group-hover:scale-100"
            style={{ borderColor: colors.accent }}
          >
            <span 
              className="font-bold text-sm uppercase tracking-wider"
              style={{ color: colors.accent }}
            >
              View Profile
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

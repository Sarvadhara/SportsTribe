"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchPlayers, Player } from "@/lib/playersService";
import { usePublicAdminData } from "@/lib/adminDataHook";
import PlayerCard from "@/components/PlayerCard";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import TeamCard from "@/components/TeamCard";
import TeamDetailModal from "@/components/TeamDetailModal";

// Enhanced player data - only add accent colors, keep all other data from admin/user
const getEnhancedPlayers = (basePlayers: any[]) => {
  const accentColors: ("orange" | "purple" | "pink")[] = ["orange", "purple", "pink"];
  
  return basePlayers.map((player, index) => ({
    ...player, // Keep all original player data from admin/user
    accentColor: accentColors[index % 3], // Only add accent color for card styling
  }));
};

// Enhanced team data with stats
const getEnhancedTeams = (baseTeams: any[]) => {
  const accentColors: ("blue" | "green" | "yellow")[] = ["blue", "green", "yellow"];
  
  return baseTeams.map((team, index) => ({
    ...team,
    members: 18 + (index % 7), // 18-24 members
    wins: 45 + (index * 5), // Varying wins
    losses: 12 + (index * 2), // Varying losses
    accentColor: accentColors[index % 3], // Rotate through colors
  }));
};

export default function PlayersTeams() {
  const router = useRouter();
  const { data: adminData, isLoading: adminDataLoading } = usePublicAdminData();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const INITIAL_VISIBLE_COUNT = 5; // First row = 5 cards (xl breakpoint)

  // Load players from Supabase
  useEffect(() => {
    async function loadPlayers() {
      try {
        setIsLoadingPlayers(true);
        const data = await fetchPlayers();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to load players:", error);
        // On error, set empty array to show "no players" message
        setPlayers([]);
      } finally {
        setIsLoadingPlayers(false);
      }
    }
    loadPlayers();
  }, []);

  const allPlayers = getEnhancedPlayers(players);
  const allTeams = getEnhancedTeams(adminData.teams || []);
  const isLoading = isLoadingPlayers || adminDataLoading;
  
  // Players state
  const [visiblePlayerCount, setVisiblePlayerCount] = useState(INITIAL_VISIBLE_COUNT);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  // Teams state
  const [visibleTeamCount, setVisibleTeamCount] = useState(INITIAL_VISIBLE_COUNT);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const visiblePlayers = allPlayers.slice(0, visiblePlayerCount);
  const isPlayersExpanded = visiblePlayerCount >= allPlayers.length;
  const showPlayersToggle = allPlayers.length > INITIAL_VISIBLE_COUNT;

  const visibleTeams = allTeams.slice(0, visibleTeamCount);
  const isTeamsExpanded = visibleTeamCount >= allTeams.length;
  const showTeamsToggle = allTeams.length > INITIAL_VISIBLE_COUNT;

  const handleViewPlayerProfile = (player: any) => {
    setSelectedPlayer(player);
    setIsPlayerModalOpen(true);
  };

  const handleViewTeamProfile = (team: any) => {
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
  };

  const handleTogglePlayersView = () => {
    if (isPlayersExpanded) {
      setVisiblePlayerCount(INITIAL_VISIBLE_COUNT);
    } else {
      setVisiblePlayerCount(allPlayers.length);
    }
  };

  const handleToggleTeamsView = () => {
    if (isTeamsExpanded) {
      setVisibleTeamCount(INITIAL_VISIBLE_COUNT);
    } else {
      setVisibleTeamCount(allTeams.length);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
        <h1 className="text-4xl font-extrabold text-st-white mb-2">Players & Teams</h1>
        <p className="text-st-text/85">Explore talented players from across the country.</p>
        <div className="mt-8 text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4 text-st-text/70">Loading players and teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
      <h1 className="text-4xl font-extrabold text-st-white mb-2">Players & Teams</h1>
      <p className="text-st-text/85">Explore talented players from across the country.</p>
      
      {/* Players Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-extrabold text-st-white mb-4">
          Players {allPlayers.length > 0 && <span className="text-st-text/70 text-lg">({allPlayers.length})</span>}
        </h2>
        {allPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-st-text/70 mb-6">No players available at the moment. Be the first to create your profile!</p>
          </div>
        ) : (
          <>
            {/* Player Cards Grid - 4-5 cards per row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 justify-items-center">
              {visiblePlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onViewProfile={handleViewPlayerProfile}
                  accentColor={player.accentColor || "orange"}
                />
              ))}
            </div>

        {/* Players Action Buttons */}
        {showPlayersToggle && (
          <div className="mt-10 flex items-center justify-center">
            <button
              onClick={handleTogglePlayersView}
              className="px-8 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-full hover:shadow-[0_0_25px_rgba(255,106,61,0.5)] transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              {isPlayersExpanded ? (
                <>
                  <span>View Less</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>View More Players</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
          </>
        )}
      </section>

      {/* Create Profile Button - Always Visible */}
      <div className="mt-16 flex items-center justify-center">
        <button 
          onClick={() => router.push("/create-profile")}
          className="px-8 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-full hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your Profile
        </button>
      </div>

      {/* Teams Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-extrabold text-st-white mb-4">
          Teams {allTeams.length > 0 && <span className="text-st-text/70 text-lg">({allTeams.length})</span>}
        </h2>
        {allTeams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-st-text/70 mb-6">No teams available at the moment. Create your profile to join a team!</p>
          </div>
        ) : (
          <>
            {/* Team Cards Grid - 4-5 cards per row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 justify-items-center">
              {visibleTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onViewProfile={handleViewTeamProfile}
                  accentColor={team.accentColor || "blue"}
                />
              ))}
            </div>

        {/* Teams Action Buttons */}
        {showTeamsToggle && (
          <div className="mt-10 flex items-center justify-center">
            <button
              onClick={handleToggleTeamsView}
              className="px-8 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-full hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              {isTeamsExpanded ? (
                <>
                  <span>View Less</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>View More Teams</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
          </>
        )}
      </section>

      {/* Player Detail Modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
      />

      {/* Team Detail Modal */}
      <TeamDetailModal
        team={selectedTeam}
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </div>
  );
}

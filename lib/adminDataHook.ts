"use client";
import { useState, useEffect } from "react";
import { Tournament, News, Player, Team, Community, LiveMatch, Product, AdminData } from "@/contexts/AdminDataContext";

// Default data (same as AdminDataContext)
const defaultData: AdminData = {
  tournaments: [
    { id: 1, name: "Cricket Premier League", date: "2025-12-15", location: "Mumbai", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop", status: "active" },
    { id: 2, name: "Football Championship", date: "2025-12-20", location: "Delhi", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=450&fit=crop", status: "upcoming" },
    { id: 3, name: "Tennis Grand Slam", date: "2026-01-05", location: "Bangalore", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=450&fit=crop", status: "completed" },
  ],
  news: [
    { id: 1, title: "Cricket World Cup Finals - Epic Showdown", description: "India vs Australia clash in the most anticipated match of the year.", date: "2025-12-10", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop" },
    { id: 2, title: "Football League Championship Winners", description: "Mumbai FC clinches the championship title in dramatic fashion.", date: "2025-12-08", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=450&fit=crop" },
    { id: 3, title: "Tennis Grand Slam Update", description: "New records set in the latest tennis tournament.", date: "2025-12-05", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=450&fit=crop" },
  ],
  players: [],
  teams: [],
  communities: [],
  liveMatches: [],
  products: [],
  registrations: [],
  communityRequests: [],
  sports: [],
  communityHighlights: [],
};

/**
 * Hook to read admin data from localStorage for user-facing pages
 * This allows user pages to display content managed by admins
 */
export function usePublicAdminData() {
  const [data, setData] = useState<AdminData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const savedData = localStorage.getItem("sportstribe_admin_data");
      let parsed: any = savedData ? JSON.parse(savedData) : null;
      
      // Sync user profiles to players list on load (same as AdminDataContext)
      let hasUpdates = false;
      try {
        const userProfilesStr = localStorage.getItem("user_profiles");
        if (userProfilesStr) {
          const userProfiles = JSON.parse(userProfilesStr);
          if (!parsed) {
            parsed = { players: [], tournaments: [], teams: [], news: [], communities: [], liveMatches: [], products: [] };
          }
          if (!parsed.players) {
            parsed.players = [];
          }
          const existingPlayerUserIds = new Set(
            parsed.players.map((p: any) => p.userId).filter(Boolean)
          );

          // Ensure all existing players have userId (for admin-created players without userId)
          parsed.players.forEach((player: any) => {
            if (!player.userId) {
              const now = new Date();
              const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
              const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
              const random = Math.random().toString(36).substring(2, 6).toUpperCase();
              player.userId = `ST-ADMIN-${dateStr}-${timeStr}-${random}`;
              hasUpdates = true;
            }
          });

          userProfiles.forEach((profile: any) => {
            // Only add if not already in players list
            if (profile.userId && !existingPlayerUserIds.has(profile.userId)) {
              const playerData = {
                id: profile.id || Date.now(),
                name: profile.name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                city: profile.city || "",
                state: profile.state || "",
                sport: profile.sport || "",
                position: profile.position || "",
                age: profile.age ? parseInt(profile.age) : undefined,
                matchesPlayed: undefined,
                bio: profile.bio || "",
                image: profile.profileImage || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
                userId: profile.userId,
                createdAt: profile.createdAt || new Date().toISOString(),
                updatedAt: profile.updatedAt,
              };

              parsed.players.push(playerData);
              existingPlayerUserIds.add(profile.userId);
              hasUpdates = true;
            }
          });
          
          // If we added players, save immediately to localStorage
          if (hasUpdates) {
            localStorage.setItem("sportstribe_admin_data", JSON.stringify(parsed));
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent("sportstribe-admin-data-changed", {
              detail: { data: parsed }
            }));
          }
        }
      } catch (profileError) {
        console.error("Error syncing user profiles:", profileError);
      }
      
      if (parsed) {
        // Ensure all players have userId (critical for persistence)
        if (parsed.players && parsed.players.length > 0) {
          let needsSave = false;
          parsed.players.forEach((player: any) => {
            if (!player.userId) {
              const now = new Date();
              const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
              const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
              const random = Math.random().toString(36).substring(2, 6).toUpperCase();
              player.userId = `ST-ADMIN-${dateStr}-${timeStr}-${random}`;
              needsSave = true;
            }
          });
          
          // Save if we updated any players
          if (needsSave) {
            localStorage.setItem("sportstribe_admin_data", JSON.stringify(parsed));
          }
        }
        
          // Use saved data directly - respect what admin has set (including deletions)
          // For news, use parsed array if it exists (even if empty), otherwise empty array (not defaultData)
          const loadedData: AdminData = {
            tournaments: Array.isArray(parsed.tournaments) ? parsed.tournaments : [],
            players: Array.isArray(parsed.players) ? parsed.players : [],
            teams: Array.isArray(parsed.teams) ? parsed.teams : [],
            news: Array.isArray(parsed.news) ? parsed.news : [],
            communities: Array.isArray(parsed.communities) ? parsed.communities : [],
            liveMatches: Array.isArray(parsed.liveMatches) ? parsed.liveMatches : [],
            products: Array.isArray(parsed.products) ? parsed.products : [],
            registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
            communityRequests: Array.isArray(parsed.communityRequests) ? parsed.communityRequests : [],
            sports: Array.isArray(parsed.sports) ? parsed.sports : [],
            communityHighlights: Array.isArray(parsed.communityHighlights) ? parsed.communityHighlights : [],
          };
        setData(loadedData);
      } else {
        // No saved data - use empty arrays instead of defaults to avoid overwriting
        // This ensures that if admin adds data, it won't be replaced by defaults
        setData({
          tournaments: [],
          players: [],
          teams: [],
          news: [], // Empty array, not defaultData.news
          communities: [],
          liveMatches: [],
          products: [],
          registrations: [],
          communityRequests: [],
          sports: [],
          communityHighlights: [],
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading admin data:", error);
      // If parsing fails, use empty arrays instead of defaults to avoid overwriting saved data
      setData({
        tournaments: [],
        players: [],
        teams: [],
        news: [], // Empty array, not defaultData.news
        communities: [],
        liveMatches: [],
        products: [],
        registrations: [],
        communityRequests: [],
        sports: [],
        communityHighlights: [],
      });
      setIsLoading(false);
    }

    // Function to load and update data (also syncs user profiles)
    const loadData = () => {
      try {
        const savedData = localStorage.getItem("sportstribe_admin_data");
        
        // If no saved data exists, don't overwrite current state
        if (!savedData) {
          return;
        }
        
        let parsed: any;
        try {
          parsed = JSON.parse(savedData);
        } catch (parseError) {
          console.error("Error parsing saved data:", parseError);
          return; // Don't overwrite if parsing fails
        }
        
        // Ensure parsed is an object
        if (!parsed || typeof parsed !== 'object') {
          return; // Don't overwrite with invalid data
        }
        
        // Initialize arrays if they don't exist (but don't overwrite if they do)
        if (!parsed.news) parsed.news = [];
        if (!parsed.tournaments) parsed.tournaments = [];
        if (!parsed.players) parsed.players = [];
        if (!parsed.teams) parsed.teams = [];
        if (!parsed.communities) parsed.communities = [];
        if (!parsed.liveMatches) parsed.liveMatches = [];
        if (!parsed.products) parsed.products = [];
        if (!parsed.sports) parsed.sports = [];
        if (!parsed.communityHighlights) parsed.communityHighlights = [];
        if (!parsed.registrations) parsed.registrations = [];
        if (!parsed.communityRequests) parsed.communityRequests = [];
        
        // Sync user profiles on each load
        let hasUpdates = false;
        try {
          const userProfilesStr = localStorage.getItem("user_profiles");
          if (userProfilesStr) {
            const userProfiles = JSON.parse(userProfilesStr);
            const existingPlayerUserIds = new Set(
              (parsed.players || []).map((p: any) => p.userId).filter(Boolean)
            );

            // Ensure all existing players have userId (for admin-created players without userId)
            (parsed.players || []).forEach((player: any) => {
              if (!player.userId) {
                const now = new Date();
                const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
                const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
                const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                player.userId = `ST-ADMIN-${dateStr}-${timeStr}-${random}`;
                hasUpdates = true;
              }
            });

            userProfiles.forEach((profile: any) => {
              if (profile.userId && !existingPlayerUserIds.has(profile.userId)) {
                const playerData = {
                  id: profile.id || Date.now(),
                  name: profile.name || "",
                  email: profile.email || "",
                  phone: profile.phone || "",
                  city: profile.city || "",
                  state: profile.state || "",
                  sport: profile.sport || "",
                  position: profile.position || "",
                  age: profile.age ? parseInt(profile.age) : undefined,
                  matchesPlayed: profile.matchesPlayed ? parseInt(profile.matchesPlayed) : undefined,
                  bio: profile.bio || "",
                  image: profile.profileImage || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
                  userId: profile.userId,
                  createdAt: profile.createdAt || new Date().toISOString(),
                  updatedAt: profile.updatedAt,
                };
                parsed.players.push(playerData);
                existingPlayerUserIds.add(profile.userId);
                hasUpdates = true;
              } else if (profile.userId && existingPlayerUserIds.has(profile.userId)) {
                // Update existing player to ensure matchesPlayed is synced
                const playerIndex = parsed.players.findIndex((p: any) => p.userId === profile.userId);
                if (playerIndex >= 0 && parsed.players[playerIndex]) {
                  // Update matchesPlayed only when the value actually changes
                  if (profile.matchesPlayed !== undefined && profile.matchesPlayed !== null) {
                    const parsedMatchesPlayed = parseInt(profile.matchesPlayed);
                    if (
                      !Number.isNaN(parsedMatchesPlayed) &&
                      parsed.players[playerIndex].matchesPlayed !== parsedMatchesPlayed
                    ) {
                      parsed.players[playerIndex].matchesPlayed = parsedMatchesPlayed;
                      hasUpdates = true;
                    }
                  }
                }
              }
            });
            
            if (hasUpdates) {
              // Ensure all arrays are preserved before saving
              if (!parsed.communityHighlights) parsed.communityHighlights = [];
              if (!parsed.sports) parsed.sports = [];
              if (!parsed.registrations) parsed.registrations = [];
              if (!parsed.communityRequests) parsed.communityRequests = [];
              localStorage.setItem("sportstribe_admin_data", JSON.stringify(parsed));
              // Dispatch event to notify other components
              window.dispatchEvent(new CustomEvent("sportstribe-admin-data-changed", {
                detail: { data: parsed }
              }));
            }
          }
        } catch (profileError) {
          console.error("Error syncing user profiles:", profileError);
        }
        
        // Ensure all admin-created players without userId get one assigned
        if (parsed.players && parsed.players.length > 0) {
          let needsSave = false;
          parsed.players.forEach((player: any) => {
            if (!player.userId) {
              const now = new Date();
              const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
              const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
              const random = Math.random().toString(36).substring(2, 6).toUpperCase();
              player.userId = `ST-ADMIN-${dateStr}-${timeStr}-${random}`;
              needsSave = true;
            }
          });
          
          // Save if we updated any players
          if (needsSave) {
            // Ensure all arrays are preserved before saving
            if (!parsed.communityHighlights) parsed.communityHighlights = [];
            if (!parsed.sports) parsed.sports = [];
            if (!parsed.registrations) parsed.registrations = [];
            if (!parsed.communityRequests) parsed.communityRequests = [];
            localStorage.setItem("sportstribe_admin_data", JSON.stringify(parsed));
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent("sportstribe-admin-data-changed", {
              detail: { data: parsed }
            }));
          }
        }
        
        // Use saved data directly - respect deletions and additions
        // CRITICAL: Use parsed arrays exactly as they are (even if empty) - don't overwrite with defaults
        const updatedData: AdminData = {
          tournaments: Array.isArray(parsed.tournaments) ? parsed.tournaments : [],
          players: Array.isArray(parsed.players) ? parsed.players : [],
          teams: Array.isArray(parsed.teams) ? parsed.teams : [],
          news: Array.isArray(parsed.news) ? parsed.news : [], // Always use saved news, never defaults
          communities: Array.isArray(parsed.communities) ? parsed.communities : [],
          liveMatches: Array.isArray(parsed.liveMatches) ? parsed.liveMatches : [],
          products: Array.isArray(parsed.products) ? parsed.products : [],
          registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
          communityRequests: Array.isArray(parsed.communityRequests) ? parsed.communityRequests : [],
          sports: Array.isArray(parsed.sports) ? parsed.sports : [],
          communityHighlights: Array.isArray(parsed.communityHighlights) ? parsed.communityHighlights : [],
        };
        
        setData((prev) => {
          // Quick reference check first
          if (prev === updatedData) return prev;
          
          // Shallow comparison of array lengths (fast check)
          if (
            prev.tournaments?.length === updatedData.tournaments?.length &&
            prev.registrations?.length === updatedData.registrations?.length &&
            prev.players?.length === updatedData.players?.length &&
            prev.teams?.length === updatedData.teams?.length &&
            prev.news?.length === updatedData.news?.length &&
            prev.communities?.length === updatedData.communities?.length &&
            prev.liveMatches?.length === updatedData.liveMatches?.length &&
            prev.products?.length === updatedData.products?.length &&
            prev.communityHighlights?.length === updatedData.communityHighlights?.length
          ) {
            // Only do deep comparison if lengths match (reduces expensive JSON.stringify calls)
            const prevDataStr = JSON.stringify(prev);
            const newDataStr = JSON.stringify(updatedData);
            if (prevDataStr === newDataStr) return prev;
          }
          
          return updatedData;
        });
      } catch (error) {
        console.error("Error loading admin data:", error);
        // Don't overwrite state on error - keep current data
      }
    };

    // Listen for custom event (same-tab changes)
    const handleCustomEvent = () => {
      loadData();
    };

    // Listen for storage event (cross-tab changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sportstribe_admin_data") {
        loadData();
      }
    };

    // Listen for both custom and storage events
    window.addEventListener("sportstribe-admin-data-changed", handleCustomEvent);
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for changes (failsafe)
    // Use longer interval (10 seconds) to reduce CPU usage and avoid race conditions
    const interval = setInterval(() => {
      loadData();
    }, 10000); // Check every 10 seconds for reliable sync without excessive CPU usage

    return () => {
      window.removeEventListener("sportstribe-admin-data-changed", handleCustomEvent);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return { data, isLoading };
}

/**
 * Format date from YYYY-MM-DD to readable format
 */
export function formatTournamentDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}


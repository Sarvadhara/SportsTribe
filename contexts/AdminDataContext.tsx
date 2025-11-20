"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Tournament {
  id: number;
  name: string;
  date: string;
  time?: string; // Tournament start time
  location: string;
  venue?: string; // Specific venue name
  image: string;
  status: "active" | "upcoming" | "completed";
  description?: string; // Detailed description
  rules?: string; // Tournament rules
  prizePool?: string; // Prize information
  maxParticipants?: number; // Maximum number of participants
  registrationDeadline?: string; // Registration deadline
  contactInfo?: string; // Contact information
  registrationFee?: string; // Registration fee
}

interface News {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
}

interface Player {
  id: number;
  name: string;
  city: string;
  state: string;
  sport: string;
  image: string;
  matchesPlayed?: number;
  age?: number;
  position?: string;
  bio?: string;
  email?: string;
  phone?: string;
  userId?: string; // Unique user ID for admin-created and user-created players
  createdAt?: string; // Creation timestamp
  updatedAt?: string; // Update timestamp
}

interface Community {
  id: number;
  name: string;
  members: string;
  location: string;
  image: string;
}

interface LiveMatch {
  id: number;
  title: string;
  status: "LIVE" | "Upcoming" | "Completed";
  image: string;
  streamUrl?: string;
}

interface Product {
  id: number | string;
  name: string;
  price: string;
  image: string;
  description?: string;
  stock?: string | number | null;
}

interface Team {
  id: number;
  name: string;
  city: string;
  state: string;
  sport: string;
  image: string;
  founded?: number;
  coach?: string;
  captain?: string;
}

interface Sport {
  id: number;
  name: string;
  image: string;
}

interface CommunityHighlight {
  id: number;
  title: string;
  mediaUrl: string; // Can be image or video URL
  mediaType: "image" | "video";
  description?: string; // Data shown on hover
  date?: string;
}

interface AdminData {
  tournaments: Tournament[];
  news: News[];
  players: Player[];
  teams: Team[];
  communities: Community[];
  liveMatches: LiveMatch[];
  products: Product[];
  registrations: Registration[];
  communityRequests: CommunityJoinRequest[];
  sports: Sport[];
  communityHighlights: CommunityHighlight[];
}

interface AdminDataContextType {
  data: AdminData;
  updateTournaments: (tournaments: Tournament[]) => void;
  updateNews: (news: News[]) => void;
  updatePlayers: (players: Player[]) => void;
  updateTeams: (teams: Team[]) => void;
  updateCommunities: (communities: Community[]) => void;
  updateLiveMatches: (matches: LiveMatch[]) => void;
  updateProducts: (products: Product[]) => void;
  updateRegistrations: (registrations: Registration[]) => void;
  updateCommunityRequests: (requests: CommunityJoinRequest[]) => void;
  updateSports: (sports: Sport[]) => void;
  updateCommunityHighlights: (highlights: CommunityHighlight[]) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

interface Registration {
  id: string; // `${tournamentId}-${userId}-${timestamp}`
  tournamentId: number | string;
  tournamentName: string;
  userId: string;
  userName: string;
  userEmail?: string;
  registrationDate: string;
  status: "pending" | "confirmed" | "rejected";
}

interface CommunityJoinRequest {
  id: string; // `${communityId}-${userId}-${timestamp}`
  communityId: number;
  communityName: string;
  userId: string;
  userName?: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

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
  players: [], // No default players - only admin-created and user-created players
  teams: [
    { id: 1, name: "Mumbai Warriors", city: "Mumbai", state: "Maharashtra", sport: "Cricket", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop", founded: 2015, coach: "Ravi Shastri", captain: "Virat Kohli" },
    { id: 2, name: "Delhi Dragons", city: "Delhi", state: "Delhi", sport: "Football", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop", founded: 2018, coach: "John Smith", captain: "Sunil Chhetri" },
    { id: 3, name: "Bangalore Blazers", city: "Bangalore", state: "Karnataka", sport: "Basketball", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop", founded: 2016, coach: "Mike Johnson", captain: "Amritpal Singh" },
    { id: 4, name: "Chennai Champions", city: "Chennai", state: "Tamil Nadu", sport: "Cricket", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop", founded: 2014, coach: "MS Dhoni", captain: "Ravindra Jadeja" },
    { id: 5, name: "Hyderabad Hawks", city: "Hyderabad", state: "Telangana", sport: "Badminton", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop", founded: 2017, coach: "Pullela Gopichand", captain: "PV Sindhu" },
    { id: 6, name: "Pune Panthers", city: "Pune", state: "Maharashtra", sport: "Football", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop", founded: 2019, coach: "David Beckham", captain: "Sandesh Jhingan" },
    { id: 7, name: "Kolkata Kings", city: "Kolkata", state: "West Bengal", sport: "Tennis", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&h=400&fit=crop", founded: 2013, coach: "Leander Paes", captain: "Sania Mirza" },
    { id: 8, name: "Jaipur Jaguars", city: "Jaipur", state: "Rajasthan", sport: "Cricket", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop", founded: 2012, coach: "Rahul Dravid", captain: "Ajinkya Rahane" },
    { id: 9, name: "Ahmedabad Aces", city: "Ahmedabad", state: "Gujarat", sport: "Basketball", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop", founded: 2020, coach: "Satnam Singh", captain: "Prasidh Krishna" },
    { id: 10, name: "Surat Strikers", city: "Surat", state: "Gujarat", sport: "Football", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop", founded: 2021, coach: "Igor Stimac", captain: "Gurpreet Singh" },
    { id: 11, name: "Kochi Knights", city: "Kochi", state: "Kerala", sport: "Tennis", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&h=400&fit=crop", founded: 2015, coach: "Mahesh Bhupathi", captain: "Rohan Bopanna" },
    { id: 12, name: "Vizag Vikings", city: "Visakhapatnam", state: "Andhra Pradesh", sport: "Cricket", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop", founded: 2017, coach: "VVS Laxman", captain: "Hanuma Vihari" },
  ],
  communities: [
    { id: 1, name: "Cricket Hyderabad", members: "2.5K", location: "Hyderabad", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop" },
    { id: 2, name: "Football Vizag", members: "1.8K", location: "Visakhapatnam", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop" },
    { id: 3, name: "Tennis Mumbai", members: "1.2K", location: "Mumbai", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&h=400&fit=crop" },
  ],
  liveMatches: [
    { id: 1, title: "Cricket - India vs Australia", status: "LIVE", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop", streamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: 2, title: "Football - Mumbai FC vs Delhi United", status: "LIVE", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=450&fit=crop", streamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: 3, title: "Tennis - Championship Finals", status: "Upcoming", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=450&fit=crop", streamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  ],
  products: [
    { id: 1, name: "SportsTribe Jersey", price: "₹ 1,299", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop" },
    { id: 2, name: "Official Cricket Bat", price: "₹ 2,499", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop" },
    { id: 3, name: "Football Boots", price: "₹ 3,999", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=600&fit=crop" },
  ],
  registrations: [],
  communityRequests: [],
  sports: [
    { id: 1, name: "Cricket", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop" },
    { id: 2, name: "Football", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=300&fit=crop" },
    { id: 3, name: "Tennis", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400&h=300&fit=crop" },
    { id: 4, name: "Badminton", image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=300&fit=crop" },
    { id: 5, name: "Basketball", image: "https://images.unsplash.com/photo-1622279457456-62e9e2b6e310?w=400&h=300&fit=crop" },
    { id: 6, name: "Table Tennis", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop" },
    { id: 7, name: "Volleyball", image: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400&h=300&fit=crop" },
  ],
  communityHighlights: [],
};

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminData>(defaultData);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const savedData = localStorage.getItem("sportstribe_admin_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Sync user profiles to players list if they're not already there
        // This ensures user-created profiles appear as players
        let hasUpdates = false;
        try {
          const userProfilesStr = localStorage.getItem("user_profiles");
          if (userProfilesStr) {
            const userProfiles = JSON.parse(userProfilesStr);
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
              } else if (profile.userId && existingPlayerUserIds.has(profile.userId)) {
                // Update existing player if profile has been updated
                const playerIndex = parsed.players.findIndex((p: any) => p.userId === profile.userId);
                if (playerIndex >= 0) {
                  const updatedPlayer = {
                    ...parsed.players[playerIndex],
                    name: profile.name || parsed.players[playerIndex].name,
                    email: profile.email || parsed.players[playerIndex].email,
                    phone: profile.phone || parsed.players[playerIndex].phone,
                    city: profile.city || parsed.players[playerIndex].city,
                    state: profile.state || parsed.players[playerIndex].state,
                    sport: profile.sport || parsed.players[playerIndex].sport,
                    position: profile.position || parsed.players[playerIndex].position,
                    age: profile.age ? parseInt(profile.age) : parsed.players[playerIndex].age,
                    bio: profile.bio || parsed.players[playerIndex].bio,
                    image: profile.profileImage || parsed.players[playerIndex].image,
                    updatedAt: profile.updatedAt || parsed.players[playerIndex].updatedAt,
                  };
                  if (JSON.stringify(updatedPlayer) !== JSON.stringify(parsed.players[playerIndex])) {
                    parsed.players[playerIndex] = updatedPlayer;
                    hasUpdates = true;
                  }
                }
              }
            });
            
            // If we added or updated players, save immediately to localStorage
            // Ensure all required arrays exist before saving
            if (hasUpdates) {
              // Ensure all arrays are initialized before saving
              if (!parsed.communityHighlights) parsed.communityHighlights = [];
              if (!parsed.sports) parsed.sports = [];
              if (!parsed.registrations) parsed.registrations = [];
              if (!parsed.communityRequests) parsed.communityRequests = [];
              localStorage.setItem("sportstribe_admin_data", JSON.stringify(parsed));
            }
          }
        } catch (profileError) {
          console.error("Error syncing user profiles:", profileError);
        }

        // Use saved data directly - no merging with defaults (respects deletions)
        // Ensure all arrays exist, but use saved data if it exists
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
      }
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
  }, []);

  // DISABLED: Save effect is no longer needed since all update functions save immediately
  // This was causing race conditions where the effect would overwrite data saved by update functions
  // All update functions now read from localStorage first and save immediately, ensuring consistency
  // 
  // useEffect(() => {
  //   ... save logic ...
  // }, [data]);

  // Helper function to safely save to localStorage with error handling and quota checking
  const safeSaveToLocalStorage = (data: any, dataType: string): boolean => {
    try {
      // Ensure data is valid
      if (!data || typeof data !== 'object') {
        console.error(`Invalid data provided for ${dataType}`);
        return false;
      }

      const jsonString = JSON.stringify(data);
      const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
      
      // Check if data is too large (localStorage limit is typically 5-10MB)
      if (sizeInMB > 8) {
        console.error(`Data too large (${sizeInMB.toFixed(2)}MB) for ${dataType}. Consider cleaning up old data.`);
        alert(`Warning: Data is getting large (${sizeInMB.toFixed(2)}MB). Some data may not save properly.`);
        return false;
      }
      
      // Save to localStorage
      localStorage.setItem("sportstribe_admin_data", jsonString);
      
      // Verify the save worked by reading it back
      const verifySave = localStorage.getItem("sportstribe_admin_data");
      if (!verifySave || verifySave !== jsonString) {
        console.error(`Failed to verify save for ${dataType} - data may be corrupted`);
        return false;
      }
      
      console.log(`✅ Successfully saved ${dataType} to localStorage (${sizeInMB.toFixed(2)}MB)`);
      
      // Dispatch custom event for same-tab sync
      try {
        window.dispatchEvent(new CustomEvent("sportstribe-admin-data-changed", {
          detail: { data }
        }));
        
        // Dispatch storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'sportstribe_admin_data',
          newValue: jsonString,
          storageArea: localStorage
        }));
      } catch (eventError) {
        console.warn(`Event dispatch failed for ${dataType}, but data was saved:`, eventError);
        // Don't fail the save if event dispatch fails
      }
      
      return true;
    } catch (error: any) {
      console.error(`❌ Error saving ${dataType} to localStorage:`, error);
      
      // Check if it's a quota error
      if (error.name === 'QuotaExceededError' || error.code === 22 || error.message?.includes('quota')) {
        const errorMsg = `Storage quota exceeded! Please clear some data or use a different browser.\n\nError: ${error.message || 'Unknown error'}`;
        console.error(errorMsg);
        alert(errorMsg);
      } else {
        const errorMsg = `Failed to save ${dataType}.\n\nError: ${error.message || 'Unknown error'}`;
        console.error(errorMsg);
        alert(errorMsg);
      }
      return false;
    }
  };

  const updateTournaments = (tournaments: Tournament[]) => {
    // Read latest data from localStorage to avoid race conditions
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try {
        latestData = JSON.parse(savedData);
      } catch {
        latestData = null;
      }
    }
    
    setData((prev) => {
      // Use latest data from localStorage if available, otherwise use prev state
      const baseData = latestData || prev;
      
      // Ensure tournaments is an array
      const tournamentsArray = Array.isArray(tournaments) ? tournaments : [];
      
      // Ensure all other arrays are properly defined when saving
      const updatedData = {
        tournaments: tournamentsArray,
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      
      // Save to localStorage immediately for persistence - CRITICAL: Only update state if save succeeds
      const saved = safeSaveToLocalStorage(updatedData, "tournaments");
      if (!saved) {
        console.error("❌ Failed to save tournaments - NOT updating state to prevent data loss");
        alert("Failed to save tournaments. Please try again or check browser storage.");
        return prev; // Return previous state if save failed
      }
      
      console.log("✅ Tournaments saved successfully, updating state");
      return updatedData;
    });
  };

  const updateNews = (news: News[]) => {
    // Read latest data from localStorage to avoid race conditions
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try {
        latestData = JSON.parse(savedData);
      } catch {
        latestData = null;
      }
    }
    
    setData((prev) => {
      // Use latest data from localStorage if available, otherwise use prev state
      const baseData = latestData || prev;
      
      // Ensure news is an array
      const newsArray = Array.isArray(news) ? news : [];
      
      // Ensure all other arrays are properly defined when saving
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: newsArray, // Use the provided news array
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      
      // Save to localStorage immediately for persistence
      // Save to localStorage immediately for persistence - CRITICAL: Only update state if save succeeds
      const saved = safeSaveToLocalStorage(updatedData, "news");
      if (!saved) {
        console.error("❌ Failed to save news - NOT updating state to prevent data loss");
        alert("Failed to save news. Please try again or check browser storage.");
        return prev; // Return previous state if save failed
      }
      
      console.log("✅ News saved successfully, updating state");
      return updatedData;
    });
  };

  const updatePlayers = (players: Player[]) => {
    // Read latest data from localStorage to avoid race conditions
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try {
        latestData = JSON.parse(savedData);
      } catch {
        latestData = null;
      }
    }
    
    // Ensure all players have required fields and userId
    const validatedPlayers = (Array.isArray(players) ? players : []).map((player: any) => {
      if (!player.userId) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        player.userId = `ST-ADMIN-${dateStr}-${timeStr}-${random}`;
      }
      if (!player.createdAt && !player.id) {
        player.createdAt = new Date().toISOString();
      }
      return player;
    });
    
    setData((prev) => {
      // Use latest data from localStorage if available, otherwise use prev state
      const baseData = latestData || prev;
      
      // Ensure all other arrays are properly defined when saving
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: validatedPlayers,
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      
      // Save to localStorage immediately for persistence - CRITICAL: Only update state if save succeeds
      const saved = safeSaveToLocalStorage(updatedData, "players");
      if (!saved) {
        console.error("❌ Failed to save players - NOT updating state to prevent data loss");
        alert("Failed to save players. Please try again or check browser storage.");
        return prev; // Return previous state if save failed
      }
      
      console.log("✅ Players saved successfully, updating state");
      return updatedData;
    });
  };

  const updateTeams = (teams: Team[]) => {
    // Read latest data from localStorage to avoid race conditions
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try {
        latestData = JSON.parse(savedData);
      } catch {
        latestData = null;
      }
    }
    
    setData((prev) => {
      // Use latest data from localStorage if available, otherwise use prev state
      const baseData = latestData || prev;
      
      // Ensure teams is an array
      const teamsArray = Array.isArray(teams) ? teams : [];
      
      // Ensure all other arrays are properly defined when saving
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: teamsArray,
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      
      // Save to localStorage immediately for persistence
      // Save to localStorage immediately for persistence - CRITICAL: Only update state if save succeeds
      const saved = safeSaveToLocalStorage(updatedData, "teams");
      if (!saved) {
        console.error("❌ Failed to save teams - NOT updating state to prevent data loss");
        alert("Failed to save teams. Please try again or check browser storage.");
        return prev; // Return previous state if save failed
      }
      
      console.log("✅ Teams saved successfully, updating state");
      return updatedData;
    });
  };

  const updateCommunities = (communities: Community[]) => {
    // Read latest data from localStorage to avoid race conditions
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try {
        latestData = JSON.parse(savedData);
      } catch {
        latestData = null;
      }
    }
    
    setData((prev) => {
      // Use latest data from localStorage if available, otherwise use prev state
      const baseData = latestData || prev;
      
      // Ensure communities is an array and filter out invalid entries
      let communitiesArray = Array.isArray(communities) ? communities : [];
      
      // Validate and ensure communities have valid structure with defaults for optional fields
      const beforeFilter = communitiesArray.length;
      const defaultImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop";
      const defaultName = "Unnamed Community";
      const defaultLocation = "Location not specified";
      const defaultMembers = "0";
      
      communitiesArray = communitiesArray.filter((c: any) => {
        if (!c) {
          console.warn("Filtered out null/undefined community");
          return false;
        }
        if (typeof c.id !== 'number') {
          console.warn("Filtered out community with invalid id:", c);
          return false;
        }
        // All fields are optional - set defaults if missing
        if (typeof c.name !== 'string' || c.name.trim().length === 0) {
          c.name = defaultName;
        }
        if (typeof c.location !== 'string' || c.location.trim().length === 0) {
          c.location = defaultLocation;
        }
        if (typeof c.members !== 'string' || c.members.trim().length === 0) {
          c.members = defaultMembers;
        }
        if (typeof c.image !== 'string' || c.image.trim().length === 0) {
          c.image = defaultImage;
        }
        return true;
      });
      
      if (beforeFilter !== communitiesArray.length) {
        console.warn(`updateCommunities: Filtered ${beforeFilter - communitiesArray.length} invalid communities`);
      }
      console.log("updateCommunities: Saving", communitiesArray.length, "communities");
      
      // Ensure all other arrays are properly defined when saving
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: communitiesArray,
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      
      // Save to localStorage immediately for persistence - CRITICAL: Only update state if save succeeds
      const saved = safeSaveToLocalStorage(updatedData, "communities");
      if (!saved) {
        console.error("❌ Failed to save communities - NOT updating state to prevent data loss");
        alert("Failed to save communities. Please try again or check browser storage.");
        return prev; // Return previous state if save failed
      }
      
      console.log("✅ Communities saved successfully, updating state");
      return updatedData;
    });
  };

  const updateLiveMatches = (matches: LiveMatch[]) => {
    // Read latest data from localStorage to avoid race conditions
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try {
        latestData = JSON.parse(savedData);
      } catch {
        latestData = null;
      }
    }
    
    setData((prev) => {
      // Use latest data from localStorage if available, otherwise use prev state
      const baseData = latestData || prev;
      
      // Ensure liveMatches is an array
      const matchesArray = Array.isArray(matches) ? matches : [];
      
      // Ensure all other arrays are properly defined when saving
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: matchesArray,
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      
      // Save to localStorage immediately for persistence
      // Save to localStorage immediately for persistence - CRITICAL: Only update state if save succeeds
      const saved = safeSaveToLocalStorage(updatedData, "liveMatches");
      if (!saved) {
        console.error("❌ Failed to save live matches - NOT updating state to prevent data loss");
        alert("Failed to save live matches. Please try again or check browser storage.");
        return prev; // Return previous state if save failed
      }
      
      console.log("✅ Live matches saved successfully, updating state");
      return updatedData;
    });
  };

  const updateProducts = (products: Product[]) => {
    // Read latest data from localStorage to avoid race conditions
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try {
        latestData = JSON.parse(savedData);
      } catch {
        latestData = null;
      }
    }
    
    setData((prev) => {
      // Use latest data from localStorage if available, otherwise use prev state
      const baseData = latestData || prev;
      
      // Ensure products is an array
      const productsArray = Array.isArray(products) ? products : [];
      
      // Ensure all other arrays are properly defined when saving
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: productsArray,
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      
      // Save to localStorage immediately for persistence - CRITICAL: Only update state if save succeeds
      const saved = safeSaveToLocalStorage(updatedData, "products");
      if (!saved) {
        console.error("❌ Failed to save products - NOT updating state to prevent data loss");
        alert("Failed to save products. Please try again or check browser storage.");
        return prev; // Return previous state if save failed
      }
      
      console.log("✅ Products saved successfully, updating state");
      return updatedData;
    });
  };

  const updateCommunityRequests = (requests: CommunityJoinRequest[]) => {
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try { latestData = JSON.parse(savedData); } catch { latestData = null; }
    }
    setData((prev) => {
      const baseData = latestData || prev;
      const requestsArray = Array.isArray(requests) ? requests : [];
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: requestsArray,
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      try {
        const saved = safeSaveToLocalStorage(updatedData, "communityRequests");
        if (!saved) {
          console.error("Failed to save community requests - data may be lost on refresh");
        }
      } catch (error) {
        console.error("Error preparing community requests data:", error);
      }
      return updatedData;
    });
  };

  const updateSports = (sports: Sport[]) => {
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try { latestData = JSON.parse(savedData); } catch { latestData = null; }
    }
    setData((prev) => {
      const baseData = latestData || prev;
      const sportsArray = Array.isArray(sports) ? sports : [];
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: Array.isArray(baseData.registrations) ? baseData.registrations : [],
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: sportsArray,
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      // Save to localStorage immediately for persistence - CRITICAL: Only update state if save succeeds
      try {
        const saved = safeSaveToLocalStorage(updatedData, "sports");
        if (!saved) {
          console.error("❌ Failed to save sports - NOT updating state to prevent data loss");
          alert("Failed to save sports. Please try again or check browser storage.");
          return prev; // Return previous state if save failed
        }
        
        console.log("✅ Sports saved successfully, updating state");
        return updatedData;
      } catch (error) {
        console.error("❌ Error preparing sports data:", error);
        alert(`Error saving sports: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return prev; // Return previous state if error occurred
      }
    });
  };

  const updateRegistrations = (registrations: Registration[]) => {
    const savedData = localStorage.getItem("sportstribe_admin_data");
    let latestData: any = null;
    if (savedData) {
      try {
        latestData = JSON.parse(savedData);
      } catch {
        latestData = null;
      }
    }
    setData((prev) => {
      const baseData = latestData || prev;
      const registrationsArray = Array.isArray(registrations) ? registrations : [];
      const updatedData = {
        tournaments: Array.isArray(baseData.tournaments) ? baseData.tournaments : [],
        players: Array.isArray(baseData.players) ? baseData.players : [],
        teams: Array.isArray(baseData.teams) ? baseData.teams : [],
        news: Array.isArray(baseData.news) ? baseData.news : [],
        communities: Array.isArray(baseData.communities) ? baseData.communities : [],
        liveMatches: Array.isArray(baseData.liveMatches) ? baseData.liveMatches : [],
        products: Array.isArray(baseData.products) ? baseData.products : [],
        registrations: registrationsArray,
        communityRequests: Array.isArray(baseData.communityRequests) ? baseData.communityRequests : [],
        sports: Array.isArray(baseData.sports) ? baseData.sports : [],
        communityHighlights: Array.isArray(baseData.communityHighlights) ? baseData.communityHighlights : [],
      };
      try {
        const saved = safeSaveToLocalStorage(updatedData, "registrations");
        if (!saved) {
          console.error("Failed to save registrations - data may be lost on refresh");
        }
      } catch (error) {
        console.error("Error preparing registrations data:", error);
      }
      return updatedData;
    });
  };

  const updateCommunityHighlights = (highlights: CommunityHighlight[]) => {
    setData((prev) => {
      // Use current state (prev) as the base to avoid race conditions
      // This ensures we're always working with the latest state
      const highlightsArray = Array.isArray(highlights) ? highlights : [];
      
      // Ensure all arrays are properly initialized from current state
      const updatedData: AdminData = {
        tournaments: Array.isArray(prev.tournaments) ? prev.tournaments : [],
        players: Array.isArray(prev.players) ? prev.players : [],
        teams: Array.isArray(prev.teams) ? prev.teams : [],
        news: Array.isArray(prev.news) ? prev.news : [],
        communities: Array.isArray(prev.communities) ? prev.communities : [],
        liveMatches: Array.isArray(prev.liveMatches) ? prev.liveMatches : [],
        products: Array.isArray(prev.products) ? prev.products : [],
        registrations: Array.isArray(prev.registrations) ? prev.registrations : [],
        communityRequests: Array.isArray(prev.communityRequests) ? prev.communityRequests : [],
        sports: Array.isArray(prev.sports) ? prev.sports : [],
        communityHighlights: highlightsArray, // Use the new highlights array
      };
      
      try {
        // Save to localStorage immediately
        const saved = safeSaveToLocalStorage(updatedData, "communityHighlights");
        if (!saved) {
          console.error("Failed to save community highlights - data may be lost on refresh");
          return prev; // Return previous state if save fails
        }
        
        // Explicitly dispatch event to ensure sync (safeSaveToLocalStorage also does this, but this ensures it)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sportstribe-admin-data-changed", {
            detail: { data: updatedData }
          }));
        }
        
        console.log(`✅ Community highlights updated: ${highlightsArray.length} highlights saved`);
      } catch (error) {
        console.error("Error preparing community highlights data:", error);
        // Return previous state if save fails to avoid data loss
        return prev;
      }
      
      // Return the updated data to update the state
      return updatedData;
    });
  };

  return (
    <AdminDataContext.Provider
      value={{
        data,
        updateTournaments,
        updateNews,
        updatePlayers,
        updateTeams,
        updateCommunities,
        updateLiveMatches,
        updateProducts,
        updateRegistrations,
        updateCommunityRequests,
        updateSports,
        updateCommunityHighlights,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
}

// Export types for use in other components
export type { Tournament, News, Player, Team, Community, LiveMatch, Product, Sport, CommunityHighlight, AdminData };


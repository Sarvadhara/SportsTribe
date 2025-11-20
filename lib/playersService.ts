import { supabase } from "./supabaseClient";

export interface Player {
  id: number | string;
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
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Maps database column names (snake_case) to app format (camelCase)
 */
function mapPlayerFromDB(data: any): Player {
  return {
    id: data.id,
    name: data.name,
    city: data.city,
    state: data.state,
    sport: data.sport,
    image: data.image,
    matchesPlayed: data.matches_played || data.matchesPlayed || undefined,
    age: data.age || undefined,
    position: data.position || undefined,
    bio: data.bio || undefined,
    email: data.email || undefined,
    phone: data.phone || undefined,
    userId: data.user_id || data.userId || undefined,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
  };
}

/**
 * Maps app format (camelCase) to database column names (snake_case)
 */
function mapPlayerToDB(player: Partial<Player>): any {
  const dbData: any = {};
  
  if (player.name !== undefined) dbData.name = player.name;
  if (player.city !== undefined) dbData.city = player.city;
  if (player.state !== undefined) dbData.state = player.state;
  if (player.sport !== undefined) dbData.sport = player.sport;
  if (player.image !== undefined) dbData.image = player.image;
  if (player.matchesPlayed !== undefined) dbData.matches_played = player.matchesPlayed;
  if (player.age !== undefined) dbData.age = player.age;
  if (player.position !== undefined) dbData.position = player.position;
  if (player.bio !== undefined) dbData.bio = player.bio;
  if (player.email !== undefined) dbData.email = player.email;
  if (player.phone !== undefined) dbData.phone = player.phone;
  if (player.userId !== undefined) dbData.user_id = player.userId;
  
  return dbData;
}

/**
 * Fetch all players from Supabase
 */
export async function fetchPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching players:", error);
      throw error;
    }

    return (data || []).map(mapPlayerFromDB);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    throw error;
  }
}

/**
 * Fetch players by sport
 */
export async function fetchPlayersBySport(sport: string): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("sport", sport)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching players by sport:", error);
      throw error;
    }

    return (data || []).map(mapPlayerFromDB);
  } catch (error) {
    console.error("Failed to fetch players by sport:", error);
    throw error;
  }
}

/**
 * Fetch a single player by ID
 */
export async function fetchPlayerById(id: number | string): Promise<Player | null> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching player:", error);
      throw error;
    }

    return data ? mapPlayerFromDB(data) : null;
  } catch (error) {
    console.error("Failed to fetch player:", error);
    throw error;
  }
}

/**
 * Fetch a player by user ID
 */
export async function fetchPlayerByUserId(userId: string): Promise<Player | null> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching player by user ID:", error);
      throw error;
    }

    return data ? mapPlayerFromDB(data) : null;
  } catch (error) {
    console.error("Failed to fetch player by user ID:", error);
    throw error;
  }
}

/**
 * Create a new player in Supabase
 */
export async function createPlayer(
  player: Omit<Player, "id" | "createdAt" | "updatedAt">
): Promise<Player> {
  try {
    const dbData = mapPlayerToDB(player);
    
    // Log the data being sent for debugging
    console.log("Creating player with data:", dbData);
    
    const { data, error } = await supabase
      .from("players")
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error("Error creating player:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Create a more user-friendly error message
      let errorMessage = "Failed to create player";
      if (error.code === "42P01") {
        errorMessage = "Players table does not exist. Please create it in Supabase.";
      } else if (error.code === "42501") {
        errorMessage = "Permission denied. Check your Row Level Security (RLS) policies in Supabase.";
      } else if (error.message) {
        errorMessage = `Failed to create player: ${error.message}`;
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }

    return mapPlayerFromDB(data);
  } catch (error: any) {
    console.error("Failed to create player:", error);
    // Re-throw with enhanced message if it's our enhanced error
    if (error.message && error.message !== "Failed to create player") {
      throw error;
    }
    throw new Error(error.message || "Failed to create player. Please check your Supabase connection.");
  }
}

/**
 * Update an existing player in Supabase
 */
export async function updatePlayer(
  id: number | string,
  player: Partial<Player>
): Promise<Player> {
  try {
    const dbData = mapPlayerToDB(player);
    
    const { data, error } = await supabase
      .from("players")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating player:", error);
      throw error;
    }

    return mapPlayerFromDB(data);
  } catch (error) {
    console.error("Failed to update player:", error);
    throw error;
  }
}

/**
 * Delete a player from Supabase
 */
export async function deletePlayer(id: number | string): Promise<void> {
  try {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting player:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete player:", error);
    throw error;
  }
}


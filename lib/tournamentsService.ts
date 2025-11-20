import { supabase } from "./supabaseClient";

export interface Tournament {
  id: number | string;
  name: string;
  date: string;
  time?: string;
  location: string;
  venue?: string;
  image: string;
  status: "active" | "upcoming" | "completed";
  description?: string;
  rules?: string;
  prizePool?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  contactInfo?: string;
  registrationFee?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Maps database column names (snake_case) to app format (camelCase)
 */
function mapTournamentFromDB(data: any): Tournament {
  return {
    id: data.id,
    name: data.name,
    date: data.date,
    time: data.time || undefined,
    location: data.location,
    venue: data.venue || undefined,
    image: data.image,
    status: data.status,
    description: data.description || undefined,
    rules: data.rules || undefined,
    prizePool: data.prize_pool || data.prizePool || undefined,
    maxParticipants: data.max_participants || data.maxParticipants || undefined,
    registrationDeadline: data.registration_deadline || data.registrationDeadline || undefined,
    contactInfo: data.contact_info || data.contactInfo || undefined,
    registrationFee: data.registration_fee || data.registrationFee || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Maps app format (camelCase) to database column names (snake_case)
 */
function mapTournamentToDB(tournament: Partial<Tournament>): any {
  const dbData: any = {};
  
  if (tournament.name !== undefined) dbData.name = tournament.name;
  if (tournament.date !== undefined) dbData.date = tournament.date;
  if (tournament.time !== undefined) dbData.time = tournament.time;
  if (tournament.location !== undefined) dbData.location = tournament.location;
  if (tournament.venue !== undefined) dbData.venue = tournament.venue;
  if (tournament.image !== undefined) dbData.image = tournament.image;
  if (tournament.status !== undefined) dbData.status = tournament.status;
  if (tournament.description !== undefined) dbData.description = tournament.description;
  if (tournament.rules !== undefined) dbData.rules = tournament.rules;
  if (tournament.prizePool !== undefined) dbData.prize_pool = tournament.prizePool;
  if (tournament.maxParticipants !== undefined) dbData.max_participants = tournament.maxParticipants;
  if (tournament.registrationDeadline !== undefined) dbData.registration_deadline = tournament.registrationDeadline;
  if (tournament.contactInfo !== undefined) dbData.contact_info = tournament.contactInfo;
  if (tournament.registrationFee !== undefined) dbData.registration_fee = tournament.registrationFee;
  
  return dbData;
}

/**
 * Fetch all tournaments from Supabase
 */
export async function fetchTournaments(): Promise<Tournament[]> {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching tournaments:", error);
      throw error;
    }

    return (data || []).map(mapTournamentFromDB);
  } catch (error) {
    console.error("Failed to fetch tournaments:", error);
    throw error;
  }
}

/**
 * Fetch only active and upcoming tournaments (for featured section)
 */
export async function fetchFeaturedTournaments(limit?: number): Promise<Tournament[]> {
  try {
    let query = supabase
      .from("tournaments")
      .select("*")
      .in("status", ["active", "upcoming"])
      .order("date", { ascending: true });

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching featured tournaments:", error);
      throw error;
    }

    return (data || []).map(mapTournamentFromDB);
  } catch (error) {
    console.error("Failed to fetch featured tournaments:", error);
    throw error;
  }
}

/**
 * Fetch a single tournament by ID
 */
export async function fetchTournamentById(id: number | string): Promise<Tournament | null> {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching tournament:", error);
      throw error;
    }

    return data ? mapTournamentFromDB(data) : null;
  } catch (error) {
    console.error("Failed to fetch tournament:", error);
    throw error;
  }
}

/**
 * Create a new tournament in Supabase
 */
export async function createTournament(
  tournament: Omit<Tournament, "id" | "created_at" | "updated_at">
): Promise<Tournament> {
  try {
    const dbData = mapTournamentToDB(tournament);
    
    // Log the data being sent for debugging
    console.log("Creating tournament with data:", dbData);
    
    const { data, error } = await supabase
      .from("tournaments")
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error("Error creating tournament:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Create a more user-friendly error message
      let errorMessage = "Failed to create tournament";
      if (error.code === "42P01") {
        errorMessage = "Tournaments table does not exist. Please create it in Supabase.";
      } else if (error.code === "42501") {
        errorMessage = "Permission denied. Check your Row Level Security (RLS) policies in Supabase.";
      } else if (error.message) {
        errorMessage = `Failed to create tournament: ${error.message}`;
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }

    return mapTournamentFromDB(data);
  } catch (error: any) {
    console.error("Failed to create tournament:", error);
    // Re-throw with enhanced message if it's our enhanced error
    if (error.message && error.message !== "Failed to create tournament") {
      throw error;
    }
    throw new Error(error.message || "Failed to create tournament. Please check your Supabase connection.");
  }
}

/**
 * Update an existing tournament in Supabase
 */
export async function updateTournament(
  id: number | string,
  tournament: Partial<Tournament>
): Promise<Tournament> {
  try {
    const dbData = mapTournamentToDB(tournament);
    
    const { data, error } = await supabase
      .from("tournaments")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating tournament:", error);
      throw error;
    }

    return mapTournamentFromDB(data);
  } catch (error) {
    console.error("Failed to update tournament:", error);
    throw error;
  }
}

/**
 * Delete a tournament from Supabase
 */
export async function deleteTournament(id: number | string): Promise<void> {
  try {
    const { error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting tournament:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete tournament:", error);
    throw error;
  }
}


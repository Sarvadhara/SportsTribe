import { supabase } from "./supabaseClient";

export interface LiveMatch {
  id: number | string;
  title: string;
  status: "LIVE" | "Upcoming" | "Completed";
  image: string;
  streamUrl?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Maps database column names (snake_case) to app format (camelCase)
 */
function mapLiveMatchFromDB(data: any): LiveMatch {
  return {
    id: data.id,
    title: data.title,
    status: data.status,
    image: data.image,
    streamUrl: data.stream_url || data.streamUrl || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Maps app format (camelCase) to database column names (snake_case)
 */
function mapLiveMatchToDB(match: Partial<LiveMatch>): any {
  const dbData: any = {};
  
  if (match.title !== undefined) dbData.title = match.title;
  if (match.status !== undefined) dbData.status = match.status;
  if (match.image !== undefined) dbData.image = match.image;
  if (match.streamUrl !== undefined) dbData.stream_url = match.streamUrl;
  
  return dbData;
}

/**
 * Fetch all live matches from Supabase
 */
export async function fetchLiveMatches(): Promise<LiveMatch[]> {
  try {
    const { data, error } = await supabase
      .from("live_matches")
      .select("*")
      .order("created_at", { ascending: false }); // Newest first

    if (error) {
      console.error("Error fetching live matches:", error);
      throw error;
    }

    return (data || []).map(mapLiveMatchFromDB);
  } catch (error) {
    console.error("Failed to fetch live matches:", error);
    throw error;
  }
}

/**
 * Fetch live matches by status
 */
export async function fetchLiveMatchesByStatus(status: "LIVE" | "Upcoming" | "Completed"): Promise<LiveMatch[]> {
  try {
    const { data, error } = await supabase
      .from("live_matches")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching live matches by status:", error);
      throw error;
    }

    return (data || []).map(mapLiveMatchFromDB);
  } catch (error) {
    console.error("Failed to fetch live matches by status:", error);
    throw error;
  }
}

/**
 * Fetch a single live match by ID
 */
export async function fetchLiveMatchById(id: number | string): Promise<LiveMatch | null> {
  try {
    const { data, error } = await supabase
      .from("live_matches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching live match:", error);
      throw error;
    }

    return data ? mapLiveMatchFromDB(data) : null;
  } catch (error) {
    console.error("Failed to fetch live match:", error);
    throw error;
  }
}

/**
 * Create a new live match in Supabase
 */
export async function createLiveMatch(
  match: Omit<LiveMatch, "id" | "created_at" | "updated_at">
): Promise<LiveMatch> {
  try {
    const dbData = mapLiveMatchToDB(match);
    
    // Log the data being sent for debugging
    console.log("Creating live match with data:", dbData);
    
    const { data, error } = await supabase
      .from("live_matches")
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error("Error creating live match:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Create a more user-friendly error message
      let errorMessage = "Failed to create live match";
      if (error.code === "42P01") {
        errorMessage = "Live matches table does not exist. Please create it in Supabase.";
      } else if (error.code === "42501") {
        errorMessage = "Permission denied. Check your Row Level Security (RLS) policies in Supabase.";
      } else if (error.message) {
        errorMessage = `Failed to create live match: ${error.message}`;
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }

    return mapLiveMatchFromDB(data);
  } catch (error: any) {
    console.error("Failed to create live match:", error);
    // Re-throw with enhanced message if it's our enhanced error
    if (error.message && error.message !== "Failed to create live match") {
      throw error;
    }
    throw new Error(error.message || "Failed to create live match. Please check your Supabase connection.");
  }
}

/**
 * Update an existing live match in Supabase
 */
export async function updateLiveMatch(
  id: number | string,
  match: Partial<LiveMatch>
): Promise<LiveMatch> {
  try {
    const dbData = mapLiveMatchToDB(match);
    
    const { data, error } = await supabase
      .from("live_matches")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating live match:", error);
      throw error;
    }

    return mapLiveMatchFromDB(data);
  } catch (error) {
    console.error("Failed to update live match:", error);
    throw error;
  }
}

/**
 * Delete a live match from Supabase
 */
export async function deleteLiveMatch(id: number | string): Promise<void> {
  try {
    const { error } = await supabase
      .from("live_matches")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting live match:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete live match:", error);
    throw error;
  }
}


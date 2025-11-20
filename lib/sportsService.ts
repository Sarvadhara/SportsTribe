import { supabase } from "./supabaseClient";

export interface Sport {
  id: number | string;
  name: string;
  image: string;
  created_at?: string;
  updated_at?: string;
}

function mapSportFromDB(data: any): Sport {
  return {
    id: data.id,
    name: data.name,
    image: data.image,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

function mapSportToDB(sport: Partial<Sport>): any {
  const dbData: any = {};

  if (sport.name !== undefined) dbData.name = sport.name;
  if (sport.image !== undefined) dbData.image = sport.image;

  return dbData;
}

export async function fetchSports(): Promise<Sport[]> {
  try {
    const { data, error } = await supabase
      .from("sports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sports:", error);
      throw error;
    }

    return (data || []).map(mapSportFromDB);
  } catch (error) {
    console.error("Failed to fetch sports:", error);
    throw error;
  }
}

export async function fetchSportById(id: number | string): Promise<Sport | null> {
  try {
    const { data, error } = await supabase
      .from("sports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching sport:", error);
      throw error;
    }

    return data ? mapSportFromDB(data) : null;
  } catch (error) {
    console.error("Failed to fetch sport:", error);
    throw error;
  }
}

export async function createSport(
  sport: Omit<Sport, "id" | "created_at" | "updated_at">
): Promise<Sport> {
  try {
    const dbData = mapSportToDB(sport);

    const { data, error } = await supabase
      .from("sports")
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error("Error creating sport:", error);
      throw new Error(
        error.code === "42P01"
          ? "Sports table does not exist. Please create it in Supabase."
          : error.code === "42501"
          ? "Permission denied. Check your Supabase RLS policies."
          : `Failed to create sport: ${error.message}`
      );
    }

    return mapSportFromDB(data);
  } catch (error: any) {
    console.error("Failed to create sport:", error);
    throw new Error(error.message || "Failed to create sport. Please try again.");
  }
}

export async function updateSport(
  id: number | string,
  sport: Partial<Sport>
): Promise<Sport> {
  try {
    const dbData = mapSportToDB(sport);

    const { data, error } = await supabase
      .from("sports")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating sport:", error);
      throw error;
    }

    return mapSportFromDB(data);
  } catch (error) {
    console.error("Failed to update sport:", error);
    throw error;
  }
}

export async function deleteSport(id: number | string): Promise<void> {
  try {
    const { error } = await supabase
      .from("sports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting sport:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete sport:", error);
    throw error;
  }
}


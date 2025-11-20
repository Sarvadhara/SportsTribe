import { supabase } from "./supabaseClient";

export interface CommunityHighlight {
  id: number | string;
  title: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  description?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
}

function mapHighlightFromDB(data: any): CommunityHighlight {
  return {
    id: data.id,
    title: data.title,
    mediaUrl: data.media_url,
    mediaType: data.media_type,
    description: data.description || undefined,
    date: data.date || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

function mapHighlightToDB(highlight: Partial<CommunityHighlight>): any {
  const dbData: any = {};

  if (highlight.title !== undefined) dbData.title = highlight.title;
  if (highlight.mediaUrl !== undefined) dbData.media_url = highlight.mediaUrl;
  if (highlight.mediaType !== undefined) dbData.media_type = highlight.mediaType;
  if (highlight.description !== undefined) dbData.description = highlight.description;
  if (highlight.date !== undefined) dbData.date = highlight.date;

  return dbData;
}

export async function fetchCommunityHighlights(): Promise<CommunityHighlight[]> {
  try {
    const { data, error } = await supabase
      .from("community_highlights")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching community highlights:", error);
      throw error;
    }

    return (data || []).map(mapHighlightFromDB);
  } catch (error) {
    console.error("Failed to fetch community highlights:", error);
    throw error;
  }
}

export async function createCommunityHighlight(
  highlight: Omit<CommunityHighlight, "id" | "created_at" | "updated_at">
): Promise<CommunityHighlight> {
  try {
    const dbData = mapHighlightToDB(highlight);

    const { data, error } = await supabase
      .from("community_highlights")
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error("Error creating community highlight:", error);
      throw new Error(
        error.code === "42P01"
          ? "Community highlights table does not exist. Please create it in Supabase."
          : error.code === "42501"
          ? "Permission denied. Check your Supabase RLS policies."
          : `Failed to create community highlight: ${error.message}`
      );
    }

    return mapHighlightFromDB(data);
  } catch (error: any) {
    console.error("Failed to create community highlight:", error);
    throw new Error(error.message || "Failed to create community highlight.");
  }
}

export async function updateCommunityHighlight(
  id: number | string,
  highlight: Partial<CommunityHighlight>
): Promise<CommunityHighlight> {
  try {
    const dbData = mapHighlightToDB(highlight);

    const { data, error } = await supabase
      .from("community_highlights")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating community highlight:", error);
      throw error;
    }

    return mapHighlightFromDB(data);
  } catch (error) {
    console.error("Failed to update community highlight:", error);
    throw error;
  }
}

export async function deleteCommunityHighlight(id: number | string): Promise<void> {
  try {
    const { error } = await supabase
      .from("community_highlights")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting community highlight:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete community highlight:", error);
    throw error;
  }
}


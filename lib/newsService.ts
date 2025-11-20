import { supabase } from "./supabaseClient";

export interface News {
  id: number | string;
  title: string;
  description: string;
  date: string;
  image: string;
  content?: string; // Optional full article content
  created_at?: string;
  updated_at?: string;
}

/**
 * Maps database column names (snake_case) to app format (camelCase)
 */
function mapNewsFromDB(data: any): News {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    date: data.date,
    image: data.image,
    content: data.content || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Maps app format (camelCase) to database column names (snake_case)
 */
function mapNewsToDB(news: Partial<News>): any {
  const dbData: any = {};
  
  if (news.title !== undefined) dbData.title = news.title;
  if (news.description !== undefined) dbData.description = news.description;
  if (news.date !== undefined) dbData.date = news.date;
  if (news.image !== undefined) dbData.image = news.image;
  if (news.content !== undefined) dbData.content = news.content;
  
  return dbData;
}

/**
 * Fetch all news articles from Supabase
 */
export async function fetchNews(): Promise<News[]> {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false }); // Newest first

    if (error) {
      console.error("Error fetching news:", error);
      throw error;
    }

    return (data || []).map(mapNewsFromDB);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    throw error;
  }
}

/**
 * Fetch a single news article by ID
 */
export async function fetchNewsById(id: number | string): Promise<News | null> {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching news:", error);
      throw error;
    }

    return data ? mapNewsFromDB(data) : null;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    throw error;
  }
}

/**
 * Create a new news article in Supabase
 */
export async function createNews(
  news: Omit<News, "id" | "created_at" | "updated_at">
): Promise<News> {
  try {
    const dbData = mapNewsToDB(news);
    
    // Log the data being sent for debugging
    console.log("Creating news article with data:", dbData);
    
    const { data, error } = await supabase
      .from("news")
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error("Error creating news:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Create a more user-friendly error message
      let errorMessage = "Failed to create news article";
      if (error.code === "42P01") {
        errorMessage = "News table does not exist. Please create it in Supabase.";
      } else if (error.code === "42501") {
        errorMessage = "Permission denied. Check your Row Level Security (RLS) policies in Supabase.";
      } else if (error.message) {
        errorMessage = `Failed to create news article: ${error.message}`;
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }

    return mapNewsFromDB(data);
  } catch (error: any) {
    console.error("Failed to create news:", error);
    // Re-throw with enhanced message if it's our enhanced error
    if (error.message && error.message !== "Failed to create news article") {
      throw error;
    }
    throw new Error(error.message || "Failed to create news article. Please check your Supabase connection.");
  }
}

/**
 * Update an existing news article in Supabase
 */
export async function updateNews(
  id: number | string,
  news: Partial<News>
): Promise<News> {
  try {
    const dbData = mapNewsToDB(news);
    
    const { data, error } = await supabase
      .from("news")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating news:", error);
      throw error;
    }

    return mapNewsFromDB(data);
  } catch (error) {
    console.error("Failed to update news:", error);
    throw error;
  }
}

/**
 * Delete a news article from Supabase
 */
export async function deleteNews(id: number | string): Promise<void> {
  try {
    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting news:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete news:", error);
    throw error;
  }
}


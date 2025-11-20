import { supabase } from "./supabaseClient";

export interface UserProfileRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  sport?: string | null;
  position?: string | null;
  matchesPlayed?: number | null;
  age?: number | null;
  bio?: string | null;
  profileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UserProfileInput = {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  sport?: string | null;
  position?: string | null;
  matchesPlayed?: number | null;
  age?: number | null;
  bio?: string | null;
  profileImage?: string | null;
};

type DbUserProfileRow = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  sport?: string | null;
  position?: string | null;
  matches_played?: number | null;
  age?: number | null;
  bio?: string | null;
  profile_image?: string | null;
  created_at?: string;
  updated_at?: string;
};

const USER_PROFILES_TABLE = "user_profiles";

function mapUserProfile(row: DbUserProfileRow): UserProfileRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    city: row.city ?? null,
    state: row.state ?? null,
    sport: row.sport ?? null,
    position: row.position ?? null,
    matchesPlayed: row.matches_played ?? null,
    age: row.age ?? null,
    bio: row.bio ?? null,
    profileImage: row.profile_image ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchUserProfileByUserId(
  userId: string
): Promise<UserProfileRecord | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from(USER_PROFILES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapUserProfile(data as DbUserProfileRow);
}

export async function upsertUserProfile(
  input: UserProfileInput
): Promise<UserProfileRecord> {
  if (!input.userId || !input.name || !input.email) {
    throw new Error("userId, name, and email are required to save a profile.");
  }

  const payload = {
    user_id: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    sport: input.sport ?? null,
    position: input.position ?? null,
    matches_played: input.matchesPlayed ?? null,
    age: input.age ?? null,
    bio: input.bio ?? null,
    profile_image: input.profileImage ?? null,
  };

  const { data, error } = await supabase
    .from(USER_PROFILES_TABLE)
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }

  return mapUserProfile(data as DbUserProfileRow);
}


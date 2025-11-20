import { fetchUserProfileByUserId, upsertUserProfile } from "./userProfilesService";
import {
  fetchPlayerByUserId,
  createPlayer,
  updatePlayer,
} from "./playersService";

const USER_ID_KEY = "sportstribe_user_id";
const USER_PROFILES_KEY = "user_profiles";
const CURRENT_PROFILE_KEY = "current_profile";

type CachedProfile = {
  id: string | number;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  sport?: string;
  position?: string;
  matchesPlayed?: number | string | null;
  age?: number | string | null;
  bio?: string;
  profileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function readProfiles(): CachedProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const profilesStr = localStorage.getItem(USER_PROFILES_KEY);
    return profilesStr ? JSON.parse(profilesStr) : [];
  } catch {
    return [];
  }
}

function writeProfiles(profiles: CachedProfile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
}

function cacheProfile(profile: CachedProfile) {
  if (typeof window === "undefined") return;
  const profiles = readProfiles();
  const existingIndex = profiles.findIndex((p) => p.userId === profile.userId);
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  writeProfiles(profiles);
  localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(profile));
}

function mapRecordToCache(profile: any): CachedProfile {
  return {
    id: profile.id ?? Date.now(),
    userId: profile.userId,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    city: profile.city,
    state: profile.state,
    sport: profile.sport,
    position: profile.position,
    matchesPlayed: profile.matchesPlayed,
    age: profile.age,
    bio: profile.bio,
    profileImage: profile.profileImage,
    createdAt: profile.createdAt ?? profile.created_at,
    updatedAt: profile.updatedAt ?? profile.updated_at,
  };
}

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    const safeRandom =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()
        : Math.random().toString(36).substring(2, 10).toUpperCase();
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    userId = `ST-${datePart}-${safeRandom}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

export function getCurrentUserProfile(userId?: string): CachedProfile | null {
  if (typeof window === "undefined") return null;
  const id = userId || getOrCreateUserId();
  const profiles = readProfiles();
  const profile = profiles.find((p) => p.userId === id);
  return profile || null;
}

export function hasUserProfile(userId?: string): boolean {
  return getCurrentUserProfile(userId) !== null;
}

export async function syncUserProfileFromSupabase(
  userId?: string
): Promise<CachedProfile | null> {
  const id = userId || getOrCreateUserId();
  if (!id) return null;

  try {
    const remote = await fetchUserProfileByUserId(id);
    if (!remote) return null;
    const cached = mapRecordToCache(remote);
    cacheProfile(cached);
    syncProfileIntoAdminPlayers(cached);
    return cached;
  } catch (error) {
    console.error("Failed to sync profile from Supabase:", error);
    return null;
  }
}

export async function ensureUserProfileCached(
  userId?: string
): Promise<CachedProfile | null> {
  const cached = getCurrentUserProfile(userId);
  if (cached) return cached;
  return syncUserProfileFromSupabase(userId);
}

export async function saveUserProfile(
  profileData: any,
  userId?: string
): Promise<CachedProfile | null> {
  if (typeof window === "undefined") return null;

  const id = userId || getOrCreateUserId();
  const payload = {
    userId: id,
    name: profileData.name?.trim() || "",
    email: profileData.email?.trim() || "",
    phone: profileData.phone?.trim() || null,
    city: profileData.city?.trim() || null,
    state: profileData.state?.trim() || null,
    sport: profileData.sport || null,
    position: profileData.position?.trim() || null,
    matchesPlayed: profileData.matchesPlayed
      ? Number(profileData.matchesPlayed)
      : null,
    age: profileData.age ? Number(profileData.age) : null,
    bio: profileData.bio?.trim() || null,
    profileImage: profileData.profileImage || null,
  };

  const saved = await upsertUserProfile(payload);
  const cached = mapRecordToCache(saved);
  cacheProfile(cached);
  syncProfileIntoAdminPlayers(cached);
  await syncPlayerRecordWithSupabase(cached);
  return cached;
}

function syncProfileIntoAdminPlayers(profile: CachedProfile) {
  if (typeof window === "undefined") return;
  try {
    const adminDataStr = localStorage.getItem("sportstribe_admin_data");
    let adminData: any = {
      tournaments: [],
      players: [],
      teams: [],
      news: [],
      communities: [],
      liveMatches: [],
      products: [],
    };

    if (adminDataStr) {
      try {
        adminData = JSON.parse(adminDataStr);
      } catch {
        // keep default structure
      }
    }

    const playerData = {
      id: profile.id,
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      city: profile.city || "",
      state: profile.state || "",
      sport: profile.sport || "",
      position: profile.position || "",
      age: profile.age ? Number(profile.age) : undefined,
      matchesPlayed: profile.matchesPlayed
        ? Number(profile.matchesPlayed)
        : undefined,
      bio: profile.bio || "",
      image:
        profile.profileImage ||
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
      userId: profile.userId,
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: profile.updatedAt || new Date().toISOString(),
    };

    const playerIndex =
      adminData.players?.findIndex(
        (p: any) => p.userId === profile.userId || p.id === profile.id
      ) ?? -1;

    if (playerIndex >= 0 && Array.isArray(adminData.players)) {
      adminData.players[playerIndex] = {
        ...adminData.players[playerIndex],
        ...playerData,
      };
    } else {
      if (!Array.isArray(adminData.players)) {
        adminData.players = [];
      }
      adminData.players.push(playerData);
    }

    localStorage.setItem("sportstribe_admin_data", JSON.stringify(adminData));
    window.dispatchEvent(
      new CustomEvent("sportstribe-admin-data-changed", {
        detail: { data: adminData },
      })
    );
  } catch (error) {
    console.error("Error syncing profile to admin data:", error);
  }
}

async function syncPlayerRecordWithSupabase(profile: CachedProfile) {
  try {
    if (!profile.userId) {
      console.warn("Cannot sync player without userId");
      return;
    }

    const playerPayload = {
      name: profile.name?.trim() || "SportsTribe Player",
      city: profile.city?.trim() || "Unknown City",
      state: profile.state?.trim() || "Unknown State",
      sport: profile.sport || "Sports",
      image:
        profile.profileImage ||
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
      age: profile.age ? Number(profile.age) : undefined,
      matchesPlayed: profile.matchesPlayed ? Number(profile.matchesPlayed) : undefined,
      position: profile.position || undefined,
      bio: profile.bio || undefined,
      email: profile.email || undefined,
      phone: profile.phone || undefined,
    };

    const existing = await fetchPlayerByUserId(profile.userId);

    if (existing) {
      await updatePlayer(existing.id, playerPayload);
    } else {
      await createPlayer({
        ...playerPayload,
        userId: profile.userId,
      });
    }
  } catch (error) {
    console.error("Failed to sync player record with Supabase:", error);
  }
}

export function getUserId(): string {
  return getOrCreateUserId();
}


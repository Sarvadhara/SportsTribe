import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export interface CommunityRecord {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  memberCount?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityMessageRecord {
  id: string;
  communityId: number;
  message: string;
  senderType: "admin" | "system";
  senderName?: string | null;
  imageUrl?: string | null;
  createdAt: string;
}

type DbCommunityRow = {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  member_count?: number | null;
  memberCount?: number | null;
  created_at?: string;
  updated_at?: string;
};

type DbCommunityMessageRow = {
  id: string;
  community_id: number;
  communityId?: number;
  message: string;
  sender_type?: string;
  senderType?: string;
  sender_name?: string | null;
  senderName?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  created_at?: string;
  createdAt?: string;
};

const COMMUNITY_TABLE = "communities";
const COMMUNITY_MESSAGES_TABLE = "community_messages";

export type CommunityUpsertInput = {
  name?: string;
  description?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  memberCount?: number | null;
};

function mapCommunity(row: DbCommunityRow): CommunityRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    location: row.location ?? null,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    memberCount:
      typeof row.member_count === "number"
        ? row.member_count
        : typeof row.memberCount === "number"
        ? row.memberCount
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCommunityInputToDb(payload: CommunityUpsertInput) {
  const dbPayload: Record<string, any> = {};

  if (payload.name !== undefined) {
    dbPayload.name = payload.name?.trim() || null;
  }
  if (payload.description !== undefined) {
    dbPayload.description =
      payload.description && payload.description.trim().length > 0
        ? payload.description.trim()
        : null;
  }
  if (payload.location !== undefined) {
    dbPayload.location =
      payload.location && payload.location.trim().length > 0
        ? payload.location.trim()
        : null;
  }
  if (payload.imageUrl !== undefined) {
    dbPayload.image_url =
      payload.imageUrl && payload.imageUrl.trim().length > 0
        ? payload.imageUrl.trim()
        : null;
  }
  if (payload.memberCount !== undefined) {
    dbPayload.member_count =
      typeof payload.memberCount === "number" && !Number.isNaN(payload.memberCount)
        ? payload.memberCount
        : null;
  }

  return dbPayload;
}

function mapMessage(row: DbCommunityMessageRow): CommunityMessageRecord {
  return {
    id: row.id,
    communityId: row.community_id ?? row.communityId,
    message: row.message,
    senderType: (row.sender_type ?? row.senderType ?? "admin") as
      | "admin"
      | "system",
    senderName: row.sender_name ?? row.senderName ?? null,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

export async function fetchCommunities(): Promise<CommunityRecord[]> {
  const { data, error } = await supabase
    .from(COMMUNITY_TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }

  return (data || []).map(mapCommunity);
}

export async function createCommunity(
  payload: Required<Pick<CommunityUpsertInput, "name">> & CommunityUpsertInput
): Promise<CommunityRecord> {
  const dbPayload = mapCommunityInputToDb(payload);

  if (!dbPayload.name) {
    throw new Error("Community name is required");
  }

  const { data, error } = await supabase
    .from(COMMUNITY_TABLE)
    .insert(dbPayload)
    .select()
    .single();

  if (error) {
    console.error("Error creating community:", error);
    throw error;
  }

  return mapCommunity(data);
}

export async function updateCommunity(
  id: number | string,
  payload: CommunityUpsertInput
): Promise<CommunityRecord> {
  const dbPayload = mapCommunityInputToDb(payload);

  const { data, error } = await supabase
    .from(COMMUNITY_TABLE)
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating community:", error);
    throw error;
  }

  return mapCommunity(data);
}

export async function deleteCommunity(id: number | string): Promise<void> {
  const { error } = await supabase.from(COMMUNITY_TABLE).delete().eq("id", id);

  if (error) {
    console.error("Error deleting community:", error);
    throw error;
  }
}

export async function fetchCommunityMessages(
  communityId: number
): Promise<CommunityMessageRecord[]> {
  const { data, error } = await supabase
    .from(COMMUNITY_MESSAGES_TABLE)
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching community messages:", error);
    throw error;
  }

  return (data || []).map(mapMessage);
}

interface SendMessagePayload {
  communityId: number;
  message: string;
  senderType?: "admin" | "system";
  senderName?: string;
  imageUrl?: string | null;
}

export async function sendCommunityMessage(
  payload: SendMessagePayload
): Promise<CommunityMessageRecord> {
  const { data, error } = await supabase
    .from(COMMUNITY_MESSAGES_TABLE)
    .insert({
      community_id: payload.communityId,
      message: payload.message,
      sender_type: payload.senderType ?? "admin",
      sender_name: payload.senderName ?? null,
      image_url: payload.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending community message:", error);
    throw error;
  }

  return mapMessage(data);
}

export function subscribeToCommunityMessages(
  communityId: number,
  onInsert: (message: CommunityMessageRecord) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`community-messages-${communityId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: COMMUNITY_MESSAGES_TABLE,
        filter: `community_id=eq.${communityId}`,
      },
      (payload) => {
        try {
          if (payload.new) {
            onInsert(mapMessage(payload.new as DbCommunityMessageRow));
          }
        } catch (err) {
          console.error("Failed to process community message payload:", err);
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.info(`Subscribed to community ${communityId} messages.`);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export function formatMemberCountLabel(memberCount?: number | null): string {
  if (typeof memberCount !== "number" || Number.isNaN(memberCount)) {
    return "";
  }
  if (memberCount >= 1000) {
    return `${(memberCount / 1000).toFixed(memberCount % 1000 === 0 ? 0 : 1)}K`;
  }
  return memberCount.toString();
}


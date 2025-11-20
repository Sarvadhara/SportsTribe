"use client";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePublicAdminData } from "@/lib/adminDataHook";
import { ensureUserProfileCached, getCurrentUserProfile, getUserId, hasUserProfile } from "@/lib/userUtils";
import {
  CommunityRecord,
  fetchCommunities,
  formatMemberCountLabel,
} from "@/lib/communitiesService";

export default function Communities() {
  const router = useRouter();
  const { data, isLoading } = usePublicAdminData();
  const communities = data.communities || [];
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<number[]>([]);
  const [remoteCommunities, setRemoteCommunities] = useState<CommunityRecord[]>([]);
  const [communitiesError, setCommunitiesError] = useState<string | null>(null);
  const [isFetchingCommunities, setIsFetchingCommunities] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const id = getUserId();
    setCurrentUserId(id);
    ensureUserProfileCached(id).catch((err) =>
      console.error("Failed to sync user profile:", err)
    );

    const membershipsRaw = localStorage.getItem("community_memberships");
    if (membershipsRaw) {
      try {
        const memberships = JSON.parse(membershipsRaw) as Array<{ communityId: number; userId: string }>;
        const userMemberships = memberships
          .filter((m) => m.userId === id)
          .map((m) => m.communityId);
        setJoinedCommunityIds(userMemberships);
      } catch (error) {
        console.error("Error loading community memberships:", error);
        setJoinedCommunityIds([]);
      }
    } else {
      setJoinedCommunityIds([]);
    }
  }, [data.communityRequests]);

  useEffect(() => {
    let isMounted = true;
    async function loadCommunities() {
      try {
        setIsFetchingCommunities(true);
        setCommunitiesError(null);
        const remote = await fetchCommunities();
        if (!isMounted) return;
        setRemoteCommunities(remote);
      } catch (error) {
        console.error("Failed to fetch communities from Supabase:", error);
        if (isMounted) {
          setCommunitiesError(
            "Unable to fetch live communities. Showing local fallback data."
          );
        }
      } finally {
        if (isMounted) {
          setIsFetchingCommunities(false);
        }
      }
    }
    loadCommunities();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasRemoteCommunities = remoteCommunities.length > 0;
  const communitySource = hasRemoteCommunities ? remoteCommunities : communities;

  const displayCommunities = useMemo(() => {
    if (hasRemoteCommunities) {
      return remoteCommunities.map((community) => ({
        id: community.id,
        name: community.name,
        location: community.location || "Online",
        image:
          community.imageUrl ||
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop",
        membersLabel: formatMemberCountLabel(community.memberCount),
      }));
    }

    return (communities || []).map((community: any) => ({
      id: community.id,
      name: community.name,
      location: community.location || "Online",
      image:
        community.image ||
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop",
      membersLabel:
        typeof community.members === "number"
          ? formatMemberCountLabel(community.members)
          : community.members || "",
    }));
  }, [communities, hasRemoteCommunities, remoteCommunities]);

  const handleJoinCommunity = async (communityId: number) => {
    const userId = currentUserId || getUserId();

    const profileRecord = await ensureUserProfileCached(userId);
    if (!profileRecord) {
      alert("Please create your profile first to join a community.");
      router.push("/create-profile");
      return;
    }

    // If already joined, send them straight to the chat
    if (joinedCommunityIds.includes(communityId)) {
      router.push(`/communities/${communityId}/chat`);
      return;
    }

    const profile = getCurrentUserProfile(userId) || profileRecord;
    const membershipKey = "community_memberships";

    try {
      // Update community memberships (client-side)
      const membershipsRaw = localStorage.getItem(membershipKey);
      let memberships: Array<{ communityId: number; userId: string; joinedAt: string }> = [];

      if (membershipsRaw) {
        try {
          memberships = JSON.parse(membershipsRaw);
          if (!Array.isArray(memberships)) memberships = [];
        } catch {
          memberships = [];
        }
      }

      const alreadyMember = memberships.some((m) => m.communityId === communityId && m.userId === userId);
      if (!alreadyMember) {
        memberships.push({ communityId, userId, joinedAt: new Date().toISOString() });
        localStorage.setItem(membershipKey, JSON.stringify(memberships));
      }

      setJoinedCommunityIds((prev) => (prev.includes(communityId) ? prev : [...prev, communityId]));

      // Update admin data so the join appears there as auto-approved
      const saved = localStorage.getItem("sportstribe_admin_data");
      const parsed = saved ? JSON.parse(saved) : {};
      if (!parsed.communityRequests) parsed.communityRequests = [];
      if (!parsed.communities) parsed.communities = communitySource;

      const community = (parsed.communities || communitySource).find(
        (c: any) => c.id === communityId
      );
      const approvedRequest = {
        id: `${communityId}-${userId}`,
        communityId,
        communityName: community?.name || String(communityId),
        userId,
        userName: profile?.name || "User",
        requestedAt: new Date().toISOString(),
        status: "approved",
      };

      const existingIndex = parsed.communityRequests.findIndex(
        (r: any) => r.communityId === communityId && r.userId === userId
      );
      if (existingIndex >= 0) {
        parsed.communityRequests[existingIndex] = { ...parsed.communityRequests[existingIndex], ...approvedRequest };
      } else {
        parsed.communityRequests.push(approvedRequest);
      }

      localStorage.setItem("sportstribe_admin_data", JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent("sportstribe-admin-data-changed", { detail: { data: parsed } }));
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "sportstribe_admin_data",
          newValue: JSON.stringify(parsed),
          storageArea: localStorage,
        })
      );

      // Directly navigate to chat without alert
      router.push(`/communities/${communityId}/chat`);
    } catch (error) {
      console.error("Failed to join community", error);
      alert("Something went wrong while joining this community. Please try again.");
    }
  };
  if (isLoading && isFetchingCommunities && displayCommunities.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
        <h1 className="text-4xl font-extrabold text-st-white">Communities</h1>
        <p className="mt-2 text-st-text/85">Join groups to chat and collaborate.</p>
        <div className="mt-8 text-st-text/70">Loading communities...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
      <h1 className="text-4xl font-extrabold text-st-white">Communities</h1>
      <p className="mt-2 text-st-text/85">Join groups to chat and collaborate.</p>
      {communitiesError && (
        <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
          {communitiesError}
        </div>
      )}
      {displayCommunities.length === 0 ? (
        <div className="mt-8 text-center py-12">
          <p className="text-st-text/70 text-lg">No communities available yet.</p>
          <p className="text-st-text/50 text-sm mt-2">Check back soon for new communities to join!</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayCommunities.map((c) => (
          <div key={c.id} className="relative rounded-2xl bg-white/5 border-2 border-white/15 overflow-hidden group hover:border-[#E94057] hover:shadow-[0_0_25px_rgba(233,64,87,0.3)] transition-all duration-300">
            {/* Membership badge icon */}
            <div className="absolute top-4 left-4 z-10 bg-gradient-to-br from-[#E94057] to-[#FF6A3D] w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-[#1A063B] to-[#2C0C5B]">
              <Image
                src={
                  imageErrors.has(Number(c.id))
                    ? "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=400&fit=crop"
                    : c.image
                }
                alt={c.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImageErrors(prev => new Set([...prev, Number(c.id)]))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            <div className="p-5 bg-gradient-to-b from-white/10 to-white/5">
              <div className="font-bold text-st-white text-lg mb-2">{c.name}</div>
              <div className="flex items-center gap-2 text-st-text/80 text-sm mb-3">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {c.membersLabel || "New"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {c.location}
                </span>
              </div>
              <button
                onClick={() => handleJoinCommunity(c.id)}
                className="w-full text-st-white px-4 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform bg-gradient-to-r from-[#7A1FA2] to-[#9333EA] hover:shadow-[0_0_15px_rgba(122,31,162,0.4)]"
              >
                {joinedCommunityIds.includes(c.id) ? "Enter Community" : "Join Community"}
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}



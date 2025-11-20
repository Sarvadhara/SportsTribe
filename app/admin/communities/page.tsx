"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminData, Community } from "@/contexts/AdminDataContext";
import { handleImageUpload } from "@/lib/imageUtils";
import {
  fetchCommunities as fetchRemoteCommunities,
  createCommunity as createCommunityRecord,
  updateCommunity as updateCommunityRecord,
  deleteCommunity as deleteCommunityRecord,
  sendCommunityMessage,
  CommunityRecord,
  CommunityUpsertInput,
  formatMemberCountLabel,
} from "@/lib/communitiesService";

interface ChatMessage {
  id: string;
  communityId: number;
  message: string;
  timestamp: string;
  sender: "admin";
  image?: string;
  reactions?: any[];
}

const DEFAULT_COMMUNITY_IMAGE =
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop";

const memberLabelFromCount = (count?: number | null) => {
  if (typeof count === "number" && !Number.isNaN(count)) {
    const label = formatMemberCountLabel(count);
    return label || count.toString();
  }
  return "0";
};

const mapRecordToAdminCommunity = (record: CommunityRecord): Community => ({
  id: record.id,
  name: record.name || "Untitled Community",
  members: memberLabelFromCount(record.memberCount),
  location: record.location || "Online",
  image: record.imageUrl || DEFAULT_COMMUNITY_IMAGE,
});

const parseMembersToNumber = (value: string): number | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toUpperCase();
  let multiplier = 1;

  if (normalized.endsWith("K")) {
    multiplier = 1000;
  } else if (normalized.endsWith("M")) {
    multiplier = 1_000_000;
  }

  const numericPart =
    multiplier === 1 ? normalized : normalized.slice(0, -1);
  const parsed = parseFloat(numericPart);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.round(parsed * multiplier);
};

const persistMessageLocally = (communityId: number, message: ChatMessage) => {
  if (typeof window === "undefined") return;

  const key = `community_${communityId}_messages`;
  const existingMessages = localStorage.getItem(key);
  let messages: ChatMessage[] = [];

  if (existingMessages) {
    try {
      const parsed = JSON.parse(existingMessages);
      if (Array.isArray(parsed)) {
        messages = parsed.filter((msg: any) => msg.sender === "admin");
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  const updatedMessages = [...messages, message];
  localStorage.setItem(key, JSON.stringify(updatedMessages));

  window.dispatchEvent(
    new CustomEvent(`community-${communityId}-messages-updated`, {
      detail: { messages: updatedMessages },
    })
  );

  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      newValue: JSON.stringify(updatedMessages),
      storageArea: localStorage,
    })
  );
};

export default function CommunitiesManagement() {
  const { data, updateCommunities } = useAdminData();
  const communities = data.communities;
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageImage, setMessageImage] = useState<string>("");
  const [messageImagePreview, setMessageImagePreview] = useState<string>("");
  const [messageImageError, setMessageImageError] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    members: "",
    location: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const [isSyncingRemote, setIsSyncingRemote] = useState(false);
  const [remoteSyncError, setRemoteSyncError] = useState<string | null>(null);
  const [isSavingCommunity, setIsSavingCommunity] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Debug: Log communities when they change
  useEffect(() => {
    console.log("Communities updated in component:", communities.length, communities);
    
    // Verify communities are loaded from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sportstribe_admin_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedCommunities = parsed.communities || [];
          console.log("Communities in localStorage:", savedCommunities.length);
          if (savedCommunities.length !== communities.length) {
            console.warn("Mismatch! Component has", communities.length, "but localStorage has", savedCommunities.length);
          }
        } catch (e) {
          console.error("Error reading from localStorage:", e);
        }
      }
    }
  }, [communities]);

  useEffect(() => {
    let isMounted = true;

    async function syncCommunities() {
      try {
        setIsSyncingRemote(true);
        setRemoteSyncError(null);
        const remote = await fetchRemoteCommunities();
        if (!isMounted || !Array.isArray(remote)) return;

        if (remote.length > 0) {
          const mapped = remote.map(mapRecordToAdminCommunity);
          updateCommunities(mapped);
        }
      } catch (error) {
        console.error("Failed to sync communities from Supabase:", error);
        if (isMounted) {
          setRemoteSyncError("Unable to sync with Supabase. Using local data.");
        }
      } finally {
        if (isMounted) {
          setIsSyncingRemote(false);
        }
      }
    }

    syncCommunities();
    return () => {
      isMounted = false;
    };
  }, [updateCommunities]);

  const handleEdit = (community: any) => {
    setEditingId(community.id);
    setFormData(community);
    setImagePreview(community.image || "");
    setImageError("");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this community?");
    if (!confirmed) return;

    try {
      setIsSavingCommunity(true);
      await deleteCommunityRecord(id);
      updateCommunities(communities.filter((c) => c.id !== id));
      alert("Community deleted successfully!");
    } catch (error) {
      console.error("Failed to delete community from Supabase:", error);
      alert("Failed to delete community. Please try again.");
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleOpenMessageModal = (communityId: number) => {
    setSelectedCommunity(communityId);
    setShowMessageModal(true);
    setMessageText("");
    setMessageImage("");
    setMessageImagePreview("");
    setMessageImageError("");
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    setSelectedCommunity(null);
    setMessageText("");
    setMessageImage("");
    setMessageImagePreview("");
    setMessageImageError("");
  };

  const handleMessageImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(
      e,
      (base64String) => {
        setMessageImage(base64String);
        setMessageImagePreview(base64String);
        setMessageImageError("");
      },
      (error) => {
        setMessageImageError(error);
        setMessageImage("");
        setMessageImagePreview("");
      }
    );
  };

  const handleRemoveMessageImage = () => {
    setMessageImage("");
    setMessageImagePreview("");
    setMessageImageError("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    const trimmedMessage = messageText.trim();
    const resolvedMessage =
      trimmedMessage || (messageImage ? "Shared an update 📢" : "");

    if (!resolvedMessage) {
      alert("Please add a message or upload an image.");
      return;
    }

    setIsSendingMessage(true);
    try {
      const sent = await sendCommunityMessage({
        communityId: selectedCommunity,
        message: resolvedMessage,
        senderType: "admin",
        senderName: "Admin",
        imageUrl: messageImage || undefined,
      });

      persistMessageLocally(selectedCommunity, {
        id: sent.id,
        communityId: sent.communityId,
        message: sent.message,
        timestamp: sent.createdAt,
        sender: "admin",
        image: sent.imageUrl ?? undefined,
        reactions: [],
      });

      alert("Message sent successfully!");
      handleCloseMessageModal();
    } catch (error) {
      console.error("Error sending community message via Supabase:", error);
      const fallbackMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        communityId: selectedCommunity,
        message: resolvedMessage,
        timestamp: new Date().toISOString(),
        sender: "admin",
        image: messageImage || undefined,
        reactions: [],
      };

      persistMessageLocally(selectedCommunity, fallbackMessage);
      alert(
        "Supabase connection failed. The message was saved locally as a fallback."
      );
      handleCloseMessageModal();
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedName = formData.name.trim() || "Unnamed Community";
    const resolvedLocation = formData.location.trim() || null;
    const resolvedImage =
      formData.image?.trim() || imagePreview || DEFAULT_COMMUNITY_IMAGE;
    const memberCount = parseMembersToNumber(formData.members);

    const payload: CommunityUpsertInput = {
      name: resolvedName,
      location: resolvedLocation,
      imageUrl: resolvedImage,
      memberCount,
    };

    try {
      setIsSavingCommunity(true);
      if (editingId) {
        const updated = await updateCommunityRecord(editingId, payload);
        updateCommunities(
          communities.map((c) =>
            c.id === editingId ? mapRecordToAdminCommunity(updated) : c
          )
        );
        setEditingId(null);
        alert(`Community "${updated.name}" updated successfully!`);
      } else {
        const createPayload: Required<
          Pick<CommunityUpsertInput, "name">
        > &
          CommunityUpsertInput = {
            ...payload,
            name: resolvedName,
          };
        const created = await createCommunityRecord(createPayload);
        updateCommunities([
          ...communities,
          mapRecordToAdminCommunity(created),
        ]);
        alert(`Community "${created.name}" created successfully!`);
      }

      setShowForm(false);
      setFormData({ name: "", members: "", location: "", image: "" });
      setImagePreview("");
      setImageError("");
    } catch (error) {
      console.error("Failed to save community via Supabase:", error);
      alert("Failed to save community. Please try again.");
    } finally {
      setIsSavingCommunity(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Communities Management</h1>
          <p className="text-st-text/70">Create, edit, and manage community groups</p>
          {isSyncingRemote && (
            <p className="text-xs text-st-text/60 mt-1 animate-pulse">
              Syncing with Supabase...
            </p>
          )}
          {remoteSyncError && (
            <p className="text-xs text-yellow-300 mt-1">{remoteSyncError}</p>
          )}
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", members: "", location: "", image: "" });
            setImagePreview("");
            setImageError("");
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
        >
          + Add Community
        </button>
      </div>

      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-st-white mb-4">
            {editingId ? "Edit Community" : "Add New Community"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">
                  Community Name <span className="text-st-text/50 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="Cricket Hyderabad (Optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">
                  Members Count <span className="text-st-text/50 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.members}
                  onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="2.5K (Optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">
                  Location <span className="text-st-text/50 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="Hyderabad (Optional)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-st-text/90 mb-2">
                  Image <span className="text-st-text/50 text-xs">(Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageUpload(
                      e,
                      (base64) => {
                        setFormData({ ...formData, image: base64 });
                        setImagePreview(base64);
                        setImageError("");
                      },
                      (error) => {
                        setImageError(error);
                        setImagePreview("");
                      }
                    );
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6A3D] file:text-white hover:file:bg-[#E94057] file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                />
                {imageError && (
                  <p className="text-red-400 text-xs mt-1">{imageError}</p>
                )}
                {imagePreview && (
                  <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-white/20">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSavingCommunity}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCommunity
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                  ? "Update Community"
                  : "Add Community"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                disabled={isSavingCommunity}
                className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <p className="text-st-text/70 text-lg mb-2">No communities created yet</p>
            <p className="text-st-text/50 text-sm">Click "+ Add Community" to create your first community</p>
          </div>
        ) : (
          communities.map((community) => (
          <div key={community.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-[#FF6A3D] transition-all duration-300">
            <div className="aspect-video relative">
              <Image
                src={community.image}
                alt={community.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-st-white text-lg mb-2">{community.name}</h3>
              <div className="flex items-center gap-4 text-sm text-st-text/70 mb-3">
                <span>👥 {community.members}</span>
                <span>📍 {community.location}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenMessageModal(community.id)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white rounded-lg hover:shadow-[0_0_15px_rgba(255,106,61,0.5)] transition-all text-xs font-medium flex items-center justify-center gap-1"
                  title="Send message to this community"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Message
                </button>
                <button
                  onClick={() => router.push(`/communities/${community.id}/chat`)}
                  className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs font-medium"
                  title="View chat"
                >
                  View Chat
                </button>
                <button
                  onClick={() => handleEdit(community)}
                  className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(community.id)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Send Message Modal */}
      {showMessageModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A063B] border border-white/20 rounded-xl p-6 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-st-white">
                Send Message to {communities.find(c => c.id === selectedCommunity)?.name}
              </h2>
              <button
                onClick={handleCloseMessageModal}
                className="text-st-text/70 hover:text-st-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">
                  Message (Optional if image is provided)
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">
                  Image (Optional)
                </label>
                {messageImagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-white/20">
                      <Image
                        src={messageImagePreview}
                        alt="Message preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveMessageImage}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-st-text/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-2 text-sm text-st-text/70">
                          <span className="font-semibold text-[#FF6A3D]">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-st-text/50">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleMessageImageUpload}
                      />
                    </label>
                  </div>
                )}
                {messageImageError && (
                  <p className="mt-2 text-sm text-red-400">{messageImageError}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6A3D]/20 to-[#E94057]/20 rounded-lg border border-[#FF6A3D]/30">
                <svg className="w-4 h-4 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-[#FF6A3D] font-medium">
                  This message will be sent as an admin message to all community members.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={
                    isSendingMessage || (!messageText.trim() && !messageImage)
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {isSendingMessage ? "Sending..." : "Send Message"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseMessageModal}
                  className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


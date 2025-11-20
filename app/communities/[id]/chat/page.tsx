"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePublicAdminData } from "@/lib/adminDataHook";
import { ensureUserProfileCached, getUserId, hasUserProfile } from "@/lib/userUtils";
import { Community } from "@/contexts/AdminDataContext";
import Image from "next/image";
import {
  fetchCommunityMessages,
  subscribeToCommunityMessages,
  CommunityMessageRecord,
} from "@/lib/communitiesService";

interface MessageReaction {
  emoji: string;
  userId: string;
}

interface ChatMessage {
  id: string;
  communityId: number;
  message: string;
  timestamp: string;
  sender: "admin";
  image?: string;
  reactions?: MessageReaction[];
  senderName?: string | null;
}

export default function CommunityChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data, isLoading } = usePublicAdminData();
  const communityId = parseInt(params.id as string);
  const community = data.communities?.find((c) => c.id === communityId);
  const userId = typeof window !== "undefined" ? (localStorage.getItem("sportstribe_user_id") || getUserId()) : "";
  const userRequest = (data.communityRequests || []).find((r: any) => r.communityId === communityId && r.userId === userId);
  const isRejected = userRequest?.status === "rejected";
  const isApproved = userRequest?.status === "approved";
  const [hasMembership, setHasMembership] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messagesSource, setMessagesSource] = useState<"supabase" | "local">("local");
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Get current user ID for reactions
  const getCurrentUserId = (): string => {
    if (typeof window === "undefined") return "";
    const userId = localStorage.getItem("sportstribe_user_id");
    if (!userId) {
      // Generate if doesn't exist
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newUserId = `ST-${dateStr}-${timeStr}-${random}`;
      localStorage.setItem("sportstribe_user_id", newUserId);
      return newUserId;
    }
    return userId;
  };

  // Popular emojis for reactions
  const emojiOptions = ["👍", "❤️", "😄", "🎉", "🔥", "👏", "💯", "🚀"];


  const usingSupabaseMessages = messagesSource === "supabase";

  const mapRecordToChatMessage = (record: CommunityMessageRecord): ChatMessage => ({
    id: record.id,
    communityId: record.communityId,
    message: record.message,
    timestamp: record.createdAt,
    sender: "admin",
    reactions: [],
    image: record.imageUrl ?? undefined,
    senderName: record.senderName ?? null,
  });

  // Load messages from Supabase with realtime subscription
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    async function loadMessages() {
      try {
        setIsMessagesLoading(true);
        setMessagesError(null);
        const remoteMessages = await fetchCommunityMessages(communityId);
        if (!isMounted) return;
        setMessages(remoteMessages.map(mapRecordToChatMessage));
        setMessagesSource("supabase");

        unsubscribe = subscribeToCommunityMessages(communityId, (newMessage) => {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, mapRecordToChatMessage(newMessage)];
          });
        });
      } catch (error) {
        console.error("Failed to fetch community messages from Supabase:", error);
        if (isMounted) {
          setMessagesSource("local");
          setMessagesError(
            "Unable to fetch live messages. Displaying local cached messages."
          );
        }
      } finally {
        if (isMounted) {
          setIsMessagesLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [communityId]);

  // Load local fallback messages only when Supabase is unavailable
  useEffect(() => {
    if (usingSupabaseMessages) return;

    const savedMessages = localStorage.getItem(`community_${communityId}_messages`);
    const welcomeMessagesKey = `community_${communityId}_welcome_added`;

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          const validMessages = parsed.filter((msg: any) => !msg.id?.startsWith("sample_"));
          const messagesWithReactions = validMessages
            .filter((msg: any) => msg.sender === "admin")
            .map((msg: any) => ({
              ...msg,
              sender: "admin",
              reactions: msg.reactions || []
            }));
          setMessages(messagesWithReactions);
          return;
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }

    const welcomeAdded = localStorage.getItem(welcomeMessagesKey);
    if (!welcomeAdded) {
      const now = new Date();
      const welcomeMessages: ChatMessage[] = [
        {
          id: `welcome_${communityId}_${Date.now()}_1`,
          communityId,
          message: `Welcome to ${community?.name || "our community"}! 👋 We're excited to have you here. This is your space to stay connected with fellow sports enthusiasts.`,
          timestamp: new Date(now.getTime() - 7200000).toISOString(),
          sender: "admin",
          reactions: [],
        },
        {
          id: `welcome_${communityId}_${Date.now()}_2`,
          communityId,
          message: `Stay updated with the latest tournaments, matches, and events happening in your area. Don't miss out on exciting competitions and opportunities to showcase your skills! 🏆`,
          timestamp: new Date(now.getTime() - 3600000).toISOString(),
          sender: "admin",
          reactions: [],
        },
        {
          id: `welcome_${communityId}_${Date.now()}_3`,
          communityId,
          message: `Feel free to react to messages with emojis to show your appreciation. Community guidelines: Be respectful, supportive, and have fun! Let's build an amazing sports community together. 🎉`,
          timestamp: new Date(now.getTime() - 1800000).toISOString(),
          sender: "admin",
          reactions: [],
        },
      ];

      setMessages(welcomeMessages);
      localStorage.setItem(`community_${communityId}_messages`, JSON.stringify(welcomeMessages));
      localStorage.setItem(welcomeMessagesKey, "true");
    } else {
      setMessages([]);
    }
  }, [community, communityId, usingSupabaseMessages]);

  // Listen for new messages from other tabs and same-tab updates
  useEffect(() => {
    if (usingSupabaseMessages) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `community_${communityId}_messages` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && Array.isArray(parsed)) {
            const messagesWithReactions = parsed
              .filter((msg: any) => msg.sender === "admin")
              .map((msg: any) => ({
                ...msg,
                sender: "admin",
                reactions: msg.reactions || []
              }));

            setMessages(prevMessages => {
              const prevStr = JSON.stringify(prevMessages);
              const newStr = JSON.stringify(messagesWithReactions);
              if (prevStr !== newStr) {
                return messagesWithReactions;
              }
              return prevMessages;
            });
          }
        } catch (error) {
          console.error("Error loading messages from storage:", error);
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail?.messages && Array.isArray(e.detail.messages)) {
        const messagesWithReactions = e.detail.messages
          .filter((msg: any) => msg.sender === "admin")
          .map((msg: any) => ({
            ...msg,
            sender: "admin",
            reactions: msg.reactions || []
          }));

        setMessages(prevMessages => {
          const prevStr = JSON.stringify(prevMessages);
          const newStr = JSON.stringify(messagesWithReactions);
          if (prevStr !== newStr) {
            return messagesWithReactions;
          }
          return prevMessages;
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(`community-${communityId}-messages-updated`, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(`community-${communityId}-messages-updated`, handleCustomEvent as EventListener);
    };
  }, [communityId, usingSupabaseMessages]);

  // Handle long press on mobile
  const handleTouchStart = (messageId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    
    longPressTimerRef.current = setTimeout(() => {
      // Vibrate on long press (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      setShowEmojiPicker(messageId);
      setEmojiPickerPosition({
        x: startX,
        y: startY
      });
      
      // Prevent default text selection on long press
      if (document.getSelection) {
        const selection = document.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
      }
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Handle right-click on desktop
  const handleContextMenu = (messageId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setShowEmojiPicker(showEmojiPicker === messageId ? null : messageId);
    setEmojiPickerPosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.emoji-picker-container') && !target.closest('.emoji-picker')) {
        setShowEmojiPicker(null);
        setEmojiPickerPosition(null);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as any);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside as any);
      };
    }
  }, [showEmojiPicker]);

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added (but allow manual scrolling)
    if (messages.length > 0 && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      
      // Only auto-scroll if user is near bottom (within 200px)
      if (isNearBottom) {
        setTimeout(() => scrollToBottom(), 100);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (usingSupabaseMessages) return;
    if (messages.length === 0) return;
    try {
      localStorage.setItem(`community_${communityId}_messages`, JSON.stringify(messages));
      window.dispatchEvent(new CustomEvent(`community-${communityId}-messages-updated`, {
        detail: { messages }
      }));
    } catch (error) {
      console.error("Error saving messages to localStorage:", error);
    }
  }, [communityId, messages, usingSupabaseMessages]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ensure user has a membership record for this community
    const membershipKey = "community_memberships";
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

    let membershipExists = memberships.some((m) => m.communityId === communityId && m.userId === userId);

    // If the legacy data marked the request as approved, create a membership entry automatically
    if (!membershipExists && isApproved) {
      memberships.push({ communityId, userId, joinedAt: new Date().toISOString() });
      localStorage.setItem(membershipKey, JSON.stringify(memberships));
      membershipExists = true;
    }

    setHasMembership(membershipExists);
  }, [communityId, userId, isApproved]);

  useEffect(() => {
    ensureUserProfileCached(userId).catch((err) =>
      console.error("Failed to sync profile for chat:", err)
    );
  }, [userId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } else if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };


  const handleReaction = (messageId: string, emoji: string) => {
    const userId = getCurrentUserId();
    setMessages((prevMessages) => {
      return prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const existingReactionIndex = reactions.findIndex(
            (r) => r.emoji === emoji && r.userId === userId
          );

          let updatedReactions: MessageReaction[];
          if (existingReactionIndex >= 0) {
            // Remove reaction if user already reacted with this emoji
            updatedReactions = reactions.filter((_, index) => index !== existingReactionIndex);
          } else {
            // Remove user's other reactions to this emoji, then add new reaction
            const otherReactions = reactions.filter((r) => !(r.emoji === emoji && r.userId === userId));
            updatedReactions = [...otherReactions, { emoji, userId }];
          }

          return {
            ...msg,
            reactions: updatedReactions,
          };
        }
        return msg;
      });
    });
    setShowEmojiPicker(null);
  };

  const getReactionCount = (message: ChatMessage, emoji: string): number => {
    return (message.reactions || []).filter((r) => r.emoji === emoji).length;
  };

  const hasUserReacted = (message: ChatMessage, emoji: string): boolean => {
    const userId = getCurrentUserId();
    return (message.reactions || []).some((r) => r.emoji === emoji && r.userId === userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex items-center justify-center">
        <div className="text-white text-xl">Loading community...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex items-center justify-center">
        <div className="text-white text-xl">Community not found</div>
      </div>
    );
  }

  if (isRejected) {
    const messageText = `Your request to join "${community.name}" was rejected. Please contact admin for more information.`;
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-st-white mb-2">Request Rejected</h2>
          <p className="text-st-text/80 mb-6">{messageText}</p>
          <button onClick={() => window.history.back()} className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-st-white hover:bg-white/15">Go Back</button>
        </div>
      </div>
    );
  }

  if (!hasMembership) {
    const promptText = hasUserProfile() 
      ? `Please join "${community.name}" to access the chat.`
      : "Create your player profile to start joining communities.";
    const actionLabel = hasUserProfile() ? "Browse Communities" : "Create Profile";
    const actionPath = hasUserProfile() ? "/communities" : "/create-profile";

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-st-white mb-2">Join the Community</h2>
          <p className="text-st-text/80 mb-6">{promptText}</p>
          <button onClick={() => router.push(actionPath)} className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-st-white hover:bg-white/15">{actionLabel}</button>
        </div>
      </div>
    );
  }

  // Format time as HH:MM (24-hour format) for display in message bubble
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Format date header (WhatsApp style: Today, Yesterday, or date)
  const formatDateHeader = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const diffTime = today.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      // Format: "Mon, 3 Nov" or "Mon, 3 Nov 2023" if not current year
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      };
      
      if (date.getFullYear() !== today.getFullYear()) {
        options.year = 'numeric';
      }
      
      return date.toLocaleDateString('en-US', options);
    }
  };

  // Check if date has changed between two messages
  const isNewDay = (currentTimestamp: string, previousTimestamp: string | null) => {
    if (!previousTimestamp) return true;
    
    const currentDate = new Date(currentTimestamp);
    const previousDate = new Date(previousTimestamp);
    
    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1A063B]/95 backdrop-blur-lg border-b border-white/10 px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-st-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#FF6A3D] to-[#E94057] flex-shrink-0">
              <Image
                src={community.image}
                alt={community.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-st-white truncate">{community.name}</h1>
              <p className="text-sm text-st-text/70 truncate">{community.members} members</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-st-text/70">Online</span>
          </div>
        </div>
      </header>

      {/* Chat Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 min-h-0"
        style={{ height: '100%', maxHeight: 'calc(100vh - 200px)' }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6A3D]/20 to-[#E94057]/20 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-st-text/70 text-center max-w-md">
                No messages yet. Community updates will appear here.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showDateHeader = isNewDay(msg.timestamp, previousMessage?.timestamp || null);
              const isGrouped = index > 0 && 
                new Date(msg.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() < 60000;
              
              return (
                <div key={msg.id}>
                  {/* Date Header - Show once per day */}
                  {showDateHeader && (
                    <div className="flex items-center justify-center my-6">
                      <div className="px-4 py-1.5 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
                        <span className="text-xs font-medium text-st-white/80">
                          {formatDateHeader(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isGrouped ? "mt-1" : "mt-4"}`}>
                    <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {!isGrouped && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A3D] to-[#E94057] flex items-center justify-center">
                          <span className="text-white font-bold text-sm">A</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {!isGrouped && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-st-white">Admin</span>
                        </div>
                      )}
                      
                      <div 
                        className="inline-block bg-gradient-to-br from-[#FF6A3D]/20 to-[#E94057]/20 backdrop-blur-lg border border-[#FF6A3D]/30 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%] md:max-w-[60%] shadow-lg relative cursor-pointer select-none"
                        onContextMenu={(e) => handleContextMenu(msg.id, e)}
                        onTouchStart={(e) => handleTouchStart(msg.id, e)}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                        onTouchMove={handleTouchMove}
                        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                      >
                        {/* Image Display */}
                        {msg.image && (
                          <div className="relative w-full mb-2 rounded-lg overflow-hidden">
                            <Image
                              src={msg.image}
                              alt="Message image"
                              width={400}
                              height={300}
                              className="w-full h-auto max-h-64 object-cover rounded-lg"
                              unoptimized
                            />
                          </div>
                        )}
                        
                        {/* Message Text */}
                        {msg.message && (
                          <p className="text-st-white text-sm leading-relaxed whitespace-pre-wrap break-words mb-1">
                            {msg.message}
                          </p>
                        )}
                        
                        {/* Time display at bottom right of message */}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs text-st-white/60">{formatMessageTime(msg.timestamp)}</span>
                        </div>
                        
                        {/* Reactions Section */}
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          {emojiOptions.map((emoji) => {
                            const count = getReactionCount(msg, emoji);
                            const userReacted = hasUserReacted(msg, emoji);
                            
                            if (count === 0 && !userReacted) return null;
                            
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                                  userReacted
                                    ? "bg-[#FF6A3D]/30 border border-[#FF6A3D]/50"
                                    : "bg-white/10 border border-white/20 hover:bg-white/15"
                                }`}
                              >
                                <span className="text-sm">{emoji}</span>
                                {count > 0 && (
                                  <span className="text-st-white/80 font-semibold">{count}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Emoji Picker - Positioned at cursor/touch position */}
                        {showEmojiPicker === msg.id && emojiPickerPosition && (
                          <div 
                            className="fixed emoji-picker-container emoji-picker bg-[#1A063B] border border-white/20 rounded-xl p-3 shadow-2xl z-50 flex gap-2"
                            style={{
                              left: typeof window !== 'undefined' 
                                ? `${Math.min(emojiPickerPosition.x, window.innerWidth - 300)}px`
                                : `${emojiPickerPosition.x}px`,
                              top: `${Math.max(emojiPickerPosition.y - 80, 20)}px`,
                              transform: typeof window !== 'undefined' && emojiPickerPosition.x > window.innerWidth - 300
                                ? 'translateX(-100%)'
                                : 'translateX(-50%)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {emojiOptions.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleReaction(msg.id, emoji);
                                  setShowEmojiPicker(null);
                                  setEmojiPickerPosition(null);
                                }}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleReaction(msg.id, emoji);
                                  setShowEmojiPicker(null);
                                  setEmojiPickerPosition(null);
                                }}
                                className={`w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white/10 active:bg-white/20 transition-all touch-manipulation ${
                                  hasUserReacted(msg, emoji) ? "bg-[#FF6A3D]/20 ring-2 ring-[#FF6A3D]/50" : ""
                                }`}
                              >
                                <span className="text-2xl">{emoji}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

    </div>
  );
}


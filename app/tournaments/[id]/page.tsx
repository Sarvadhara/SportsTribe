"use client";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePublicAdminData, formatTournamentDate } from "@/lib/adminDataHook";
import { ensureUserProfileCached, getCurrentUserProfile, getUserId, hasUserProfile } from "@/lib/userUtils";

export default function TournamentDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading } = usePublicAdminData();
  const [imageError, setImageError] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState<{ userId: string; name: string; email: string; date: string } | null>(null);

  const tournament = useMemo(() => {
    const idParam = params.id;
    // Try numeric id first, fallback to name
    const asNumber = Number(idParam);
    const foundById = data?.tournaments?.find((t: any) => t.id === asNumber);
    if (foundById) return foundById;
    const decoded = decodeURIComponent(idParam);
    return data?.tournaments?.find((t: any) => t.name === decoded);
  }, [data, params.id]);

  // Check if user has a pending or approved registration
  const userId = typeof window !== "undefined" ? getUserId() : "";
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "pending" | "rejected">("pending");
  
  const registration = useMemo(() => {
    if (!userId || !tournament) return null;
    return (data.registrations || []).find((r: any) => 
      r.tournamentId === (tournament.id || tournament.name) && r.userId === userId
    ) || null;
  }, [data.registrations, userId, tournament]);

  const registrationStatus = registration ? registration.status : null;

  useEffect(() => {
    if (!userId) return;
    ensureUserProfileCached(userId).catch((err) =>
      console.error("Failed to sync user profile for tournament page:", err)
    );
  }, [userId]);

  // Listen for registration status changes and show notifications
  useEffect(() => {
    if (!userId || !tournament) return;
    
    let previousStatus = registrationStatus;
    
    const handleStorageChange = () => {
      // Check if status changed
      const savedData = localStorage.getItem("sportstribe_admin_data");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          const updatedReg = (parsed.registrations || []).find((r: any) => 
            r.tournamentId === (tournament?.id || tournament?.name) && r.userId === userId
          );
          
          const currentStatus = updatedReg ? updatedReg.status : null;
          
          // Only show notification if status actually changed
          if (currentStatus !== previousStatus && currentStatus !== null) {
            if (currentStatus === "confirmed") {
              setNotificationType("success");
              setNotificationMessage("🎉 Your registration request has been approved! You are now registered for this tournament.");
              setShowNotification(true);
              // Auto-hide after 10 seconds
              setTimeout(() => setShowNotification(false), 10000);
            } else if (currentStatus === "rejected") {
              setNotificationType("rejected");
              setNotificationMessage("❌ Your registration request has been rejected. Please contact admin for more information.");
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 10000);
            }
            previousStatus = currentStatus;
          }
        } catch (e) {
          console.error("Error checking registration status:", e);
        }
      }
    };

    // Listen for storage events (cross-tab updates)
    window.addEventListener("storage", handleStorageChange);
    // Listen for custom events (same-tab updates)
    window.addEventListener("sportstribe-admin-data-changed", handleStorageChange);
    
    // Also check periodically (every 2 seconds) for status updates
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sportstribe-admin-data-changed", handleStorageChange);
      clearInterval(interval);
    };
  }, [registration, registrationStatus, tournament, userId]);

  const handleConfirmRegister = async () => {
    if (!tournament) return;
    const currentUserId = typeof window !== "undefined" ? getUserId() : "";
    if (!currentUserId) {
      alert("Please create your profile before registering for a tournament.");
      router.push("/create-profile");
      return;
    }
    const profileRecord = await ensureUserProfileCached(currentUserId);
    if (!profileRecord) {
      alert("Please create your profile before registering for a tournament.");
      router.push("/create-profile");
      return;
    }

    const profile = getCurrentUserProfile() || profileRecord;
    const registrationData = {
      tournamentId: tournament.id || tournament.name,
      tournamentName: tournament.name,
      userId: currentUserId,
      userName: profile?.name || "User",
      userEmail: profile?.email || "",
      registrationDate: new Date().toISOString(),
    };

    // Save to user-side history (optional)
    try {
      const registrations = JSON.parse(localStorage.getItem("tournament_registrations") || "[]");
      registrations.push(registrationData);
      localStorage.setItem("tournament_registrations", JSON.stringify(registrations));

      // Send to admin as a pending registration
      const savedData = localStorage.getItem("sportstribe_admin_data");
      const parsed = savedData ? JSON.parse(savedData) : {};
      if (!parsed.registrations) parsed.registrations = [];
      
      // Check if registration already exists
      const existingReg = parsed.registrations.find((r: any) => 
        r.tournamentId === registrationData.tournamentId && r.userId === currentUserId
      );
      
      if (!existingReg) {
        const newAdminRegistration = {
          id: `${registrationData.tournamentId}-${registrationData.userId}-${Date.now()}`,
          ...registrationData,
          status: "pending",
        };
        parsed.registrations.push(newAdminRegistration);
        localStorage.setItem("sportstribe_admin_data", JSON.stringify(parsed));
        // Notify any listeners (admin pages)
        window.dispatchEvent(new CustomEvent("sportstribe-admin-data-changed", { detail: { data: parsed } }));
        window.dispatchEvent(new StorageEvent('storage', { key: 'sportstribe_admin_data', newValue: JSON.stringify(parsed), storageArea: localStorage }));
      }
    } catch (e) {
      console.error("Failed to save admin registration:", e);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
        <p className="mt-4 text-st-text/70">Loading tournament...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-4xl px-6 md:px-10 lg:px-16 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-st-white">Tournament not found</h1>
        <p className="mt-3 text-st-text/80">The tournament you are looking for does not exist.</p>
        <button onClick={() => router.push("/tournaments")} className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold">Back to Tournaments</button>
      </div>
    );
  }

  const formattedDate = formatTournamentDate(tournament.date);
  const fallbackImage = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&h=600&fit=crop";

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format date for deadline
  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 md:px-10 lg:px-16 py-12">
      {/* Notification Banner */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-[200] max-w-md rounded-2xl border-2 shadow-2xl p-4 backdrop-blur-md animate-slide-in ${
          notificationType === "success" 
            ? "bg-green-500/20 border-green-500/40 text-green-300" 
            : notificationType === "rejected"
            ? "bg-red-500/20 border-red-500/40 text-red-300"
            : "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
        }`}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold text-sm">{notificationMessage}</p>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button onClick={() => router.back()} className="text-st-text/70 hover:text-st-white transition">← Back</button>
      <div className="mt-4 rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-white/8 to-white/3">
        <div className="aspect-[16/7] relative bg-gradient-to-br from-[#1A063B] to-[#2C0C5B]">
          <Image
            src={imageError ? fallbackImage : tournament.image}
            alt={tournament.name}
            fill
            className="object-cover"
            sizes="100vw"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs font-semibold">
            {formattedDate}
          </div>
        </div>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-st-white">{tournament.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-st-text/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>{tournament.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{formattedDate}</span>
            </div>
            {tournament.status && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold border border-white/20 bg-white/5 text-st-text/80">{tournament.status}</span>
            )}
          </div>

          {/* Key Information Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournament.location && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF6A3D]/20">
                    <svg className="w-5 h-5 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-st-text/60 uppercase tracking-wider">Location</div>
                    <div className="text-st-white font-semibold">{tournament.location}</div>
                    {tournament.venue && (
                      <div className="text-st-text/70 text-sm mt-1">{tournament.venue}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tournament.time && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF6A3D]/20">
                    <svg className="w-5 h-5 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-st-text/60 uppercase tracking-wider">Time</div>
                    <div className="text-st-white font-semibold">{formatTime(tournament.time)}</div>
                  </div>
                </div>
              </div>
            )}

            {tournament.maxParticipants && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF6A3D]/20">
                    <svg className="w-5 h-5 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-st-text/60 uppercase tracking-wider">Max Participants</div>
                    <div className="text-st-white font-semibold">{tournament.maxParticipants}</div>
                  </div>
                </div>
              </div>
            )}

            {tournament.prizePool && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF6A3D]/20">
                    <svg className="w-5 h-5 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-st-text/60 uppercase tracking-wider">Prize Pool</div>
                    <div className="text-st-white font-semibold">{tournament.prizePool}</div>
                  </div>
                </div>
              </div>
            )}

            {tournament.registrationDeadline && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF6A3D]/20">
                    <svg className="w-5 h-5 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-st-text/60 uppercase tracking-wider">Registration Deadline</div>
                    <div className="text-st-white font-semibold">{formatDeadline(tournament.registrationDeadline)}</div>
                  </div>
                </div>
              </div>
            )}

            {tournament.contactInfo && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#FF6A3D]/20">
                    <svg className="w-5 h-5 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-st-text/60 uppercase tracking-wider">Contact</div>
                    <div className="text-st-white font-semibold">{tournament.contactInfo}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {tournament.description && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-st-white mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#FF6A3D] to-[#E94057] rounded-full"></div>
                About the Tournament
              </h3>
              <p className="text-st-text/85 leading-relaxed whitespace-pre-line">{tournament.description}</p>
            </div>
          )}

          {/* Rules */}
          {tournament.rules && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-st-white mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#FF6A3D] to-[#E94057] rounded-full"></div>
                Rules & Regulations
              </h3>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-st-text/85 leading-relaxed whitespace-pre-line">{tournament.rules}</p>
              </div>
            </div>
          )}

          {/* Registration Status & Actions */}
          <div className="mt-8 pt-6 border-t border-white/10">
            {registrationStatus === null ? (
              <button 
                onClick={handleConfirmRegister} 
                className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF6A3D] via-[#FF7A4D] to-[#E94057] text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(255,106,61,0.6)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request Registration
              </button>
            ) : registrationStatus === "pending" ? (
              <div className="space-y-4">
                <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/40 text-yellow-300 font-bold text-center flex items-center justify-center gap-3 shadow-lg">
                  <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Request Pending Approval
                </div>
                <p className="text-st-text/70 text-base text-center">Your registration request has been sent to admin. Please wait for approval. You will be notified when your request is reviewed.</p>
              </div>
            ) : registrationStatus === "confirmed" ? (
              <div className="space-y-4">
                <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500/40 text-green-300 font-bold text-center flex items-center justify-center gap-3 shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You are registered for the tournament
                </div>
                {registration && (
                  <div className="p-6 bg-gradient-to-br from-white/8 to-white/3 rounded-2xl border border-white/15">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="text-st-text/60 text-xs uppercase tracking-wider mb-2 font-semibold">Registration Date</div>
                        <div className="text-st-white font-bold text-lg">{new Date(registration.registrationDate).toLocaleDateString()}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="text-st-text/60 text-xs uppercase tracking-wider mb-2 font-semibold">Receipt ID</div>
                        <div className="text-st-white font-mono text-sm break-all font-semibold">{registration.id}</div>
                      </div>
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => {
                    if (registration) {
                      setReceiptInfo({
                        userId: registration.userId,
                        name: registration.userName,
                        email: registration.userEmail || "",
                        date: registration.registrationDate,
                      });
                      setShowReceipt(true);
                    }
                  }}
                  className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all"
                >
                  View Receipt
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/40 text-red-300 font-bold text-center flex items-center justify-center gap-3 shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Registration Rejected
                </div>
                <p className="text-st-text/70 text-base text-center">Your registration request was not approved. Please contact admin for more information.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReceipt && receiptInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowReceipt(false)} />
          <div className="relative z-[101] w-[90%] max-w-md rounded-2xl border border-white/20 bg-gradient-to-b from-[#0f0b1b] to-[#1b1230] p-6 text-st-white shadow-2xl">
            <div className="text-center">
              <div className="text-lg font-bold">Successfully Registered</div>
              <div className="mt-1 text-st-text/75 text-sm">You can take a screenshot of this receipt.</div>
            </div>
            <div className="mt-5 rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="text-sm text-st-text/70">Tournament</div>
              <div className="font-semibold">{tournament.name}</div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-st-text/70">User ID</div>
                  <div className="font-mono text-sm break-all">{receiptInfo.userId}</div>
                </div>
                <div>
                  <div className="text-st-text/70">Date</div>
                  <div>{new Date(receiptInfo.date).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-st-text/70">Name</div>
                  <div>{receiptInfo.name}</div>
                </div>
                {receiptInfo.email && (
                  <div>
                    <div className="text-st-text/70">Email</div>
                    <div className="break-all">{receiptInfo.email}</div>
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs text-st-text/60">Receipt ID: {`${tournament.id || encodeURIComponent(tournament.name)}-${receiptInfo.userId.slice(0,6)}`}</div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowReceipt(false)} className="flex-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15">Close</button>
              <button onClick={() => router.push("/tournaments")} className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6A3D] to-[#E94057]">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



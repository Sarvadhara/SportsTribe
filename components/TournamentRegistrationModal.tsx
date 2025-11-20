"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import { usePublicAdminData, formatTournamentDate } from "@/lib/adminDataHook";
import { ensureUserProfileCached, hasUserProfile, getCurrentUserProfile, getUserId } from "@/lib/userUtils";

interface TournamentRegistrationModalProps {
  tournament: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TournamentRegistrationModal({
  tournament,
  isOpen,
  onClose,
  onSuccess,
}: TournamentRegistrationModalProps) {
  const { data } = usePublicAdminData();
  const [imageError, setImageError] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "rejected">("success");
  const userId = typeof window !== "undefined" ? getUserId() : "";
  const previousStatusRef = useRef<string | null>(null);

  // Memoize registration calculation to prevent unnecessary recalculations
  const registration = useMemo(() => {
    if (!tournament || !data.registrations) return null;
    return (data.registrations || []).find((r: any) => 
      r.tournamentId === (tournament.id || tournament.name) && r.userId === userId
    ) || null;
  }, [tournament, data.registrations, userId]);

  const registrationStatus = registration ? registration.status : null;

  useEffect(() => {
    if (!userId) return;
    ensureUserProfileCached(userId).catch((err) =>
      console.error("Failed to sync profile for registration modal:", err)
    );
  }, [userId]);

  // Listen for registration status changes and show notifications
  useEffect(() => {
    if (!isOpen || !userId || !tournament) return;
    
    const handleStatusChange = () => {
      const savedData = localStorage.getItem("sportstribe_admin_data");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          const updatedReg = (parsed.registrations || []).find((r: any) => 
            r.tournamentId === (tournament?.id || tournament?.name) && r.userId === userId
          );
          
          const currentStatus = updatedReg ? updatedReg.status : null;
          
          // Only show notification if status actually changed
          if (currentStatus !== previousStatusRef.current && currentStatus !== null && previousStatusRef.current !== null) {
            if (currentStatus === "confirmed") {
              setNotificationType("success");
              setNotificationMessage("🎉 Your registration request has been approved! You are now registered for this tournament.");
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 8000);
            } else if (currentStatus === "rejected") {
              setNotificationType("rejected");
              setNotificationMessage("❌ Your registration request has been rejected. Please contact admin for more information.");
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 8000);
            }
          }
          previousStatusRef.current = currentStatus;
        } catch (e) {
          console.error("Error checking registration status:", e);
        }
      }
    };

    // Initialize previous status
    previousStatusRef.current = registrationStatus;

    // Listen for storage events (cross-tab updates)
    window.addEventListener("storage", handleStatusChange);
    // Listen for custom events (same-tab updates)
    window.addEventListener("sportstribe-admin-data-changed", handleStatusChange);
    
    // Also check periodically (every 2 seconds) for status updates
    const interval = setInterval(handleStatusChange, 2000);

    return () => {
      window.removeEventListener("storage", handleStatusChange);
      window.removeEventListener("sportstribe-admin-data-changed", handleStatusChange);
      clearInterval(interval);
    };
  }, [isOpen, registration, registrationStatus, tournament, userId]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    return tournament ? formatTournamentDate(tournament.date) : "";
  }, [tournament?.date]);

  // Format time for display - memoized
  const formatTime = useCallback((time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  // Format date for deadline - memoized
  const formatDeadline = useCallback((dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  }, []);

  // Get registered teams/participants count
  const registeredCount = useMemo(() => {
    if (!tournament || !data.registrations) return 0;
    // Count confirmed registrations
    const tournamentRegs = (data.registrations || []).filter((r: any) => 
      r.tournamentId === (tournament.id || tournament.name) && r.status === "confirmed"
    );
    return tournamentRegs.length;
  }, [tournament, data.registrations]);

  // Handle register function - must be defined before early return
  const handleRegister = useCallback(async () => {
    if (!tournament) return;
    const profileRecord = await ensureUserProfileCached(userId);
    if (!profileRecord) {
      alert("Please create your profile before registering for a tournament.");
      window.location.href = "/create-profile";
      return;
    }

    setIsRegistering(true);
    const profile = getCurrentUserProfile() || profileRecord;
    const registrationData = {
      tournamentId: tournament.id || tournament.name,
      tournamentName: tournament.name,
      userId,
      userName: profile?.name || "User",
      userEmail: profile?.email || "",
      registrationDate: new Date().toISOString(),
    };

    try {
      const registrations = JSON.parse(localStorage.getItem("tournament_registrations") || "[]");
      registrations.push(registrationData);
      localStorage.setItem("tournament_registrations", JSON.stringify(registrations));

      const savedData = localStorage.getItem("sportstribe_admin_data");
      const parsed = savedData ? JSON.parse(savedData) : {};
      if (!parsed.registrations) parsed.registrations = [];
      
      const existingReg = parsed.registrations.find((r: any) => 
        r.tournamentId === registrationData.tournamentId && r.userId === userId
      );
      
      if (!existingReg) {
        const newAdminRegistration = {
          id: `${registrationData.tournamentId}-${registrationData.userId}-${Date.now()}`,
          ...registrationData,
          status: "pending",
        };
        parsed.registrations.push(newAdminRegistration);
        localStorage.setItem("sportstribe_admin_data", JSON.stringify(parsed));
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent("sportstribe-admin-data-changed", { detail: { data: parsed } }));
      }
      
      setIsRegistering(false);
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error("Failed to save admin registration:", e);
      setIsRegistering(false);
    }
  }, [tournament, userId, onSuccess]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Early return after all hooks
  if (!isOpen || !tournament) return null;

  const fallbackImage = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&h=600&fit=crop";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      
      {/* Notification Banner */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-[201] max-w-md rounded-2xl border-2 shadow-2xl p-4 backdrop-blur-md animate-slide-in ${
          notificationType === "success" 
            ? "bg-green-500/20 border-green-500/40 text-green-300" 
            : "bg-red-500/20 border-red-500/40 text-red-300"
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

      <div className="relative z-[101] w-full max-w-2xl rounded-2xl border border-white/20 bg-gradient-to-b from-[#0f0b1b] via-[#1a0f2e] to-[#1b1230] overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10 hover:scale-110"
        >
          <svg className="w-4 h-4 text-st-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tournament Image - Compact */}
        <div className="aspect-[16/6] relative bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#3D1A7A] overflow-hidden">
          <Image
            src={imageError ? fallbackImage : tournament.image}
            alt={tournament.name}
            fill
            className="object-cover"
            sizes="100vw"
            onError={() => setImageError(true)}
            priority={false}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Tournament Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-st-white mb-2 leading-tight drop-shadow-lg">{tournament.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs font-semibold">
                {formattedDate}
              </div>
              {tournament.status && (
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-400/30 bg-green-500/20 text-green-300 backdrop-blur-md capitalize">
                  {tournament.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tournament Details - Compact */}
        <div className="p-6 bg-gradient-to-b from-transparent to-[#0f0b1b]/50">
          
          {/* Key-Value Pairs Format */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2.5 min-w-[140px]">
                  <div className="p-1.5 rounded-md bg-[#FF6A3D]/10">
                    <svg className="w-4 h-4 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-st-text/60">Date:</span>
                </div>
                <span className="text-base font-semibold text-st-white flex-1">{formattedDate}</span>
              </div>

              {/* Time */}
              {tournament.time && (
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2.5 min-w-[140px]">
                    <div className="p-1.5 rounded-md bg-[#FF6A3D]/10">
                      <svg className="w-4 h-4 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-st-text/60">Time:</span>
                  </div>
                  <span className="text-base font-semibold text-st-white flex-1">{formatTime(tournament.time)}</span>
                </div>
              )}

              {/* Venue */}
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2.5 min-w-[140px]">
                  <div className="p-1.5 rounded-md bg-[#FF6A3D]/10">
                    <svg className="w-4 h-4 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-st-text/60">Venue:</span>
                </div>
                <span className="text-base font-semibold text-st-white flex-1">{tournament.venue || tournament.location}</span>
              </div>

              {/* Registration Fee */}
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2.5 min-w-[140px]">
                  <div className="p-1.5 rounded-md bg-[#FF6A3D]/10">
                    <svg className="w-4 h-4 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-st-text/60">Registration Fee:</span>
                </div>
                <span className="text-base font-semibold text-st-white flex-1">{tournament.registrationFee || tournament.prizePool || "Free"}</span>
              </div>

              {/* Total People Required */}
              {tournament.maxParticipants && (
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2.5 min-w-[140px]">
                    <div className="p-1.5 rounded-md bg-[#FF6A3D]/10">
                      <svg className="w-4 h-4 text-[#FF6A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-st-text/60">People Required:</span>
                  </div>
                  <span className="text-base font-semibold text-st-white flex-1">{tournament.maxParticipants}</span>
                </div>
              )}
            </div>
          </div>

          {/* Registration Status & Actions */}
          <div className="mt-6 pt-6 border-t border-white/10">
            {registrationStatus === null ? (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6A3D] via-[#FF7A4D] to-[#E94057] text-white font-bold text-base hover:shadow-[0_0_30px_rgba(255,106,61,0.6)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Request Registration
                  </>
                )}
              </button>
            ) : registrationStatus === "pending" ? (
              <div className="space-y-3">
                <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/40 text-yellow-300 font-bold text-center flex items-center justify-center gap-2 shadow-lg">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Request Pending Approval
                </div>
                <p className="text-st-text/70 text-sm text-center">Your registration request has been sent to admin. You will be notified when your request is reviewed.</p>
              </div>
            ) : registrationStatus === "confirmed" ? (
              <div className="space-y-3">
                <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500/40 text-green-300 font-bold text-center flex items-center justify-center gap-2 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You are registered for the tournament
                </div>
                {registration && (
                  <div className="p-4 bg-gradient-to-br from-white/8 to-white/3 rounded-xl border border-white/15">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-st-text/60 text-xs uppercase tracking-wider mb-1 font-semibold">Registration Date</div>
                        <div className="text-st-white font-bold text-sm">{new Date(registration.registrationDate).toLocaleDateString()}</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-st-text/60 text-xs uppercase tracking-wider mb-1 font-semibold">Receipt ID</div>
                        <div className="text-st-white font-mono text-xs break-all font-semibold">{registration.id}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/40 text-red-300 font-bold text-center flex items-center justify-center gap-2 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Registration Rejected
                </div>
                <p className="text-st-text/70 text-sm text-center">Your registration request was not approved. Please contact admin for more information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getOrCreateUserId, getCurrentUserProfile, ensureUserProfileCached, hasUserProfile, saveUserProfile } from "@/lib/userUtils";

export default function CreateProfile() {
  const router = useRouter();
  const userId = getOrCreateUserId();
  const existingProfile = getCurrentUserProfile();
  const [hasProfile, setHasProfile] = useState(hasUserProfile());
  const [isSyncingProfile, setIsSyncingProfile] = useState(!existingProfile);
  
  const [formData, setFormData] = useState({
    name: existingProfile?.name || "",
    email: existingProfile?.email || "",
    phone: existingProfile?.phone || "",
    city: existingProfile?.city || "",
    state: existingProfile?.state || "",
    sport: existingProfile?.sport || "",
    position: existingProfile?.position || "",
    age: existingProfile?.age?.toString?.() || "",
    matchesPlayed: existingProfile?.matchesPlayed?.toString?.() || "",
    bio: existingProfile?.bio || "",
    profileImage: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(existingProfile?.profileImage || null);

  useEffect(() => {
    let isMounted = true;
    async function syncProfile() {
      try {
        setIsSyncingProfile(true);
        const profile = await ensureUserProfileCached(userId);
        if (!isMounted || !profile) return;
        setFormData((prev) => ({
          ...prev,
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          city: profile.city || "",
          state: profile.state || "",
          sport: profile.sport || "",
          position: profile.position || "",
          age: profile.age ? String(profile.age) : "",
          matchesPlayed: profile.matchesPlayed ? String(profile.matchesPlayed) : "",
          bio: profile.bio || "",
        }));
        if (profile.profileImage) {
          setImagePreview(profile.profileImage);
        }
        setHasProfile(true);
      } finally {
        if (isMounted) {
          setIsSyncingProfile(false);
        }
      }
    }
    if (!existingProfile) {
      syncProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [existingProfile, userId]);

  const sports = [
    "Cricket",
    "Football",
    "Tennis",
    "Basketball",
    "Badminton",
    "Volleyball",
    "Hockey",
    "Table Tennis",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.sport) newErrors.sport = "Sport is required";
    if (!formData.age) newErrors.age = "Age is required";
    else if (parseInt(formData.age) < 10 || parseInt(formData.age) > 100) {
      newErrors.age = "Age must be between 10 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = {
        ...formData,
        profileImage: imagePreview,
      };

      await saveUserProfile(profileData, userId);
      setHasProfile(true);
      router.push("/players-teams");
    } catch (error) {
      console.error("Error creating profile:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-10 lg:px-16 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-st-white mb-2">
          {hasProfile ? "Update Your Profile" : "Create Your Profile"}
        </h1>
        <p className="text-st-text/85">Join the SportsTribe community and showcase your skills!</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="px-4 py-2 bg-gradient-to-r from-[#1A063B] via-[#2C0C5B] to-[#1A063B] border border-white/20 rounded-lg">
            <span className="text-st-text/70 text-sm font-semibold">Your User ID:</span>
            <span className="text-white font-bold ml-2 text-lg tracking-wider">{userId}</span>
          </div>
          {hasProfile && (
            <div className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg">
              <span className="text-white text-sm font-semibold">✓ Profile Exists</span>
            </div>
          )}
        </div>
        {isSyncingProfile && (
          <p className="text-xs text-st-text/60 mt-3">
            Syncing your profile with Supabase...
          </p>
        )}
        <p className="text-sm text-[#FF6A3D] mt-4 font-semibold">* Required for tournament registration</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <label className="block text-st-white font-semibold mb-4">Profile Photo</label>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#1A063B] to-[#2C0C5B] border-2 border-white/20">
              {imagePreview ? (
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profileImage"
              />
              <label
                htmlFor="profileImage"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-full hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                Upload Photo
              </label>
              <p className="text-st-text/70 text-sm mt-2">JPG, PNG or GIF (Max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-st-white mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-st-white font-semibold mb-2">
                Full Name <span className="text-[#FF6A3D]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-[#E94057] text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-st-white font-semibold mb-2">
                Email <span className="text-[#FF6A3D]">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-[#E94057] text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-st-white font-semibold mb-2">
                Phone Number <span className="text-[#FF6A3D]">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors"
                placeholder="+91 1234567890"
              />
              {errors.phone && <p className="text-[#E94057] text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-st-white font-semibold mb-2">
                Age <span className="text-[#FF6A3D]">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="10"
                max="100"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors"
                placeholder="25"
              />
              {errors.age && <p className="text-[#E94057] text-sm mt-1">{errors.age}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-st-white mb-6">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-st-white font-semibold mb-2">
                City <span className="text-[#FF6A3D]">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors"
                placeholder="Mumbai"
              />
              {errors.city && <p className="text-[#E94057] text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-st-white font-semibold mb-2">
                State <span className="text-[#FF6A3D]">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors"
                placeholder="Maharashtra"
              />
              {errors.state && <p className="text-[#E94057] text-sm mt-1">{errors.state}</p>}
            </div>
          </div>
        </div>

        {/* Sports Information */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-st-white mb-6">Sports Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-st-white font-semibold mb-2">
                Primary Sport <span className="text-[#FF6A3D]">*</span>
              </label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white focus:outline-none focus:border-[#FF6A3D] transition-colors"
              >
                <option value="">Select a sport</option>
                {sports.map((sport) => (
                  <option key={sport} value={sport} className="bg-[#1A063B]">
                    {sport}
                  </option>
                ))}
              </select>
              {errors.sport && <p className="text-[#E94057] text-sm mt-1">{errors.sport}</p>}
            </div>

            <div>
              <label className="block text-st-white font-semibold mb-2">Position/Role</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors"
                placeholder="e.g., Batsman, Goalkeeper, Forward"
              />
            </div>

            <div>
              <label className="block text-st-white font-semibold mb-2">Matches Played</label>
              <input
                type="number"
                name="matchesPlayed"
                value={formData.matchesPlayed}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors"
                placeholder="e.g., 50"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <label className="block text-st-white font-semibold mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:border-[#FF6A3D] transition-colors resize-none"
            placeholder="Tell us about your sports background, achievements, and goals..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-4 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-bold text-lg rounded-full hover:shadow-[0_0_30px_rgba(255,106,61,0.6)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isSubmitting 
              ? (hasProfile ? "Updating Profile..." : "Creating Profile...") 
              : (hasProfile ? "Update Profile" : "Create Profile")
            }
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-10 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


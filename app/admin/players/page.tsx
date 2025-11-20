"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer, Player } from "@/lib/playersService";
import { handleImageUpload } from "@/lib/imageUtils";

// Generate unique user ID for admin-created players
function generateUniqueUserId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ST-ADMIN-${dateStr}-${timeStr}-${random}`;
}

export default function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    sport: "",
    age: "",
    position: "",
    matchesPlayed: "",
    bio: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  // Load players from Supabase on component mount
  useEffect(() => {
    async function loadPlayers() {
      try {
        setIsLoading(true);
        const data = await fetchPlayers();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to load players:", error);
        alert("Failed to load players. Please check your Supabase connection.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPlayers();
  }, []);

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

  const handleEdit = (player: any) => {
    setEditingId(player.id);
    setFormData({
      name: player.name || "",
      email: player.email || "",
      phone: player.phone || "",
      city: player.city || "",
      state: player.state || "",
      sport: player.sport || "",
      age: player.age?.toString() || "",
      position: player.position || "",
      matchesPlayed: player.matchesPlayed?.toString() || "",
      bio: player.bio || "",
      image: player.image || "",
    });
    setImagePreview(player.image || "");
    setImageError("");
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this player?")) {
      return;
    }

    try {
      await deletePlayer(id);
      setPlayers(players.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete player:", error);
      alert("Failed to delete player. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const playerData = {
        name: formData.name,
        city: formData.city,
        state: formData.state,
        sport: formData.sport,
        image: formData.image || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
        age: formData.age ? parseInt(formData.age) : undefined,
        matchesPlayed: formData.matchesPlayed ? parseInt(formData.matchesPlayed) : undefined,
        position: formData.position || undefined,
        bio: formData.bio || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        userId: undefined as string | undefined, // Will be set below
      };

      if (editingId) {
        const existingPlayer = players.find((p) => p.id === editingId);
        const userId = existingPlayer?.userId || generateUniqueUserId();
        
        const updated = await updatePlayer(editingId, {
          ...playerData,
          userId,
        });
        
        setPlayers(players.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
      } else {
        const userId = generateUniqueUserId();
        const newPlayer = await createPlayer({
          ...playerData,
          userId,
        });
        
        setPlayers([...players, newPlayer]);
      }

      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        sport: "",
        age: "",
        position: "",
        matchesPlayed: "",
        bio: "",
        image: "",
      });
      setImagePreview("");
      setImageError("");
    } catch (error: any) {
      console.error("Failed to save player:", error);
      const errorMessage = error?.message || "Failed to save player. Please check your Supabase connection and try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Players & Teams Management</h1>
            <p className="text-st-text/70">Create, edit, and manage player profiles</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4 text-st-text/70">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Players & Teams Management</h1>
          <p className="text-st-text/70">Create, edit, and manage player profiles</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              name: "",
              email: "",
              phone: "",
              city: "",
              state: "",
              sport: "",
              age: "",
              position: "",
              matchesPlayed: "",
              bio: "",
              image: "",
            });
            setImagePreview("");
            setImageError("");
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
        >
          + Add Player
        </button>
      </div>

      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-st-white mb-4">
            {editingId ? "Edit Player" : "Add New Player"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg p-4">
              <h3 className="text-lg font-bold text-st-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    Full Name <span className="text-[#FF6A3D]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    Email <span className="text-[#FF6A3D]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="player@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    Age <span className="text-[#FF6A3D]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="25"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg p-4">
              <h3 className="text-lg font-bold text-st-white mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    City <span className="text-[#FF6A3D]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus-ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    State <span className="text-[#FF6A3D]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
            </div>

            {/* Sports Information */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg p-4">
              <h3 className="text-lg font-bold text-st-white mb-4">Sports Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    What Sport Does He Play? <span className="text-[#FF6A3D]">*</span>
                  </label>
                  <select
                    required
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  >
                    <option value="">Select Sport</option>
                    {sports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">Position/Role</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="e.g., Batsman, Goalkeeper, Forward"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    Number of Matches Played <span className="text-[#FF6A3D]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.matchesPlayed}
                    onChange={(e) => setFormData({ ...formData, matchesPlayed: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            {/* Bio and Image */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg p-4">
              <h3 className="text-lg font-bold text-st-white mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about the player's background, achievements, and goals..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    Image <span className="text-[#FF6A3D]">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!imagePreview}
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
                  {imageError && <p className="text-red-400 text-xs mt-1">{imageError}</p>}
                  {imagePreview && (
                    <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-white/20">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Player" : "Add Player"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                disabled={isSubmitting}
                className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-st-text/70">No players found. Create your first player to get started!</p>
          </div>
        ) : (
          players.map((player) => (
          <div
            key={player.id}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-[#FF6A3D] transition-all duration-300"
          >
            <div className="aspect-[4/3] relative">
              <Image src={player.image} alt={player.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-st-white text-lg mb-2">{player.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#FF6A3D]/20 text-[#FF6A3D] rounded-full text-xs font-semibold">
                  {player.sport}
                </span>
              </div>
              <p className="text-st-text/70 text-sm mb-2">
                {player.city}, {player.state}
              </p>
              {player.matchesPlayed && (
                <p className="text-st-text/70 text-sm mb-3">
                  <span className="font-semibold text-[#FF6A3D]">{player.matchesPlayed}</span> matches played
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(player)}
                  className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(player.id)}
                  className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}


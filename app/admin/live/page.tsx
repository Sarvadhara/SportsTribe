"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchLiveMatches, createLiveMatch, updateLiveMatch, deleteLiveMatch, LiveMatch } from "@/lib/liveMatchesService";
import { handleImageUpload } from "@/lib/imageUtils";

export default function LiveMatchesManagement() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    status: "LIVE",
    image: "",
    streamUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  // Load live matches from Supabase on component mount
  useEffect(() => {
    async function loadLiveMatches() {
      try {
        setIsLoading(true);
        const data = await fetchLiveMatches();
        setMatches(data);
      } catch (error) {
        console.error("Failed to load live matches:", error);
        alert("Failed to load live matches. Please check your Supabase connection.");
      } finally {
        setIsLoading(false);
      }
    }
    loadLiveMatches();
  }, []);

  const handleEdit = (match: LiveMatch) => {
    setEditingId(match.id);
    setFormData({ ...match, streamUrl: match.streamUrl || "" });
    setImagePreview(match.image || "");
    setImageError("");
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this match?")) {
      return;
    }

    try {
      await deleteLiveMatch(id);
      setMatches(matches.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete live match:", error);
      alert("Failed to delete live match. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const matchData = {
        title: formData.title,
        status: formData.status as "LIVE" | "Upcoming" | "Completed",
        image: formData.image,
        streamUrl: formData.streamUrl || undefined,
      };

      if (editingId) {
        const updated = await updateLiveMatch(editingId, matchData);
        setMatches(matches.map((m) => (m.id === editingId ? updated : m)));
        setEditingId(null);
      } else {
        const newMatch = await createLiveMatch(matchData);
        setMatches([...matches, newMatch]);
      }

      setShowForm(false);
      setFormData({ title: "", status: "LIVE", image: "", streamUrl: "" });
      setImagePreview("");
      setImageError("");
    } catch (error: any) {
      console.error("Failed to save live match:", error);
      const errorMessage = error?.message || "Failed to save live match. Please check your Supabase connection and try again.";
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
            <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Live Matches Management</h1>
            <p className="text-st-text/70">Create, edit, and manage live and upcoming matches</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4 text-st-text/70">Loading live matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Live Matches Management</h1>
          <p className="text-st-text/70">Create, edit, and manage live and upcoming matches</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: "", status: "LIVE", image: "", streamUrl: "" });
            setImagePreview("");
            setImageError("");
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
        >
          + Add Match
        </button>
      </div>

      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-st-white mb-4">
            {editingId ? "Edit Match" : "Add New Match"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-st-text/90 mb-2">Match Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                placeholder="Cricket - India vs Australia"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Status</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                >
                  <option value="LIVE">LIVE</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">
                  YouTube Link <span className="text-[#FF6A3D]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                />
                <p className="text-st-text/70 text-xs mt-1">Paste the full YouTube video URL here</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-st-text/90 mb-2">
                  Thumbnail Image <span className="text-[#FF6A3D]">*</span>
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
                <p className="text-st-text/70 text-xs mt-1">Upload a thumbnail image for the live stream</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Match" : "Add Match"}
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
        {matches.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-st-text/70">No live matches found. Create your first match to get started!</p>
          </div>
        ) : (
          matches.map((match) => (
          <div key={match.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-[#FF6A3D] transition-all duration-300">
            <div className="aspect-video relative">
              <Image
                src={match.image}
                alt={match.title}
                fill
                className="object-cover"
              />
              {match.status === "LIVE" && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 rounded-full shadow-lg border border-white/30">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-st-white text-lg mb-3">{match.title}</h3>
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    match.status === "LIVE"
                      ? "bg-red-500/20 text-red-400"
                      : match.status === "Upcoming"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {match.status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(match)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(match.id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}


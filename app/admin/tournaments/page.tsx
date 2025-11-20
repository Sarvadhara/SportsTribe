"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchTournaments, createTournament, updateTournament, deleteTournament, Tournament } from "@/lib/tournamentsService";
import { handleImageUpload } from "@/lib/imageUtils";

export default function TournamentsManagement() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    venue: "",
    image: "",
    status: "active" as "active" | "upcoming" | "completed",
    description: "",
    rules: "",
    prizePool: "",
    maxParticipants: "",
    registrationDeadline: "",
    contactInfo: "",
    registrationFee: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  // Load tournaments from Supabase on component mount
  useEffect(() => {
    async function loadTournaments() {
      try {
        setIsLoading(true);
        const data = await fetchTournaments();
        setTournaments(data);
      } catch (error) {
        console.error("Failed to load tournaments:", error);
        alert("Failed to load tournaments. Please check your Supabase connection.");
      } finally {
        setIsLoading(false);
      }
    }
    loadTournaments();
  }, []);

  const handleEdit = (tournament: Tournament) => {
    setEditingId(tournament.id);
    setFormData({
      name: tournament.name || "",
      date: tournament.date || "",
      time: tournament.time || "",
      location: tournament.location || "",
      venue: tournament.venue || "",
      image: tournament.image || "",
      status: tournament.status || "active",
      description: tournament.description || "",
      rules: tournament.rules || "",
      prizePool: tournament.prizePool || "",
      maxParticipants: tournament.maxParticipants?.toString() || "",
      registrationDeadline: tournament.registrationDeadline || "",
      contactInfo: tournament.contactInfo || "",
      registrationFee: tournament.registrationFee || "",
    });
    setImagePreview(tournament.image || "");
    setImageError("");
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) {
      return;
    }

    try {
      await deleteTournament(id);
      setTournaments(tournaments.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete tournament:", error);
      alert("Failed to delete tournament. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const tournamentData = {
        name: formData.name,
        date: formData.date,
        time: formData.time || undefined,
        location: formData.location,
        venue: formData.venue || undefined,
        image: formData.image,
        status: formData.status,
        description: formData.description || undefined,
        rules: formData.rules || undefined,
        prizePool: formData.prizePool || undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        registrationDeadline: formData.registrationDeadline || undefined,
        contactInfo: formData.contactInfo || undefined,
        registrationFee: formData.registrationFee || undefined,
      };

      if (editingId) {
        const updated = await updateTournament(editingId, tournamentData);
        setTournaments(tournaments.map((t) => (t.id === editingId ? updated : t)));
        setEditingId(null);
      } else {
        const newTournament = await createTournament(tournamentData);
        setTournaments([...tournaments, newTournament]);
      }
      
      setShowForm(false);
      setFormData({ 
        name: "", 
        date: "", 
        time: "",
        location: "", 
        venue: "",
        image: "", 
        status: "active",
        description: "",
        rules: "",
        prizePool: "",
        maxParticipants: "",
        registrationDeadline: "",
        contactInfo: "",
        registrationFee: "",
      });
      setImagePreview("");
      setImageError("");
    } catch (error: any) {
      console.error("Failed to save tournament:", error);
      const errorMessage = error?.message || "Failed to save tournament. Please check your Supabase connection and try again.";
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
            <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Tournaments Management</h1>
            <p className="text-st-text/70">Create, edit, and manage tournaments</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4 text-st-text/70">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Tournaments Management</h1>
          <p className="text-st-text/70">Create, edit, and manage tournaments</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ 
              name: "", 
              date: "", 
              time: "",
              location: "", 
              venue: "",
              image: "", 
              status: "active",
              description: "",
              rules: "",
              prizePool: "",
              maxParticipants: "",
              registrationDeadline: "",
              contactInfo: "",
              registrationFee: "",
            });
            setImagePreview("");
            setImageError("");
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
        >
          + Add Tournament
        </button>
      </div>

      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-st-white mb-4">
            {editingId ? "Edit Tournament" : "Add New Tournament"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Tournament Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="Cricket Premier League"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Venue</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="Wankhede Stadium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "upcoming" | "completed" })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                >
                  <option className="text-black" value="active">Active</option>
                  <option className="text-black" value="upcoming">Upcoming</option>
                  <option className="text-black" value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Max Participants</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Registration Deadline</label>
                <input
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-st-text/90 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all resize-none"
                  placeholder="Detailed description about the tournament..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-st-text/90 mb-2">Rules & Regulations</label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all resize-none"
                  placeholder="Tournament rules and regulations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Prize Pool</label>
                <input
                  type="text"
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="₹50,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Registration Fee</label>
                <input
                  type="text"
                  value={formData.registrationFee}
                  onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="₹500 or Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Contact Information</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="Email or Phone"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-st-text/90 mb-2">Image</label>
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
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Tournament" : "Add Tournament"}
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

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Tournament</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tournaments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-st-text/70">
                    No tournaments found. Create your first tournament to get started!
                  </td>
                </tr>
              ) : (
                tournaments.map((tournament) => (
                <tr key={tournament.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        <Image
                          src={tournament.image}
                          alt={tournament.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-medium text-st-white">{tournament.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-st-text/80">{tournament.date}</td>
                  <td className="px-6 py-4 text-st-text/80">{tournament.location}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tournament.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : tournament.status === "upcoming"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {tournament.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(tournament)}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tournament.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


"use client";
import { useState } from "react";
import Image from "next/image";
import { useAdminData, Sport } from "@/contexts/AdminDataContext";
import { handleImageUpload } from "@/lib/imageUtils";

export default function SportsManagement() {
  const { data, updateSports } = useAdminData();
  const sports = data.sports || [];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", image: "" });
    setImagePreview("");
    setImageError("");
  };

  const handleEdit = (sport: any) => {
    setEditingId(sport.id);
    setFormData(sport);
    setImagePreview(sport.image || "");
    setImageError("");
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sport?")) {
      updateSports(sports.filter((s: any) => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSports(sports.map((s: any) => (s.id === editingId ? { ...s, ...formData } as Sport : s)));
    } else {
      const newId = sports.length > 0 ? Math.max(...sports.map((s: any) => s.id || 0)) + 1 : 1;
      const newSport: Sport = { id: newId, ...formData } as Sport;
      updateSports([...(sports as Sport[]), newSport]);
    }
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Sports Management</h1>
          <p className="text-st-text/70">Manage sports offered in the Sports Offered section</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
        >
          + Add Sport
        </button>
      </div>

      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-st-white mb-4">{editingId ? "Edit Sport" : "Add New Sport"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-st-text/90 mb-2">Sport Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                placeholder="Cricket"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-st-text/90 mb-2">Sport Image</label>
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
              {imageError && <p className="text-red-400 text-xs mt-1">{imageError}</p>}
              {imagePreview && (
                <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-white/20">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
              >
                {editingId ? "Update Sport" : "Add Sport"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map((sport: any) => (
          <div key={sport.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-[#FF6A3D] transition-all duration-300">
            <div className="aspect-video relative">
              <Image
                src={sport.image}
                alt={sport.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-st-white text-lg mb-3">{sport.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(sport)}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sport.id)}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


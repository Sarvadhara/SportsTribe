"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  fetchSports,
  createSport,
  updateSport,
  deleteSport,
  Sport,
} from "@/lib/sportsService";
import {
  fetchCommunityHighlights,
  createCommunityHighlight,
  updateCommunityHighlight,
  deleteCommunityHighlight,
  CommunityHighlight,
} from "@/lib/communityHighlightsService";
import { handleImageUpload } from "@/lib/imageUtils";

const sections = [
  {
    id: "hero",
    title: "Hero Section",
    description: "Manage the main hero section on the homepage",
    fields: [
      { name: "Main Title", type: "text", value: "SPORTSTRIBE UNITED" },
      { name: "Subtitle", type: "text", value: "UNITED" },
      { name: "Description", type: "textarea", value: "Join thousands of athletes and sports enthusiasts..." },
      { name: "CTA Button Text", type: "text", value: "Get Started" },
      { name: "Background Image", type: "file", value: "" },
    ],
  },
  {
    id: "featured-tournaments",
    title: "Featured Tournaments",
    description: "Manage featured tournaments displayed on homepage",
  },
  {
    id: "sports-offered",
    title: "Sports Offered",
    description: "Manage the sports carousel on homepage",
  },
  {
    id: "community-highlights",
    title: "Community Highlights",
    description: "Manage community highlights gallery",
  },
];

export default function HomePageManagement() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [highlights, setHighlights] = useState<CommunityHighlight[]>([]);
  const [isLoadingSports, setIsLoadingSports] = useState(true);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const [sportsError, setSportsError] = useState<string | null>(null);
  const [highlightsError, setHighlightsError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Sports form state
  const [showSportsForm, setShowSportsForm] = useState(false);
  const [editingSportId, setEditingSportId] = useState<number | string | null>(null);
  const [sportFormData, setSportFormData] = useState({ name: "", image: "" });
  const [sportImagePreview, setSportImagePreview] = useState<string>("");
  const [sportImageError, setSportImageError] = useState<string>("");
  
  // Highlights form state
  const [showHighlightsForm, setShowHighlightsForm] = useState(false);
  const [editingHighlightId, setEditingHighlightId] = useState<number | string | null>(null);
  const [highlightFormData, setHighlightFormData] = useState({
    title: "",
    mediaUrl: "",
    mediaType: "image" as "image" | "video",
    description: "",
    date: "",
  });
  const [highlightMediaPreview, setHighlightMediaPreview] = useState<string>("");
  const [highlightMediaError, setHighlightMediaError] = useState<string>("");

  useEffect(() => {
    async function loadSports() {
      try {
        setIsLoadingSports(true);
        setSportsError(null);
        const data = await fetchSports();
        setSports(data);
      } catch (error) {
        console.error("Failed to load sports:", error);
        setSportsError("Failed to load sports. Please check your Supabase connection.");
      } finally {
        setIsLoadingSports(false);
      }
    }

    async function loadHighlights() {
      try {
        setIsLoadingHighlights(true);
        setHighlightsError(null);
        const data = await fetchCommunityHighlights();
        setHighlights(data);
      } catch (error) {
        console.error("Failed to load community highlights:", error);
        setHighlightsError(
          "Failed to load community highlights. Please check your Supabase connection."
        );
      } finally {
        setIsLoadingHighlights(false);
      }
    }

    loadSports();
    loadHighlights();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert("Changes saved successfully!");
  };

  // Sports CRUD handlers
  const resetSportForm = () => {
    setEditingSportId(null);
    setSportFormData({ name: "", image: "" });
    setSportImagePreview("");
    setSportImageError("");
  };

  const handleEditSport = (sport: Sport) => {
    setEditingSportId(sport.id);
    setSportFormData({ name: sport.name, image: sport.image });
    setSportImagePreview(sport.image);
    setSportImageError("");
    setShowSportsForm(true);
  };

  const handleDeleteSport = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this sport?")) {
      return;
    }

    try {
      await deleteSport(id);
      setSports(sports.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete sport:", error);
      alert("Failed to delete sport. Please try again.");
    }
  };

  const handleSubmitSport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSportId) {
        const updated = await updateSport(editingSportId, sportFormData);
        setSports(sports.map((s) => (s.id === editingSportId ? updated : s)));
      } else {
        const newSport = await createSport(sportFormData);
        setSports([...sports, newSport]);
      }
      setShowSportsForm(false);
      resetSportForm();
    } catch (error: any) {
      console.error("Failed to save sport:", error);
      alert(error?.message || "Failed to save sport. Please try again.");
    }
  };

  // Highlights CRUD handlers
  const resetHighlightForm = () => {
    setEditingHighlightId(null);
    setHighlightFormData({ title: "", mediaUrl: "", mediaType: "image", description: "", date: "" });
    setHighlightMediaPreview("");
    setHighlightMediaError("");
  };

  const handleEditHighlight = (highlight: CommunityHighlight) => {
    setEditingHighlightId(highlight.id);
    setHighlightFormData({
      title: highlight.title,
      mediaUrl: highlight.mediaUrl,
      mediaType: highlight.mediaType,
      description: highlight.description || "",
      date: highlight.date || "",
    });
    setHighlightMediaPreview(highlight.mediaUrl);
    setHighlightMediaError("");
    setShowHighlightsForm(true);
  };

  const handleDeleteHighlight = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this highlight?")) {
      return;
    }

    try {
      await deleteCommunityHighlight(id);
      setHighlights(highlights.filter((h) => h.id !== id));
      alert("Highlight deleted successfully!");
    } catch (error) {
      console.error("Error deleting highlight:", error);
      alert("Error deleting highlight. Please try again.");
    }
  };

  const handleSubmitHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!highlightFormData.title.trim() || !highlightFormData.mediaUrl.trim()) {
      alert("Please fill in all required fields (Title and Media URL)");
      return;
    }
    
    try {
      let updatedHighlights: CommunityHighlight[];
      
      if (editingHighlightId) {
        const updated = await updateCommunityHighlight(editingHighlightId, {
          title: highlightFormData.title.trim(),
          mediaUrl: highlightFormData.mediaUrl.trim(),
          mediaType: highlightFormData.mediaType,
          description: highlightFormData.description?.trim() || undefined,
          date: highlightFormData.date?.trim() || undefined,
        });
        updatedHighlights = highlights.map((h) => (h.id === editingHighlightId ? updated : h));
      } else {
        const newHighlight = await createCommunityHighlight({
          title: highlightFormData.title.trim(),
          mediaUrl: highlightFormData.mediaUrl.trim(),
          mediaType: highlightFormData.mediaType,
          description: highlightFormData.description?.trim() || undefined,
          date: highlightFormData.date?.trim() || undefined,
        });
        updatedHighlights = [...highlights, newHighlight];
      }
      
      setHighlights(updatedHighlights);
      
      // Close form and reset
      setShowHighlightsForm(false);
      resetHighlightForm();
      
      // Show success message
      alert(editingHighlightId ? "Highlight updated successfully!" : "Highlight added successfully!");
    } catch (error) {
      console.error("Error saving highlight:", error);
      alert("Error saving highlight. Please try again.");
    }
  };

  const renderSectionContent = () => {
    if (activeSection === "sports-offered") {
      if (isLoadingSports) {
        return (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
            <p className="mt-4 text-st-text/70">Loading sports...</p>
          </div>
        );
      }

      if (sportsError) {
        return (
          <div className="text-center py-12 text-red-400">
            {sportsError}
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-st-white">Sports Offered</h2>
            <button
              onClick={() => { resetSportForm(); setShowSportsForm(true); }}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
            >
              + Add Sport
            </button>
          </div>

          {showSportsForm && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-st-white mb-4">{editingSportId ? "Edit Sport" : "Add New Sport"}</h3>
              <form onSubmit={handleSubmitSport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">Sport Name</label>
                  <input
                    type="text"
                    required
                    value={sportFormData.name}
                    onChange={(e) => setSportFormData({ ...sportFormData, name: e.target.value })}
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
                          setSportFormData({ ...sportFormData, image: base64 });
                          setSportImagePreview(base64);
                          setSportImageError("");
                        },
                        (error) => {
                          setSportImageError(error);
                          setSportImagePreview("");
                        }
                      );
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6A3D] file:text-white hover:file:bg-[#E94057] file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  />
                  {sportImageError && <p className="text-red-400 text-xs mt-1">{sportImageError}</p>}
                  {sportImagePreview && (
                    <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-white/20">
                      <Image src={sportImagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
                  >
                    {editingSportId ? "Update Sport" : "Add Sport"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSportsForm(false); resetSportForm(); }}
                    className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sport) => (
              <div key={sport.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-[#FF6A3D] transition-all duration-300">
                <div className="aspect-video relative">
                  <Image src={sport.image} alt={sport.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-st-white text-lg mb-3">{sport.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSport(sport)}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSport(sport.id)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {sports.length === 0 && (
              <div className="col-span-full text-center py-8 text-st-text/70">
                No sports added yet. Click "Add Sport" to get started.
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeSection === "community-highlights") {
      if (isLoadingHighlights) {
        return (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
            <p className="mt-4 text-st-text/70">Loading community highlights...</p>
          </div>
        );
      }

      if (highlightsError) {
        return (
          <div className="text-center py-12 text-red-400">
            {highlightsError}
          </div>
        );
      }
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-st-white">Community Highlights</h2>
            <button
              onClick={() => { resetHighlightForm(); setShowHighlightsForm(true); }}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
            >
              + Add Highlight
            </button>
          </div>

          {showHighlightsForm && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-st-white mb-4">{editingHighlightId ? "Edit Highlight" : "Add New Highlight"}</h3>
              <form onSubmit={handleSubmitHighlight} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={highlightFormData.title}
                    onChange={(e) => setHighlightFormData({ ...highlightFormData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder="Community Event Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">Media Type</label>
                  <select
                    value={highlightFormData.mediaType}
                    onChange={(e) => {
                      setHighlightFormData({ ...highlightFormData, mediaType: e.target.value as "image" | "video" });
                      setHighlightMediaPreview("");
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">
                    {highlightFormData.mediaType === "image" ? "Image" : "Video"} URL
                  </label>
                  <input
                    type="url"
                    required
                    value={highlightFormData.mediaUrl}
                    onChange={(e) => {
                      setHighlightFormData({ ...highlightFormData, mediaUrl: e.target.value });
                      setHighlightMediaPreview(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    placeholder={highlightFormData.mediaType === "image" ? "https://example.com/image.jpg" : "https://example.com/video.mp4"}
                  />
                  {highlightFormData.mediaType === "image" && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleImageUpload(
                          e,
                          (base64) => {
                            setHighlightFormData({ ...highlightFormData, mediaUrl: base64 });
                            setHighlightMediaPreview(base64);
                            setHighlightMediaError("");
                          },
                          (error) => {
                            setHighlightMediaError(error);
                            setHighlightMediaPreview("");
                          }
                        );
                      }}
                      className="w-full mt-2 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6A3D] file:text-white hover:file:bg-[#E94057] file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    />
                  )}
                  {highlightMediaError && <p className="text-red-400 text-xs mt-1">{highlightMediaError}</p>}
                  {highlightMediaPreview && (
                    <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-white/20">
                      {highlightFormData.mediaType === "image" ? (
                        <Image src={highlightMediaPreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <video src={highlightMediaPreview} className="w-full h-full object-cover" controls />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">Description (shown on hover)</label>
                  <textarea
                    value={highlightFormData.description}
                    onChange={(e) => setHighlightFormData({ ...highlightFormData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Description that appears when hovering over the highlight"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-st-text/90 mb-2">Date (optional)</label>
                  <input
                    type="date"
                    value={highlightFormData.date}
                    onChange={(e) => setHighlightFormData({ ...highlightFormData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
                  >
                    {editingHighlightId ? "Update Highlight" : "Add Highlight"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowHighlightsForm(false); resetHighlightForm(); }}
                    className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={`highlights-grid-${highlights.length}`}>
            {highlights.map((highlight) => (
              <div key={highlight.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-[#FF6A3D] transition-all duration-300">
                <div className="aspect-square relative">
                  {highlight.mediaType === "video" ? (
                    <video src={highlight.mediaUrl} className="w-full h-full object-cover" muted loop />
                  ) : (
                    <Image src={highlight.mediaUrl} alt={highlight.title} fill className="object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-st-white text-lg mb-1">{highlight.title}</h3>
                  {highlight.description && (
                    <p className="text-st-text/70 text-sm mb-2 line-clamp-2">{highlight.description}</p>
                  )}
                  {highlight.date && (
                    <p className="text-st-text/60 text-xs mb-3">{highlight.date}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditHighlight(highlight)}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteHighlight(highlight.id)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {highlights.length === 0 && (
              <div className="col-span-full text-center py-8 text-st-text/70">
                No highlights added yet. Click "Add Highlight" to get started.
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default section content
    return (
      <div className="space-y-4">
        {sections.find((s) => s.id === activeSection)?.fields?.map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-st-text/90 mb-2">{field.name}</label>
            {field.type === "textarea" ? (
              <textarea
                defaultValue={field.value}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                rows={4}
              />
            ) : field.type === "file" ? (
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6A3D] file:text-white hover:file:bg-[#E94057] transition-colors"
              />
            ) : (
              <input
                type={field.type}
                defaultValue={field.value}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
              />
            )}
          </div>
        )) || (
          <div className="text-st-text/70">
            <p>Manage {sections.find((s) => s.id === activeSection)?.title.toLowerCase()} content here.</p>
            <p className="text-sm mt-2">This section will allow you to add, edit, and delete items.</p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => setActiveSection(null)}
            className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Home Page Management</h1>
        <p className="text-st-text/70">Control all content displayed on the homepage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(activeSection === section.id ? null : section.id);
                  setShowSportsForm(false);
                  setShowHighlightsForm(false);
                  resetSportForm();
                  resetHighlightForm();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white"
                    : "bg-white/5 hover:bg-white/10 text-st-text/80 hover:text-st-white"
                }`}
              >
                <div className="font-medium">{section.title}</div>
                <div className="text-xs mt-1 opacity-75">{section.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeSection ? (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              {renderSectionContent()}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 flex items-center justify-center h-64">
              <p className="text-st-text/60">Select a section from the sidebar to manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchNews, createNews, updateNews, deleteNews, News } from "@/lib/newsService";
import { handleImageUpload } from "@/lib/imageUtils";

export default function NewsManagement() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  // Load news from Supabase on component mount
  useEffect(() => {
    async function loadNews() {
      try {
        setIsLoading(true);
        const data = await fetchNews();
        setNews(data);
      } catch (error) {
        console.error("Failed to load news:", error);
        alert("Failed to load news. Please check your Supabase connection.");
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, []);

  const handleEdit = (article: News) => {
    setEditingId(article.id);
    setFormData(article);
    setImagePreview(article.image || "");
    setImageError("");
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this news article?")) {
      return;
    }

    try {
      await deleteNews(id);
      setNews(news.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete news:", error);
      alert("Failed to delete news article. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const newsData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        image: formData.image,
      };

      if (editingId) {
        const updated = await updateNews(editingId, newsData);
        setNews(news.map((n) => (n.id === editingId ? updated : n)));
        setEditingId(null);
      } else {
        const newArticle = await createNews(newsData);
        setNews([...news, newArticle]);
      }

      setShowForm(false);
      setFormData({ title: "", description: "", date: "", image: "" });
      setImagePreview("");
      setImageError("");
    } catch (error: any) {
      console.error("Failed to save news:", error);
      const errorMessage = error?.message || "Failed to save news article. Please check your Supabase connection and try again.";
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
            <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">News Management</h1>
            <p className="text-st-text/70">Create, edit, and manage news articles</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4 text-st-text/70">Loading news articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">News Management</h1>
          <p className="text-st-text/70">Create, edit, and manage news articles</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: "", description: "", date: "", image: "" });
            setImagePreview("");
            setImageError("");
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
        >
          + Add News
        </button>
      </div>

      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-st-white mb-4">
            {editingId ? "Edit News Article" : "Add New News Article"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-st-text/90 mb-2">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                placeholder="News article title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-st-text/90 mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                placeholder="Article description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {isSubmitting ? "Saving..." : editingId ? "Update Article" : "Add Article"}
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
        {news.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-st-text/70">No news articles found. Create your first article to get started!</p>
          </div>
        ) : (
          news.slice().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((article) => (
          <div key={article.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-[#FF6A3D] transition-all duration-300">
            <div className="aspect-video relative">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-st-white text-lg mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-st-text/70 text-sm mb-3 line-clamp-2">{article.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-st-text/60">{new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
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


"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchNews, News } from "@/lib/newsService";
import NewsDetailModal from "@/components/NewsDetailModal";

export default function SportsNews() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number | string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadNews() {
      try {
        setIsLoading(true);
        const data = await fetchNews();
        // News is already sorted by date (newest first) from the service
        setNews(data);
      } catch (error) {
        console.error("Failed to load news:", error);
        // On error, set empty array to show "no news" message
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, []);

  const handleReadMore = (article: any) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12">
      <h1 className="text-4xl font-extrabold text-st-white">Sports News</h1>
      <p className="mt-2 text-st-text/85">Latest articles and updates.</p>
      
      {isLoading ? (
        <div className="mt-8 flex items-center justify-center py-20">
          <div className="text-st-text/70">Loading news articles...</div>
        </div>
      ) : news.length === 0 ? (
        <div className="mt-8 flex items-center justify-center py-20">
          <div className="text-st-text/70 text-center">
            <p className="text-lg mb-2">No news articles yet.</p>
            <p className="text-sm">Check back later for the latest sports updates!</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
          <article key={article.id} className="relative rounded-xl bg-white/5 border-l-4 border-l-[#E94057] overflow-hidden group hover:shadow-[0_4px_20px_rgba(233,64,87,0.3)] transition-all duration-300 backdrop-blur-sm">
            {/* Magazine-style category tag */}
            <div className="absolute top-4 left-0 bg-[#E94057] px-3 py-1 text-white text-xs font-bold z-10">
              NEWS
            </div>
            <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-[#1A063B] to-[#2C0C5B]">
              <Image
                src={imageErrors.has(article.id) ? "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop" : article.image}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImageErrors(prev => new Set([...prev, article.id]))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            <div className="p-6 bg-gradient-to-b from-white/10 to-transparent">
              <h3 className="font-bold text-st-white text-lg mb-2 leading-tight">{article.title}</h3>
              <p className="text-st-text/85 text-sm mb-4 line-clamp-2">{article.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-st-text/70 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
                <button 
                  onClick={() => handleReadMore(article)}
                  className="text-[#E94057] text-xs font-semibold hover:underline flex items-center gap-1 transition-all duration-300 hover:scale-105"
                >
                  Read More
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </article>
          ))}
        </div>
      )}

      {/* News Detail Modal */}
      <NewsDetailModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}



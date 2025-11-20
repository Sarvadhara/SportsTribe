"use client";
import Image from "next/image";
import { useEffect } from "react";

interface NewsDetailModalProps {
  article: {
    id: number | string;
    title: string;
    description: string;
    date: string;
    image: string;
    content?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsDetailModal({ article, isOpen, onClose }: NewsDetailModalProps) {
  // Handle body overflow and keyboard events
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicking the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Generate full article content if not provided
  const fullContent = article.content || `
    ${article.description}

    In a thrilling display of athletic excellence, this match showcased the very best that sports has to offer. The athletes demonstrated remarkable skill, determination, and sportsmanship throughout the event, creating an unforgettable experience for spectators and participants alike.

    The game was characterized by intense competition from start to finish. Both teams showed exceptional preparation and strategy, making every moment count. The crowd was electrified by the high-level performance and dramatic moments that unfolded throughout the competition.

    Key highlights included remarkable individual performances that stood out, strategic plays that shifted momentum, and moments of sheer brilliance that reminded everyone why we love sports. The commitment to excellence was evident in every play, every decision, and every effort made on the field.

    This event not only celebrated the current achievements but also set the stage for future competitions. The level of competition demonstrated here raises the bar for upcoming events and inspires the next generation of athletes to push their limits.

    As we reflect on this incredible display of sportsmanship and skill, we're reminded of the power of sports to bring people together, inspire greatness, and create lasting memories. This is what makes competitive sports truly special.
  `;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-start justify-center pt-24 md:pt-28 px-4 pb-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-4xl my-4 md:my-8 bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] rounded-2xl border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Enhanced Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-12 h-12 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] hover:from-[#FF8A65] hover:to-[#FF6A3D] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.6)] hover:scale-110 active:scale-95 group"
          aria-label="Close article"
        >
          <svg 
            className="w-6 h-6 text-white transition-transform group-hover:rotate-90" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Article Content */}
        <article className="overflow-y-auto max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative w-full h-80 md:h-96 rounded-t-2xl overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40"></div>
            
            {/* Article Header Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[#E94057] text-white text-xs font-bold uppercase rounded-full">
                  NEWS
                </span>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{article.date}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
                {article.title}
              </h1>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6 md:p-8 lg:p-10">
            {/* Article Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-st-text/90 text-base md:text-lg leading-relaxed space-y-4">
                {fullContent.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>

            {/* Article Footer */}
            <div className="mt-10 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6A3D] to-[#E94057] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">ST</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">SportsTribe Editorial</div>
                    <div className="text-st-text/70 text-sm">Published on {article.date}</div>
                  </div>
                </div>
                
                {/* Share Buttons */}
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}


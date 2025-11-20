"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminData } from "@/contexts/AdminDataContext";
import { fetchProducts, StoreProduct } from "@/lib/productsService";

export default function Store() {
  const { data } = useAdminData();
  const cachedProducts = data.products || [];
  const [products, setProducts] = useState<StoreProduct[]>(
    cachedProducts as StoreProduct[]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number | string>>(new Set());

  const handleAddToCart = (product: any) => {
    // Add to cart functionality
    alert(`${product.name} added to cart!`);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const remoteProducts = await fetchProducts();
        if (!isMounted) return;

        if (remoteProducts.length > 0) {
          setProducts(remoteProducts);
        } else {
          setProducts(cachedProducts as StoreProduct[]);
        }
      } catch (err) {
        console.error("Failed to load products from Supabase:", err);
        if (isMounted) {
          setError("Unable to load live products. Showing fallback data.");
          setProducts(cachedProducts as StoreProduct[]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [cachedProducts]);

  const accentColors = [
    { accent: "#FF6A3D", accentDark: "#E94057", light: "#FFE5DC", border: "#FF8A6B" },
    { accent: "#3B82F6", accentDark: "#2563EB", light: "#DBEAFE", border: "#60A5FA" },
    { accent: "#10B981", accentDark: "#059669", light: "#D1FAE5", border: "#34D399" },
    { accent: "#8B5CF6", accentDark: "#7C3AED", light: "#EDE9FE", border: "#A78BFA" },
    { accent: "#F59E0B", accentDark: "#D97706", light: "#FEF3C7", border: "#FBBF24" },
    { accent: "#EC4899", accentDark: "#DB2777", light: "#FCE7F3", border: "#F472B6" },
  ];

  const getAccentColor = (index: number) => {
    return accentColors[index % accentColors.length];
  };

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 py-12 relative min-h-[80vh]">
      <h1 className="text-4xl font-extrabold text-st-white relative z-0">Store</h1>
      <p className="mt-2 text-st-text/85 relative z-0">Official SportsTribe merchandise.</p>
      
      {error && (
        <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 text-center text-st-text/70 py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
          <p className="mt-4">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-0">
          {products.map((product, index) => {
            const colors = getAccentColor(index);
            const formattedStock =
              product.stock === null || product.stock === undefined
                ? "In stock"
                : product.stock > 0
                ? `${product.stock} available`
                : "Out of stock";
            return (
              <div 
                key={product.id} 
                className="relative group transform transition-all duration-500 hover:-translate-y-2"
              >
                {/* Card with stylish design */}
                <div
                  className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2"
                  style={{
                    background: "linear-gradient(160deg, #1A063B, #2C0C5B)",
                    borderColor: `${colors.accent}`,
                    boxShadow: `0 25px 45px -25px ${colors.accent}60`,
                  }}
                >
                  {/* Gradient border effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl"
                    style={{ 
                      padding: '4px',
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    }}
                  ></div>
                  
                  {/* Glow effect on hover */}
                  <div 
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                    style={{ backgroundColor: colors.accent }}
                  ></div>
                  
                  {/* Inner border - Dark Blue with gradient */}
                  <div className="absolute inset-[6px] rounded-xl border-2 border-[#1A063B] opacity-90 pointer-events-none"></div>
                  
                  {/* Main Content Area - White Background with subtle gradient */}
                  <div
                    className="relative rounded-2xl border px-0 py-0"
                    style={{
                      background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,248,255,0.9))",
                      borderColor: `${colors.accent}33`,
                    }}
                  >
                    {/* Decorative corner elements */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-bl-full"
                      style={{ background: `linear-gradient(135deg, ${colors.accent}, transparent)` }}
                    ></div>
                    
                    {/* Product Image Area */}
                    <div className="relative aspect-[5/4] p-2 bg-gradient-to-br from-gray-50 to-white">
                      <div className="relative w-full h-full">
                        <Image
                          src={imageErrors.has(product.id) ? "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop" : product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          onError={() => setImageErrors(prev => new Set([...prev, product.id]))}
                        />
                      </div>
                    </div>
                    
                    {/* Product Info Section */}
                    <div className="relative px-5 pb-4 space-y-2.5">
                      {/* Product Name */}
                      <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#9CA3AF] mb-1.5">Featured Product</p>
                        <h3 className="font-black text-[#111827] text-lg leading-tight">
                          {product.name}
                        </h3>
                      </div>

                      {/* Description */}
                      {product.description && (
                        <p className="text-sm text-[#4B5563] line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="inline-flex items-center gap-2 text-[#1F2937] bg-[#EEF2FF] px-3 py-1 rounded-full">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 9h18M3 15h18M3 21h18" />
                          </svg>
                          {formattedStock}
                        </span>
                      </div>

                      {/* CTA row */}
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-[0.65] relative overflow-hidden group/btn px-3 py-2.5 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
                          }}
                        >
                          <div
                            className="relative z-10 flex items-center justify-center gap-2 text-white font-semibold text-xs uppercase tracking-wide transition-all duration-300 group-hover/btn:shadow-lg"
                            style={{ boxShadow: `0 4px 15px rgba(${colors.accent === "#FF6A3D" ? "255,106,61" : colors.accent === "#3B82F6" ? "59,130,246" : "16,185,129"}, 0.3)` }}
                          >
                            <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Add to Cart</span>
                          </div>
                          <div
                            className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                            style={{
                              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                              animation: "shimmer 2s infinite",
                            }}
                          ></div>
                        </button>

                        <div
                          className="flex-[0.35] flex items-center justify-center px-3 py-2.5 rounded-lg text-white font-semibold text-sm"
                          style={{
                            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
                            boxShadow: `0 4px 15px rgba(${colors.accent === "#FF6A3D" ? "255,106,61" : colors.accent === "#3B82F6" ? "59,130,246" : "16,185,129"}, 0.25)`,
                          }}
                        >
                          {product.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 text-center text-st-text/70 py-12 relative z-0">
          <p>No products available yet.</p>
          <p className="text-sm text-st-text/50 mt-2">
            Visit again soon to explore the latest SportsTribe merchandise.
          </p>
        </div>
      )}
      
    </div>
  );
}



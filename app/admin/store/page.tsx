"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAdminData, Product } from "@/contexts/AdminDataContext";
import { handleImageUpload } from "@/lib/imageUtils";
import {
  fetchProducts,
  createProduct as createProductRemote,
  updateProduct as updateProductRemote,
  deleteProduct as deleteProductRemote,
  StoreProduct,
} from "@/lib/productsService";

export default function StoreManagement() {
  const { data, updateProducts } = useAdminData();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    stock: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  const mapStoreProductToContext = (product: StoreProduct): Product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description || "",
    stock:
      product.stock === null || product.stock === undefined
        ? ""
        : String(product.stock),
  });

  const mapContextToStoreProduct = (product: Product): StoreProduct => ({
    id: product.id as string,
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description || null,
    stock:
      product.stock !== undefined && product.stock !== "" && product.stock !== null
        ? Number(product.stock)
        : null,
  });

  const syncContextProducts = (items: StoreProduct[]) => {
    setProducts(items);
    updateProducts(items.map(mapStoreProductToContext));
  };

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsSyncing(true);
        setError(null);
        const remoteProducts = await fetchProducts();
        if (!isMounted) return;

        if (remoteProducts.length > 0) {
          syncContextProducts(remoteProducts);
        } else {
          const fallback = (data.products || []).map(mapContextToStoreProduct);
          setProducts(fallback);
        }
      } catch (err) {
        console.error("Failed to load products from Supabase:", err);
        if (isMounted) {
          setError("Unable to sync with Supabase. Using local data.");
          const fallback = (data.products || []).map(mapContextToStoreProduct);
          setProducts(fallback);
        }
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (product: any) => {
    setEditingId(product.id.toString());
    setFormData({ ...product, description: product.description || "", stock: product.stock || "" });
    setImagePreview(product.image || "");
    setImageError("");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProductRemote(id);
      const updated = products.filter((p) => p.id !== id);
      syncContextProducts(updated);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      price: formData.price.trim(),
      image: formData.image,
      description: formData.description?.trim() || null,
      stock:
        formData.stock !== "" && formData.stock !== null
          ? Number(formData.stock)
          : null,
    };

    if (!payload.name || !payload.price || !payload.image) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const updatedProduct = await updateProductRemote(editingId, payload);
        const updatedList = products.map((p) =>
          p.id === editingId ? updatedProduct : p
        );
        syncContextProducts(updatedList);
        setEditingId(null);
        alert("Product updated successfully!");
      } else {
        const createdProduct = await createProductRemote(payload);
        syncContextProducts([createdProduct, ...products]);
        alert("Product added successfully!");
      }

      setShowForm(false);
      setFormData({ name: "", price: "", image: "", description: "", stock: "" });
      setImagePreview("");
      setImageError("");
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Store Management</h1>
          <p className="text-st-text/70">Create, edit, and manage store products</p>
          {isSyncing && (
            <p className="text-xs text-st-text/60 mt-1 animate-pulse">Syncing with Supabase...</p>
          )}
          {error && (
            <p className="text-xs text-yellow-300 mt-1">{error}</p>
          )}
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", price: "", image: "", description: "", stock: "" });
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300"
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-st-white mb-4">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="SportsTribe Jersey"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Price</label>
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="₹ 1,299"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-st-text/90 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="100"
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-st-text/90 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                  placeholder="Product description"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-[#FF6A3D] transition-all duration-300">
            <div className="aspect-square relative bg-white/5 p-6">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-st-white text-lg mb-2">{product.name}</h3>
              <p className="text-[#FF6A3D] text-xl font-bold mb-3">{product.price}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id.toString())}
                  className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium"
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


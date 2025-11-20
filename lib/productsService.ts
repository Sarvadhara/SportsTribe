import { supabase } from "./supabaseClient";

export interface StoreProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  description?: string | null;
  stock?: number | null;
  created_at?: string;
  updated_at?: string;
}

type DbProductRow = {
  id: string;
  name: string;
  price: string;
  image: string;
  description?: string | null;
  stock?: number | null;
  created_at?: string;
  updated_at?: string;
};

type ProductInput = {
  name: string;
  price: string;
  image: string;
  description?: string | null;
  stock?: number | null;
};

function mapProductFromDB(row: DbProductRow): StoreProduct {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image,
    description: row.description ?? null,
    stock: row.stock ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapProductToDB(product: Partial<ProductInput>) {
  const payload: Record<string, any> = {};

  if (product.name !== undefined) payload.name = product.name;
  if (product.price !== undefined) payload.price = product.price;
  if (product.image !== undefined) payload.image = product.image;
  if (product.description !== undefined) payload.description = product.description;
  if (product.stock !== undefined && product.stock !== null) {
    payload.stock = Number.isFinite(product.stock) ? product.stock : null;
  } else if (product.stock === null) {
    payload.stock = null;
  }

  return payload;
}

export async function fetchProducts(): Promise<StoreProduct[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return (data || []).map(mapProductFromDB);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
}

export async function createProduct(input: ProductInput): Promise<StoreProduct> {
  try {
    const payload = mapProductToDB(input);
    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw error;
    }

    return mapProductFromDB(data as DbProductRow);
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<StoreProduct> {
  try {
    const payload = mapProductToDB(input);
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    return mapProductFromDB(data as DbProductRow);
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
}


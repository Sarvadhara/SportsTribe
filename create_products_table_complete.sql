-- =====================================================
-- COMPLETE SQL SCRIPT: STORE PRODUCTS TABLE
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Step 0: Drop table if you need a clean reset (optional)
DROP TABLE IF EXISTS products CASCADE;

-- Step 1: Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  stock INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Helpful indexes
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_name ON products(name);

-- Step 3: Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- Step 4: Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Step 5: Development-friendly RLS policies (tighten for production)
CREATE POLICY "Public read products" ON products
FOR SELECT USING (true);

CREATE POLICY "Public insert products" ON products
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update products" ON products
FOR UPDATE USING (true);

CREATE POLICY "Public delete products" ON products
FOR DELETE USING (true);

-- Step 6: Verification helpers
-- SELECT table_name, column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'products'
-- ORDER BY ordinal_position;

-- SELECT COUNT(*) AS total_products FROM products;


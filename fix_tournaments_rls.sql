-- Quick fix: Allow public access for testing (NOT recommended for production)
-- Run this in Supabase Dashboard > SQL Editor

-- Allow public INSERT (for testing only)
DROP POLICY IF EXISTS "Allow public insert" ON tournaments;
CREATE POLICY "Allow public insert" ON tournaments 
FOR INSERT WITH CHECK (true);

-- Allow public UPDATE (for testing only)
DROP POLICY IF EXISTS "Allow public update" ON tournaments;
CREATE POLICY "Allow public update" ON tournaments 
FOR UPDATE USING (true);

-- Allow public DELETE (for testing only)
DROP POLICY IF EXISTS "Allow public delete" ON tournaments;
CREATE POLICY "Allow public delete" ON tournaments 
FOR DELETE USING (true);

-- Note: For production, you should use authenticated user policies instead


-- =====================================================
-- COMPLETE SQL SCRIPT: COMMUNITIES + CHAT TABLES
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Step 0: Drop tables if you need a clean reset (optional)
DROP TABLE IF EXISTS community_memberships CASCADE;
DROP TABLE IF EXISTS community_messages CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- Step 1: Communities master table
CREATE TABLE communities (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  image_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Community messages table (admin/system broadcasts)
CREATE TABLE community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'system')),
  sender_name TEXT,
  message TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Optional memberships table (for tracking joins)
CREATE TABLE community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

-- Step 4: Helpful indexes
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX idx_community_messages_community_id ON community_messages(community_id);
CREATE INDEX idx_community_memberships_user ON community_memberships(user_id);

-- Step 5: Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_communities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_communities_updated_at
BEFORE UPDATE ON communities
FOR EACH ROW
EXECUTE FUNCTION update_communities_updated_at();

-- Step 6: Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;

-- Step 7: Development-friendly RLS policies (relax for prod)
CREATE POLICY "Public read communities" ON communities
FOR SELECT USING (true);

CREATE POLICY "Public write communities" ON communities
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read community messages" ON community_messages
FOR SELECT USING (true);

CREATE POLICY "Public write community messages" ON community_messages
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read memberships" ON community_memberships
FOR SELECT USING (true);

CREATE POLICY "Public write memberships" ON community_memberships
FOR ALL USING (true) WITH CHECK (true);

-- Step 8: Verification helpers
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('communities','community_messages','community_memberships');
-- SELECT COUNT(*) FROM communities;
-- SELECT COUNT(*) FROM community_messages;
-- SELECT COUNT(*) FROM community_memberships;


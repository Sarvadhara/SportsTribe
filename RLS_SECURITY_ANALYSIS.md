# 🔒 RLS Security Analysis & Implementation Plan

## 📋 Current Situation Analysis

### ✅ What You Have:
1. **Admin System**: Uses localStorage-based authentication (`localAuth.ts`)
2. **User Profiles**: Uses Supabase Auth (`auth.uid()`)
3. **All Tables**: Have RLS enabled but with **open policies** (`USING (true)`)
4. **Database**: Supabase PostgreSQL with proper structure

### ❌ Current Security Issues:
1. **Anyone can edit anyone's profile** - No ownership checks
2. **Anyone can create/delete tournaments, news, communities** - No admin checks
3. **No proper admin verification in database** - Admin check is only in frontend
4. **Users can access other users' data** - No privacy protection

---

## 🎯 Your Requirements:

### For Regular Users:
- ✅ Can **read** their own profile
- ✅ Can **edit** their own profile
- ❌ **Cannot** edit other users' profiles
- ❌ **Cannot** access other users' data without their login
- ✅ Can **read** public content (tournaments, news, communities, etc.)
- ❌ **Cannot** create/edit/delete admin-managed content

### For Admins:
- ✅ Can **manage everything**: tournaments, news, communities, live matches, sports, products
- ✅ Can **read all** user profiles
- ✅ Can **create/edit/delete** all content

---

## 🔧 What Needs to Be Implemented:

### Step 1: Add Admin Flag to User Profiles Table

**Problem**: Currently, admin status is only checked in frontend (localStorage). Database doesn't know who is admin.

**Solution**: Add `is_admin` column to `user_profiles` table.

```sql
-- Add is_admin column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for admin checks
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin) WHERE is_admin = TRUE;
```

### Step 2: Link Admin Users to Supabase Auth

**Problem**: Admin authentication uses localStorage, but RLS needs Supabase Auth user ID.

**Solution**: 
- Admins must also have Supabase Auth accounts
- Their `user_profiles` record must have `is_admin = TRUE`
- Their `user_id` in `user_profiles` must match their Supabase Auth `auth.uid()`

### Step 3: Create Helper Function for Admin Check in RLS

**Problem**: Need a reusable way to check if a user is admin in RLS policies.

**Solution**: Create a PostgreSQL function:

```sql
-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()::text
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 4: Update RLS Policies for Each Table

---

## 📊 Table-by-Table RLS Policy Requirements:

### 1. **user_profiles** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Public read user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public upsert user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public update user profiles" ON user_profiles;

-- Policy 1: Anyone can READ profiles (public directory)
CREATE POLICY "Public read profiles" ON user_profiles
FOR SELECT USING (true);

-- Policy 2: Users can INSERT their own profile (when creating account)
CREATE POLICY "Users can create own profile" ON user_profiles
FOR INSERT 
WITH CHECK (
  auth.uid()::text = user_id
);

-- Policy 3: Users can UPDATE only their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Policy 4: Admins can UPDATE any profile
CREATE POLICY "Admins can update any profile" ON user_profiles
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());
```

**Result**: 
- ✅ Users can only edit their own profile
- ✅ Admins can edit any profile
- ✅ Everyone can read profiles (public directory)

---

### 2. **tournaments** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Allow public read access" ON tournaments;
DROP POLICY IF EXISTS "Allow public insert" ON tournaments;
DROP POLICY IF EXISTS "Allow public update" ON tournaments;
DROP POLICY IF EXISTS "Allow public delete" ON tournaments;

-- Policy 1: Anyone can READ tournaments (public viewing)
CREATE POLICY "Public read tournaments" ON tournaments
FOR SELECT USING (true);

-- Policy 2: Only admins can CREATE tournaments
CREATE POLICY "Admins can create tournaments" ON tournaments
FOR INSERT 
WITH CHECK (is_admin_user());

-- Policy 3: Only admins can UPDATE tournaments
CREATE POLICY "Admins can update tournaments" ON tournaments
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 4: Only admins can DELETE tournaments
CREATE POLICY "Admins can delete tournaments" ON tournaments
FOR DELETE 
USING (is_admin_user());
```

**Result**: 
- ✅ Public can view tournaments
- ✅ Only admins can create/edit/delete

---

### 3. **news** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Allow public read access" ON news;
DROP POLICY IF EXISTS "Allow public insert" ON news;
DROP POLICY IF EXISTS "Allow public update" ON news;
DROP POLICY IF EXISTS "Allow public delete" ON news;

-- Policy 1: Anyone can READ news
CREATE POLICY "Public read news" ON news
FOR SELECT USING (true);

-- Policy 2: Only admins can CREATE news
CREATE POLICY "Admins can create news" ON news
FOR INSERT 
WITH CHECK (is_admin_user());

-- Policy 3: Only admins can UPDATE news
CREATE POLICY "Admins can update news" ON news
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 4: Only admins can DELETE news
CREATE POLICY "Admins can delete news" ON news
FOR DELETE 
USING (is_admin_user());
```

---

### 4. **communities** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Public read communities" ON communities;
DROP POLICY IF EXISTS "Public write communities" ON communities;

-- Policy 1: Anyone can READ communities
CREATE POLICY "Public read communities" ON communities
FOR SELECT USING (true);

-- Policy 2: Only admins can CREATE communities
CREATE POLICY "Admins can create communities" ON communities
FOR INSERT 
WITH CHECK (is_admin_user());

-- Policy 3: Only admins can UPDATE communities
CREATE POLICY "Admins can update communities" ON communities
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 4: Only admins can DELETE communities
CREATE POLICY "Admins can delete communities" ON communities
FOR DELETE 
USING (is_admin_user());
```

---

### 5. **community_messages** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Public read community messages" ON community_messages;
DROP POLICY IF EXISTS "Public write community messages" ON community_messages;

-- Policy 1: Anyone can READ messages (public viewing)
CREATE POLICY "Public read messages" ON community_messages
FOR SELECT USING (true);

-- Policy 2: Only admins can CREATE messages
CREATE POLICY "Admins can create messages" ON community_messages
FOR INSERT 
WITH CHECK (is_admin_user());

-- Policy 3: Only admins can UPDATE messages
CREATE POLICY "Admins can update messages" ON community_messages
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 4: Only admins can DELETE messages
CREATE POLICY "Admins can delete messages" ON community_messages
FOR DELETE 
USING (is_admin_user());
```

---

### 6. **community_memberships** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Public read memberships" ON community_memberships;
DROP POLICY IF EXISTS "Public write memberships" ON community_memberships;

-- Policy 1: Users can READ their own memberships
CREATE POLICY "Users can read own memberships" ON community_memberships
FOR SELECT USING (auth.uid()::text = user_id);

-- Policy 2: Admins can READ all memberships
CREATE POLICY "Admins can read all memberships" ON community_memberships
FOR SELECT USING (is_admin_user());

-- Policy 3: Users can CREATE their own membership (join community)
CREATE POLICY "Users can join communities" ON community_memberships
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Policy 4: Users can UPDATE their own membership
CREATE POLICY "Users can update own membership" ON community_memberships
FOR UPDATE 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Policy 5: Admins can UPDATE any membership
CREATE POLICY "Admins can update any membership" ON community_memberships
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 6: Users can DELETE their own membership (leave community)
CREATE POLICY "Users can leave communities" ON community_memberships
FOR DELETE 
USING (auth.uid()::text = user_id);

-- Policy 7: Admins can DELETE any membership
CREATE POLICY "Admins can delete any membership" ON community_memberships
FOR DELETE 
USING (is_admin_user());
```

---

### 7. **live_matches** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Allow public read access" ON live_matches;
DROP POLICY IF EXISTS "Allow public insert" ON live_matches;
DROP POLICY IF EXISTS "Allow public update" ON live_matches;
DROP POLICY IF EXISTS "Allow public delete" ON live_matches;

-- Policy 1: Anyone can READ live matches
CREATE POLICY "Public read live matches" ON live_matches
FOR SELECT USING (true);

-- Policy 2: Only admins can CREATE live matches
CREATE POLICY "Admins can create live matches" ON live_matches
FOR INSERT 
WITH CHECK (is_admin_user());

-- Policy 3: Only admins can UPDATE live matches
CREATE POLICY "Admins can update live matches" ON live_matches
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 4: Only admins can DELETE live matches
CREATE POLICY "Admins can delete live matches" ON live_matches
FOR DELETE 
USING (is_admin_user());
```

---

### 8. **sports** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Allow public read access" ON sports;
DROP POLICY IF EXISTS "Allow public insert" ON sports;
DROP POLICY IF EXISTS "Allow public update" ON sports;
DROP POLICY IF EXISTS "Allow public delete" ON sports;

-- Policy 1: Anyone can READ sports
CREATE POLICY "Public read sports" ON sports
FOR SELECT USING (true);

-- Policy 2: Only admins can CREATE sports
CREATE POLICY "Admins can create sports" ON sports
FOR INSERT 
WITH CHECK (is_admin_user());

-- Policy 3: Only admins can UPDATE sports
CREATE POLICY "Admins can update sports" ON sports
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 4: Only admins can DELETE sports
CREATE POLICY "Admins can delete sports" ON sports
FOR DELETE 
USING (is_admin_user());
```

---

### 9. **players** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Allow public read access" ON players;
DROP POLICY IF EXISTS "Allow public insert" ON players;
DROP POLICY IF EXISTS "Allow public update" ON players;
DROP POLICY IF EXISTS "Allow public delete" ON players;

-- Policy 1: Anyone can READ players (public directory)
CREATE POLICY "Public read players" ON players
FOR SELECT USING (true);

-- Policy 2: Users can CREATE their own player profile
CREATE POLICY "Users can create own player" ON players
FOR INSERT 
WITH CHECK (
  auth.uid()::text = user_id OR is_admin_user()
);

-- Policy 3: Users can UPDATE their own player profile
CREATE POLICY "Users can update own player" ON players
FOR UPDATE 
USING (
  auth.uid()::text = user_id OR is_admin_user()
)
WITH CHECK (
  auth.uid()::text = user_id OR is_admin_user()
);

-- Policy 4: Admins can UPDATE any player
-- (Already covered in Policy 3, but explicit for clarity)

-- Policy 5: Users can DELETE their own player profile
CREATE POLICY "Users can delete own player" ON players
FOR DELETE 
USING (
  auth.uid()::text = user_id OR is_admin_user()
);
```

---

### 10. **products** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Public insert products" ON products;
DROP POLICY IF EXISTS "Public update products" ON products;
DROP POLICY IF EXISTS "Public delete products" ON products;

-- Policy 1: Anyone can READ products (store is public)
CREATE POLICY "Public read products" ON products
FOR SELECT USING (true);

-- Policy 2: Only admins can CREATE products
CREATE POLICY "Admins can create products" ON products
FOR INSERT 
WITH CHECK (is_admin_user());

-- Policy 3: Only admins can UPDATE products
CREATE POLICY "Admins can update products" ON products
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 4: Only admins can DELETE products
CREATE POLICY "Admins can delete products" ON products
FOR DELETE 
USING (is_admin_user());
```

---

### 11. **community_highlights** Table

**Current Policy**: `USING (true)` - Anyone can do anything ❌

**Required Policies**:

```sql
-- Drop existing open policies
DROP POLICY IF EXISTS "Allow public read access" ON community_highlights;
DROP POLICY IF EXISTS "Allow public insert" ON community_highlights;
DROP POLICY IF EXISTS "Allow public update" ON community_highlights;
DROP POLICY IF EXISTS "Allow public delete" ON community_highlights;

-- Policy 1: Anyone can READ highlights
CREATE POLICY "Public read highlights" ON community_highlights
FOR SELECT USING (true);

-- Policy 2: Only admins can CREATE highlights
CREATE POLICY "Admins can create highlights" ON community_highlights
FOR INSERT 
WITH CHECK (is_admin_user());

-- Policy 3: Only admins can UPDATE highlights
CREATE POLICY "Admins can update highlights" ON community_highlights
FOR UPDATE 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Policy 4: Only admins can DELETE highlights
CREATE POLICY "Admins can delete highlights" ON community_highlights
FOR DELETE 
USING (is_admin_user());
```

---

## 🚀 Implementation Steps:

### Step 1: Add Admin Column to user_profiles
```sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin 
ON user_profiles(is_admin) WHERE is_admin = TRUE;
```

### Step 2: Create Admin Check Function
```sql
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()::text
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Mark Existing Admins
```sql
-- Update admin users (replace 'admin@example.com' with actual admin emails)
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE email IN ('admin@sportstribe.com', 'your-admin@email.com');
```

### Step 4: Apply RLS Policies
Run all the policy updates shown above for each table.

### Step 5: Update Admin Authentication
- Ensure admins log in via Supabase Auth (not just localStorage)
- Their `user_profiles.user_id` must match `auth.uid()`
- Set `is_admin = TRUE` for admin accounts

---

## ⚠️ Important Notes:

1. **Admin Authentication**: Admins must use Supabase Auth, not just localStorage
2. **User ID Matching**: `user_profiles.user_id` must match `auth.uid()::text`
3. **Testing**: Test each policy after implementation
4. **Backup**: Backup database before making changes
5. **Migration**: Existing admin users need to be marked in database

---

## ✅ Expected Results After Implementation:

### For Regular Users:
- ✅ Can view all public content (tournaments, news, communities, etc.)
- ✅ Can read all user profiles (public directory)
- ✅ Can edit ONLY their own profile
- ✅ Can create/update their own player profile
- ✅ Can join/leave communities
- ❌ Cannot edit other users' profiles
- ❌ Cannot create/edit/delete tournaments, news, communities, etc.

### For Admins:
- ✅ Can do everything
- ✅ Can manage all content
- ✅ Can edit any user profile
- ✅ Can create/edit/delete tournaments, news, communities, live matches, etc.

---

## 📝 Next Steps:

1. Review this analysis
2. Create the SQL migration script
3. Test in development environment
4. Apply to production
5. Update admin authentication flow to use Supabase Auth


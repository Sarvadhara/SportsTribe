# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the public anon key)

## Step 2: Create Environment Variables File

Create a `.env.local` file in the `sportstribe-web` directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace the placeholders with your actual Supabase credentials.

## Step 3: Verify Your Tournament Table Structure

Make sure your `tournaments` table in Supabase has the following columns (or compatible ones):

- `id` (uuid or bigint, primary key)
- `name` (text)
- `date` (date or timestamp)
- `time` (time, optional)
- `location` (text)
- `venue` (text, optional)
- `image` (text, URL)
- `status` (text: 'active', 'upcoming', 'completed')
- `description` (text, optional)
- `rules` (text, optional)
- `prize_pool` (text, optional) - Note: snake_case in DB
- `max_participants` (integer, optional) - Note: snake_case in DB
- `registration_deadline` (date, optional) - Note: snake_case in DB
- `contact_info` (text, optional) - Note: snake_case in DB
- `registration_fee` (text, optional) - Note: snake_case in DB
- `created_at` (timestamp, auto)
- `updated_at` (timestamp, auto)

## Step 4: Set Up Row Level Security (RLS)

In your Supabase dashboard:

1. Go to **Authentication** → **Policies**
2. Select your `tournaments` table
3. Create a policy for SELECT (public read access):

```sql
CREATE POLICY "Allow public read access" ON tournaments
FOR SELECT USING (true);
```

4. For INSERT/UPDATE/DELETE, create policies based on your authentication needs:
   - For authenticated users only:
   ```sql
   CREATE POLICY "Allow authenticated users to insert" ON tournaments
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   CREATE POLICY "Allow authenticated users to update" ON tournaments
   FOR UPDATE USING (auth.role() = 'authenticated');
   
   CREATE POLICY "Allow authenticated users to delete" ON tournaments
   FOR DELETE USING (auth.role() = 'authenticated');
   ```

   - Or for admin-only access, you can create a custom role check or use service role key (not recommended for client-side)

## Step 5: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   - `/tournaments` - Should display tournaments from Supabase
   - `/admin/tournaments` - Should allow you to create, edit, and delete tournaments

3. Check the browser console for any errors

## Troubleshooting

### Error: "Failed to fetch tournaments"
- Check that your `.env.local` file exists and has the correct values
- Verify your Supabase project URL and anon key are correct
- Make sure RLS policies allow SELECT operations

### Error: "Failed to save tournament"
- Check RLS policies allow INSERT/UPDATE operations
- Verify all required fields are provided
- Check browser console for specific error messages

### Column name mismatches
- The service automatically maps between snake_case (database) and camelCase (app)
- If you have different column names, update `lib/tournamentsService.ts`

## Notes

- The `.env.local` file is already in `.gitignore` and won't be committed
- Never commit your actual Supabase credentials to version control
- For production, set these environment variables in your hosting platform (Vercel, Netlify, etc.)


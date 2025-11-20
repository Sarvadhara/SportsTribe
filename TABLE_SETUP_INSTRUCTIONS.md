# Tournaments Table Setup Instructions

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Create the Table

1. Open the file `create_tournaments_table_complete.sql` from your project
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

You should see: **"Success. No rows returned"** - This means the table was created successfully!

## Step 3: Verify the Table Was Created

1. In Supabase Dashboard, click on **Table Editor** in the left sidebar
2. You should now see **tournaments** in the list of tables
3. Click on it to see the table structure

OR

1. Run the verification script `verify_tournaments_table.sql` in SQL Editor
2. It will show you:
   - ✅ If the table exists
   - All columns and their types
   - RLS policies
   - Row count

## Step 4: Test Your Application

1. Make sure your `.env.local` file has the correct Supabase credentials
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Go to `/admin/tournaments` in your app
4. Try creating a new tournament
5. It should work now! 🎉

## Table Structure

The tournaments table has the following columns:

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| id | UUID | Yes | Primary key (auto-generated) |
| name | TEXT | Yes | Tournament name |
| date | DATE | Yes | Tournament date |
| time | TIME | No | Tournament time |
| location | TEXT | Yes | Location |
| venue | TEXT | No | Venue name |
| image | TEXT | Yes | Image URL |
| status | TEXT | Yes | 'active', 'upcoming', or 'completed' |
| description | TEXT | No | Description |
| rules | TEXT | No | Rules and regulations |
| prize_pool | TEXT | No | Prize pool information |
| max_participants | INTEGER | No | Maximum participants |
| registration_deadline | DATE | No | Registration deadline |
| contact_info | TEXT | No | Contact information |
| registration_fee | TEXT | No | Registration fee |
| created_at | TIMESTAMP | Auto | Creation timestamp |
| updated_at | TIMESTAMP | Auto | Last update timestamp |

## Security Note

⚠️ **Important**: The current setup allows **public access** to all operations (read, insert, update, delete). This is fine for testing, but for production you should:

1. Implement authentication
2. Update RLS policies to restrict access
3. Only allow authenticated/admin users to modify tournaments

## Troubleshooting

### Error: "relation 'tournaments' does not exist"
- The table wasn't created. Run the `create_tournaments_table_complete.sql` script again.

### Error: "permission denied"
- RLS policies might not be set up correctly. Re-run the creation script.

### Error: "column does not exist"
- The table structure doesn't match. Drop the table and recreate it using the complete script.

### Still having issues?
1. Check the browser console (F12) for detailed error messages
2. Verify your `.env.local` file has correct credentials
3. Make sure you're running the SQL script in the correct Supabase project


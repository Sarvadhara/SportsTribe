# Players Table Setup Instructions

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Create the Table

1. Open the file `create_players_table_complete.sql` from your project
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

You should see: **"Success. No rows returned"** - This means the table was created successfully!

## Step 3: Verify the Table Was Created

1. In Supabase Dashboard, click on **Table Editor** in the left sidebar
2. You should now see **players** in the list of tables
3. Click on it to see the table structure

OR

1. Run the verification script `verify_players_table.sql` in SQL Editor
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
3. Go to `/admin/players` in your app
4. Try creating a new player
5. It should work now! 🎉

## Table Structure

The players table has the following columns:

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| id | UUID | Yes | Primary key (auto-generated) |
| name | TEXT | Yes | Player name |
| city | TEXT | Yes | City |
| state | TEXT | Yes | State |
| sport | TEXT | Yes | Sport name |
| image | TEXT | Yes | Profile image URL |
| matches_played | INTEGER | No | Number of matches played |
| age | INTEGER | No | Player age |
| position | TEXT | No | Player position/role |
| bio | TEXT | No | Player biography |
| email | TEXT | No | Email address |
| phone | TEXT | No | Phone number |
| user_id | TEXT | No | Unique user ID for tracking |
| created_at | TIMESTAMP | Auto | Creation timestamp |
| updated_at | TIMESTAMP | Auto | Last update timestamp |

## Column Name Mapping

The application uses **camelCase** (e.g., `matchesPlayed`, `userId`) but the database uses **snake_case** (e.g., `matches_played`, `user_id`). When you create a players service (similar to tournaments), you'll need to map between these formats.

## Indexes Created

The table includes indexes on:
- `sport` - For filtering by sport
- `city` - For filtering by city
- `state` - For filtering by state
- `user_id` - For finding players by user ID
- `created_at` - For sorting by creation date

## Security Note

⚠️ **Important**: The current setup allows **public access** to all operations (read, insert, update, delete). This is fine for testing, but for production you should:

1. Implement authentication
2. Update RLS policies to restrict access
3. Only allow authenticated/admin users to modify players
4. Consider allowing users to only update their own player profile (using `user_id`)

## Troubleshooting

### Error: "relation 'players' does not exist"
- The table wasn't created. Run the `create_players_table_complete.sql` script again.

### Error: "permission denied"
- RLS policies might not be set up correctly. Re-run the creation script.

### Error: "column does not exist"
- The table structure doesn't match. Drop the table and recreate it using the complete script.

### Still having issues?
1. Check the browser console (F12) for detailed error messages
2. Verify your `.env.local` file has correct credentials
3. Make sure you're running the SQL script in the correct Supabase project

## Next Steps

After creating the table, you'll want to:
1. Create a `playersService.ts` file (similar to `tournamentsService.ts`)
2. Update the admin players page to use Supabase
3. Update the public players page to fetch from Supabase
4. Implement proper error handling


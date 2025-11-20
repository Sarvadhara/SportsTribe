/**
 * Test Supabase Connection
 * 
 * This file helps you verify that your Supabase connection is working.
 * Run this in your browser console or create a test page to use it.
 */

import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase Connection...");
  
  // Check if environment variables are set
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || url === "" || url.includes("your_supabase")) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL is not set or is empty!");
    return false;
  }
  
  if (!key || key === "" || key.includes("your_supabase")) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or is empty!");
    return false;
  }
  
  console.log("✅ Environment variables are set");
  console.log("📡 Testing connection to Supabase...");
  
  try {
    // Test basic connection by getting the current user (will be null if not logged in, but connection should work)
    const { data, error } = await supabase.auth.getUser();
    
    if (error && error.message.includes("Invalid API key")) {
      console.error("❌ Connection failed: Invalid API key");
      return false;
    }
    
    if (error && error.message.includes("Invalid URL")) {
      console.error("❌ Connection failed: Invalid URL");
      return false;
    }
    
    // If we get here, connection is working (even if user is null)
    console.log("✅ Supabase connection successful!");
    console.log("📊 Current user:", data?.user || "Not logged in (this is OK)");
    return true;
    
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);
    return false;
  }
}

// Test database connection (if you have tables)
export async function testDatabaseConnection() {
  console.log("🔍 Testing Database Connection...");
  
  try {
    // Try to query a simple table (this will fail if no tables exist, but that's OK)
    // Replace 'test_table' with an actual table name when you create one
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.log("⚠️  No tables found yet - this is OK if you haven't created tables");
        console.log("💡 You can create tables in Supabase Dashboard → Table Editor");
        return true; // Connection works, just no tables
      }
      console.error("❌ Database query failed:", error.message);
      return false;
    }
    
    console.log("✅ Database connection successful!");
    return true;
    
  } catch (error: any) {
    console.error("❌ Database test failed:", error.message);
    return false;
  }
}





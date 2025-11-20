"use client";
import { supabase } from "./supabaseClient";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

// Check if user is admin (simplified - in production, use proper role-based access)
export async function checkAdminAccess(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    // For now, check if user email contains admin or specific admin emails
    // In production, this should check a user roles table
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
    const userEmail = user.email?.toLowerCase() || "";
    
    return adminEmails.includes(userEmail) || userEmail.includes("admin@");
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      role: "admin"
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}


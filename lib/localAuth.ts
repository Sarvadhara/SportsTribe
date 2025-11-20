"use client";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

// Simple local authentication using localStorage
const ADMIN_KEY = "sportstribe_admin_user";
const ADMIN_SESSION_KEY = "sportstribe_admin_session";
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Default admin credentials (for demo purposes)
const DEFAULT_ADMIN = {
  email: "admin@sportstribe.com",
  password: "admin123",
};

export function login(email: string, password: string): Promise<AdminUser> {
  return new Promise((resolve, reject) => {
    // For demo: accept default admin or any email that contains "admin"
    if (
      (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) ||
      email.toLowerCase().includes("admin") ||
      email.toLowerCase().endsWith("@admin.com")
    ) {
      const user: AdminUser = {
        id: `admin_${Date.now()}`,
        email: email,
        role: "admin",
      };

      const sessionData = {
        active: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + SESSION_TIMEOUT,
      };

      // Save user to localStorage
      localStorage.setItem(ADMIN_KEY, JSON.stringify(user));
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      
      resolve(user);
    } else {
      reject(new Error("Invalid credentials. Use admin@sportstribe.com / admin123 or any email containing 'admin'"));
    }
  });
}

export function logout(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.error("Error during logout:", error);
  }
}

export function getCurrentUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  
  try {
    const userStr = localStorage.getItem(ADMIN_KEY);
    const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);

    if (!userStr || !sessionStr) {
      return null;
    }

    // Check session validity
    if (sessionStr !== "active") {
      try {
        const sessionData = JSON.parse(sessionStr);
        if (!sessionData.active || (sessionData.expiresAt && Date.now() > sessionData.expiresAt)) {
          return null;
        }
      } catch {
        // Invalid session format
        return null;
      }
    }

    const user = JSON.parse(userStr);
    
    // Validate user object structure
    if (!user || !user.email || !user.role) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export function checkAdminAccess(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const user = getCurrentUser();
    if (!user) {
      return false;
    }

    const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
    
    if (!sessionStr) {
      return false;
    }

    // Check if session is still valid (handle both old format "active" and new format with expiration)
    if (sessionStr === "active") {
      // Legacy format - still valid, but migrate it
      const sessionData = {
        active: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + SESSION_TIMEOUT,
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      return true;
    }

    try {
      const sessionData = JSON.parse(sessionStr);
      
      // Check if session has expired
      if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
        // Session expired
        logout();
        return false;
      }
      
      // Check if session is active
      if (!sessionData.active) {
        return false;
      }
      
      return true;
    } catch {
      // Invalid session format
      return false;
    }
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
}

// Check if user is currently logged in
export function isAuthenticated(): boolean {
  return checkAdminAccess();
}


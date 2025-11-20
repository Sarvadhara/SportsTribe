"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/localAuth";
import { AdminUser } from "@/lib/localAuth";
import Logo from "@/components/Logo";

interface AdminHeaderProps {
  user: AdminUser | null;
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

export default function AdminHeader({ user, onMenuClick, sidebarOpen = true }: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // Clear state before redirecting
    setShowDropdown(false);
    router.push("/admin/login");
    router.refresh(); // Force refresh to clear auth state
  };

  return (
    <header className={`sticky top-0 z-40 bg-[#1A063B]/95 backdrop-blur-lg border-b border-white/10 h-16 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-0"}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 text-st-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:block">
          <Logo size="sm" variant="header" showTagline={false} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6A3D] to-[#E94057] flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="hidden md:block text-st-white font-medium">{user?.email || "Admin"}</span>
            <svg className="w-4 h-4 text-st-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-[#2C0C5B]/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-medium text-st-white">{user?.email}</p>
                  <p className="text-xs text-st-text/60 mt-1">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


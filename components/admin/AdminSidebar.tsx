"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/home", label: "Home Page", icon: "🏠" },
  { href: "/admin/tournaments", label: "Tournaments", icon: "🏆" },
  { href: "/admin/registrations", label: "Registrations", icon: "📝" },
  { href: "/admin/sports", label: "Sports Offered", icon: "⚽" },
  { href: "/admin/players", label: "Players & Teams", icon: "👥" },
  { href: "/admin/communities", label: "Communities", icon: "👨‍👩‍👧‍👦" },
  { href: "/admin/news", label: "News", icon: "📰" },
  { href: "/admin/live", label: "Live Matches", icon: "🔴" },
  { href: "/admin/store", label: "Store", icon: "🛍️" },
  { href: "/admin/users", label: "Users", icon: "👤" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#1A063B]/95 to-[#2C0C5B]/95 backdrop-blur-lg border-r border-white/10 z-[60] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 overflow-y-auto`}
      >
        <div className="p-4 pt-20">
          <div className="mb-6 px-2">
            <h2 className="text-xl font-bold text-st-white mb-1">Admin Panel</h2>
            <p className="text-xs text-st-text/60">SportsTribe Control Center</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white shadow-lg shadow-[#FF6A3D]/30"
                      : "text-st-text/80 hover:bg-white/10 hover:text-st-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/10">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-st-text/80 hover:bg-white/10 hover:text-st-white transition-all duration-200"
            >
              <span className="text-xl">🌐</span>
              <span className="font-medium">View Website</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}


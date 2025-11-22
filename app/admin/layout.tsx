"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminDataProvider } from "@/contexts/AdminDataContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

// Temporary mock user for testing
const mockUser = {
  id: "temp-admin",
  email: "admin@test.com",
  role: "admin"
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Skip layout on login page
  const isLoginPage = pathname === "/admin/login";
  if (isLoginPage) {
    return <>{children}</>;
  }

  // TEMPORARY: Direct access to admin dashboard without authentication
  // TODO: Implement proper authentication with whitelist system
  return (
    <AdminDataProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex flex-col">
        <AdminHeader user={mockUser} onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="flex flex-1">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-0"} p-6 md:p-8`}>
            {children}
          </main>
        </div>
      </div>
    </AdminDataProvider>
  );
}

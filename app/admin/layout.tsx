"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { checkAdminAccess, getCurrentUser, AdminUser } from "@/lib/localAuth";
import { AdminDataProvider } from "@/contexts/AdminDataContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Skip auth check on login page
  const isLoginPage = pathname === "/admin/login";

  const verifyAuth = useCallback(() => {
    // Skip verification on login page
    if (isLoginPage) {
      setIsChecking(false);
      setIsAuthenticated(false);
      return;
    }

    // Ensure we're on client side
    if (typeof window === "undefined") {
      return;
    }

    try {
      const hasAccess = checkAdminAccess();
      
      if (!hasAccess) {
        setIsAuthenticated(false);
        setIsChecking(false);
        router.push("/admin/login");
        return;
      }
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setIsAuthenticated(false);
        setIsChecking(false);
        router.push("/admin/login");
        return;
      }

      setUser(currentUser);
      setIsAuthenticated(true);
      setIsChecking(false);
    } catch (error) {
      console.error("Auth verification error:", error);
      setIsAuthenticated(false);
      setIsChecking(false);
      router.push("/admin/login");
    }
  }, [router, isLoginPage]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Periodic session check - verify every 30 seconds
  useEffect(() => {
    if (isLoginPage || !isAuthenticated) return;

    const interval = setInterval(() => {
      const hasAccess = checkAdminAccess();
      if (!hasAccess) {
        router.push("/admin/login");
      } else {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoginPage, router]);

  // Handle storage events for logout from other tabs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sportstribe_admin_session" || e.key === "sportstribe_admin_user") {
        if (isLoginPage) return;
        const hasAccess = checkAdminAccess();
        if (!hasAccess) {
          router.push("/admin/login");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router, isLoginPage]);

  if (isChecking || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D] mb-4"></div>
          <div className="text-white text-xl">Verifying access...</div>
        </div>
      </div>
    );
  }

  // Don't render layout on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminDataProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex flex-col">
        <AdminHeader user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
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


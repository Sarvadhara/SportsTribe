"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, checkAdminAccess } from "@/lib/localAuth";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasAccess = checkAdminAccess();
      if (hasAccess) {
        router.push("/admin");
      } else {
        setChecking(false);
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Small delay to ensure localStorage is saved
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push("/admin");
      router.refresh(); // Force refresh to update auth state
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D] mb-4"></div>
          <div className="text-white text-xl">Checking authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A063B] via-[#2C0C5B] to-[#1A063B] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-st-white mb-2">Admin Panel</h1>
          <p className="text-st-text/70">Sign in to manage your website</p>
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              <strong>Default Login:</strong> admin@sportstribe.com / admin123
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Or use any email containing "admin" with any password
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-st-text/90 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                placeholder="admin@sportstribe.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-st-text/90 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-st-text/70 hover:text-st-white text-sm transition-colors">
              ← Back to Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


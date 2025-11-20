"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Force dynamic rendering to skip static generation during build
export const dynamic = 'force-dynamic';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<{
    loading: boolean;
    connected: boolean;
    message: string;
    user: any;
  }>({
    loading: true,
    connected: false,
    message: "",
    user: null,
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus({ ...status, loading: true });

    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || url === "" || url.includes("your_supabase")) {
      setStatus({
        loading: false,
        connected: false,
        message: "❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local",
        user: null,
      });
      return;
    }

    if (!key || key === "" || key.includes("your_supabase")) {
      setStatus({
        loading: false,
        connected: false,
        message: "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local",
        user: null,
      });
      return;
    }

    try {
      // Test connection by getting current user
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        if (error.message.includes("Invalid API key")) {
          setStatus({
            loading: false,
            connected: false,
            message: "❌ Invalid API key. Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY",
            user: null,
          });
          return;
        }
        if (error.message.includes("Invalid URL")) {
          setStatus({
            loading: false,
            connected: false,
            message: "❌ Invalid URL. Please check your NEXT_PUBLIC_SUPABASE_URL",
            user: null,
          });
          return;
        }
      }

      // Connection successful!
      setStatus({
        loading: false,
        connected: true,
        message: "✅ Supabase connection successful!",
        user: data?.user || null,
      });
    } catch (error: any) {
      setStatus({
        loading: false,
        connected: false,
        message: `❌ Connection failed: ${error.message}`,
        user: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A063B] to-[#2C0C5B] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Supabase Connection Test
        </h1>

        <div className="space-y-4">
          {/* Environment Variables Check */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-2">
              Environment Variables
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-400" : "text-red-400"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-400" : "text-red-400"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set"}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-2">
              Connection Status
            </h2>
            {status.loading ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                <span>Testing connection...</span>
              </div>
            ) : (
              <div className={`text-lg font-semibold ${status.connected ? "text-green-400" : "text-red-400"}`}>
                {status.message}
              </div>
            )}
          </div>

          {/* User Info */}
          {status.connected && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-2">
                Current User
              </h2>
              <p className="text-gray-300 text-sm">
                {status.user
                  ? `Logged in as: ${status.user.email || status.user.id}`
                  : "Not logged in (this is OK - connection works!)"}
              </p>
            </div>
          )}

          {/* Instructions */}
          {!status.connected && (
            <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/50">
              <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                Setup Instructions
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                <li>Create a file named <code className="bg-black/30 px-1 rounded">.env.local</code> in the <code className="bg-black/30 px-1 rounded">sportstribe-web</code> folder</li>
                <li>Add these lines (replace with your actual values):
                  <pre className="bg-black/30 p-2 rounded mt-2 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here`}
                  </pre>
                </li>
                <li>Restart your dev server (stop with Ctrl+C, then run <code className="bg-black/30 px-1 rounded">npm run dev</code> again)</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}

          {/* Retry Button */}
          <button
            onClick={testConnection}
            className="w-full bg-gradient-to-r from-[#E94057] to-[#7A1FA2] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Test Connection Again
          </button>

          {/* Success Message */}
          {status.connected && (
            <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/50">
              <p className="text-green-400 font-semibold">
                🎉 Great! Your Supabase connection is working!
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Next steps: Create database tables and start using Supabase in your app.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





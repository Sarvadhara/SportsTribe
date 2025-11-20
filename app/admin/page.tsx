"use client";
import Link from "next/link";
import { useAdminData } from "@/contexts/AdminDataContext";

export default function AdminDashboard() {
  const { data } = useAdminData();
  
  const stats = [
    { label: "Total Tournaments", value: data.tournaments.length.toString(), icon: "🏆", color: "from-[#FF6A3D] to-[#E94057]", href: "/admin/tournaments" },
    { label: "Active Players", value: data.players.length.toString(), icon: "👥", color: "from-[#7A1FA2] to-[#9333EA]", href: "/admin/players" },
    { label: "Communities", value: data.communities.length.toString(), icon: "👨‍👩‍👧‍👦", color: "from-[#3B82F6] to-[#06B6D4]", href: "/admin/communities" },
    { label: "News Articles", value: data.news.length.toString(), icon: "📰", color: "from-[#F59E0B] to-[#D97706]", href: "/admin/news" },
    { label: "Live Matches", value: data.liveMatches.length.toString(), icon: "🔴", color: "from-red-600 to-red-500", href: "/admin/live" },
    { label: "Store Products", value: data.products.length.toString(), icon: "🛍️", color: "from-green-600 to-green-500", href: "/admin/store" },
  ];

  const recentActivities = [
    { action: "New tournament created", item: "Cricket Premier League", time: "2 hours ago" },
    { action: "News article published", item: "World Cup Finals Update", time: "5 hours ago" },
    { action: "Player profile updated", item: "Rahul Sharma", time: "1 day ago" },
    { action: "Community created", item: "Football Mumbai", time: "2 days ago" },
    { action: "Store product added", item: "SportsTribe Jersey", time: "3 days ago" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Dashboard</h1>
        <p className="text-st-text/70">Welcome back! Here's what's happening with your website.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:border-[#FF6A3D] hover:shadow-[0_0_25px_rgba(255,106,61,0.3)] transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-st-text/70 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-st-white">{stat.value}</p>
              </div>
              <div className={`text-4xl bg-gradient-to-br ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-st-text/60 group-hover:text-[#FF6A3D] transition-colors">
              <span>View all</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-st-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A3D]/20 to-[#E94057]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-st-white font-medium">{activity.action}</p>
                <p className="text-sm text-st-text/70 mt-1">{activity.item}</p>
              </div>
              <span className="text-xs text-st-text/60">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-st-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/tournaments?action=create"
            className="bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white px-4 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 text-center"
          >
            + Add Tournament
          </Link>
          <Link
            href="/admin/news?action=create"
            className="bg-gradient-to-r from-[#7A1FA2] to-[#9333EA] text-white px-4 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(122,31,162,0.5)] transition-all duration-300 text-center"
          >
            + Add News
          </Link>
          <Link
            href="/admin/players?action=create"
            className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white px-4 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 text-center"
          >
            + Add Player
          </Link>
          <Link
            href="/admin/communities?action=create"
            className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-4 py-3 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-300 text-center"
          >
            + Add Community
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // TODO: Implement proper user fetching with admin authentication
      // This will fetch from user_profiles table with proper admin access
      
      // For now, showing mock data
      setUsers([
        {
          id: "1",
          email: "user1@example.com",
          created_at: new Date().toISOString(),
          role: "user",
        },
        {
          id: "2",
          email: "user2@example.com",
          created_at: new Date().toISOString(),
          role: "user",
        },
        {
          id: "3",
          email: "user3@example.com",
          created_at: new Date().toISOString(),
          role: "user",
        },
      ]);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // In production, this would update the user's role in the database
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    alert(`User role updated to ${newRole}`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      // In production, this would delete the user from the database
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-st-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Users Management</h1>
          <p className="text-st-text/70">Manage website users and their roles</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
        />
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-st-text/70">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A3D] to-[#E94057] flex items-center justify-center text-white font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-st-white">{user.email.split("@")[0]}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-st-text/80">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || "user"}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-st-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-st-text/80 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-300 text-sm">
          <strong>Note:</strong> This is a demo interface. In production, user management would require proper
          authentication, authorization, and database integration with Supabase.
        </p>
      </div>
    </div>
  );
}


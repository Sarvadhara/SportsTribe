"use client";
import { useAdminData } from "@/contexts/AdminDataContext";

export default function RegistrationsAdminPage() {
  const { data, updateRegistrations } = useAdminData();
  const registrations = data.registrations || [];

  const setStatus = (id: string, status: "confirmed" | "rejected") => {
    const updated = registrations.map((r) => (r.id === id ? { ...r, status } : r));
    updateRegistrations(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Approvals</h1>
          <p className="text-st-text/70">Approve tournament registrations submitted by community members</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-st-white">Tournament Registrations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Tournament</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-st-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-st-text/70">No registrations yet.</td>
                </tr>
              ) : (
                registrations
                  .slice()
                  .reverse()
                  .map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-st-white font-medium">{r.userName || "User"}</div>
                      <div className="text-xs text-st-text/70 break-all">{r.userEmail || r.userId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-st-white font-medium">{r.tournamentName}</div>
                      <div className="text-xs text-st-text/70">ID: {r.tournamentId}</div>
                    </td>
                    <td className="px-6 py-4 text-st-text/80">{new Date(r.registrationDate).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : r.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {r.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setStatus(r.id, "confirmed")} className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium">Approve</button>
                          <button onClick={() => setStatus(r.id, "rejected")} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium">Reject</button>
                        </div>
                      ) : (
                        <span className="text-st-text/60 text-sm">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



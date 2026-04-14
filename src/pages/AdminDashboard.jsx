import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_ngos: 0,
    pending_ngos: 0,
    active_ngos: 0,
    total_volunteers: 0
  });
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ngosRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/organizations?status_filter=pending")
      ]);
      setStats(statsRes.data);
      setPendingNGOs(ngosRes.data);
    } catch (err) {
      setError("Failed to fetch admin data. Check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await API.post(`/admin/organizations/${id}/approve`);
      // Update local state instead of refetching everything
      setPendingNGOs(prev => prev.filter(ngo => ngo.id !== id));
      setStats(prev => ({
        ...prev,
        pending_ngos: prev.pending_ngos - 1,
        active_ngos: prev.active_ngos + 1
      }));
    } catch (err) {
      alert("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this organization? it will be deleted.")) return;
    setActionLoading(id);
    try {
      await API.post(`/admin/organizations/${id}/reject`);
      setPendingNGOs(prev => prev.filter(ngo => ngo.id !== id));
      setStats(prev => ({
        ...prev,
        pending_ngos: prev.pending_ngos - 1,
        total_ngos: prev.total_ngos - 1
      }));
    } catch (err) {
      alert("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-inter text-on_surface">
      {/* 🔝 HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-surface_highest sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primaryGradient rounded-xl shadow-lg ring-4 ring-primary/10 flex items-center justify-center text-white font-black">SS</div>
             <span className="text-xl font-outfit font-black tracking-tighter">ADMIN <span className="text-primary">PORTAL</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">System Admin</p>
              <p className="text-[10px] text-on_surface_variant uppercase tracking-widest font-black">Global Access</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 rounded-xl bg-surface_highest text-on_surface_variant hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* 📊 STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total NGOs" value={stats.total_ngos} icon="corporate_fare" color="bg-blue-500" />
          <StatCard title="Pending" value={stats.pending_ngos} icon="pending_actions" color="bg-amber-500" pulse />
          <StatCard title="Active NGOs" value={stats.active_ngos} icon="verified" color="bg-green-500" />
          <StatCard title="Volunteers" value={stats.total_volunteers} icon="groups" color="bg-primary" />
        </div>

        {/* 🏢 PENDING NGOS LIST */}
        <section className="bg-white rounded-3xl shadow-soft border border-surface_highest overflow-hidden">
          <div className="p-8 border-b border-surface_highest flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-outfit font-black mb-1">Pending Approvals</h2>
              <p className="text-sm text-on_surface_variant">Recent organization registration requests</p>
            </div>
            <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest ring-1 ring-amber-100">
              {pendingNGOs.length} Awaiting
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface_lowest text-[10px] uppercase font-black tracking-widest text-on_surface_variant">
                <tr>
                  <th className="px-8 py-4">Organization</th>
                  <th className="px-8 py-4">Contact Info</th>
                  <th className="px-8 py-4">Registered On</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface_highest">
                <AnimatePresence>
                  {pendingNGOs.map((ngo) => (
                    <motion.tr 
                      key={ngo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-surface_lowest transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="font-bold text-on_surface text-lg">{ngo.name}</div>
                        <div className="text-xs text-on_surface_variant flex items-center gap-1">
                           <span className="material-symbols-outlined text-xs">fingerprint</span> NGO ID: {ngo.id}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-on_surface_variant">
                            <span className="material-symbols-outlined text-sm">mail</span> {ngo.contact_email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-on_surface_variant">
                            <span className="material-symbols-outlined text-sm">call</span> {ngo.contact_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium">
                          {new Date(ngo.created_at).toLocaleDateString(undefined, {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            disabled={actionLoading === ngo.id}
                            onClick={() => handleApprove(ngo.id)}
                            className="h-10 px-6 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
                          >
                            {actionLoading === ngo.id ? "..." : "Approve"}
                          </button>
                          <button 
                            disabled={actionLoading === ngo.id}
                            onClick={() => handleReject(ngo.id)}
                            className="h-10 px-6 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            {actionLoading === ngo.id ? "..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {pendingNGOs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="mb-4 text-primary opacity-20 transform scale-150">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                      </div>
                      <h3 className="text-lg font-bold text-on_surface">No Pending Requests</h3>
                      <p className="text-sm text-on_surface_variant">All clear! Check back later for new registrations.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, pulse = false }) => (
  <div className="bg-white p-6 rounded-3xl shadow-soft border border-surface_highest flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-black text-on_surface_variant uppercase tracking-widest">{title}</p>
      <div className="flex items-center gap-2">
         <h4 className="text-3xl font-outfit font-black">{value}</h4>
         {pulse && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>}
      </div>
    </div>
  </div>
);

export default AdminDashboard;

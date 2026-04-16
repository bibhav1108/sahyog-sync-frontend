import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "active"
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchOrgs();
  }, [activeTab]);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/organizations?status_filter=${activeTab}`);
      setOrganizations(res.data);
    } catch (err) {
      console.error("Failed to fetch organizations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await API.post(`/admin/organizations/${id}/approve`);
      setOrganizations(prev => prev.filter(org => org.id !== id));
    } catch (err) {
      alert("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure? This will permanently delete the registration.")) return;
    setActionLoading(id);
    try {
      await API.post(`/admin/organizations/${id}/reject`);
      setOrganizations(prev => prev.filter(org => org.id !== id));
    } catch (err) {
      alert("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
      {/* 🚀 HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black tracking-tight">Organization Hub</h1>
          <p className="text-sm text-on_surface_variant">Manage and verify non-profit across the platform.</p>
        </div>
        
        <div className="relative group max-w-md w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on_surface_variant transition-colors group-focus-within:text-primary">search</span>
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-surface_highest focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium shadow-soft"
          />
        </div>
      </div>

      {/* 📑 TABS */}
      <div className="flex p-1.5 bg-surface_lowest rounded-2xl w-fit border border-surface_highest shadow-inner">
        {[
          { id: "pending", label: "Pending Approval", icon: "pending_actions" },
          { id: "active", label: "Active Organizations", icon: "verified" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? "bg-white text-primary shadow-soft scale-[1.02]" 
                : "text-on_surface_variant hover:text-on_surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🏢 CONTENT */}
      <div className="bg-white rounded-[2rem] border border-surface_highest shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface_lowest/50 text-[10px] uppercase font-black tracking-widest text-on_surface_variant border-b border-surface_highest">
              <tr>
                <th className="px-8 py-5">General Information</th>
                <th className="px-8 py-5">Contact Details</th>
                <th className="px-8 py-5">Status & Time</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface_highest">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="4" className="px-8 py-4">
                      <Skeleton height={60} className="rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredOrgs.map((org) => (
                    <motion.tr 
                      key={org.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group hover:bg-surface_lowest/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-surface_highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined">{activeTab === 'active' ? 'corporate_fare' : 'hourglass_empty'}</span>
                            </div>
                            <div>
                                <div className="font-black text-on_surface text-lg leading-tight">{org.name}</div>
                                <div className="text-[10px] font-black uppercase tracking-tighter text-on_surface_variant">ID: #{org.id}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-on_surface_variant">
                            <span className="material-symbols-outlined text-xs">mail</span> {org.contact_email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-on_surface_variant">
                            <span className="material-symbols-outlined text-xs">call</span> {org.contact_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeTab === 'active' ? 'text-green-500' : 'text-amber-500'}`}>
                                {org.status}
                            </div>
                            <div className="text-xs text-on_surface_variant">
                                Joined {new Date(org.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                           {activeTab === 'pending' ? (
                             <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  disabled={actionLoading === org.id}
                                  onClick={() => handleApprove(org.id)}
                                  className="px-6 py-2.5 bg-primaryGradient text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                  {actionLoading === org.id && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                  {actionLoading === org.id ? "Working..." : "Approve"}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  disabled={actionLoading === org.id}
                                  onClick={() => handleReject(org.id)}
                                  className="px-6 py-2.5 bg-white text-red-500 border border-red-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                >
                                  Reject
                                </motion.button>
                             </>
                           ) : (
                             <button className="p-2.5 bg-surface_highest text-on_surface_variant rounded-xl hover:text-primary transition-colors">
                               <span className="material-symbols-outlined">more_vert</span>
                             </button>
                           )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!loading && filteredOrgs.length === 0 && (
                 <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                        <span className="material-symbols-outlined text-4xl text-on_surface_variant/20 mb-4 block">empty_dashboard</span>
                        <h3 className="text-sm font-bold text-on_surface">No results found</h3>
                        <p className="text-xs text-on_surface_variant">Try a different search or change the active tab.</p>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrganizations;

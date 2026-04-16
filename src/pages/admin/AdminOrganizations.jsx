import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

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

  const skeletonLayout = [
    { type: 'stack', gap: 4, items: Array(5).fill({ 
      type: 'row', 
      className: "items-center justify-between py-6 px-4 bg-surface_lowest/50 rounded-2xl", 
      cols: [
        { type: 'row', className: "w-1/3 gap-4", cols: [ { type: 'rect', width: 48, height: 48, className: "rounded-2xl" }, { type: 'stack', items: [{ type: 'text', width: 120 }, { type: 'text', width: 60 }] } ] },
        { type: 'stack', className: "w-1/4", items: [{ type: 'text', width: 150 }, { type: 'text', width: 120 }] },
        { type: 'stack', className: "w-1/6", items: [{ type: 'text', width: 80 }, { type: 'text', width: 60 }] },
        { type: 'rect', width: 100, height: 40, className: "rounded-xl" }
      ]
    }) }
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
      {/* 🚀 HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black tracking-tight">Organization Hub</h1>
          <p className="text-sm text-on_surface_variant border-l-2 border-primary pl-3 ml-1 mt-1 font-medium">
             Consolidated verification and management console
          </p>
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
        {loading ? (
            <div className="p-10">
                <SkeletonStructure layout={skeletonLayout} />
            </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface_lowest/50 text-[10px] uppercase font-black tracking-widest text-on_surface_variant border-b border-surface_highest">
                  <tr>
                    <th className="px-8 py-5">Organization</th>
                    <th className="px-8 py-5">Contact</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface_highest">
                  <AnimatePresence mode="popLayout">
                    {filteredOrgs.map((org) => (
                      <motion.tr 
                        key={org.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group hover:bg-surface_lowest/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-surface_highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined">corporate_fare</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-on_surface text-lg leading-tight">{org.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-on_surface_variant">System ID: #{org.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-on_surface_variant">{org.contact_email}</p>
                                <p className="text-[10px] font-medium text-on_surface_variant opacity-60 uppercase">{org.contact_phone}</p>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest inline-block ${org.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                {org.status.toUpperCase()}
                            </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {activeTab === 'pending' ? (
                               <div className="flex items-center justify-end gap-2">
                                   <button 
                                      onClick={() => handleApprove(org.id)}
                                      disabled={actionLoading === org.id}
                                      className="h-9 px-5 bg-primaryGradient text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                   >
                                      {actionLoading === org.id ? "..." : "Approve"}
                                   </button>
                                   <button 
                                      onClick={() => handleReject(org.id)}
                                      disabled={actionLoading === org.id}
                                      className="h-9 px-5 bg-white text-red-500 border border-red-50 border-b-red-100 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all"
                                   >
                                      Reject
                                   </button>
                               </div>
                           ) : (
                               <div className="text-emerald-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-end gap-1">
                                   <span className="material-symbols-outlined text-sm">verified</span>
                                   ACTIVE PORTAL
                               </div>
                           )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-surface_highest">
                <AnimatePresence mode="popLayout">
                    {filteredOrgs.map((org) => (
                        <motion.div 
                            key={org.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                       {org.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-on_surface leading-tight">{org.name}</h4>
                                        <p className="text-[10px] font-bold text-on_surface_variant uppercase opacity-40">System ID: #{org.id}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${org.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {org.status.toUpperCase()}
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-on_surface_variant">{org.contact_email}</p>
                                <p className="text-[10px] font-medium text-on_surface_variant opacity-60 uppercase">{org.contact_phone}</p>
                            </div>

                            {activeTab === 'pending' && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleApprove(org.id)}
                                        disabled={actionLoading === org.id}
                                        className="flex-1 py-3 bg-primaryGradient text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleReject(org.id)}
                                        disabled={actionLoading === org.id}
                                        className="flex-1 py-3 bg-white text-red-500 border border-red-50 text-[10px] font-black uppercase tracking-widest rounded-xl"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredOrgs.length === 0 && (
                <div className="py-20 text-center text-on_surface_variant border-t border-surface_highest">
                    <span className="material-symbols-outlined text-4xl mb-4 block opacity-20">empty_dashboard</span>
                    <h3 className="text-sm font-bold">No results found</h3>
                    <p className="text-xs">Try a different search or change the active tab.</p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrganizations;

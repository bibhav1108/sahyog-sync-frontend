import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("VERIFICATION_REQUESTED"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [checks, setChecks] = useState({ docs: false, identity: false });

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

  const handleReview = async (id) => {
    try {
      setActionLoading(id);
      const res = await API.get(`/admin/organizations/${id}`);
      setSelectedOrg(res.data);
      setShowDetailModal(true);
    } catch (err) {
      alert("Failed to load details");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await API.post(`/admin/organizations/${id}/approve`);
      setOrganizations(prev => prev.filter(org => org.id !== id));
      setShowDetailModal(false);
    } catch (err) {
      alert("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this registration?")) return;
    try {
      setActionLoading(id);
      await API.post(`/admin/organizations/${id}/reject`);
      setOrganizations(prev => prev.filter(org => org.id !== id));
      setShowDetailModal(false);
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
      {/* HEADER & SEARCH */}
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

      {/* TABS */}
      <div className="flex p-1.5 bg-surface_lowest rounded-2xl w-fit border border-surface_highest shadow-inner overflow-x-auto max-w-full">
        {[
          { id: "VERIFICATION_REQUESTED", label: "Verification Requested", icon: "pending_actions" },
          { id: "APPROVED", label: "Active", icon: "verified" },
          { id: "REJECTED", label: "Rejected", icon: "cancel" },
          { id: "DRAFT", label: "Drafts", icon: "edit_note" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
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

      {/* CONTENT */}
      <div className="bg-white rounded-[2rem] border border-surface_highest shadow-soft overflow-hidden">
        {loading ? (
            <div className="p-10">
                <SkeletonStructure layout={[{ type: 'stack', gap: 4, items: Array(5).fill({ type: 'rect', height: 80, className: "rounded-2xl" }) }]} />
            </div>
        ) : (
          <div className="overflow-x-auto">
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-surface_lowest/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-surface_highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined">corporate_fare</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-on_surface text-lg leading-tight">{org.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-on_surface_variant">ID: #{org.id}</p>
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
                            <StatusBadge status={org.status} />
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button 
                              onClick={() => handleReview(org.id)}
                              disabled={actionLoading === org.id}
                              className="h-9 px-5 bg-white border border-surface_highest text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-surface_lowest transition-all"
                           >
                              {actionLoading === org.id ? "..." : "Review Details"}
                           </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredOrgs.length === 0 && <EmptyState />}
          </div>
        )}
      </div>

      {/* DETAIL MODAL (PORTALED) */}
      {showDetailModal && selectedOrg && createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 font-outfit">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => {
                        setShowDetailModal(false);
                        setChecks({ docs: false, identity: false });
                    }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-[95vw] max-w-7xl h-[92vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                >
                <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                    <div className="flex justify-between items-center bg-surface_high/30 p-8 rounded-[2.5rem] border border-on_surface/5">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-3xl bg-primaryGradient text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-4xl">corporate_fare</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-4xl font-black text-on_surface tracking-tight">{selectedOrg.name}</h2>
                                    <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{selectedOrg.status.replace('_', ' ')}</span>
                                </div>
                                <p className="text-on_surface_variant font-bold uppercase tracking-widest text-xs opacity-60">NGO Application Profile • ID #{selectedOrg.id}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setShowDetailModal(false);
                                setChecks({ docs: false, identity: false });
                            }} 
                            className="w-12 h-12 rounded-2xl bg-white border border-on_surface/5 flex items-center justify-center hover:bg-surface_high transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* NGO INFO */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">NGO Details</h3>
                            </div>
                            <div className="space-y-6">
                                <DetailField label="Type of NGO" value={selectedOrg.ngo_type} />
                                <DetailField label="Registration #" value={selectedOrg.registration_number} />
                                <DetailField label="PAN Card Number" value={selectedOrg.pan_number} />
                                <DetailField label="Darpan ID" value={selectedOrg.ngo_darpan_id || "Not Provided"} />
                            </div>
                        </div>

                        {/* ADMIN INFO */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">person</span>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Main Admin Person</h3>
                            </div>
                            <div className="space-y-6">
                                <DetailField label="Full Name" value={selectedOrg.admin_name} />
                                <DetailField label="Phone Number" value={selectedOrg.admin_phone} />
                                <DetailField label="ID Proof Type" value={selectedOrg.id_proof_type} />
                                <DetailField label="ID Card Number" value={selectedOrg.id_proof_number} />
                            </div>
                        </div>

                        {/* ADDRESS */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Office Location</h3>
                            </div>
                            <div className="space-y-6">
                                <DetailField label="Address" value={selectedOrg.office_address} />
                                <div className="p-6 bg-surface_high rounded-3xl border border-on_surface/5 space-y-4 shadow-inner">
                                    <p className="text-xs font-medium text-on_surface_variant leading-relaxed italic">
                                        Check all the details carefully. Once you approve, they can start using the portal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-10 border-t border-on_surface/5">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary">file_present</span>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Uploaded Documents</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {selectedOrg.documents?.map(doc => (
                                <a 
                                    key={doc.id} 
                                    href={doc.document_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-6 bg-surface_lowest rounded-[2rem] border border-surface_highest hover:border-primary transition-all flex flex-col gap-4 group shadow-sm hover:shadow-lg"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-on_surface_variant group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                        <span className="material-symbols-outlined text-2xl">description</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-on_surface leading-tight mb-1">{doc.document_type.replace('_', ' ')}</p>
                                        <p className="text-[9px] font-bold text-primary flex items-center gap-1 uppercase">Open File</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MODAL ACTIONS */}
                <div className="p-10 bg-surface_lowest border-t border-surface_highest flex flex-col md:flex-row items-center gap-10 shrink-0 shadow-inner">
                    <div className="flex flex-col gap-4 flex-1">
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={checks.docs}
                                onChange={e => setChecks({...checks, docs: e.target.checked})}
                                className="w-6 h-6 rounded-lg border-2 border-primary/20 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className="text-sm font-bold text-on_surface group-hover:text-primary transition-colors">I have checked all the uploaded documents</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={checks.identity}
                                onChange={e => setChecks({...checks, identity: e.target.checked})}
                                className="w-6 h-6 rounded-lg border-2 border-primary/20 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className="text-sm font-bold text-on_surface group-hover:text-primary transition-colors">I confirm all the information is correct</span>
                        </label>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => {
                                handleReject(selectedOrg.id);
                                setChecks({ docs: false, identity: false });
                            }}
                            className="px-8 py-5 bg-white text-red-500 border-2 border-red-500/10 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">cancel</span>
                            Reject
                        </button>
                        <button 
                            onClick={() => {
                                handleApprove(selectedOrg.id);
                                setChecks({ docs: false, identity: false });
                            }}
                            disabled={!checks.docs || !checks.identity || (actionLoading === selectedOrg.id)}
                            className="px-12 py-5 bg-primaryGradient text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">verified</span>
                            {actionLoading === selectedOrg.id ? "Working..." : "Approve NGO"}
                        </button>
                    </div>
                </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

const DetailField = ({ label, value }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/60 ml-1">{label}</p>
        <p className="px-4 py-3 bg-surface_high text-sm font-bold text-on_surface rounded-xl border border-on_surface/5">{value || "N/A"}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    const config = {
        VERIFICATION_REQUESTED: { bg: "bg-amber-500", text: "text-white", label: "PENDING REVIEW" },
        APPROVED: { bg: "bg-emerald-500", text: "text-white", label: "ACTIVE" },
        REJECTED: { bg: "bg-red-500", text: "text-white", label: "REJECTED" },
        DRAFT: { bg: "bg-on_surface/10", text: "text-on_surface_variant", label: "DRAFT" }
    }[status] || { bg: "bg-on_surface/5", text: "text-on_surface_variant", label: status };

    return (
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest inline-block ${config.bg} ${config.text}`}>
            {config.label}
        </div>
    );
};

const EmptyState = () => (
    <div className="py-20 text-center text-on_surface_variant">
        <span className="material-symbols-outlined text-4xl mb-4 block opacity-20">inventory_2</span>
        <h3 className="text-sm font-bold">No records found</h3>
        <p className="text-xs">Organizations matching this status will appear here.</p>
    </div>
);

export default AdminOrganizations;

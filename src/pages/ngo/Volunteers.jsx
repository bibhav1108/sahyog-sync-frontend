import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import VerificationBadge from "../../components/shared/VerificationBadge";
import { resolveProfileImage, handleImageError } from "../../utils/imageUtils";
import { useToast } from "../../context/ToastContext";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import DataRow from "../../components/shared/DataRow";
import ActionInput from "../../components/shared/ActionInput";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import Modal from "../../components/shared/Modal";

const Volunteers = () => {
  const [activeTab, setActiveTab] = useState("members"); // "members" or "requests"
  const [volunteers, setVolunteers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    zone: "",
    skills: "",
  });

  useEffect(() => {
    if (activeTab === "members") {
      loadVolunteers(true);
    } else {
      loadRequests();
    }
  }, [activeTab]);

  const loadVolunteers = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch {
    } finally {
      if (initial) setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await API.get("/volunteers/join-requests/incoming");
      setRequests(res.data || []);
    } catch {
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      setActionLoading(requestId);
      await API.patch(`/volunteers/join-requests/${requestId}`, { status });
      setRequests(prev => prev.filter(r => r.id !== requestId));
      if (status === "APPROVED") {
        addToast(`Volunteer ${status.toLowerCase()}! ✨`, "success");
        loadVolunteers(false);
      }
    } catch (err) {
      addToast(err.response?.data?.detail || "Action failed", "error");
      loadRequests();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.phone_number) {
      return addToast("Name and phone required", "warning");
    }

    try {
      setCreating(true);
      await API.post("/volunteers", {
        name: form.name,
        phone_number: form.phone_number,
        zone: form.zone || null,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
      });
      setForm({ name: "", phone_number: "", zone: "", skills: "" });
      setShowForm(false);
      loadVolunteers(false);
    } catch (err) {
      addToast(err?.response?.data?.detail || "Failed to create volunteer", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleVerifyId = async (volId) => {
    try {
      setActionLoading(`verify-${volId}`);
      const res = await API.post(`/volunteers/${volId}/verify-id`);
      setVolunteers(prev => prev.map(v => v.id === volId ? res.data : v));
      setSelected(res.data);
      addToast("Identity officially verified! 🆔", "success");
    } catch (err) {
      addToast(err.response?.data?.detail || "Verification failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = volunteers.filter((v) =>
    (v.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const volunteerSkeletonLayout = [
      { type: 'row', cols: [ { type: 'text', width: 150 }, { type: 'rect', width: 60, height: 24 } ] },
      { type: 'stack', gap: 2, items: Array(6).fill({ type: 'rect', height: 64, className: "rounded-xl" }) }
  ];

  return (
    <div className="space-y-8 selection:bg-primary/10">
      {/* HEADER: Metrics & Search */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-primary text-[10px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1">Team Management</p>
                <h1 className="text-3xl sm:text-4xl font-outfit font-black text-on_surface tracking-tight">Volunteer Team</h1>
                <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Managing volunteers across active campaigns and operations.</p>
            </motion.div>
        </div>
        <div className="col-span-12 lg:col-span-4 flex justify-center lg:justify-end items-center gap-4">
             <MetricCard label="Total Volunteers" value={volunteers.length} icon="groups" className="w-full max-w-[220px]" />
        </div>
      </div>

      {/* TABS & ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex gap-2 p-1.5 bg-surface_high rounded-2xl overflow-x-auto custom-scrollbar shadow-inner">
            {[
              { id: "members", label: "Members", icon: "badge" },
              { id: "requests", label: "Requests", icon: "person_add", badge: requests.length > 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-on_surface shadow-xl"
                    : "text-on_surface_variant/60 hover:text-on_surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                {tab.label}
                {tab.badge && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
              </button>
            ))}
          </div>
  
          <div className="flex items-center gap-3 flex-1 lg:flex-none justify-between sm:justify-end">
            {activeTab === "members" && (
                <div className="relative flex-1 lg:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-30">search</span>
                    <input
                        placeholder="Filter by name..."
                        className="w-full bg-surface_high border border-white/5 pl-9 pr-4 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}
            <button onClick={() => setShowForm(true)} className="bg-primaryGradient text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Add Volunteer
            </button>
        </div>
      </div>

      <div className="animate-fadeIn">
        {activeTab === "members" ? (
            <ContentSection title="Volunteer List" icon="list_alt" noPadding>
                {loading ? (
                    <div className="p-6">
                        <SkeletonStructure layout={volunteerSkeletonLayout} />
                    </div>
                ) : (
                    <div className="divide-y divide-white/10 bg-surface_high/40 rounded-[2rem] border border-white/20 overflow-hidden shadow-inner">
                        {filtered.map((v) => (
                            <div key={v.id} onClick={() => setSelected(v)} className="group flex items-center justify-between p-4 px-6 hover:bg-white/60 cursor-pointer transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                                        <img src={resolveProfileImage(v.profile_image_url)} alt={v.name} className="w-full h-full object-cover" onError={handleImageError} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-outfit font-black text-on_surface tracking-tight">{v.name}</span>
                                            <VerificationBadge trustTier={v.trust_tier} telegramActive={v.telegram_active} />
                                        </div>
                                        <p className="text-[10px] font-bold text-on_surface_variant/40 tracking-wider">OFFICE: {v.phone_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-1 leading-none">Trust Score</p>
                                        <p className="text-xs font-black text-on_surface">{v.trust_score}%</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        v.status === 'AVAILABLE' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                                        v.status === 'ON_MISSION' ? "bg-primary/10 text-primary border-primary/20" : 
                                        "bg-surface_highest text-on_surface_variant border-white/5"
                                    }`}>
                                        {v.status === 'ON_MISSION' ? "ACTIVE" : v.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ContentSection>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requestsLoading ? (
                    Array(3).fill(0).map((_, i) => <SkeletonStructure key={i} layout={[{type: 'rect', height: 180, className: "rounded-3xl"}]} />)
                ) : (
                    <AnimatePresence mode="popLayout">
                        {requests.map((req) => (
                            <motion.div 
                                key={req.id} 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-surface_high/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/40 shadow-xl hover:bg-white transition-all group"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-xl group-hover:rotate-3 transition-transform">
                                        <img src={resolveProfileImage(req.profile_image_url)} alt={req.volunteer_name} className="w-full h-full object-cover" onError={handleImageError} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-outfit font-black text-on_surface tracking-tight truncate">{req.volunteer_name}</h3>
                                            <VerificationBadge trustTier={req.trust_tier} telegramActive={req.telegram_active} />
                                        </div>
                                        <p className="text-[10px] font-bold text-on_surface_variant/40 tracking-wider">APPLIED {new Date(req.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        disabled={actionLoading === req.id}
                                        onClick={() => handleRequestAction(req.id, "REJECTED")}
                                        className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-all"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        disabled={actionLoading === req.id}
                                        onClick={() => handleRequestAction(req.id, "APPROVED")}
                                        className="flex-[2] py-2.5 bg-primaryGradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === req.id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Approve"}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        )}
      </div>

      {/* CREATE FORM MODAL */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add Volunteer"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
            <p className="text-xs font-bold text-on_surface_variant/60 leading-relaxed italic border-l-4 border-primary/20 pl-4">Add a new volunteer to the team and assign them to the network.</p>
            <div className="space-y-4">
                <ActionInput label="Full Name" placeholder="e.g. John Doe" value={form.name} onChange={(val) => setForm({...form, name: val})} />
                <ActionInput label="Phone Number" placeholder="+91..." value={form.phone_number} onChange={(val) => setForm({...form, phone_number: val})} />
                <ActionInput label="Work Zone" placeholder="e.g. Central Lucknow" value={form.zone} onChange={(val) => setForm({...form, zone: val})} />
                <button onClick={handleCreate} disabled={creating} className="w-full py-4 mt-4 bg-on_surface text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                    {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {creating ? "Adding..." : "Add Volunteer"}
                </button>
            </div>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="max-w-2xl"
        className="!p-0"
        showClose={false}
      >
        {selected && (
            <div className="relative">
                <div className="h-40 bg-primaryGradient relative">
                    <button onClick={() => setSelected(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface_high to-transparent opacity-60" />
                </div>
                
                <div className="px-10 pb-12">
                    <div className="relative -mt-16 mb-8 flex justify-center sm:justify-start">
                        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-8 border-surface_high shadow-2xl relative group">
                            <img src={resolveProfileImage(selected.profile_image_url)} alt={selected.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={handleImageError} />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-4xl font-outfit font-black text-on_surface tracking-tight">{selected.name}</h2>
                                <VerificationBadge trustTier={selected.trust_tier} telegramActive={selected.telegram_active} />
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-on_surface_variant/60">
                                <span className="flex items-center gap-1.5 bg-surface_high px-3 py-1 rounded-lg"><span className="material-symbols-outlined text-sm">call</span>{selected.phone_number}</span>
                                {selected.zone && <span className="flex items-center gap-1.5 bg-surface_high px-3 py-1 rounded-lg"><span className="material-symbols-outlined text-sm">location_on</span>{selected.zone}</span>}
                            </div>
                        </div>
                        
                        <div className={`px-6 py-3 rounded-2xl border-2 flex flex-col items-center shadow-lg ${
                            selected.status === 'AVAILABLE' ? "border-green-500/20 bg-green-500/5 text-green-500 shadow-green-500/5" : 
                            selected.status === 'ON_MISSION' ? "border-primary/20 bg-primary/5 text-primary shadow-primary/5" : 
                            "border-white/10 bg-white/5 text-on_surface_variant shadow-on_surface/5"
                        }`}>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Current Status</span>
                            <span className="text-xl font-black uppercase tracking-tight">{selected.status === 'ON_MISSION' ? "ACTIVE" : selected.status}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-10">
                        {[
                            { label: "Trust Score", value: `${selected.trust_score}%`, color: "text-primary" },
                            { label: "Campaigns", value: selected.completions, color: "text-on_surface" },
                            { label: "Service", value: `${(selected.hours_served || 0).toFixed(1)}h`, color: "text-on_surface" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-on_surface/5 text-center shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-1 leading-none">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* ID Panel */}
                    {!selected.id_verified && selected.aadhaar_last_4 && (
                        <div className="mt-10 p-8 bg-primaryGradient/10 rounded-[2.5rem] border-2 border-primary/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-9xl">verified_user</span>
                            </div>
                            <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                                        <span className="material-symbols-outlined text-3xl font-black">fingerprint</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Identity Verification Pending</p>
                                        <p className="text-sm font-bold text-on_surface">Aadhaar Key: <span className="text-primary font-black ml-1 tracking-widest">****{selected.aadhaar_last_4}</span></p>
                                    </div>
                                </div>
                                <button
                                    disabled={actionLoading === `verify-${selected.id}`}
                                    onClick={() => handleVerifyId(selected.id)}
                                    className="w-full sm:w-auto px-10 py-4 bg-on_surface text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-primary transition-all disabled:opacity-50"
                                >
                                    {actionLoading === `verify-${selected.id}` ? "Verifying..." : "Approve ID"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default Volunteers;

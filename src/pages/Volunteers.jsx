import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import Skeleton from "../components/Skeleton";
import VerificationBadge from "../components/VerificationBadge";
import { resolveProfileImage } from "../utils/imageUtils";
import { useToast } from "../context/ToastContext";

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

  const [seenIds, setSeenIds] = useState(new Set());

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
      // Optimistic update
      setRequests(prev => prev.filter(r => r.id !== requestId));
      if (status === "APPROVED") {
        addToast(`Volunteer ${status.toLowerCase()}! ✨`, "success");
        loadVolunteers(false);
      }
    } catch (err) {
      addToast(err.response?.data?.detail || "Action failed", "error");
      loadRequests(); // Rollback if error
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
      // Update local state
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

  return (
    <div className="space-y-6">
      {/* TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "members"
              ? "bg-primary text-white shadow-soft"
              : "bg-surface_high text-on_surface_variant hover:bg-surface_highest"
          }`}
        >
          Team Members
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "requests"
              ? "bg-primary text-white shadow-soft"
              : "bg-surface_high text-on_surface_variant hover:bg-surface_highest"
          }`}
        >
          Join Requests
          {requests.length > 0 && activeTab !== "requests" && (
             <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {activeTab === "members" ? (
        <div className="space-y-6">
          {/* MEMBERS VIEW */}
          <div className="rounded-2xl border border-white/10 bg-surface_high/80 backdrop-blur p-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on_surface">Volunteer Force</h1>
              <p className="text-sm text-on_surface_variant">Manage and deploy your human network</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-on_surface">{volunteers.length}</p>
                <p className="text-xs text-on_surface_variant">Active Volunteers</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90"
              >
                + Add
              </button>
            </div>
          </div>

          <input
            placeholder="Search volunteers..."
            className="w-full max-w-md px-4 py-3 rounded-xl bg-surface_high border border-white/10 text-on_surface placeholder:text-on_surface_variant focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="rounded-2xl border border-white/10 bg-surface_high/80 backdrop-blur p-2 space-y-2">
            <div className="grid grid-cols-12 px-4 py-2 text-xs text-on_surface_variant">
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Phone</div>
              <div className="col-span-3 text-right">Status</div>
            </div>

            {loading ? (
               <div className="space-y-1">
                  <Skeleton count={6} height={60} className="rounded-xl" />
               </div>
            ) : filtered.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelected(v)}
                className="grid grid-cols-12 items-center px-4 py-3 cursor-pointer transition rounded-lg border border-white/10 hover:bg-white/5"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/10 shadow-sm">
                    <img 
                      src={resolveProfileImage(v.profile_image_url)} 
                      alt={v.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-sm text-on_surface">{v.name}</span>
                  <VerificationBadge trustTier={v.trust_tier} telegramActive={v.telegram_active} />
                </div>
                <div className="col-span-4 text-sm text-on_surface_variant">{v.phone_number}</div>
                <div className="col-span-3 text-right">
                   <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                        v.status === 'AVAILABLE' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        v.status === 'ON_MISSION' ? "bg-primary/10 text-primary border-primary/20" : 
                        "bg-surface_highest text-on_surface_variant border-white/5"
                      }`}>
                        {v.status}
                      </span>
                      {v.status === 'AVAILABLE' && (
                        <span className="text-[8px] text-green-600 font-bold uppercase tracking-tighter opacity-60">Ready for Dispatch</span>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* REQUESTS VIEW */}
          <div className="rounded-2xl border border-white/10 bg-surface_high/80 backdrop-blur p-6">
             <h2 className="text-xl font-bold text-on_surface">Pending Applications</h2>
             <p className="text-sm text-on_surface_variant">Volunteers waiting to join your team.</p>
          </div>

           <div className="grid gap-4">
              {requestsLoading ? (
                 <div className="grid gap-4">
                   <Skeleton count={3} height={100} className="rounded-2xl" />
                 </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {requests.length > 0 ? (
                    requests.map((req) => (
                      <motion.div 
                        key={req.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className="bg-surface_lowest p-5 rounded-2xl border border-white/10 shadow-soft flex justify-between items-center"
                      >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 shadow-soft">
                                <img 
                                    src={resolveProfileImage(req.profile_image_url)} 
                                    alt={req.volunteer_name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 font-bold text-on_surface">
                                    <h3>{req.volunteer_name}</h3>
                                    <VerificationBadge trustTier={req.trust_tier} telegramActive={req.telegram_active} />
                                </div>
                                <p className="text-xs text-on_surface_variant">Applied on {new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={actionLoading === req.id}
                                onClick={() => handleRequestAction(req.id, "REJECTED")}
                                className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            >
                                Decline
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={actionLoading === req.id}
                                onClick={() => handleRequestAction(req.id, "APPROVED")}
                                className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === req.id && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {actionLoading === req.id ? "Processing..." : "Approve"}
                            </motion.button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 opacity-50">
                      <p className="text-sm">No pending join requests</p>
                    </div>
                  )}
                </AnimatePresence>
              )}
           </div>
        </div>
      )}

      {/* MODALS ... (re-using the ones from original Volunteers.jsx) */}
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="bg-surface_high w-full max-w-md p-6 rounded-2xl space-y-4 border border-white/10 relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-xl text-on_surface">Add Volunteer</h2>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface border border-white/10 text-on_surface" />
            <input placeholder="Phone Number" value={form.phone_number} onChange={(e) => setForm({...form, phone_number: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-surface border border-white/10 text-on_surface" />
            <button onClick={handleCreate} className="w-full py-2.5 rounded-lg bg-primary text-white font-medium">{creating ? "Creating..." : "Create Volunteer"}</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setSelected(null)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface_high w-full max-w-xl rounded-2xl md:rounded-[3rem] shadow-2xl border border-white/20 relative overflow-y-auto max-h-[90vh] custom-scrollbar" 
            onClick={(e) => e.stopPropagation()}
          >
             {/* Profile Header Background */}
             <div className="h-24 md:h-32 bg-gradient-to-br from-primary to-primary_dark relative">
                <button 
                  onClick={() => setSelected(null)}
                  className="absolute top-4 md:top-6 right-4 md:right-6 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
             </div>

             <div className="px-6 md:px-10 pb-8 md:pb-10">
                {/* Profile Picture Overlay */}
                <div className="relative -mt-12 md:-mt-16 mb-4 md:mb-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl mx-auto md:mx-0">
                        <img 
                            src={resolveProfileImage(selected.profile_image_url)} 
                            alt={selected.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-outfit font-black text-on_surface">{selected.name}</h2>
                            <VerificationBadge trustTier={selected.trust_tier} telegramActive={selected.telegram_active} />
                        </div>
                        <div className="flex items-center gap-2 text-on_surface_variant">
                            <span className="material-symbols-outlined text-sm">call</span>
                            <span className="text-sm font-bold">{selected.phone_number}</span>
                            {selected.zone && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    <span className="text-sm font-bold">{selected.zone}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="bg-surface_high/50 px-4 py-2 rounded-2xl border border-surface_highest">
                            <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant mb-1 text-center">Trust Score</p>
                            <p className="text-xl font-black text-primary text-center">{selected.trust_score}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl border ${
                            selected.status === 'AVAILABLE' ? "bg-green-500/5 border-green-500/20" : 
                            selected.status === 'ON_MISSION' ? "bg-primary/5 border-primary/20" : 
                            "bg-surface_high/50 border-surface_highest"
                        }`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant mb-1 text-center">Status</p>
                            <p className={`text-xl font-black text-center ${
                                selected.status === 'AVAILABLE' ? "text-green-500" : 
                                selected.status === 'ON_MISSION' ? "text-primary" : "text-on_surface_variant"
                            }`}>{selected.status}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-8">
                     <div className="bg-surface_lowest p-5 rounded-3xl border border-surface_highest text-center group hover:bg-primary/5 transition-all">
                        <span className="text-[10px] text-on_surface_variant block mb-1 uppercase font-black tracking-widest">Completed</span>
                        <span className="text-2xl font-black text-on_surface">{selected.completions}</span>
                     </div>
                     <div className="bg-surface_lowest p-5 rounded-3xl border border-surface_highest text-center group hover:bg-secondary/5 transition-all">
                        <span className="text-[10px] text-on_surface_variant block mb-1 uppercase font-black tracking-widest">No Shows</span>
                        <span className={`text-2xl font-black ${selected.no_shows > 0 ? "text-red-400" : "text-on_surface"}`}>{selected.no_shows}</span>
                     </div>
                     <div className="bg-surface_lowest p-5 rounded-3xl border border-surface_highest text-center group hover:bg-primary/5 transition-all">
                        <span className="text-[10px] text-on_surface_variant block mb-1 uppercase font-black tracking-widest">Hours</span>
                        <span className="text-2xl font-black text-on_surface">{(selected.hours_served || 0).toFixed(1)}</span>
                     </div>
                </div>

                {/* Performance Meter */}
                <div className="mt-6 md:mt-8 space-y-3">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant">Confidence Score</label>
                        <span className="text-xs font-black text-primary italic">
                            {selected.completions > 0 ? Math.round((selected.completions / (selected.completions + selected.no_shows)) * 100) : 0}% Reliable
                        </span>
                    </div>
                    <div className="h-4 w-full bg-surface_highest rounded-full overflow-hidden border border-surface_highest p-1">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selected.completions > 0 ? (selected.completions / (selected.completions + selected.no_shows)) * 100 : 0}%` }}
                            className="h-full bg-gradient-to-r from-primary to-primary_light rounded-full"
                        />
                    </div>
                </div>

                {/* Skills Chips */}
                {selected.skills && selected.skills.length > 0 && (
                    <div className="mt-8">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant block mb-3">Capabilities</label>
                        <div className="flex flex-wrap gap-2">
                             {selected.skills.map(skill => (
                                 <span key={skill} className="px-3 py-1 bg-surface_high text-on_surface text-[10px] font-black uppercase tracking-widest rounded-full border border-surface_highest">
                                    {skill}
                                 </span>
                             ))}
                        </div>
                    </div>
                )}

                {/* 🆔 ID Verification Panel (Admin) */}
                {!selected.id_verified && selected.aadhaar_last_4 && (
                    <div className="mt-8 p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 animate-slide-up">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                                    <span className="material-symbols-outlined text-3xl">fingerprint</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Identity Verification Pending</p>
                                    <p className="text-sm font-bold text-on_surface">Submitted Aadhaar Fragment: <span className="text-primary tracking-[0.2em] font-black ml-1">****{selected.aadhaar_last_4}</span></p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={actionLoading === `verify-${selected.id}`}
                                onClick={() => handleVerifyId(selected.id)}
                                className="w-full md:w-auto px-8 py-3 bg-primary text-white text-sm font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {actionLoading === `verify-${selected.id}` ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                )}
                                {actionLoading === `verify-${selected.id}` ? "Verifying..." : "Confirm Identity"}
                            </motion.button>
                        </div>
                    </div>
                )}
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;

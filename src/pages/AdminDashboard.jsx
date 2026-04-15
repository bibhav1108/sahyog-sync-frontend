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
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("NGO_APPROVALS"); // NGO_APPROVALS or FEEDBACK

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ngosRes, feedbackRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/organizations?status_filter=pending"),
        API.get("/feedback/list")
      ]);
      setStats(statsRes.data);
      setPendingNGOs(ngosRes.data);
      setFeedback(feedbackRes.data || []);
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

  const handleResolveFeedback = async (id) => {
    setActionLoading(id);
    try {
      await API.patch(`/feedback/${id}/status?status_val=RESOLVED`);
      setFeedback(prev => prev.map(fb => fb.id === id ? { ...fb, status: "RESOLVED" } : fb));
    } catch (err) {
      alert("Status update failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-[fadeIn_0.4s_ease]">
      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total NGOs" value={stats.total_ngos} icon="corporate_fare" color="bg-blue-500" />
        <StatCard title="Pending" value={stats.pending_ngos} icon="pending_actions" color="bg-amber-500" pulse />
        <StatCard title="Active NGOs" value={stats.active_ngos} icon="verified" color="bg-green-500" />
        <StatCard title="Volunteers" value={stats.total_volunteers} icon="groups" color="bg-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-8">
          {/* NAVIGATION TABS */}
          <div className="flex gap-4 p-1 bg-surface_high/50 rounded-2xl w-fit border border-surface_highest">
            <button 
              onClick={() => setActiveTab("NGO_APPROVALS")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === "NGO_APPROVALS" ? "bg-white shadow-soft text-primary" : "text-on_surface_variant hover:text-on_surface"}`}
            >
              NGO APPROVALS
            </button>
            <button 
              onClick={() => setActiveTab("FEEDBACK")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === "FEEDBACK" ? "bg-white shadow-soft text-primary" : "text-on_surface_variant hover:text-on_surface"}`}
            >
              FEEDBACK & ISSUES
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-soft border border-surface_highest overflow-hidden">
            {activeTab === "NGO_APPROVALS" ? (
              <RenderNGOApprovals 
                pendingNGOs={pendingNGOs} 
                handleApprove={handleApprove} 
                handleReject={handleReject} 
                actionLoading={actionLoading} 
              />
            ) : (
              <RenderFeedback 
                feedback={feedback} 
                handleResolve={handleResolveFeedback} 
                actionLoading={actionLoading} 
              />
            )}
          </div>
        </section>

        {/* 🚀 QUICK TOOLS */}
        <section className="space-y-6">
           <div className="bg-primaryGradient p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-2 italic">Broadcast System</h3>
                <p className="text-xs text-white/80 mb-6">Send urgent messages to all registered NGO coordinators.</p>
                <button className="w-full py-3 bg-white text-primary text-xs font-black rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                   Manage Broadcasts
                </button>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">campaign</span>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-surface_highest shadow-soft">
              <h4 className="text-xs font-black uppercase tracking-widest text-on_surface_variant mb-4">System Status</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Core API</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Healthy</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Telegram Bot</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Online</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database (Neon)</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Optimal</span>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

const RenderNGOApprovals = ({ pendingNGOs, handleApprove, handleReject, actionLoading }) => (
    <>
      <div className="p-8 border-b border-surface_highest flex items-center justify-between bg-surface_lowest/50">
        <div>
          <h2 className="text-xl font-outfit font-black mb-1">Organization Registration</h2>
          <p className="text-xs text-on_surface_variant">Recent ngo/entity requests awaiting authorization</p>
        </div>
        <Link to="/admin/organizations" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
          Full List
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface_lowest text-[10px] uppercase font-black tracking-widest text-on_surface_variant">
            <tr>
              <th className="px-8 py-4">Organization</th>
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
                  <td className="px-8 py-5">
                    <div className="font-bold text-on_surface text-md">{ngo.name}</div>
                    <div className="text-[10px] text-on_surface_variant flex items-center gap-1 uppercase tracking-wider font-semibold opacity-60">
                       {ngo.contact_email} • {ngo.contact_phone}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        disabled={actionLoading === ngo.id}
                        onClick={() => handleApprove(ngo.id)}
                        className="h-9 px-5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button 
                        disabled={actionLoading === ngo.id}
                        onClick={() => handleReject(ngo.id)}
                        className="h-9 px-5 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {pendingNGOs.length === 0 && (
              <tr>
                <td colSpan="2" className="px-8 py-20 text-center text-on_surface_variant">
                  <span className="material-symbols-outlined text-[48px] mb-4 block opacity-20">verified</span>
                  <h3 className="text-sm font-bold text-on_surface">All Caught Up!</h3>
                  <p className="text-xs">No pending NGO approvals at this time.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
);

const RenderFeedback = ({ feedback, handleResolve, actionLoading }) => (
    <>
      <div className="p-8 border-b border-surface_highest flex items-center justify-between bg-surface_lowest/50">
        <div>
          <h2 className="text-xl font-outfit font-black mb-1">Community Feedback</h2>
          <p className="text-xs text-on_surface_variant">Reviews and platform issues from the frontline</p>
        </div>
      </div>

      <div className="divide-y divide-surface_highest max-h-[600px] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
              {feedback.map((fb) => (
                  <motion.div 
                    key={fb.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 hover:bg-surface_lowest transition-all group relative ${fb.status === 'RESOLVED' ? 'opacity-60 bg-gray-50/50' : ''}`}
                  >
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                              <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${fb.type === 'REVIEW' ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white'}`}>
                                  {fb.type}
                              </div>
                              <div className="text-xs font-bold text-on_surface/80">
                                  {fb.user_name} <span className="text-[10px] opacity-40 font-normal ml-1">({fb.user_role})</span>
                              </div>
                          </div>
                          
                          {fb.status === 'PENDING' ? (
                              <button 
                                onClick={() => handleResolve(fb.id)}
                                disabled={actionLoading === fb.id}
                                className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {actionLoading === fb.id ? "..." : "Mark Resolved"}
                              </button>
                          ) : (
                              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                                  <span className="material-symbols-outlined text-[14px]">task_alt</span>
                                  RESOLVED
                              </div>
                          )}
                      </div>

                      {fb.type === 'REVIEW' && fb.rating && (
                          <div className="flex gap-0.5 mb-2">
                              {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`material-symbols-outlined text-[14px] ${i < fb.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                      star
                                  </span>
                              ))}
                          </div>
                      )}

                      {fb.type === 'ISSUE' && fb.category && (
                          <div className="flex items-center gap-1 mb-2">
                              <span className="material-symbols-outlined text-xs text-red-400">bug_report</span>
                              <span className="text-[10px] font-black text-red-400 uppercase tracking-tighter">{fb.category}</span>
                          </div>
                      )}

                      <p className="text-sm text-on_surface_variant leading-relaxed">
                          {fb.content}
                      </p>
                      
                      <p className="text-[10px] text-on_surface_variant/40 mt-3 font-medium">
                          Submitted on {new Date(fb.created_at).toLocaleString()}
                      </p>
                  </motion.div>
              ))}
          </AnimatePresence>
          {feedback.length === 0 && (
              <div className="p-20 text-center text-on_surface_variant">
                  <h3 className="text-sm font-bold">Inbox is Clear</h3>
                  <p className="text-xs">No feedback or issues reported yet.</p>
              </div>
          )}
      </div>
    </>
);

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

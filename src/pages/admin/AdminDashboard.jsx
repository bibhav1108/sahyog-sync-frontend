import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { resolveProfileImage } from "../../utils/imageUtils";
import ProfileImageModal from "../../components/shared/ProfileImageModal";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import { useToast } from "../../context/ToastContext";

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
  const { addToast } = useToast();
  const [admin, setAdmin] = useState(null);
  const [saving, setSaving] = useState(false);

  // 📸 Image Flow States
  const [pfpModalOpen, setPfpModalOpen] = useState(false);

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

    try {
      const userRes = await API.get("/users/me");
      setAdmin(userRes.data);
    } catch (err) {
      console.error("Admin user load failed", err);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setPfpModalOpen(false);
    
    const formData = new FormData();
    formData.append("file", croppedBlob, "profile.jpg");

    setSaving(true);
    setMsg("");

    try {
      const res = await API.post("/users/me/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAdmin({ ...admin, profile_image_url: res.data.profile_image_url });
      addToast("Admin identity updated! 🛡️", "success");
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      addToast(err.response?.data?.detail || "Upload failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    setPfpModalOpen(false);
    setSaving(true);
    setMsg("");

    try {
      await API.delete("/users/me/image");
      setAdmin({ ...admin, profile_image_url: null });
      addToast("Admin photo removed. ✨", "success");
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      addToast(err.response?.data?.detail || "Removal failed", "error");
    } finally {
      setSaving(false);
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
      addToast("Organization rejected", "info");
    } catch (err) {
      addToast("Rejection failed", "error");
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
      addToast("Status update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10">
        <SkeletonStructure layout={[
            { type: 'grid', cols: 4, item: { type: 'rect', height: 120, className: "rounded-3xl" } },
            { type: 'grid', cols: 12, gap: 10, items: [
                { type: 'stack', width: '66%', gap: 8, items: [
                    { type: 'rect', height: 50, width: 250, className: "rounded-2xl" },
                    { type: 'rect', height: 400, className: "rounded-3xl" }
                ], className: "lg:col-span-2" },
                { type: 'stack', width: '33%', gap: 6, items: Array(3).fill({ type: 'rect', height: 150, className: "rounded-3xl" }), className: "lg:col-span-1" }
            ]}
        ]} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-[fadeIn_0.4s_ease]">
      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total NGOs" value={stats.total_ngos} icon="corporate_fare" color="bg-blue-500" />
        <StatCard title="Pending" value={stats.pending_ngos} icon="pending_actions" color="bg-amber-500" pulse />
        <StatCard title="Active NGOs" value={stats.active_ngos} icon="verified" color="bg-green-500" />
        <StatCard title="Volunteers" value={stats.total_volunteers} icon="groups" color="bg-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-surface_highest shadow-soft overflow-hidden relative">
            <div className="relative z-10">
                <h2 className="text-2xl font-black mb-2 italic">Platform Pulse</h2>
                <p className="text-sm text-on_surface_variant mb-8">Quick overview of system activity and critical alerts.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/admin/organizations" className="p-6 bg-surface_lowest rounded-3xl border border-surface_highest hover:border-primary transition-all group">
                        <span className="material-symbols-outlined text-primary mb-3 text-3xl group-hover:scale-110 transition-transform">corporate_fare</span>
                        <h4 className="font-black text-on_surface">Manage NGOs</h4>
                        <p className="text-[10px] text-on_surface_variant uppercase tracking-widest font-bold">Verification Hub</p>
                    </Link>
                    <Link to="/admin/issues" className="p-6 bg-surface_lowest rounded-3xl border border-surface_highest hover:border-red-400 transition-all group">
                        <span className="material-symbols-outlined text-red-400 mb-3 text-3xl group-hover:scale-110 transition-transform">bug_report</span>
                        <h4 className="font-black text-on_surface">Security & Bugs</h4>
                        <p className="text-[10px] text-on_surface_variant uppercase tracking-widest font-bold">Technical Issues</p>
                    </Link>
                </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-surface_highest shadow-soft">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black italic">Recent Activity</h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full">REALTIME</span>
              </div>
              <div className="space-y-6">
                  {feedback.slice(0, 3).map((fb, idx) => (
                      <div key={idx} className="flex gap-4">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${fb.type === 'ISSUE' ? 'bg-red-500' : 'bg-primary'}`} />
                          <div>
                              <p className="text-sm font-bold text-on_surface leading-tight mb-1">{fb.content}</p>
                              <p className="text-[10px] text-on_surface_variant font-medium">By {fb.user_name} • {new Date(fb.created_at).toLocaleDateString()}</p>
                          </div>
                      </div>
                  ))}
                  {feedback.length === 0 && <p className="text-sm text-on_surface_variant text-center py-10">No recent activity detected.</p>}
              </div>
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
              <h4 className="text-xs font-black uppercase tracking-widest text-on_surface_variant mb-4">System Identity</h4>
              <div className="flex items-center gap-4">
                 <div 
                    className="relative group cursor-pointer" 
                    onClick={() => setPfpModalOpen(true)}
                >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/20 group-hover:brightness-50 transition-all shadow-inner">
                        <img 
                            src={resolveProfileImage(admin?.profile_image_url)} 
                            className="w-full h-full object-cover" 
                            alt="admin"
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                        <span className="material-symbols-outlined text-white text-xl">add_a_photo</span>
                    </div>
                 </div>
                 <div className="min-w-0">
                    <p className="text-sm font-black text-on_surface truncate">{admin?.full_name || "System Controller"}</p>
                    <p className="text-[10px] text-on_surface_variant uppercase font-black tracking-tighter opacity-50">Main Cryptographic Identity</p>
                 </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-surface_highest shadow-soft">
              <h4 className="text-xs font-black uppercase tracking-widest text-on_surface_variant mb-4">Detailed Controls</h4>
              <div className="space-y-3">
                  <Link to="/admin/volunteers" className="flex items-center justify-between p-3 bg-surface_lowest rounded-2xl hover:bg-white transition-all border border-transparent hover:border-primary/10 group">
                      <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-blue-500 group-hover:rotate-12 transition-transform">groups</span>
                          <span className="text-sm font-bold">Volunteers</span>
                      </div>
                      <span className="material-symbols-outlined text-sm opacity-20">chevron_right</span>
                  </Link>
                  <Link to="/admin/reviews" className="flex items-center justify-between p-3 bg-surface_lowest rounded-2xl hover:bg-white transition-all border border-transparent hover:border-primary/10 group">
                      <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-indigo-500 group-hover:rotate-12 transition-transform">reviews</span>
                          <span className="text-sm font-bold">Platform Reviews</span>
                      </div>
                      <span className="material-symbols-outlined text-sm opacity-20">chevron_right</span>
                  </Link>
              </div>
           </div>
        </section>
      </div>


      {pfpModalOpen && (
        <ProfileImageModal 
          currentImage={admin?.profile_image_url} 
          onCropComplete={handleCropComplete} 
          onRemove={handleRemoveImage}
          onCancel={() => setPfpModalOpen(false)} 
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, pulse = false }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-soft border border-surface_highest flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-on_surface_variant uppercase tracking-[0.2em] mb-1">{title}</p>
      <div className="flex items-center gap-2">
         <h4 className="text-3xl font-outfit font-black tracking-tight">{value}</h4>
         {pulse && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>}
      </div>
    </div>
  </div>
);

export default AdminDashboard;

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { resolveProfileImage } from "../../utils/imageUtils";
import ProfileImageModal from "../../components/shared/ProfileImageModal";
import { useToast } from "../../context/ToastContext";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import DataRow from "../../components/shared/DataRow";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const CoordinatorProfile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total_campaigns: 0, total_inventory: 0, total_volunteers: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  // 📸 Profile Photo States
  const [pfpModalOpen, setPfpModalOpen] = useState(false);

  // 📝 Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // 🔐 Security States
  const [pwdForm, setPwdForm] = useState({ old: "", new: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [userRes, statsRes] = await Promise.all([
            API.get("/users/me"),
            API.get("/users/me/stats")
        ]);
        setUser(userRes.data);
        setEditName(userRes.data.full_name);
        setEditEmail(userRes.data.email);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!editName.trim()) return addToast("Please enter your name", "warning");
    if (!editEmail.trim()) return addToast("Please enter your email", "warning");
    
    setSaving(true);
    try {
      const res = await API.patch("/users/me", { 
        full_name: editName.trim(),
        email: editEmail.trim()
      });
      setUser(prev => ({ ...prev, full_name: res.data.full_name, email: res.data.email }));
      setIsEditing(false);
      addToast("Profile updated successfully! ✨", "success");
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      addToast(err.response?.data?.detail || "Could not save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new !== pwdForm.confirm) return addToast("New passwords do not match", "warning");
    if (pwdForm.new.length < 8) return addToast("Password must be at least 8 characters long", "warning");

    setPwdLoading(true);
    try {
      await API.post("/users/me/change-password", {
        old_password: pwdForm.old,
        new_password: pwdForm.new
      });
      addToast("Password changed successfully! 🔐", "success");
      setPwdForm({ old: "", new: "", confirm: "" });
    } catch (err) {
      addToast(err.response?.data?.detail || "Could not change password. Check your current password.", "error");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setPfpModalOpen(false);
    const formData = new FormData();
    formData.append("file", croppedBlob, "profile.jpg");
    setSaving(true);

    try {
      const res = await API.post("/users/me/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, profile_image_url: res.data.profile_image_url });
      addToast("Profile photo updated! 📸", "success");
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      addToast(err.response?.data?.detail || "Could not upload photo", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    setPfpModalOpen(false);
    setSaving(true);
    try {
      await API.delete("/users/me/image");
      setUser({ ...user, profile_image_url: null });
      addToast("Profile photo removed.", "success");
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      addToast(err.response?.data?.detail || "Could not remove photo", "error");
    } finally {
      setSaving(false);
    }
  };

  const skeletonLayout = [
    { type: 'rect', height: 400, className: "rounded-[3.5rem] mb-10" },
    { type: 'row', gap: 6, cols: [
        { type: 'rect', height: 140, className: "rounded-[2.5rem]" },
        { type: 'rect', height: 140, className: "rounded-[2.5rem]" },
        { type: 'rect', height: 140, className: "rounded-[2.5rem]" }
    ]},
    { type: 'rect', height: 300, className: "rounded-[3rem] mt-10" }
  ];

  if (loading) return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
        <SkeletonStructure layout={skeletonLayout} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 pb-32 animate-fadeIn selection:bg-primary/10">
      {/* 🚀 SIMPLIFIED UNIFIED HEADER CARD */}
      <div className="relative overflow-hidden rounded-[4rem] bg-surface_high border border-white p-10 md:p-14 shadow-2xl group transition-all duration-500">
        <div className="absolute inset-0 bg-primaryGradient opacity-5" />
        
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* PHOTO SECTION */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div 
                className="relative cursor-pointer group/pfp"
                onClick={() => setPfpModalOpen(true)}
            >
                <div className="w-48 h-48 rounded-[3.5rem] overflow-hidden border-4 border-white shadow-2xl group-hover/pfp:brightness-50 transition-all duration-500 rotate-3 group-hover/pfp:rotate-0">
                <img 
                    src={resolveProfileImage(user?.profile_image_url)} 
                    alt="profile" 
                    className="w-full h-full object-cover scale-110 group-hover/pfp:scale-100 transition-transform duration-700"
                />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pfp:opacity-100 transition-all pointer-events-none">
                <span className="material-symbols-outlined text-white text-4xl font-black">add_a_photo</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-on_surface text-white flex items-center justify-center shadow-2xl transition group-hover/pfp:scale-110 group-hover/pfp:bg-primary">
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
                </div>
            </div>
            <button 
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isEditing) {
                    setEditName(user?.full_name);
                    setEditEmail(user?.email);
                  }
                }}
                className="mt-8 px-8 py-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 text-[10px] font-black uppercase tracking-widest text-on_surface_variant hover:bg-primary hover:text-white transition-all shadow-sm"
            >
                {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          
          {/* PERSONAL DETAILS SECTION */}
          <div className="lg:col-span-8 space-y-8">
            <div className="text-center lg:text-left">
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-2">Coordinator Account</p>
                {isEditing ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Full Name</label>
                                <input 
                                    className="bg-white/50 border border-on_surface/5 px-6 py-4 rounded-3xl text-2xl font-outfit font-black text-on_surface w-full focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Email Address</label>
                                <input 
                                    className="bg-white/50 border border-on_surface/5 px-6 py-4 rounded-3xl text-2xl font-outfit font-black text-on_surface w-full focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="w-full lg:w-fit px-12 py-5 bg-on_surface text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all self-center lg:self-start mt-2"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                ) : (
                    <h1 className="text-5xl md:text-6xl font-outfit font-black text-on_surface tracking-tighter transition-all">{user?.full_name}</h1>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/40 border border-white/40 p-6 rounded-[2.5rem] flex items-center gap-5 transition hover:shadow-soft">
                    <span className="material-symbols-outlined text-primary text-3xl bg-primary/10 p-3 rounded-2xl">alternate_email</span>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-0.5">Email Address</p>
                        <p className="text-sm font-bold text-on_surface truncate">{user?.email}</p>
                    </div>
                </div>
                <div className="bg-white/40 border border-white/40 p-6 rounded-[2.5rem] flex items-center gap-5 transition hover:shadow-soft">
                    <span className="material-symbols-outlined text-primary text-3xl bg-primary/10 p-3 rounded-2xl">verified_user</span>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-0.5">Status</p>
                        <p className="text-sm font-bold text-on_surface">{user?.org_id ? "Verified NGO Coordinator" : "Approval Pending"}</p>
                    </div>
                </div>
                <div className="bg-white/40 border border-white/40 p-6 rounded-[2.5rem] flex items-center gap-5 transition hover:shadow-soft">
                    <span className="material-symbols-outlined text-primary text-3xl bg-primary/10 p-3 rounded-2xl">calendar_today</span>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-0.5">Joined</p>
                        <p className="text-sm font-bold text-on_surface">{new Date(user?.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                    </div>
                </div>
                <div className="bg-white/40 border border-white/40 p-6 rounded-[2.5rem] flex items-center gap-5 transition hover:shadow-soft">
                    <span className="material-symbols-outlined text-primary text-3xl bg-primary/10 p-3 rounded-2xl">lock</span>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-0.5">Security</p>
                        <p className="text-sm font-bold text-on_surface">Active & Protected</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <MetricCard label="Campaigns Managed" value={stats.total_campaigns} icon="rocket_launch" variant="primary" />
        <MetricCard label="Volunteers" value={stats.total_volunteers} icon="groups" />
        <MetricCard label="Inventory Items" value={stats.total_inventory} icon="inventory_2" />
      </div>

      {/* 🔐 BOTTOM: INLINE PASSWORD CHANGE */}
      <ContentSection title="Security Settings" icon="lock">
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-end p-2">
            <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">Current Password</label>
                <input 
                    type="password"
                    required
                    className="w-full bg-surface_high border border-on_surface/5 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    value={pwdForm.old}
                    onChange={(e) => setPwdForm({...pwdForm, old: e.target.value})}
                    placeholder="••••••••"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">New Password</label>
                <input 
                    type="password"
                    required
                    className="w-full bg-surface_high border border-on_surface/5 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    value={pwdForm.new}
                    onChange={(e) => setPwdForm({...pwdForm, new: e.target.value})}
                    placeholder="••••••••"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">Confirm New Password</label>
                <input 
                    type="password"
                    required
                    className="w-full bg-surface_high border border-on_surface/5 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    value={pwdForm.confirm}
                    onChange={(e) => setPwdForm({...pwdForm, confirm: e.target.value})}
                    placeholder="••••••••"
                />
            </div>
            <button 
                type="submit"
                disabled={pwdLoading}
                className="py-4 bg-on_surface text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 h-[58px]"
            >
                {pwdLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-lg">shield_lock</span>}
                {pwdLoading ? "Saving..." : "Change Password"}
            </button>
        </form>
      </ContentSection>

      {pfpModalOpen && (
        <ProfileImageModal 
          currentImage={user?.profile_image_url} 
          onCropComplete={handleCropComplete} 
          onRemove={handleRemoveImage}
          onCancel={() => setPfpModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default CoordinatorProfile;

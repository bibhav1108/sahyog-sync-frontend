import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { resolveProfileImage } from "../../utils/imageUtils";
import VerificationBadge from "../../components/shared/VerificationBadge";
import ProfileImageModal from "../../components/shared/ProfileImageModal";
import { useToast } from "../../context/ToastContext";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import DataRow from "../../components/shared/DataRow";
import ActionInput from "../../components/shared/ActionInput";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const VolunteerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const { addToast } = useToast();

  // 📧 Email Flow States
  const [emailStep, setEmailStep] = useState(0); 
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // 🆔 ID Verification States
  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [idSubmitting, setIdSubmitting] = useState(false);
  const [showIdForm, setShowIdForm] = useState(false);

  // 📸 Image Flow States
  const [pfpModalOpen, setPfpModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/volunteers/profile/me");
      const data = res.data;

      setProfile(data);
      setForm({
        name: data.name || "",
        skills: data.skills?.join(", ") || "",
        zone: data.zone || "",
      });
    } catch (err) {
      addToast("Failed to load profile", "error");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const profileSkeletonLayout = [
    { type: 'row', className: "flex-col lg:flex-row justify-between items-start lg:items-center gap-6", cols: [
        { type: 'row', className: "w-full lg:w-auto", cols: [
            { type: 'circle', size: 96, className: "shrink-0" },
            { type: 'stack', items: [ { type: 'text', width: 200, height: 32 }, { type: 'text', width: 150 } ] }
        ]},
        { type: 'row', className: "w-full lg:w-auto", cols: [ { type: 'rect', width: 180, height: 56 }, { type: 'rect', width: 140, height: 56 } ] }
    ]},
    { type: 'grid', cols: 4, item: { type: 'rect', height: 140 } },
    { type: 'grid', cols: 3, items: [
        { type: 'rect', height: 400 },
        { type: 'rect', height: 400, className: "lg:col-span-2" }
    ]}
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        skills: form.skills.split(",").map((s) => s.trim()),
        zone: form.zone,
      };
      const res = await API.patch("/volunteers/profile/me", payload);
      setProfile(res.data);
      setEditing(false);
      addToast("Profile updated successfully! 🚀", "success");
    } catch (err) {
      addToast(err.response?.data?.detail || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!newEmail) return setEmailError("Email is required");
    setEmailLoading(true);
    setEmailError("");
    try {
      await API.post("/volunteers/profile/me/email/request-otp", { new_email: newEmail });
      setEmailStep(2);
    } catch (err) {
      setEmailError(err.response?.data?.detail || "Failed to send OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setEmailError("OTP is required");
    setEmailLoading(true);
    setEmailError("");
    try {
      await API.post("/volunteers/profile/me/email/verify", { otp });
      addToast("Email verified successfully! 🎉", "success");
      setEmailStep(0);
      setNewEmail("");
      setOtp("");
      await fetchProfile();
    } catch (err) {
      setEmailError(err.response?.data?.detail || "Verification failed");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleIdSubmit = async () => {
    if (!/^\d{4}$/.test(aadhaarLast4)) {
      return addToast("Please enter exactly 4 digits", "warning");
    }
    setIdSubmitting(true);
    try {
      await API.patch("/volunteers/profile/me/id-verify", { aadhaar_last_4: aadhaarLast4 });
      addToast("ID submitted for verification! 🆔", "success");
      setShowIdForm(false);
      await fetchProfile();
    } catch (err) {
      addToast(err.response?.data?.detail || "ID submission failed", "error");
    } finally {
      setIdSubmitting(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!profile || profile.status === "ON_MISSION") return;
    const newStatus = profile.status === "AVAILABLE" ? "BUSY" : "AVAILABLE";
    setSaving(true);
    try {
      const res = await API.patch("/volunteers/profile/me/status", { status: newStatus });
      setProfile(res.data);
      addToast(`You are now ${newStatus.toLowerCase()}! ✨`, "success");
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to update status", "error");
    } finally {
      setSaving(false);
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
      setProfile({ ...profile, profile_image_url: res.data.profile_image_url });
      addToast("Profile picture updated! 📸", "success");
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
    try {
      await API.delete("/users/me/image");
      setProfile({ ...profile, profile_image_url: null });
      addToast("Profile picture removed. ✨", "success");
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      addToast(err.response?.data?.detail || "Removal failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonStructure layout={profileSkeletonLayout} className="mt-10" />;
  }

  return (
    <div className="space-y-10 selection:bg-primary/20">
      {/* 🔹 HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fadeIn">
        <div className="flex gap-6 items-center">
          <div 
            className="relative group cursor-pointer"
            onClick={() => setPfpModalOpen(true)}
          >
            <div className="absolute -inset-1 bg-primaryGradient rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img
                src={resolveProfileImage(profile.profile_image_url)}
                alt="profile"
                className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl group-hover:brightness-50 transition-all"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
              <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
          </div>

            <div className="flex flex-col">
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Volunteer Personnel</p>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-outfit font-black text-on_surface">{profile.name}</h1>
                    <VerificationBadge trustTier={profile.trust_tier} telegramActive={profile.telegram_active} />
                </div>
                <p className="text-on_surface_variant flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {profile.zone || "Location not specified"}
                </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <motion.div 
                whileHover={{ scale: profile.status !== 'ON_MISSION' ? 1.02 : 1 }}
                whileTap={{ scale: profile.status !== 'ON_MISSION' ? 0.98 : 1 }}
                onClick={handleStatusToggle}
                className={`
                    px-6 py-4 rounded-3xl border-2 transition-all cursor-pointer group flex items-center gap-4 relative overflow-hidden
                    ${profile.status === 'AVAILABLE' ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10" 
                        : profile.status === 'ON_MISSION' ? "bg-primary/5 border-primary/20 cursor-not-allowed"
                        : "bg-surface_high border-on_surface_variant/10 hover:bg-surface_highest"}
                    ${saving ? "opacity-70 pointer-events-none" : ""}
                `}
            >
                {saving && (
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                    />
                )}
                <div className={`w-3 h-3 rounded-full ${saving ? "animate-spin border-2 border-primary border-t-transparent" : "animate-pulse"} ${
                    profile.status === 'AVAILABLE' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
                    profile.status === 'ON_MISSION' ? "bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" : "bg-on_surface_variant/30"
                }`}></div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant opacity-50 leading-none mb-1">
                        {saving ? "Updating Status..." : "Dispatch Readiness"}
                    </p>
                    <p className={`text-sm font-black font-outfit ${profile.status === 'AVAILABLE' ? "text-green-600" : profile.status === 'ON_MISSION' ? "text-primary" : "text-on_surface_variant"}`}>
                        {profile.status}
                    </p>
                </div>
                {profile.status !== 'ON_MISSION' && !saving && (
                    <span className="material-symbols-outlined text-sm text-on_surface_variant/30 group-hover:text-primary transition-colors">
                        {profile.status === 'AVAILABLE' ? 'pause_circle' : 'play_circle'}
                    </span>
                )}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(!editing)}
              className={`px-8 py-4 rounded-[1.5rem] font-bold transition-all flex items-center gap-2 ${editing ? "bg-surface_high text-on_surface_variant" : "bg-primaryGradient text-white shadow-lg shadow-primary/25"}`}
            >
              <span className="material-symbols-outlined text-sm">{editing ? "close" : "edit_square"}</span>
              {editing ? "Cancel Editing" : "Modify Profile"}
            </motion.button>
        </div>
      </div>

      {/* 🔹 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Trust Score" value={profile.trust_score} icon="verified" delay="100ms" />
        <MetricCard label="Rank Tier" value={profile.trust_tier} icon="military_tech" delay="200ms" />
        <MetricCard label="Accomplishments" value={profile.completions} icon="task_alt" delay="300ms" />
        <MetricCard label="Service Hours" value={profile.hours_served} icon="schedule" highlight delay="400ms" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <ContentSection title="Identity & Verification" icon="badge" delay="500ms">
            <div className="space-y-4">
                <DataRow
                    label="Email Proof"
                    status={profile.is_email_verified}
                    description={profile.is_email_verified ? "Email Validated" : "Verification Required"}
                    action={!profile.is_email_verified && (
                        <button onClick={() => { setEmailStep(1); setNewEmail(profile.email); }} className="text-[10px] bg-primary text-white px-3 py-1 rounded-lg font-bold hover:opacity-90 transition-all">Verify Email</button>
                    )}
                />
                <DataRow
                    label="Identity Shield"
                    status={profile.id_verified}
                    description={profile.id_verified ? "Verified" : (profile.aadhaar_last_4 ? `Pending Review (****${profile.aadhaar_last_4})` : "Unverified")}
                    action={!profile.id_verified && !profile.aadhaar_last_4 && !showIdForm && (
                        <button onClick={() => setShowIdForm(true)} className="text-[10px] bg-primary text-white px-3 py-1 rounded-lg font-bold hover:opacity-90 transition-all">Secure ID</button>
                    )}
                />

                {showIdForm && (
                    <div className="bg-surface_highest p-4 rounded-xl border border-primary/20 space-y-3 animate-slide-up">
                        <p className="text-[10px] font-black uppercase text-primary">Enter Last 4 Digits of Aadhaar</p>
                        <div className="flex gap-2">
                            <ActionInput value={aadhaarLast4} maxLength={4} placeholder="0000" onChange={setAadhaarLast4} className="w-20" />
                            <button onClick={handleIdSubmit} disabled={idSubmitting} className="flex-1 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50">{idSubmitting ? "..." : "Submit"}</button>
                            <button onClick={() => setShowIdForm(false)} className="px-3 bg-white text-on_surface_variant rounded-lg text-xs font-bold hover:bg-surface_high">✕</button>
                        </div>
                    </div>
                )}

                <DataRow label="Account Verified" status={profile.is_active} description={profile.is_active ? "Linked & Secured" : "Partial Access"} />
            </div>
          </ContentSection>

          <ContentSection title="Contact Channels" icon="alternate_email" delay="600ms">
            <div className="space-y-5">
                <DataRow type="info" label="E-Mail Address" value={profile.email} action={
                    <button onClick={() => setEmailStep(1)} className="opacity-0 group-hover:opacity-100 transition-all px-3 py-1 bg-surface_high text-primary text-[10px] font-bold rounded-lg">Update</button>
                } />
                <DataRow type="info" label="Secure Contact" value={profile.phone_number} />
            </div>
            
            {emailStep > 0 && (
              <div className="mt-6 p-6 bg-surface_high rounded-2xl border-2 border-primary/20 animate-slide-up space-y-4">
                <div className="flex justify-between items-center font-outfit">
                  <span className="font-bold text-primary tracking-tight">{emailStep === 1 ? "Update Email Profile" : "Validate Code"}</span>
                  <button onClick={() => setEmailStep(0)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs shadow-sm hover:bg-error/10 hover:text-error transition-all">✕</button>
                </div>

                {emailStep === 1 ? (
                  <div className="space-y-3">
                    <ActionInput type="email" placeholder="Enter new email" value={newEmail} onChange={setNewEmail} />
                    <button onClick={handleRequestOtp} disabled={emailLoading} className="w-full py-3 bg-primaryGradient text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50">
                      {emailLoading ? "Sending Verification..." : "Request Security Code"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[10px] text-on_surface_variant leading-relaxed text-center">We've sent a code to <span className="font-bold text-primary">{newEmail}</span>.</p>
                    <input type="text" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-4 text-center text-2xl tracking-[1em] font-black bg-white border-none rounded-2xl focus:ring-2 focus:ring-primary shadow-sm" maxLength={6} />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleVerifyOtp} disabled={emailLoading} className="w-full py-4 bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                      {emailLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {emailLoading ? "Validating..." : "Complete Verification"}
                    </motion.button>
                  </div>
                )}
                {emailError && <p className="text-[10px] text-error text-center font-bold px-4 py-2 bg-error/10 rounded-lg">{emailError}</p>}
              </div>
            )}
          </ContentSection>
        </div>

        <div className="lg:col-span-2 space-y-8">
            {!editing ? (
            <ContentSection title="Portfolio & Skills" icon="star" delay="700ms">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <DataRow type="info" label="Primary Name" value={profile.name} description="Public Display Name" />
                        <DataRow type="info" label="Current Zone" value={profile.zone} description="Operational Area" />
                    </div>
                    <div>
                        <p className="text-[10px] text-on_surface_variant uppercase font-black tracking-widest leading-none mb-4">Competency Map</p>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.length > 0 ? profile.skills.map((s, i) => (
                                <span key={i} className="px-4 py-2 text-xs font-bold rounded-xl bg-surface_high text-primary border border-primary/5 transition-all hover:scale-105 active:scale-95">{s}</span>
                            )) : <p className="text-xs text-on_surface_variant italic">No skills listed yet.</p>}
                        </div>
                    </div>
                </div>
            </ContentSection>
            ) : (
            <ContentSection title="Modify Your Profile" icon="edit_note" delay="0ms">
              <div className="space-y-6 max-w-2xl">
                <ActionInput label="Display Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <ActionInput label="Skills (Comma separated)" value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} placeholder="Medical, Driving, Teaching..." />
                <ActionInput label="Operational Zone" value={form.zone} onChange={(v) => setForm({ ...form, zone: v })} placeholder="e.g. Lucknow, Zone 4" />

                <div className="flex gap-4 pt-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-primaryGradient text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                        {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {saving ? "Saving Changes..." : "Commit Update"}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditing(false)} className="px-8 py-4 bg-surface_high text-on_surface_variant rounded-2xl font-bold hover:bg-surface_highest transition-all">Discard</motion.button>
                </div>
              </div>
            </ContentSection>
            )}

            <ContentSection title="Recent Mission Activity" icon="history" delay="800ms">
               <div className="py-12 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                    <span className="material-symbols-outlined text-4xl mb-4 text-on_surface_variant">hourglass_empty</span>
                    <p className="text-sm font-bold">Waiting for your first mission...</p>
                    <p className="text-[10px] uppercase tracking-widest mt-1">Assignments will appear here once approved by an NGO</p>
               </div>
            </ContentSection>
        </div>
      </div>

      {pfpModalOpen && (
        <ProfileImageModal 
          currentImage={profile.profile_image_url} 
          onCropComplete={handleCropComplete} 
          onRemove={handleRemoveImage}
          onCancel={() => setPfpModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default VolunteerDashboard;

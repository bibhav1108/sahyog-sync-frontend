import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import ActionInput from "../../../components/shared/ActionInput";

const OrgIdentityPage = () => {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        about: "",
        website_url: ""
    });

    const { addToast } = useToast();

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await API.get("/organizations/me");
                if (res.data) {
                    setOrg(res.data);
                    setFormData({
                        name: res.data.name || "",
                        phone: res.data.contact_phone || "",
                        email: res.data.contact_email || "",
                        about: res.data.about || "",
                        website_url: res.data.website_url || ""
                    });
                } else {
                    setIsOnboarding(true);
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setIsOnboarding(true);
                } else {
                    console.error("Fetch failed", err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.name || !formData.phone || !formData.email) {
            addToast("Mandatory fields are missing from the configuration.", "error");
            return;
        }

        setSaving(true);
        try {
            if (isOnboarding) {
                const res = await API.post("/ngo-admin/onboard", {
                    org_name: formData.name,
                    org_phone: formData.phone,
                    org_email: formData.email,
                    about: formData.about,
                    website_url: formData.website_url
                });
                addToast("Entity successfully initialized and queued for verification.", "success");
                window.location.reload(); // Refresh to exit onboarding mode
            } else {
                const res = await API.patch("/organizations/me", {
                    about: formData.about,
                    website_url: formData.website_url,
                    contact_phone: formData.phone,
                    contact_email: formData.email
                });
                setOrg(res.data);
                addToast("Identity record updated across the network.", "success");
            }
        } catch (err) {
            addToast(err.response?.data?.detail || "Operation failed", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <SkeletonStructure layout={[{type: 'rect', height: 400, className: "rounded-[3rem]"}]} />;

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
            {/* Header Section */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-black text-on_surface tracking-tight">
                    {isOnboarding ? "NGO Setup" : "NGO Profile"}
                </h1>
                <p className="text-on_surface_variant max-w-lg font-medium leading-relaxed">
                    Update your organization's public information and contact details.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="p-8 md:p-10 rounded-3xl bg-white border border-on_surface/5 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Organization Name</label>
                             <input 
                                disabled={!isOnboarding}
                                className={`w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent transition-all rounded-2xl ${!isOnboarding ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none'}`}
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Red Cross"
                             />
                        </div>

                        <ActionInput 
                            label="Contact Phone" 
                            value={formData.phone} 
                            onChange={v => setFormData({...formData, phone: v})} 
                            placeholder="+91..."
                        />
                    </div>

                    <ActionInput 
                        label="Contact Email" 
                        value={formData.email} 
                        onChange={v => setFormData({...formData, email: v})} 
                        placeholder="contact@org.org"
                        type="email"
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">About My NGO</label>
                        <textarea 
                            className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all rounded-3xl min-h-[140px] outline-none leading-relaxed"
                            value={formData.about}
                            onChange={e => setFormData({...formData, about: e.target.value})}
                            placeholder="Tell us about your organization's work and community impact..."
                        />
                    </div>

                    <ActionInput 
                        label="Website (Optional)" 
                        value={formData.website_url} 
                        onChange={v => setFormData({...formData, website_url: v})} 
                        placeholder="https://..."
                    />

                    <div className="pt-4">
                        <button 
                            disabled={saving}
                            type="submit"
                            className="w-full py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {saving ? "Saving Changes..." : "Save Profile"}
                        </button>
                    </div>
                </div>

                {/* Status Banner */}
                {!isOnboarding && (
                    <div className="p-6 rounded-2xl bg-surface_high border border-on_surface/5 flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${org?.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                             <span className="material-symbols-outlined text-3xl">{org?.status === 'active' ? 'verified' : 'hourglass_top'}</span>
                         </div>
                         <div className="space-y-1">
                             <h4 className="text-sm font-bold text-on_surface uppercase tracking-tight">NGO Status</h4>
                             <p className="text-xs text-on_surface_variant font-medium">
                                 {org?.status === 'active' 
                                     ? "Your organization is verified and active on the platform."
                                     : "Verification is pending. Some tactical features will be unlocked once approved."}
                             </p>
                         </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default OrgIdentityPage;

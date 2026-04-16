import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import VerificationBadge from "../../components/shared/VerificationBadge";
import { useToast } from "../../context/ToastContext";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import ActionInput from "../../components/shared/ActionInput";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const OrganizationProfile = () => {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ about: "", website_url: "" });
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                setLoading(true);
                const res = await API.get("/organizations/me");
                setOrg(res.data);
                setEditData({
                    about: res.data.about || "",
                    website_url: res.data.website_url || ""
                });
            } catch (err) {
                console.error("Failed to load org profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await API.patch("/organizations/me", editData);
            setOrg(res.data);
            setIsEditing(false);
            addToast("Unit profile updated successfully! 🛡️", "success");
        } catch (err) {
            addToast("Failed to upgrade profile parameters", "error");
        } finally {
            setSaving(false);
        }
    };

    const skeletonLayout = [
        { type: 'rect', height: 220, className: "rounded-[3rem] mb-8" },
        { type: 'row', cols: [
            { type: 'stack', width: '66%', gap: 4, items: [{ type: 'rect', height: 400, className: "rounded-[3rem]" }] },
            { type: 'stack', width: '33%', gap: 4, items: [
                { type: 'rect', height: 250, className: "rounded-[2.5rem]" },
                { type: 'rect', height: 120, className: "rounded-[2.5rem]" }
            ]}
        ]}
    ];

    if (loading) return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <SkeletonStructure layout={skeletonLayout} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32 selection:bg-primary/10 animate-fadeIn">
            {/* HERO BRANDING */}
            <div className="relative overflow-hidden rounded-[4rem] bg-surface_high border border-white p-12 md:p-16 shadow-2xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primaryGradient opacity-5 blur-[100px] -mr-32" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white flex items-center justify-center p-6 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                             <span className="material-symbols-outlined text-primary text-[64px] font-black">corporate_fare</span>
                        </div>
                        <div className="text-center md:text-left space-y-3">
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <h1 className="text-5xl font-outfit font-black text-on_surface tracking-tight">
                                    {org?.name}
                                </h1>
                                <VerificationBadge status={org?.status} />
                            </div>
                            <p className="text-sm font-bold text-on_surface_variant/60 italic max-w-lg">
                                "{org?.description || "Strategic partner in humanitarian operations and community asset management."}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-8 space-y-10">
                    <ContentSection title="Organizational Details" icon="public" noPadding>
                        <div className="p-10 space-y-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Tactical Mission Statement</p>
                                    <h2 className="text-2xl font-outfit font-black text-on_surface tracking-tight">Profile Data Overview</h2>
                                </div>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all hover:text-white">
                                        Update Mission
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-8 animate-fadeIn">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">About the Organization</label>
                                        <textarea 
                                            rows={8}
                                            className="w-full bg-surface_high border border-on_surface/5 rounded-3xl p-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all custom-scrollbar"
                                            value={editData.about}
                                            onChange={(e) => setEditData({...editData, about: e.target.value})}
                                            placeholder="Define your organization's mission and field objectives..."
                                        />
                                    </div>
                                    <ActionInput label="Official Operations Hub (Website)" placeholder="https://..." value={editData.website_url} onChange={(val) => setEditData({...editData, website_url: val})} />
                                    <div className="flex gap-4 pt-4">
                                        <button disabled={saving} onClick={handleSave} className="flex-1 py-4 bg-on_surface text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                                            {saving ? "Executing Update..." : "Authorize Mission Change"}
                                        </button>
                                        <button onClick={() => { setIsEditing(false); setEditData({ about: org?.about || "", website_url: org?.website_url || "" }); }} className="px-8 py-4 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-lg font-bold text-on_surface_variant/80 leading-relaxed max-w-2xl">
                                    {org?.about || "We operate as a core logistics node in the humanitarian supply chain, leveraging shared intelligence to maximize the impact of every deployment."}
                                </p>
                            )}

                            <div className="pt-10 border-t border-on_surface/5 flex flex-wrap gap-12">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40">Launch Operations Hub</p>
                                    <a href={org?.website_url || "#"} className="text-sm font-black text-primary hover:underline flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                                        {org?.website_url || "hub.sahyogsync.org"}
                                    </a>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40">Institutional Sector</p>
                                    <p className="text-sm font-black text-on_surface">Strategic Humanitarian Group</p>
                                </div>
                            </div>
                        </div>
                    </ContentSection>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-10">
                    <ContentSection title="Verified Contact" icon="verified_user">
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 group">
                                 <div className="w-12 h-12 rounded-2xl bg-surface_high flex items-center justify-center text-primary group-hover:bg-primaryGradient group-hover:text-white transition-all shadow-sm">
                                     <span className="material-symbols-outlined text-xl">mail</span>
                                 </div>
                                 <div>
                                     <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-0.5">Primary Intel</p>
                                     <p className="font-bold text-sm text-on_surface truncate max-w-[200px]">{org?.contact_email}</p>
                                 </div>
                            </div>
                            <div className="flex items-center gap-5 group">
                                 <div className="w-12 h-12 rounded-2xl bg-surface_high flex items-center justify-center text-primary group-hover:bg-primaryGradient group-hover:text-white transition-all shadow-sm">
                                     <span className="material-symbols-outlined text-xl">call</span>
                                 </div>
                                 <div>
                                     <p className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 mb-0.5">Secure Line</p>
                                     <p className="font-bold text-sm text-on_surface">{org?.contact_phone}</p>
                                 </div>
                            </div>
                            <div className="pt-6 border-t border-on_surface/5">
                                <p className="text-[10px] font-bold text-on_surface_variant/40 leading-relaxed">
                                    Security clearance required for contact modifications. Submit formal request to HQ.
                                </p>
                            </div>
                        </div>
                    </ContentSection>

                    {/* STATUS CARD */}
                    <div className="bg-on_surface rounded-[2.5rem] p-10 text-white text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primaryGradient opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Sync Identity Protocol</p>
                        <h4 className="text-4xl font-outfit font-black italic tracking-tighter uppercase mb-6">Verified</h4>
                        <div className="inline-block px-6 py-2.5 bg-white/5 rounded-2xl text-[10px] font-black tracking-widest border border-white/10">
                            UNIT-ID-{String(org?.id || 0).padStart(4, '0')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationProfile;

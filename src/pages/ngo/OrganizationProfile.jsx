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
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">About Organization</p>
                                    <h2 className="text-3xl font-outfit font-black text-on_surface mb-4 tracking-tight">Organization Bio</h2>
                                    <p className="text-sm text-on_surface_variant leading-relaxed font-medium">
                                        {org?.about || "No summary provided yet."}
                                    </p>
                                </div>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all hover:text-white">
                                        Update Bio
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-8 animate-fadeIn">
                                    <h3 className="text-lg font-black text-on_surface">
                                        Update About Summary
                                    </h3>
                                    <p className="text-xs font-bold text-on_surface_variant/60 mb-6">Define your organization's primary goals and community service areas.</p>
                                    
                                    <div className="space-y-4">
                                        <textarea
                                            value={editData.about}
                                            onChange={(e) => setEditData({...editData, about: e.target.value})}
                                            className="w-full min-h-[160px] p-6 bg-surface_high border-2 border-transparent focus:border-primary/20 rounded-[2rem] text-sm font-medium outline-none transition-all shadow-inner"
                                            placeholder="Define your organization's primary goals and local impact..."
                                        />
                                        <ActionInput label="Official Operations Hub (Website)" placeholder="https://..." value={editData.website_url} onChange={(val) => setEditData({...editData, website_url: val})} />
                                        <button 
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="w-full py-4 bg-on_surface text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3"
                                        >
                                            {saving ? "Updating..." : "Apply Changes"}
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

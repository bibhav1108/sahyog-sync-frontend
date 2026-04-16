import { useEffect, useState } from "react";
import API from "../services/api";
import Skeleton from "../components/Skeleton";
import VerificationBadge from "../components/VerificationBadge";

const OrganizationProfile = () => {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ about: "", website_url: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
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
        } catch (err) {
            alert("Failed to update organization profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton height={200} className="rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Skeleton height={300} className="rounded-3xl" />
                </div>
                <Skeleton height={300} className="rounded-3xl" />
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* HERO BRANDING */}
            <div className="relative overflow-hidden rounded-3xl bg-surface_high border border-white/5 shadow-soft">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center p-4 shadow-xl rotate-3">
                             <span className="material-symbols-outlined text-primary text-[48px]">corporate_fare</span>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-extrabold flex items-center gap-3">
                                {org?.name}
                                <VerificationBadge status={org?.status} />
                            </h1>
                            <p className="text-on_surface_variant opacity-70 mt-1 font-medium italic">
                                "{org?.description || "Dedicated to social impact and community empowerment."}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* IDENTITY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* ABOUT SECTION */}
                    <div className="bg-surface_high p-8 rounded-3xl border border-white/5 h-full relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                             <span className="material-symbols-outlined text-[100px]">info</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">public</span>
                                Organization Profile
                            </h2>
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition"
                                >
                                    Edit Mission
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-6 relative">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Mission Statement / About Us</label>
                                    <textarea 
                                        rows={6}
                                        className="w-full bg-surface_highest/50 rounded-2xl p-6 border border-white/10 outline-none focus:border-primary/50 transition-colors"
                                        value={editData.about}
                                        onChange={(e) => setEditData({...editData, about: e.target.value})}
                                        placeholder="Explain your organization's mission and goals..."
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        disabled={saving}
                                        onClick={handleSave}
                                        className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
                                    >
                                        {saving ? "Saving Changes..." : "Save Mission"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditData({ about: org?.about || "", website_url: org?.website_url || "" });
                                        }}
                                        className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-on_surface_variant leading-relaxed text-lg">
                                {org?.about || "We are a community-driven organization committed to bridging the gap in humanitarian logistics. Our mission is to scale compassion through technology."}
                            </p>
                        )}
                        
                        <div className="mt-8 pt-6 border-t border-black/5 flex flex-wrap gap-6">
                            <div className="flex flex-col flex-1 min-w-[200px]">
                                <span className="text-[10px] uppercase font-black opacity-30 tracking-widest">Website Hub</span>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="mt-1 bg-surface_highest/30 border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/30 mt-2"
                                        value={editData.website_url}
                                        onChange={(e) => setEditData({...editData, website_url: e.target.value})}
                                        placeholder="https://yourwebsite.org"
                                    />
                                ) : (
                                    <a href={org?.website_url || "#"} className="text-primary font-bold hover:underline transition">
                                        {org?.website_url || "sahyogsync.org/nexus"}
                                    </a>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black opacity-30 tracking-widest">Type</span>
                                <span className="font-bold opacity-80">Humanitarian NGO</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* CONTACT CARD */}
                    <div className="bg-surface_high p-6 rounded-3xl border border-white/5 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-40">Verified Contact</h3>
                        
                        <div className="flex items-center gap-4 group">
                             <div className="w-10 h-10 rounded-xl bg-surface_highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                 <span className="material-symbols-outlined text-[20px]">mail</span>
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-[10px] font-bold opacity-30 uppercase">Email</span>
                                 <span className="font-semibold text-sm truncate">{org?.contact_email}</span>
                             </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                             <div className="w-10 h-10 rounded-xl bg-surface_highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                 <span className="material-symbols-outlined text-[20px]">call</span>
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-[10px] font-bold opacity-30 uppercase">Phone</span>
                                 <span className="font-semibold text-sm">{org?.contact_phone}</span>
                             </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-[10px] text-on_surface_variant leading-relaxed opacity-60">
                                Contact information is verified during NGO onboarding and can only be changed via formal request to technical support.
                            </p>
                        </div>
                    </div>

                    {/* STATUS CARD */}
                    <div className="bg-primaryGradient rounded-3xl p-6 text-white text-center shadow-soft">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Sync Identity</p>
                        <h4 className="text-3xl font-black mt-1 uppercase italic tracking-tighter">Verified</h4>
                        <div className="mt-4 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold border border-white/20">
                            ORG-ID-{String(org?.id || 0).padStart(4, '0')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationProfile;

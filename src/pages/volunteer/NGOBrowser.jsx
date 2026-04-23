import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { resolveProfileImage, handleImageError } from "../../utils/imageUtils";
import { formatExternalUrl } from "../../utils/urlUtils";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const NGOBrowser = () => {
    const [organizations, setOrganizations] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [expandedOrg, setExpandedOrg] = useState(null);

    const fetchData = async () => {
        try {
            const [orgsRes, requestsRes] = await Promise.all([
                API.get("/organizations/public"),
                API.get("/volunteers/join-requests/my")
            ]);
            setOrganizations(orgsRes.data || []);
            setMyRequests(requestsRes.data || []);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const hasActiveEngagement = myRequests.some(r => r.status === "PENDING" || r.status === "APPROVED");
    const myCurrentNGO = myRequests.find(r => r.status === "APPROVED");

    const handleApply = async (orgId) => {
        try {
            setActionLoading(orgId);
            const res = await API.post("/volunteers/join-requests/", { org_id: orgId });
            setMyRequests([...myRequests, res.data]);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (requestId) => {
        try {
            setActionLoading(`cancel-${requestId}`);
            await API.delete(`/volunteers/join-requests/${requestId}`);
            setMyRequests(myRequests.filter(r => r.id !== requestId));
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = async () => {
        if (!confirm("Confirm resignation from organization? Tactical re-deployment will require new authorization.")) return;
        try {
            setActionLoading("leave");
            await API.post("/volunteers/join-requests/leave");
            setMyRequests(myRequests.filter(r => r.status !== "APPROVED"));
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const getOrgRequest = (orgId) => {
        return myRequests.find(r => r.org_id === orgId);
    };

    const skeletonLayout = [
        { type: 'stack', gap: 4, items: Array(6).fill({ 
            type: 'row', 
            className: "flex-col lg:flex-row items-center justify-between gap-6 p-6 sm:p-10 bg-white/40 rounded-3xl", 
            cols: [
                { type: 'row', className: "w-full lg:w-1/3 items-center gap-4", cols: [
                    { type: 'rect', width: 48, height: 48, className: "rounded-2xl shrink-0" },
                    { type: 'stack', items: [ { type: 'text', width: '80%', height: 20 }, { type: 'text', width: '40%' } ] }
                ]},
                { type: 'rect', width: 100, height: 20, className: "hidden lg:block" },
                { type: 'rect', width: 80, height: 24, className: "hidden lg:block rounded-full" },
                { type: 'rect', width: 140, height: 44, className: "w-full lg:w-auto rounded-xl" }
            ]
        }) }
    ];

    return (
        <div className="space-y-8 selection:bg-primary/10 animate-fadeIn p-4 md:p-8">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primaryGradient rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/20 shrink-0">
                        <span className="material-symbols-outlined text-3xl font-black">diversity_3</span>
                    </div>
                    <div>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">NGO Directory</p>
                        <h1 className="text-3xl sm:text-4xl font-outfit font-black text-on_surface tracking-tight">Browse Organizations</h1>
                        <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Connect with organizations making a real impact in your community.</p>
                    </div>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <MetricCard label="Registered NGOs" value={organizations.length} icon="public" />
                    <MetricCard label="Your Support" value={myRequests.length} icon="favorite" />
                </div>
            </div>

            {/* ACTIVE MEMBERSHIP BANNER */}
            {myCurrentNGO && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primaryGradient p-[1px] rounded-[2.5rem] shadow-2xl shadow-primary/20 overflow-hidden"
                >
                    <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl font-black">verified_user</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Your Current Organization</p>
                                <h3 className="text-xl sm:text-2xl font-outfit font-black text-on_surface tracking-tight">You are a member of {myCurrentNGO.org_name}</h3>
                            </div>
                        </div>
                        <button 
                            onClick={handleLeave}
                            disabled={actionLoading === "leave"}
                            className="w-full md:w-auto px-10 py-4 bg-on_surface text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-error transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {actionLoading === "leave" ? "Processing..." : "Leave Organization"}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* NGO LIST */}
            <div className="bg-surface_high/20 backdrop-blur-md rounded-[3rem] border border-white/40 overflow-hidden shadow-soft">
                {/* TABLE HEAD (Desktop) */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-10 py-6 border-b border-on_surface/5 bg-on_surface/[0.02]">
                    <div className="col-span-4 text-[10px] font-black uppercase tracking-widest opacity-40">Organization Name</div>
                    <div className="col-span-3 text-[10px] font-black uppercase tracking-widest opacity-40">Quick Info</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Status</div>
                    <div className="col-span-3 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Action</div>
                </div>

                <div className="divide-y divide-on_surface/5">
                    {loading ? (
                        <div className="p-10"><SkeletonStructure layout={skeletonLayout} /></div>
                    ) : organizations.length === 0 ? (
                        <div className="text-center py-40">
                            <span className="material-symbols-outlined text-6xl opacity-10 mb-4">public_off</span>
                            <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No organizations found</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {organizations.map((org, i) => {
                                const request = getOrgRequest(org.id);
                                const isMember = myCurrentNGO && myCurrentNGO.org_id === org.id;
                                
                                return (
                                    <div key={org.id} className="flex flex-col">
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => setExpandedOrg(expandedOrg === org.id ? null : org.id)}
                                            className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-center px-6 sm:px-10 py-6 hover:bg-white transition-all group cursor-pointer ${
                                                isMember ? "bg-primary/5" : "bg-transparent"
                                            }`}
                                        >
                                            {/* Name & Icon */}
                                            <div className="col-span-1 lg:col-span-4 flex items-center gap-5">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-on_surface_variant shadow-sm border border-on_surface/5 group-hover:bg-primaryGradient group-hover:text-white transition-all duration-500 shrink-0 overflow-hidden">
                                                    {org.logo_url ? (
                                                        <img 
                                                            src={resolveProfileImage(org.logo_url)} 
                                                            alt={org.name} 
                                                            className="w-full h-full object-cover"
                                                            onError={handleImageError}
                                                        />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-xl">{expandedOrg === org.id ? 'expand_less' : 'handshake'}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-base font-black text-on_surface group-hover:text-primary transition-colors truncate">{org.name}</h3>
                                                    <p className="text-[9px] font-bold text-on_surface_variant/40 uppercase tracking-widest truncate">Type: {org.ngo_type || "General NGO"}</p>
                                                </div>
                                            </div>

                                            {/* Website */}
                                            <div className="col-span-1 lg:col-span-3 flex flex-col justify-center">
                                                {org.website_url ? (
                                                    <a href={formatExternalUrl(org.website_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                                        <span className="material-symbols-outlined text-sm">language</span>
                                                        Visit Website
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-on_surface_variant/30 uppercase italic">No website listed</span>
                                                )}
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-1 lg:col-span-2 flex items-center lg:justify-center">
                                                {request?.status === "PENDING" && (
                                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-yellow-500/20">Pending</span>
                                                )}
                                                {isMember && (
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-green-500/20 flex items-center gap-1.5">
                                                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                                                        My NGO
                                                    </span>
                                                )}
                                                {!request && (
                                                    <span className="px-3 py-1 bg-surface_high text-on_surface_variant/40 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-on_surface/5">Available</span>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <div className="col-span-1 lg:col-span-3 text-right flex items-center justify-end gap-4">
                                                {request?.status === "PENDING" ? (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleCancel(request.id); }}
                                                        disabled={actionLoading === `cancel-${request.id}`}
                                                        className="w-full lg:w-auto px-6 py-2.5 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                    >
                                                        {actionLoading === `cancel-${request.id}` ? "Wait..." : "Cancel Request"}
                                                    </button>
                                                ) : isMember ? (
                                                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest mr-4 hidden lg:inline-block italic">You are a member</span>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleApply(org.id); }}
                                                        disabled={actionLoading === org.id || hasActiveEngagement}
                                                        className={`w-full lg:w-auto px-8 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ${
                                                            hasActiveEngagement 
                                                                ? "bg-surface_high text-on_surface_variant/20 cursor-not-allowed" 
                                                                : "bg-on_surface text-white hover:bg-primaryGradient hover:-translate-y-0.5"
                                                        }`}
                                                    >
                                                        {actionLoading === org.id ? "Sending..." : "Join This NGO"}
                                                    </button>
                                                )}
                                                <span className={`material-symbols-outlined transition-transform duration-300 opacity-20 ${expandedOrg === org.id ? 'rotate-180' : ''}`}>expand_more</span>
                                            </div>
                                        </motion.div>

                                        {/* DROPDOWN DETAILS */}
                                        <AnimatePresence>
                                            {expandedOrg === org.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-on_surface/[0.01] border-x border-on_surface/5"
                                                >
                                                    <div className="px-10 py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-primary">
                                                                <span className="material-symbols-outlined text-sm">info</span>
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest">About This NGO</h4>
                                                            </div>
                                                            <p className="text-sm text-on_surface_variant leading-relaxed">
                                                                {org.about || "This organization has not shared a description yet, but they are an active part of our supporting network."}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Main Focus</p>
                                                                <p className="text-sm font-bold text-on_surface">{org.ngo_type || "Social Support"}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Location</p>
                                                                <p className="text-sm font-bold text-on_surface truncate">{org.office_address || "Address not provided"}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Email Us</p>
                                                                <p className="text-sm font-bold text-primary">{org.contact_email}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Contact Phone</p>
                                                                <p className="text-sm font-bold text-on_surface">{org.contact_phone || "Not listed"}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Working Since</p>
                                                                <p className="text-sm font-bold text-on_surface">{new Date(org.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Verification</p>
                                                                <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-xs">verified</span>
                                                                    Official Partner
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NGOBrowser;

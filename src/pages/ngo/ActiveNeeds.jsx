import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import DispatchVolunteersModal from "./components/DispatchVolunteersModal";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const ActiveNeeds = () => {
    const navigate = useNavigate();
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [dispatchModal, setDispatchModal] = useState({ open: false, needId: null });

    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        loadNeeds();
    }, []);

    const loadNeeds = async () => {
        try {
            setLoading(true);
            const res = await API.get("/marketplace/needs/");
            setNeeds((res.data || []).filter(x => x.status !== "COMPLETED"));
        } catch (err) {
            console.error("Failed to load needs:", err);
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const cats = new Set(needs.map(n => n.type).filter(Boolean));
        return ["ALL", ...Array.from(cats)];
    }, [needs]);

    const filtered = useMemo(() => {
        return needs.filter(n => {
            const matchesSearch = (n.type + n.description).toLowerCase().includes(search.toLowerCase());
            const matchesCat = filterCategory === "ALL" || n.type === filterCategory;
            return matchesSearch && matchesCat;
        });
    }, [needs, search, filterCategory]);

    const stats = useMemo(() => ({
        total: needs.length,
        urgent: needs.filter(n => n.urgency === "HIGH").length,
        pending: needs.filter(n => n.status === "OPEN").length
    }), [needs]);

    const skeletonLayout = [
        { type: 'row', cols: [{type: 'text', width: 200}, {type: 'rect', width: 80, height: 32}] },
        { type: 'stack', gap: 4, items: Array(5).fill({type: 'rect', height: 80, className: "rounded-3xl"}) }
    ];

    return (
        <div className="space-y-8 selection:bg-primary/10 animate-fadeIn max-w-6xl mx-auto px-4 md:px-0">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Needs List</p>
                    <h1 className="text-4xl font-outfit font-black text-on_surface tracking-tight">Community Needs</h1>
                    <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Review and help fulfill requests from your local community.</p>
                </div>
                <div className="flex gap-4">
                    <MetricCard label="High Urgency" value={stats.urgent} icon="emergency_home" className="w-40" />
                    <MetricCard label="Pending" value={stats.pending} icon="pending_actions" className="w-40" />
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface_high/50 p-6 rounded-[2.5rem] border border-white">
                <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-30">search</span>
                    <input 
                        placeholder="Search for needs..." 
                        className="w-full bg-white border border-on_surface/5 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 p-1 bg-surface_highest rounded-xl scrollbar-hide overflow-x-auto max-w-full">
                    {categories.slice(0, 5).map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setFilterCategory(cat)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                filterCategory === cat ? "bg-white text-on_surface shadow-sm" : "text-on_surface_variant/40 hover:text-on_surface"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT LIST */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-8 bg-surface_high/30 rounded-[3rem]">
                        <SkeletonStructure layout={skeletonLayout} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-32 bg-surface_high/30 rounded-[3rem] border-2 border-dashed border-white/20">
                        <span className="material-symbols-outlined text-6xl opacity-10 mb-4">notifications_off</span>
                        <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No active needs found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((need, i) => {
                                const isExpanded = expandedId === need.id;
                                
                                // Parse item name from description if it follows "ITEM: ... | NOTES: ..." format
                                const itemMatch = need.description?.match(/ITEM:\s*(.*?)\s*\|/);
                                const itemName = itemMatch ? itemMatch[1] : null;
                                const displayTitle = itemName && itemName !== "Not Specified" ? itemName : need.type;
                                
                                // Clean description for display (remove ITEM prefix if present)
                                const displayDesc = need.description?.includes("| NOTES:") 
                                    ? need.description.split("| NOTES:")[1].trim()
                                    : need.description;

                                return (
                                    <motion.div 
                                        key={need.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className={`group bg-white/60 backdrop-blur-sm p-5 sm:p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer ${
                                            isExpanded ? "border-primary shadow-2xl scale-[1.01] bg-white ring-4 ring-primary/5" : "border-on_surface/5 hover:border-primary/20 hover:bg-white"
                                        }`}
                                        onClick={() => setExpandedId(isExpanded ? null : need.id)}
                                    >
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-6 flex-1 w-full">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                                                    isExpanded ? "bg-primaryGradient text-white" : "bg-surface_high group-hover:bg-primaryGradient group-hover:text-white"
                                                }`}>
                                                    <span className="material-symbols-outlined text-2xl">
                                                        {isExpanded ? "expand_less" : "volunteer_activism"}
                                                    </span>
                                                </div>
                                                <div className="flex-1 space-y-1 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-base sm:text-lg font-outfit font-black text-on_surface uppercase tracking-tight truncate">
                                                            {displayTitle}
                                                        </h3>
                                                        <div className="flex gap-2">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border ${
                                                                need.urgency === 'HIGH' ? "bg-red-500/10 text-red-500 border-red-500/10" : "bg-primary/10 text-primary border-primary/10"
                                                            }`}>
                                                                {need.urgency}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border bg-surface_high text-on_surface_variant/60 border-on_surface/5">
                                                                {need.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 opacity-40">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[10px] font-black text-primary">category</span>
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{need.quantity}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[10px] font-black text-primary">schedule</span>
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{new Date(need.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate("/ngo/dashboard", { state: { focusId: need.id, focusType: 'need' } });
                                                    }}
                                                    className="p-4 bg-surface_high text-on_surface_variant rounded-2xl hover:bg-black/5 transition-all flex items-center justify-center"
                                                    title="View on Map"
                                                >
                                                    <span className="material-symbols-outlined">explore</span>
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDispatchModal({ open: true, needId: need.id });
                                                    }}
                                                    className="flex-1 md:flex-none px-8 py-3.5 bg-primaryGradient text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-primary/20"
                                                >
                                                    Dispatch
                                                </button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-6 mt-6 border-t border-on_surface/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-40">Description</p>
                                                            <p className="text-xs font-bold text-on_surface_variant leading-relaxed">
                                                                {displayDesc || "No detailed description provided."}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-40">Delivery Location</p>
                                                            <div className="flex items-start gap-3 p-4 bg-surface_high/50 rounded-2xl border border-on_surface/5">
                                                                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                                                                <span className="text-[11px] font-black text-on_surface uppercase leading-tight pt-1">
                                                                    {need.pickup_address || "Central Distribution Hub"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <DispatchVolunteersModal 
                open={dispatchModal.open}
                needId={dispatchModal.needId}
                onClose={() => setDispatchModal({ open: false, needId: null })}
                onSuccess={loadNeeds}
            />
        </div>
    );
};

export default ActiveNeeds;

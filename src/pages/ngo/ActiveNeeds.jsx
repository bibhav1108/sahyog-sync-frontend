import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import DispatchVolunteersModal from "./components/DispatchVolunteersModal";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const ActiveNeeds = () => {
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [dispatchModal, setDispatchModal] = useState({ open: false, needId: null });

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
        { type: 'stack', gap: 4, items: Array(5).fill({type: 'rect', height: 120, className: "rounded-3xl"}) }
    ];

    return (
        <div className="space-y-8 selection:bg-primary/10 animate-fadeIn">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Intelligence Gathering</p>
                    <h1 className="text-4xl font-outfit font-black text-on_surface tracking-tight">Active Needs</h1>
                    <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Situational awareness of resource gaps across the network.</p>
                </div>
                <div className="flex gap-4">
                    <MetricCard label="Urgent Alerts" value={stats.urgent} icon="emergency_home" className="w-40" />
                    <MetricCard label="In Logic" value={stats.pending} icon="pending_actions" className="w-40" />
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface_high/50 p-6 rounded-[2.5rem] border border-white">
                <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm opacity-30">search</span>
                    <input 
                        placeholder="Scan missions & objectives..." 
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

            {/* CONTENT GRID */}
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-12">
                    {loading ? (
                        <ContentSection title="Analyzing Distress Signals..." icon="radar" noPadding>
                            <div className="p-8">
                                <SkeletonStructure layout={skeletonLayout} />
                            </div>
                        </ContentSection>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-32 bg-surface_high/30 rounded-[3rem] border-2 border-dashed border-white/20">
                            <span className="material-symbols-outlined text-6xl opacity-10 mb-4">notifications_off</span>
                            <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No active distress signals detected in current sector</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((need, i) => (
                                    <motion.div 
                                        key={need.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group bg-white/60 backdrop-blur-sm p-8 rounded-[3rem] border border-on_surface/5 hover:bg-white hover:border-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                need.urgency === 'HIGH' ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                                                "bg-primary/10 text-primary border-primary/20"
                                            }`}>
                                                {need.urgency}
                                            </span>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{new Date(need.created_at).toLocaleDateString()}</p>
                                        </div>

                                        <h3 className="text-xl font-outfit font-black text-on_surface tracking-tight mb-3 group-hover:text-primary transition-colors">{need.type}</h3>
                                        <p className="text-xs font-bold text-on_surface_variant/60 leading-relaxed mb-8 line-clamp-3">{need.description}</p>

                                        <div className="space-y-4 border-t border-on_surface/5 pt-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Requested Assets</span>
                                                <span className="text-xs font-black text-on_surface">{need.quantity} units</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Deployment Zone</span>
                                                <span className="text-xs font-black text-primary truncate max-w-[150px]">{need.pickup_address || "Central Sector"}</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => setDispatchModal({ open: true, needId: need.id })}
                                            className="w-full mt-8 py-4 bg-on_surface text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl group-hover:bg-primary transition-all active:scale-95"
                                        >
                                            Deploy Resources
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
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

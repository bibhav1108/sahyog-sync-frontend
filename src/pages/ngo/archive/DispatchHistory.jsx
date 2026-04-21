import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";

// Shared UI Components
import MetricCard from "../../../components/shared/MetricCard";
import ContentSection from "../../../components/shared/ContentSection";
import DataRow from "../../../components/shared/DataRow";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import { generateDispatchReport } from "../../../services/reportService";

const DispatchHistory = () => {
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [view, setView] = useState("day"); // day | month | year

    const loadDispatches = async () => {
        try {
            setLoading(true);
            const res = await API.get("/marketplace/dispatches/");
            const completed = (res.data || [])
                .filter((d) => d.status === "COMPLETED")
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setDispatches(completed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDispatches();
    }, []);

    const groupDispatches = () => {
        const groups = {};
        dispatches.forEach((d) => {
            const date = new Date(d.created_at);
            let key;
            if (view === "day") {
                key = date.toDateString();
            } else if (view === "month") {
                key = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
            } else {
                key = `${date.getFullYear()}`;
            }
            if (!groups[key]) groups[key] = [];
            groups[key].push(d);
        });
        return groups;
    };

    const grouped = groupDispatches();
    const groupKeys = Object.keys(grouped);

    const toggleGroup = (key) => {
        setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const expandAll = () => setCollapsedGroups({});
    const collapseAll = () => {
        const all = {};
        groupKeys.forEach((k) => { all[k] = true; });
        setCollapsedGroups(all);
    };

    const skeletonLayout = [
        { type: 'row', cols: [{type: 'text', width: 120}, {type: 'rect', width: 60, height: 24}] },
        { type: 'stack', gap: 4, items: Array(4).fill({type: 'rect', height: 100, className: "rounded-3xl"}) }
    ];

    return (
        <div className="space-y-8 selection:bg-primary/10 animate-fadeIn">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-center gap-8 text-center lg:text-left">
                <div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Delivery Records</p>
                    <h1 className="text-4xl font-outfit font-black text-on_surface tracking-tight">Dispatch History</h1>
                    <p className="text-xs font-bold text-on_surface_variant/60 mt-1">A timeline of all successfully completed dispatches and resource deliveries.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <button 
                        onClick={() => generateDispatchReport(dispatches, "Full History")}
                        className="flex items-center gap-2 px-6 py-3 bg-on_surface text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all outline-none"
                    >
                        <span className="material-symbols-outlined text-sm">archive</span>
                        Download Full History
                    </button>
                    <MetricCard label="Total Dispatches" value={dispatches.length} icon="history" variant="primary" />
                </div>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface_high/50 p-6 rounded-[2.5rem] border border-white">
                <div className="flex bg-surface_highest p-1 rounded-xl">
                    {["day", "month", "year"].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                view === v ? "bg-white text-on_surface shadow-sm" : "text-on_surface_variant/40 hover:text-on_surface"
                            }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={expandAll} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-on_surface/5 rounded-lg hover:bg-white transition-all">Expand All</button>
                    <button onClick={collapseAll} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-on_surface/5 rounded-lg hover:bg-white transition-all">Collapse All</button>
                </div>
            </div>

            {/* TIMELINE CONTENT */}
            {loading ? (
                <div className="p-8">
                    <SkeletonStructure layout={skeletonLayout} />
                </div>
            ) : dispatches.length === 0 ? (
                <div className="text-center py-40 bg-surface_high/30 rounded-[3.5rem] border-2 border-dashed border-white/20">
                    <span className="material-symbols-outlined text-6xl opacity-10 mb-4">history</span>
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No completed dispatch records found</p>
                </div>
            ) : (
                <div className="relative pl-8 md:pl-12">
                    {/* STEM */}
                    <div className="absolute left-4 md:left-6 top-0 bottom-0 w-[2px] bg-on_surface/5" />

                    <div className="space-y-12">
                        {groupKeys.map((group) => {
                            const items = grouped[group];
                            const collapsed = collapsedGroups[group];

                            return (
                                <div key={group} className="relative space-y-6">
                                    {/* GROUP HEADER */}
                                    <div className="relative flex items-center justify-between pr-4">
                                        <div 
                                            onClick={() => toggleGroup(group)}
                                            className="flex items-center gap-4 cursor-pointer group"
                                        >
                                            <div className="absolute -left-4 md:-left-6 w-3 h-3 bg-white border-2 border-primary rounded-full z-10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                                                {group}
                                            </span>
                                            <span className="material-symbols-outlined text-sm opacity-20 group-hover:opacity-100 transition-opacity">
                                                {collapsed ? "add" : "remove"}
                                            </span>
                                        </div>
                                        
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); generateDispatchReport(items, `${view.toUpperCase()}: ${group}`); }}
                                            className="flex items-center gap-2 p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors border border-primary/5"
                                        >
                                            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Download PDF</span>
                                        </button>
                                    </div>

                                    {!collapsed && (
                                        <div className="space-y-4">
                                            <AnimatePresence mode="popLayout">
                                                {items.map((d, i) => (
                                                    <motion.div
                                                        key={d.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.03 }}
                                                        className="group relative bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-on_surface/5 hover:bg-white hover:border-primary/20 hover:shadow-2xl transition-all duration-300"
                                                    >
                                                        <div className="flex justify-between items-start gap-6">
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-sm font-black text-on_surface uppercase tracking-tight">
                                                                        {d.description || `${d.item_type} delivery`}
                                                                    </p>
                                                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-green-500/10">COMPLETED</span>
                                                                </div>
                                                                <div className="flex items-center gap-4 opacity-40">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Ref ID #{d.id}</span>
                                                                    <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[10px]">person</span> {d.volunteer_name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-black text-on_surface uppercase tracking-tight">{new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => generateDispatchReport(d, `Dispatch: #${d.id}`)}
                                                                    className="p-2 bg-white border border-on_surface/5 rounded-xl hover:bg-primaryGradient hover:text-white hover:border-transparent transition-all shadow-sm"
                                                                    title="Download PDF Log"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DispatchHistory;

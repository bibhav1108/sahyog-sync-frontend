import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";

// Shared UI Components
import MetricCard from "../../../components/shared/MetricCard";
import ContentSection from "../../../components/shared/ContentSection";
import DataRow from "../../../components/shared/DataRow";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import { generateCampaignReport } from "../../../services/reportService";

const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [view, setView] = useState("day");

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await API.get("/campaigns/");
      const completed = (res.data || [])
        .filter((c) => c.status === "COMPLETED")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCampaigns(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const groupCampaigns = () => {
    const groups = {};
    campaigns.forEach((c) => {
      const date = new Date(c.created_at);
      let key;
      if (view === "day") key = date.toDateString();
      else if (view === "month")
        key = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
      else key = `${date.getFullYear()}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  };

  const grouped = groupCampaigns();
  const groupKeys = Object.keys(grouped);

  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const skeletonLayout = [
    { type: 'row', gap: 4, cols: [{type: 'rect', height: 40, width: 250}, {type: 'rect', height: 40, width: 300}] },
    { type: 'stack', gap: 6, items: Array(4).fill({type: 'rect', height: 120, className: "rounded-[2.5rem]"}) }
  ];

  if (loading) return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-10">
        <SkeletonStructure layout={skeletonLayout} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32 selection:bg-primary/10 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Operational Archives</p>
            <h1 className="text-5xl font-outfit font-black text-on_surface tracking-tight">Campaign History</h1>
            <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Full chronological mapping of successful humanitarian activities and resource distribution campaigns.</p>
        </div>
        
        <div className="flex bg-surface_high p-1.5 rounded-2xl border border-on_surface/5 shadow-inner">
          {["day", "month", "year"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                view === v 
                ? "bg-white text-on_surface shadow-xl ring-1 ring-on_surface/5" 
                : "text-on_surface_variant/40 hover:text-on_surface hover:bg-white/50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button 
          onClick={() => generateCampaignReport(campaigns, "Full History")}
          className="flex items-center gap-2 px-6 py-2.5 bg-on_surface text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-black/20 hover:scale-105 active:scale-95 transition-all outline-none"
        >
          <span className="material-symbols-outlined text-sm">archive</span>
          Download Full History
        </button>
      </div>

      <div className="relative">
          {/* TIMELINE THREAD */}
          <div className="absolute left-1 md:left-[2.75rem] top-0 bottom-0 w-0.5 bg-on_surface/5 z-0" />

          <div className="space-y-16">
            {campaigns.length === 0 ? (
                <div className="text-center py-40 bg-surface_high/30 rounded-[3.5rem] border-2 border-dashed border-on_surface/5 ml-0 md:ml-12">
                    <span className="material-symbols-outlined text-6xl opacity-10 mb-4">history_toggle_off</span>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">No historical timeline data available</p>
                </div>
            ) : (
                groupKeys.map((group) => {
                    const items = grouped[group];
                    const collapsed = collapsedGroups[group];

                    return (
                        <div key={group} className="space-y-8">
                            {/* GROUP MARKER */}
                            <div className="relative flex items-center justify-between ml-0 md:ml-8 pr-4">
                                <div
                                    onClick={() => toggleGroup(group)}
                                    className="flex items-center gap-4 cursor-pointer group select-none"
                                >
                                    <div className="z-10 w-4 h-4 rounded-full bg-surface_highest border-2 border-on_surface/5 group-hover:bg-primary transition-colors flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-on_surface_variant opacity-40" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on_surface_variant/60 group-hover:text-primary transition-colors">
                                        {group} ({items.length} units)
                                    </span>
                                    <span className="material-symbols-outlined text-sm opacity-20 group-hover:opacity-100 transition-opacity">
                                        {collapsed ? "keyboard_arrow_down" : "keyboard_arrow_up"}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); generateCampaignReport(items, `${view.toUpperCase()}: ${group}`); }}
                                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors flex items-center gap-2"
                                    title={`Download PDF for ${group}`}
                                >
                                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                    <span className="text-[8px] font-black uppercase tracking-tighter">Period Report</span>
                                </button>
                            </div>

                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 ml-0 md:ml-12"
                                    >
                                        {items.map((c) => (
                                            <div key={c.id} className="relative">
                                                <div className="group bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-on_surface/5 hover:bg-white hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
                                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                                        <div className="flex items-center gap-6 flex-1">
                                                            <div className="w-16 h-16 bg-surface_high group-hover:bg-primaryGradient group-hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-sm shrink-0">
                                                                <span className="material-symbols-outlined text-2xl">verified</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-lg font-black text-on_surface uppercase tracking-tight leading-tight">{c.name}</h4>
                                                                <div className="flex flex-wrap gap-4 pt-1">
                                                                    <div className="flex items-center gap-1.5 opacity-40">
                                                                        <span className="material-symbols-outlined text-sm font-black text-primary">location_on</span>
                                                                        <span className="text-[9px] font-black uppercase tracking-widest">{c.location_address || "Classified Sector"}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 opacity-40">
                                                                        <span className="material-symbols-outlined text-sm font-black text-primary">category</span>
                                                                        <span className="text-[9px] font-black uppercase tracking-widest">{c.type}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right hidden md:block">
                                                                <p className="text-[11px] font-black text-on_surface uppercase tracking-tight">{new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                                                <p className="text-[9px] font-bold text-on_surface_variant/40 tracking-widest text-right mt-1">Campaign End</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="px-5 py-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                                                                    COMPLETED
                                                                </div>
                                                                <button 
                                                                    onClick={() => generateCampaignReport(c, `Campaign: ${c.name}`)}
                                                                    className="p-2.5 bg-white border border-on_surface/5 rounded-xl hover:bg-primaryGradient hover:text-white hover:border-transparent transition-all shadow-sm group/btn"
                                                                    title="Download PDF Analysis"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })
            )}
          </div>
      </div>
    </div>
  );
};

export default CampaignHistory;

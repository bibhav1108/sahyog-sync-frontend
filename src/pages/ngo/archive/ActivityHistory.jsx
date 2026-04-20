import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";

// Shared UI Components
import MetricCard from "../../../components/shared/MetricCard";
import ContentSection from "../../../components/shared/ContentSection";
import DataRow from "../../../components/shared/DataRow";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";

const ActivityHistory = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const eventTypes = [
    { id: "", label: "All Activity" },
    { id: "MISSION_LAUNCHED", label: "Campaigns" },
    { id: "VOLUNTEER_REGISTERED", label: "Volunteers" },
    { id: "INVENTORY_ADDED", label: "Inventory" },
    { id: "PARTICIPANT_APPROVED", label: "Approvals" },
  ];

  useEffect(() => {
    fetchLogs();
  }, [page, filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      let url = `/audit/?skip=${skip}&limit=${limit}`;
      if (filter) url += `&event_type=${filter}`;
      
      const res = await API.get(url);
      setLogs(res.data.items);
      setTotal(res.data.total_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "MISSION_LAUNCHED": return "rocket_launch";
      case "MISSION_COMPLETED": return "task_alt";
      case "PARTICIPANT_APPROVED": return "person_add_alt";
      case "VOLUNTEER_REGISTERED": return "person_add";
      case "INVENTORY_ADDED": return "inventory_2";
      case "INVENTORY_UPDATED": return "edit_note";
      default: return "notifications";
    }
  };

  const totalPages = Math.ceil(total / limit);

  const skeletonLayout = [
    { type: 'row', gap: 4, cols: [{type: 'rect', height: 40, width: 200}, {type: 'rect', height: 40, width: 300}] },
    { type: 'stack', gap: 4, items: Array(6).fill({type: 'rect', height: 80, className: "rounded-3xl"}) }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32 selection:bg-primary/10 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Administrative Logs</p>
            <h1 className="text-5xl font-outfit font-black text-on_surface tracking-tight">Activity History</h1>
            <p className="text-xs font-bold text-on_surface_variant/60 mt-1">A detailed record of team actions, inventory updates, and volunteer activities across the network.</p>
        </div>
        
        <div className="flex bg-surface_high p-1.5 rounded-2xl border border-on_surface/5 shadow-inner">
          {eventTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setFilter(t.id); setPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === t.id 
                ? "bg-white text-on_surface shadow-xl ring-1 ring-on_surface/5" 
                : "text-on_surface_variant/40 hover:text-on_surface hover:bg-white/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <ContentSection title="Recent Activity Logs" icon="manage_search">
        <div className="space-y-4">
            {loading ? (
                <SkeletonStructure layout={skeletonLayout} />
            ) : logs.length === 0 ? (
                <div className="text-center py-40 bg-surface_high/30 rounded-[3.5rem] border-2 border-dashed border-on_surface/5">
                    <span className="material-symbols-outlined text-6xl opacity-10 mb-4">history</span>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">No activity records found in history</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {logs.map((log, i) => (
                            <motion.div 
                                key={log.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="group bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-on_surface/5 hover:bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex items-center gap-6"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-surface_high flex items-center justify-center text-on_surface_variant group-hover:bg-primaryGradient group-hover:text-white transition-all duration-500 shadow-sm shrink-0">
                                    <span className="material-symbols-outlined text-2xl">{getEventIcon(log.event_type)}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-on_surface uppercase tracking-tight truncate leading-tight">{log.notes}</p>
                                    <div className="flex items-center gap-4 mt-1.5 opacity-40">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{log.event_type.replace('_', ' ')}</span>
                                        <span className="w-1 h-1 rounded-full bg-on_surface" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">SEQ #{log.id}</span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-[11px] font-black text-on_surface uppercase tracking-tight">{new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                    <p className="text-[9px] font-bold text-on_surface_variant/40 tracking-widest text-right mt-1">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-between bg-surface_high/50 p-6 rounded-[2.5rem] border border-white">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on_surface_variant/40">
                    Page <span className="text-primary">{page}</span> of {totalPages}
                </p>
                <div className="flex gap-3">
                    <button 
                        disabled={page === 1}
                        onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-12 h-12 rounded-2xl bg-white border border-on_surface/5 flex items-center justify-center text-on_surface_variant hover:bg-primary hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </button>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-12 h-12 rounded-2xl bg-white border border-on_surface/5 flex items-center justify-center text-on_surface_variant hover:bg-primary hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                </div>
            </div>
        )}
      </ContentSection>
    </div>
  );
};

export default ActivityHistory;

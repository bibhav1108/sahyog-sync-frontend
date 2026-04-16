import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

const ActivityHistory = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const eventTypes = [
    { id: "", label: "All Activity" },
    { id: "MISSION_LAUNCHED", label: "Missions" },
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-2 text-xs font-bold text-on_surface_variant hover:text-primary transition-colors group"
      >
        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
        Back to Dashboard
      </Link>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-1">Audit Trail</p>
          <h1 className="text-4xl font-outfit font-black">Activity History</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-soft border border-surface_highest">
          {eventTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setFilter(t.id); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === t.id 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-on_surface_variant hover:bg-surface"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <section className="bg-white rounded-[32px] shadow-soft border border-surface_highest overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface_lowest text-[10px] uppercase font-black tracking-widest text-on_surface_variant border-b border-surface_highest">
              <tr>
                <th className="px-8 py-5">Event</th>
                <th className="px-8 py-5">Activity Details</th>
                <th className="px-8 py-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface_highest">
              <AnimatePresence mode="wait">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="3" className="px-8 py-4">
                        <Skeleton height={60} className="rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log, i) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-surface_lowest/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-on_surface_variant group-hover:bg-primary group-hover:text-white transition-all">
                          <span className="material-symbols-outlined text-xl">{getEventIcon(log.event_type)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 max-w-md">
                        <p className="font-semibold text-on_surface leading-relaxed">{log.notes}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/60 mt-1">{log.event_type.replace('_', ' ')}</p>
                      </td>
                      <td className="px-8 py-6 text-sm text-on_surface_variant font-medium">
                        <div className="flex flex-col">
                          <span>{new Date(log.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[10px] opacity-70 uppercase tracking-tighter">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-8 py-20 text-center">
                      <div className="text-on_surface_variant/20 mb-4 scale-150 transform">
                         <span className="material-symbols-outlined text-5xl">history</span>
                      </div>
                      <p className="font-bold text-on_surface">No history found</p>
                      <p className="text-xs text-on_surface_variant mt-1">Try clearing your filters or check back later.</p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* 📟 PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-surface_lowest flex items-center justify-between border-t border-surface_highest">
            <p className="text-xs font-bold text-on_surface_variant">
              Showing page <span className="text-primary">{page}</span> of {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-10 h-10 rounded-xl bg-white border border-surface_highest flex items-center justify-center text-on_surface_variant hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 rounded-xl bg-white border border-surface_highest flex items-center justify-center text-on_surface_variant hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ActivityHistory;

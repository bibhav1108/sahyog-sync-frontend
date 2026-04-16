import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import { useToast } from "../../context/ToastContext";

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await API.get("/feedback/list?type_filter=ISSUE");
      setIssues(res.data);
    } catch (err) {
      console.error("Failed to fetch issues", err);
      addToast("Technical console failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    setActionLoading(id);
    try {
      await API.patch(`/feedback/${id}/status?status_val=RESOLVED`);
      setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, status: "RESOLVED" } : iss));
      addToast("Bug ticket marked as resolved! 🛡️", "success");
    } catch (err) {
      addToast("Status update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStructure 
            layout={[
                { type: 'rect', height: 100, className: "rounded-3xl" },
                { type: 'stack', gap: 4, items: Array(5).fill({ type: 'rect', height: 100, className: "rounded-3xl" }) }
            ]} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black tracking-tight">Technical Hub</h1>
          <p className="text-sm text-on_surface_variant border-l-2 border-red-500 pl-3 ml-1 mt-1 font-medium">
            Monitoring system bugs and community-reported issues
          </p>
        </div>
        <div className="flex gap-2">
            <div className="px-4 py-2 bg-red-500/10 text-red-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">bug_report</span>
                {issues.filter(i => i.status === 'PENDING').length} Active
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">task_alt</span>
                {issues.filter(i => i.status === 'RESOLVED').length} Fixed
            </div>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-surface_highest shadow-soft overflow-hidden">
        {issues.length > 0 ? (
          <>
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface_lowest/50 text-[10px] uppercase font-black tracking-widest text-on_surface_variant border-b border-surface_highest">
                  <tr>
                    <th className="px-8 py-5">Reporter</th>
                    <th className="px-8 py-5">Issue Details</th>
                    <th className="px-8 py-5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface_highest">
                  <AnimatePresence mode="popLayout">
                    {issues.map((issue) => (
                      <motion.tr
                        key={issue.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`group hover:bg-surface_lowest/30 transition-all ${issue.status === 'RESOLVED' ? 'bg-emerald-50/10' : ''}`}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {issue.user_name?.[0] || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-black text-on_surface leading-tight">{issue.user_name}</p>
                              <p className="text-[10px] text-on_surface_variant font-bold uppercase opacity-50">{issue.user_role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-md">
                          <p className="text-sm text-on_surface_variant leading-relaxed">
                            {issue.content}
                          </p>
                          <p className="text-[10px] text-on_surface_variant/40 mt-1 font-medium">
                            Reported on {new Date(issue.created_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {issue.status === 'PENDING' ? (
                            <button
                              onClick={() => handleResolve(issue.id)}
                              disabled={actionLoading === issue.id}
                              className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                            >
                              {actionLoading === issue.id ? "Working..." : "Resolve"}
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                              <span className="material-symbols-outlined text-sm">task_alt</span>
                              Finalized
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden divide-y divide-surface_highest">
                <AnimatePresence mode="popLayout">
                    {issues.map((issue) => (
                        <motion.div
                            key={issue.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 space-y-4 ${issue.status === 'RESOLVED' ? 'bg-emerald-50/10' : ''}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                       {issue.user_name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-on_surface leading-tight">{issue.user_name}</h4>
                                        <p className="text-[10px] font-bold text-on_surface_variant uppercase opacity-40">{issue.user_role}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${issue.status === 'RESOLVED' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {issue.status}
                                </div>
                            </div>
                            
                            <p className="text-sm text-on_surface_variant leading-relaxed">
                                {issue.content}
                            </p>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[9px] font-black text-on_surface_variant/40 uppercase tracking-tighter">
                                    Reported {new Date(issue.created_at).toLocaleDateString()}
                                </span>
                                {issue.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleResolve(issue.id)}
                                        disabled={actionLoading === issue.id}
                                        className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-500/20"
                                    >
                                        {actionLoading === issue.id ? "..." : "Resolve"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="p-20 text-center">
            <span className="material-symbols-outlined text-6xl text-emerald-400 mb-4">check_circle</span>
            <h3 className="text-xl font-black text-on_surface">Zero Active Bugs</h3>
            <p className="text-sm text-on_surface_variant">System integrity is stable. No community issues reported.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminIssues;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import DataRow from "../../components/shared/DataRow";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import { useToast } from "../../context/ToastContext";

const MarketplaceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadAlerts = async (init = false, silent = false) => {
    try {
      if (init) setInitialLoading(true);
      if (!init && !silent) setRefreshing(true);
      const res = await API.get("marketplace/needs/alerts");
      setAlerts(res.data || []);
    } catch {
      addToast("Failed to load donation alerts", "error");
    } finally {
      if (init) setInitialLoading(false);
      if (!init) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);
    const interval = setInterval(() => {
      loadAlerts(false, true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const claimAlert = async (id) => {
    try {
      setLoadingId(id);
      await API.post(`marketplace/needs/alerts/${id}/convert`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      addToast("Donation accepted and added to marketplace! 📦", "success");
    } catch (err) {
      addToast(err?.response?.data?.detail || "Failed to accept donation", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const skeletonLayout = [
    { type: 'row', gap: 8, cols: [
        { type: 'stack', gap: 4, items: Array(3).fill({type: 'rect', height: 120, className: "rounded-3xl"}) },
        { type: 'rect', height: 400, className: "rounded-3xl" }
    ]}
  ];

  if (initialLoading) return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
        <SkeletonStructure layout={skeletonLayout} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32 selection:bg-primary/10 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">New Donations</p>
            <h1 className="text-5xl font-outfit font-black text-on_surface tracking-tight">Donation Alerts</h1>
            <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Review and accept donation offers from your community.</p>
        </div>
        <div className="flex items-center gap-4">
            <MetricCard label="Active Alerts" value={alerts.length} icon="notifications_active" variant="primary" />
            <button
                onClick={() => loadAlerts(false)}
                className={`w-12 h-12 flex items-center justify-center bg-surface_high rounded-2xl border border-on_surface/5 transition-all ${refreshing ? 'animate-spin opacity-50' : 'hover:bg-primary hover:text-white hover:shadow-lg'}`}
            >
                <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* ALERT FEED */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">All Alerts</h3>
                <span className="text-[9px] font-bold text-on_surface_variant/40 italic">Updating automatically</span>
            </div>

            {alerts.length === 0 ? (
                <div className="text-center py-40 bg-surface_high/30 rounded-[3.5rem] border-2 border-dashed border-on_surface/5">
                    <span className="material-symbols-outlined text-6xl opacity-10 mb-4">inventory_2</span>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">No donation alerts found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {alerts.map((alert) => {
                            const isExpanded = expandedId === alert.id;
                            return (
                                <motion.div
                                    key={alert.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
                                    onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                                    className={`group relative bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${
                                        isExpanded 
                                            ? "ring-2 ring-primary border-transparent bg-white shadow-2xl scale-[1.02] z-10" 
                                            : "border-on_surface/5 hover:border-primary/20 hover:bg-white hover:shadow-xl"
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-6 flex-1 w-full">
                                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shrink-0 ${
                                                isExpanded ? "bg-primaryGradient text-white" : "bg-surface_high group-hover:bg-primaryGradient group-hover:text-white"
                                            }`}>
                                                <span className="material-symbols-outlined text-2xl sm:text-3xl">
                                                    {isExpanded ? "expand_less" : "volunteer_activism"}
                                                </span>
                                            </div>
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-base sm:text-lg font-black text-on_surface uppercase tracking-tight truncate">
                                                        {alert.item && alert.item !== "N/A" ? alert.item : "Donation Request"}
                                                    </h4>
                                                    {alert.quantity && alert.quantity !== "N/A" && (
                                                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary/10 text-primary text-[8px] sm:text-[10px] font-black rounded-lg border border-primary/20 shrink-0">
                                                            {alert.quantity}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                                                    <div className="flex items-center gap-1.5 opacity-40">
                                                        <span className="material-symbols-outlined text-xs font-black text-primary">person</span>
                                                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest truncate max-w-[100px]">{alert.donor_name || "Anonymous Donor"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 opacity-40">
                                                        <span className="material-symbols-outlined text-xs font-black text-primary">location_on</span>
                                                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest truncate max-w-[150px]">{alert.location && alert.location !== "N/A" ? alert.location : "Location TBD"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate("/ngo/dashboard", { state: { focusId: alert.id, focusType: 'alert' } });
                                                }}
                                                className="w-full sm:w-auto p-4 bg-surface_high text-on_surface_variant rounded-2xl hover:bg-black/5 transition-all flex items-center justify-center"
                                                title="View on Map"
                                            >
                                                <span className="material-symbols-outlined">explore</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    claimAlert(alert.id);
                                                }}
                                                disabled={loadingId === alert.id}
                                                className="w-full sm:w-auto px-8 py-4 bg-primaryGradient text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                                            >
                                                {loadingId === alert.id ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-sm">inventory</span>
                                                        Accept Donation
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* EXPANDABLE DETAILS */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: "circOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-8 mt-8 border-t border-on_surface/5 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* RAW SIGNAL */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-primary opacity-60">
                                                                <span className="material-symbols-outlined text-sm">chat</span>
                                                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Original Message</p>
                                                            </div>
                                                            <div className="p-4 bg-surface_high/50 rounded-2xl border border-on_surface/5 text-[11px] leading-relaxed text-on_surface_variant whitespace-pre-wrap font-medium">
                                                                {alert.message_body || "No message content."}
                                                            </div>
                                                        </div>

                                                        {/* METADATA */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-primary opacity-60">
                                                                <span className="material-symbols-outlined text-sm">info</span>
                                                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Donor Details</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                {[
                                                                    { label: "Phone", value: alert.phone_number || "Not provided", icon: "call" },
                                                                    { label: "Received", value: new Date(alert.created_at).toLocaleString(), icon: "event_note" },
                                                                    { label: "Coordinates", value: alert.latitude ? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}` : "Unavailable", icon: "near_me" }
                                                                ].map((row, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between py-3 px-4 bg-surface_high/30 rounded-xl border border-on_surface/5">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="material-symbols-outlined text-lg text-primary opacity-40">{row.icon}</span>
                                                                            <span className="text-[10px] font-bold text-on_surface_variant uppercase tracking-widest">{row.label}</span>
                                                                        </div>
                                                                        <span className="text-[10px] font-black text-on_surface">{row.value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* AI NOTES */}
                                                    <div className="space-y-3 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                                                        <div className="flex items-center gap-2 text-primary">
                                                            <span className="material-symbols-outlined text-sm">description</span>
                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">AI Analysis</p>
                                                        </div>
                                                        <p className="text-xs font-bold text-on_surface_variant leading-relaxed">
                                                            {alert.notes && alert.notes !== "N/A" ? alert.notes : "The system has identified this as a valid donation request. NGO coordinators are advised to verify details before dispatching volunteers."}
                                                        </p>
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

        {/* INSIGHTS */}
        <div className="col-span-12 lg:col-span-4">
            <ContentSection title="Helpful Information" icon="lightbulb">
                <div className="space-y-8 py-4">
                    <p className="text-[11px] font-bold text-on_surface_variant/60 leading-relaxed">Donation alerts are received directly from donors. Accepting an alert will transform it into a task for your team to handle.</p>
                    
                    <div className="space-y-6 pt-2">
                        <DataRow label="Response Status" value="Healthy" icon="check_circle" />
                        <DataRow label="System Status" value="Stable" icon="cloud_done" />
                        <DataRow label="Data Protection" value="Active" icon="verified_user" />
                    </div>

                    <div className="mt-10 p-8 bg-surface_high border border-on_surface/5 rounded-[2rem] text-center">
                        <span className="material-symbols-outlined text-3xl opacity-10 mb-2">info</span>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Updates appear here automatically</p>
                    </div>
                </div>
            </ContentSection>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAlerts;

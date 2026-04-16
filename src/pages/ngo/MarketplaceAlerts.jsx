import { useState, useEffect } from "react";
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
  const { addToast } = useToast();

  const loadAlerts = async (init = false, silent = false) => {
    try {
      if (init) setInitialLoading(true);
      if (!init && !silent) setRefreshing(true);
      const res = await API.get("marketplace/needs/alerts");
      setAlerts(res.data || []);
    } catch {
      addToast("Failed to sync marketplace signals", "error");
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
      addToast("Signal converted into high-priority need! 📡", "success");
    } catch (err) {
      addToast(err?.response?.data?.detail || "Signal acquisition failed", "error");
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
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Electronic Surveillance</p>
            <h1 className="text-5xl font-outfit font-black text-on_surface tracking-tight">Marketplace Signals</h1>
            <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Intercepting live donor pulses for immediate humanitarian response.</p>
        </div>
        <div className="flex items-center gap-4">
            <MetricCard label="Active Signals" value={alerts.length} icon="notifications_active" variant="primary" />
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
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Live Pulse Feed</h3>
                <span className="text-[9px] font-bold text-on_surface_variant/40 italic">Syncing every 10s</span>
            </div>

            {alerts.length === 0 ? (
                <div className="text-center py-40 bg-surface_high/30 rounded-[3.5rem] border-2 border-dashed border-on_surface/5">
                    <span className="material-symbols-outlined text-6xl opacity-10 mb-4">sensors_off</span>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">Scanning frequencies: No active signals detected</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {alerts.map((alert) => (
                            <motion.div
                                key={alert.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
                                className="group relative bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-on_surface/5 hover:border-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 bg-surface_high group-hover:bg-primaryGradient group-hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all duration-500">
                                            <span className="material-symbols-outlined text-3xl">priority_high</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-black text-on_surface uppercase tracking-tight">
                                                    {alert.item && alert.item !== "N/A" ? alert.item : "Donation Item"}
                                                </h4>
                                                {alert.quantity && alert.quantity !== "N/A" && (
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20">
                                                        {alert.quantity}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-4 pt-1">
                                                <div className="flex items-center gap-1.5 opacity-40">
                                                    <span className="material-symbols-outlined text-sm font-black text-primary">person</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{alert.donor_name || "Anonymous"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-40">
                                                    <span className="material-symbols-outlined text-sm font-black text-primary">location_on</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{alert.location && alert.location !== "N/A" ? alert.location : "Location not specified"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => claimAlert(alert.id)}
                                        disabled={loadingId === alert.id}
                                        className="w-full md:w-auto px-8 py-4 bg-on_surface text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 group-hover:shadow-xl hover:-translate-y-1"
                                    >
                                        {loadingId === alert.id ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                                Convert to Need
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>

        {/* INSIGHTS */}
        <div className="col-span-12 lg:col-span-4">
            <ContentSection title="Signal Intelligence" icon="psychology">
                <div className="space-y-8 py-4">
                    <p className="text-[11px] font-bold text-on_surface_variant/60 leading-relaxed">Donor pulses are automatically intercepted and categorized. Claiming a signal initializes a high-priority deployment project in your command center.</p>
                    
                    <div className="space-y-6 pt-2">
                        <DataRow label="Conversion Matrix" value="High Efficiency" icon="analytics" />
                        <DataRow label="Signal Clarity" value="Optimized" icon="settings_input_antenna" />
                        <DataRow label="Security" value="Encrypted" icon="enhanced_encryption" />
                    </div>

                    <div className="mt-10 p-8 bg-surface_high border border-on_surface/5 rounded-[2rem] text-center">
                        <span className="material-symbols-outlined text-3xl opacity-10 mb-2">construction</span>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Deep Analytics Pipeline Initializing...</p>
                    </div>
                </div>
            </ContentSection>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAlerts;

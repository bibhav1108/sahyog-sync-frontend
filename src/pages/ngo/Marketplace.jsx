import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import DispatchVolunteersModal from "./components/DispatchVolunteersModal";
import { motion, AnimatePresence } from "framer-motion";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import DataRow from "../../components/shared/DataRow";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const Marketplace = ({ sidebarOpen }) => {
  const navigate = useNavigate();

  const [needs, setNeeds] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [needsLoading, setNeedsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [expandedId, setExpandedId] = useState(null);

  const [dispatchModal, setDispatchModal] = useState({
    open: false,
    needId: null,
  });

  const [claimingId, setClaimingId] = useState(null);
  const [filter, setFilter] = useState("OPEN");
  const [newNeedId, setNewNeedId] = useState(null);

  const MIN_ALERTS = 6;
  const MIN_NEEDS = 5;

  const sortByNewest = (items = []) =>
    [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const loadNeeds = async (init = false) => {
    if (init) setNeedsLoading(true);

    try {
      const res = await API.get("/marketplace/needs/");
      const data = sortByNewest(
        (res.data || []).filter((n) => n.status !== "COMPLETED"),
      );
      setNeeds(data);
    } catch (err) {
      console.error("Failed to load needs", err);
    } finally {
      if (init) setNeedsLoading(false);
      setLastUpdated(Date.now());
    }
  };

  const loadAlerts = async (init = false) => {
    if (init) setAlertsLoading(true);

    try {
      const res = await API.get("/marketplace/needs/alerts");
      const data = sortByNewest(res.data || []);
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      if (init) setAlertsLoading(false);
      setLastUpdated(Date.now());
    }
  };

  const claimAlert = async (id) => {
    try {
      setClaimingId(id);
      await API.post(`/marketplace/needs/alerts/${id}/convert`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      const res = await API.get("/marketplace/needs/");
      const updated = sortByNewest(res.data || []);
      setNeeds(updated);
      if (updated.length > 0) {
        setNewNeedId(updated[0].id);
        setTimeout(() => setNewNeedId(null), 1000);
      }
      setLastUpdated(Date.now());
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  useEffect(() => {
    loadNeeds(true);
    loadAlerts(true);
    const interval = setInterval(() => {
      loadNeeds();
      loadAlerts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredNeeds = needs.filter((n) =>
    filter === "ALL" ? true : n.status === filter,
  );

  const timeAgo = () => {
    const seconds = Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000));
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const marketplaceSkeletonLayout = [
      { type: 'row', cols: [ { type: 'text', width: 200 }, { type: 'row', gap: 2, cols: [ { type: 'rect', width: 100, height: 32 }, { type: 'rect', width: 80, height: 32 } ] } ] },
      { type: 'stack', gap: 4, items: Array(4).fill({ type: 'rect', height: 80, className: "rounded-xl" }) }
  ];

  return (
    <div className="grid grid-cols-12 gap-8 selection:bg-primary/10">
      {/* LEFT: Live Alerts */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Donation Feed</p>
              <h1 className="text-3xl sm:text-4xl font-outfit font-black text-on_surface tracking-tight">Marketplace</h1>
              <div className="mt-2 flex items-center gap-2 text-xs font-bold text-on_surface_variant/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>Active Feed • Updated {timeAgo()}</span>
              </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => navigate("/dispatches")} className="px-3 sm:px-4 py-2 bg-surface_high hover:bg-surface_highest rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all">History</button>
                <button onClick={() => navigate("/marketplace-stats")} className="px-3 sm:px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all">Analytics</button>
            </div>
        </motion.div>

        <ContentSection title="Recent Donation Alerts" icon="notifications_active" delay="100ms">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-on_surface_variant font-medium">New requests from donors awaiting review.</p>
                <button onClick={() => navigate("/alerts")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">View All Alerts</button>
            </div>

            <div className="space-y-4">
                {alertsLoading ? (
                    <SkeletonStructure layout={marketplaceSkeletonLayout} />
                ) : (
                    <AnimatePresence mode="popLayout">
                        {alerts.slice(0, MIN_ALERTS).map((a, i) => {
                            const isExpanded = expandedId === a.id;
                            return (
                                <motion.div 
                                    key={a.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                                    className={`group bg-white/60 backdrop-blur-md p-5 rounded-[2rem] border transition-all cursor-pointer ${
                                        isExpanded ? "ring-2 ring-primary border-transparent shadow-xl" : "border-on_surface/5 hover:border-primary/20 hover:shadow-md"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded">
                                                    {isExpanded ? "DETAILS" : "NEW ALERT"}
                                                </span>
                                                <span className="text-[10px] font-bold text-on_surface_variant/40">
                                                    {new Date(a.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-on_surface leading-tight">
                                                {a.item && a.item !== "N/A" ? a.item : "Donation Pickup"}
                                                {a.quantity && a.quantity !== "N/A" && <span className="opacity-40 ml-1">({a.quantity})</span>}
                                            </h4>
                                            {a.donor_name && <p className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant opacity-50">From {a.donor_name}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate("/ngo/dashboard", { state: { focusId: a.id, focusType: 'alert' } });
                                                }}
                                                className="p-2 transition-all duration-200 hover:bg-black/5 rounded-xl text-on_surface_variant hover:text-primary"
                                                title="View on Map"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">explore</span>
                                            </button>
                                            <button
                                                disabled={claimingId === a.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    claimAlert(a.id);
                                                }}
                                                className="shrink-0 bg-primaryGradient text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-t border-white/20"
                                            >
                                                {claimingId === a.id ? "..." : "Accept"}
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-6 mt-6 border-t border-on_surface/5 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60">Original Message</p>
                                                            <div className="p-3 bg-surface_high/40 rounded-xl border border-on_surface/5 text-[11px] text-on_surface_variant font-medium leading-relaxed italic">
                                                                "{a.message_body}"
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60">Donor Details</p>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-[10px]">
                                                                    <span className="font-bold opacity-40 uppercase">Contact</span>
                                                                    <span className="font-black">{a.phone_number || "Not listed"}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-[10px]">
                                                                    <span className="font-bold opacity-40 uppercase">Location</span>
                                                                    <span className="font-black truncate max-w-[150px]">{a.location || "Available on request"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {a.notes && a.notes !== "N/A" && (
                                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">AI Summary</p>
                                                            <p className="text-xs font-bold text-on_surface_variant leading-relaxed">{a.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </ContentSection>
      </div>

      {/* RIGHT: Active Needs */}
      <div className="col-span-12 lg:col-span-4">
        <ContentSection title="Urgent Needs" icon="bolt" delay="200ms" className="h-full">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-[10px] text-on_surface_variant font-bold uppercase tracking-widest opacity-50">Filtered View</p>
                    <button onClick={() => navigate("/needs")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">View All</button>
                </div>
                <div className="flex gap-2 p-1 bg-surface_highest rounded-xl mb-4">
                    {["OPEN", "DISPATCHED"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                filter === f ? "bg-white text-on_surface shadow-sm" : "text-on_surface_variant/60 hover:text-on_surface"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {needsLoading ? (
                    <SkeletonStructure layout={marketplaceSkeletonLayout} />
                ) : (
                    filteredNeeds.slice(0, MIN_NEEDS).map((n, i) => (
                        <motion.div 
                            key={n.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-6 rounded-[2rem] border-2 transition-all group ${
                                n.urgency === "HIGH" ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10 shadow-lg shadow-red-500/5" : 
                                n.urgency === "MEDIUM" ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 shadow-lg shadow-amber-500/5" : 
                                "border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-lg shadow-primary/5"
                            } ${newNeedId === n.id ? "ring-2 ring-primary animate-pulse" : ""}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-outfit font-black text-on_surface tracking-tight truncate pr-2">
                                    {n.type} <span className="text-xs opacity-40 ml-1">• {n.quantity}</span>
                                </h4>
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
                                    n.urgency === "HIGH" ? "bg-red-500 text-white" : "bg-on_surface/5 text-on_surface"
                                }`}>
                                    {n.urgency}
                                </span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/ngo/dashboard", { state: { focusId: n.id, focusType: 'need' } });
                                    }}
                                    className="p-1.5 transition-all duration-200 hover:bg-black/5 rounded-lg text-on_surface_variant hover:text-primary"
                                    title="View on Map"
                                >
                                    <span className="material-symbols-outlined text-[16px]">explore</span>
                                </button>
                            </div>
                            <p className="text-xs text-on_surface_variant line-clamp-2 mb-4 leading-relaxed">{n.description}</p>
                            
                            <div className="flex items-center justify-between gap-2 mt-auto border-t border-white/40 pt-4">
                                <div className="flex items-center gap-1.5 opacity-40 min-w-0">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    <span className="text-[10px] font-bold truncate">{n.pickup_address}</span>
                                </div>

                                {n.status === "OPEN" ? (
                                    <button
                                        onClick={() => setDispatchModal({ open: true, needId: n.id })}
                                        className="shrink-0 bg-primaryGradient text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                                    >
                                        Dispatch
                                    </button>
                                ) : (
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Dispatched</span>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </ContentSection>
      </div>

      <DispatchVolunteersModal
        open={dispatchModal.open}
        needId={dispatchModal.needId}
        sidebarOpen={sidebarOpen}
        onClose={() => setDispatchModal({ open: false, needId: null })}
        onSuccess={loadNeeds}
      />
    </div>
  );
};

export default Marketplace;

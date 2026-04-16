import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import Skeleton from "../components/Skeleton";

const MarketplaceAlerts = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = async (init = false, silent = false) => {
    try {
      if (init) setInitialLoading(true);
      if (!init && !silent) setRefreshing(true);

      const res = await API.get("/marketplace/needs/alerts");
      setAlerts(res.data || []);
      setError("");
    } catch {
      setError("Failed to load alerts");
    } finally {
      if (init) setInitialLoading(false);
      if (!init) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);

    const interval = setInterval(() => {
      loadAlerts(false, true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const claimAlert = async (id) => {
    try {
      setLoadingId(id);
      await API.post(`/marketplace/needs/alerts/${id}/convert`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to claim alert");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-6 shadow-lg shadow-black/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/marketplace")}
              className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm transition hover:bg-white/5"
            >
              ← Back
            </button>

            <div>
              <h1 className="text-3xl font-outfit font-bold">
                Marketplace Alerts
              </h1>
              <p className="mt-1 text-sm text-on_surface_variant">
                Live donor signals → convert into needs instantly
              </p>
            </div>
          </div>

          <button
            onClick={() => loadAlerts(false)}
            className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-sm transition hover:bg-white/5"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* CONTENT */}
      {initialLoading ? (
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SKELETON FEED */}
          <div className="col-span-12 space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="space-y-4">
              <Skeleton count={4} height={160} className="rounded-2xl" />
            </div>
          </div>

          {/* RIGHT SKELETON INSIGHTS */}
          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-2xl border border-white/5 bg-surface_high p-6 space-y-6">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                <Skeleton count={4} height={40} className="rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-16 text-center text-on_surface_variant shadow-lg shadow-black/10">
          No active alerts right now
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* ALERT LIST */}
          <div className="col-span-12 space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Alert Feed</h3>
              <p className="text-xs text-on_surface_variant">
                {refreshing ? "Checking for signals..." : "Real-time signals"}
              </p>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface_high/80 p-6 shadow-soft transition-all hover:bg-surface_high"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <span className="material-symbols-outlined">
                            notifications_active
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on_surface underline decoration-primary/20 transition-all group-hover:decoration-primary">
                            {alert.description}
                          </h4>
                          <div className="mt-2 flex items-center gap-3 text-sm text-on_surface_variant">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                person
                              </span>
                              {alert.donor_name}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-white/20" />
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                location_on
                              </span>
                              {alert.location_address}
                            </span>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => claimAlert(alert.id)}
                        disabled={loadingId === alert.id}
                        className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary shadow-soft transition-all hover:bg-primary hover:text-white disabled:opacity-50 flex items-center gap-2"
                      >
                        {loadingId === alert.id && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loadingId === alert.id ? "Converting..." : "Convert to Need"}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-surface_high p-5 shadow-lg shadow-black/10">
              <h3 className="text-lg font-semibold">Insights</h3>
              <p className="mt-1 text-sm text-on_surface_variant">
                A quick view of what is coming in.
              </p>

              <div className="mt-6 space-y-3 text-sm text-on_surface_variant">
                <p>• Incoming donor trends</p>
                <p>• Most requested resources</p>
                <p>• Conversion efficiency</p>
              </div>

              <div className="mt-10 rounded-2xl border border-white/5 bg-surface p-4 text-center text-xs text-on_surface_variant">
                analytics coming soon
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceAlerts;

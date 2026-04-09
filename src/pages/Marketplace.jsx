import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import DispatchVolunteersModal from "../components/DispatchVolunteersModal";

const Marketplace = ({ sidebarOpen }) => {
  const navigate = useNavigate();

  const [needs, setNeeds] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [needsLoading, setNeedsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [dispatchModal, setDispatchModal] = useState({
    open: false,
    needId: null,
  });

  const [claimingId, setClaimingId] = useState(null);
  const [filter, setFilter] = useState("OPEN");
  const [newNeedId, setNewNeedId] = useState(null);

  const MIN_ALERTS = 6;
  const MIN_NEEDS = 5;

  const loadNeeds = async (init = false) => {
    if (init) setNeedsLoading(true);

    const res = await API.get("/marketplace/needs/");
    let data = (res.data || []).filter((n) => n.status !== "COMPLETED");

    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setNeeds(data);
    if (init) setNeedsLoading(false);
  };

  const loadAlerts = async (init = false) => {
    if (init) setAlertsLoading(true);

    const res = await API.get("/marketplace/needs/alerts");
    let data = res.data || [];

    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setAlerts(data);
    if (init) setAlertsLoading(false);
  };

  const claimAlert = async (id) => {
    try {
      setClaimingId(id);

      await API.post(`/marketplace/needs/alerts/${id}/convert`);

      setAlerts((prev) => prev.filter((a) => a.id !== id));

      const res = await API.get("/marketplace/needs/");
      let updated = res.data || [];

      updated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNeeds(updated);

      if (updated.length > 0) {
        setNewNeedId(updated[0].id);
        setTimeout(() => setNewNeedId(null), 1000);
      }
    } catch {
      alert("Failed to claim alert");
    } finally {
      setClaimingId(null);
    }
  };

  useEffect(() => {
    loadNeeds(true);
    loadAlerts(true);

    const i = setInterval(() => {
      loadNeeds();
      loadAlerts();
      setLastUpdated(Date.now());
    }, 5000);

    return () => clearInterval(i);
  }, []);

  const urgencyBorder = (u) => {
    if (u === "HIGH") return "border-red-500";
    if (u === "MEDIUM") return "border-yellow-400";
    return "border-blue-400";
  };

  const filteredNeeds = needs.filter((n) =>
    filter === "ALL" ? true : n.status === filter,
  );

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* LEFT */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        {/* HEADER */}
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-widest">
            Operations Overview
          </p>

          <div className="flex justify-between items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold mt-1">Marketplace</h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dispatches")}
                className="px-4 py-2 text-sm bg-surface_high border border-white/10 rounded-lg hover:bg-white/5"
              >
                Dispatch History
              </button>

              <button
                onClick={() => navigate("/marketplace-stats")}
                className="px-4 py-2 text-sm bg-surface_high border border-white/10 rounded-lg hover:bg-white/5"
              >
                Stats
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm mt-1 opacity-70">
            <span>Live donor intelligence</span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>

            {lastUpdated && (
              <span className="text-xs">
                {Math.floor((Date.now() - lastUpdated) / 1000)}s ago
              </span>
            )}
          </div>
        </div>

        {/* 🔴 ALERTS (COMPACT LIST) */}
        <div className="bg-surface_high rounded-xl p-5 space-y-4 border border-white/10">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Live Alerts</h3>

            <button
              onClick={() => navigate("/alerts")}
              className="text-xs text-primary hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2">
            {(alertsLoading
              ? Array.from({ length: MIN_ALERTS })
              : alerts.slice(0, MIN_ALERTS)
            ).map((a, i) =>
              !a ? (
                <div
                  key={i}
                  className="h-[70px] bg-surface rounded-lg animate-pulse"
                />
              ) : (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-surface border border-white/5 hover:bg-white/5 transition"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-primary font-bold">ALERT</span>
                      <span className="opacity-60">
                        {new Date(a.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-sm leading-snug break-words">
                      {a.message_body}
                    </p>

                    {a.donor_name && (
                      <p className="text-[11px] opacity-60">
                        👤 {a.donor_name}
                      </p>
                    )}
                  </div>

                  <button
                    disabled={claimingId === a.id}
                    onClick={() => claimAlert(a.id)}
                    className="text-xs px-3 py-1.5 rounded bg-primary text-white whitespace-nowrap"
                  >
                    {claimingId === a.id ? "..." : "Claim"}
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-surface_high rounded-xl p-5 space-y-4 border border-white/10">
          <div className="flex justify-between">
            <h3 className="font-semibold">Active Needs</h3>

            <button
              onClick={() => navigate("/needs")}
              className="text-xs text-primary hover:underline"
            >
              View All →
            </button>
          </div>

          {/* FILTER */}
          <div className="flex gap-2 text-xs">
            {["OPEN", "DISPATCHED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded ${
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-surface border border-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {(needsLoading
              ? Array.from({ length: MIN_NEEDS })
              : filteredNeeds.slice(0, MIN_NEEDS)
            ).map((n, i) =>
              !n ? (
                <div
                  key={i}
                  className="h-[110px] bg-surface rounded-xl animate-pulse"
                />
              ) : (
                <div
                  key={n.id}
                  className={`h-[110px] flex flex-col justify-between p-4 rounded-xl border border-white/5 bg-surface transition
                  ${urgencyBorder(n.urgency)}
                  ${newNeedId === n.id ? "scale-105 bg-white/10" : ""}
                  `}
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {n.type} • {n.quantity}
                    </p>

                    <p className="text-xs opacity-70 line-clamp-2">
                      {n.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">
                      📍 {n.pickup_address}
                    </span>

                    {n.status === "OPEN" ? (
                      <button
                        onClick={() =>
                          setDispatchModal({
                            open: true,
                            needId: n.id,
                          })
                        }
                        className="text-xs px-3 py-1 rounded bg-primary text-white"
                      >
                        Dispatch
                      </button>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-500/30 text-gray-300 rounded">
                        Dispatched
                      </span>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
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

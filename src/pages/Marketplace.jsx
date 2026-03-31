import { useState, useEffect } from "react";
import API from "../services/api";

const Marketplace = () => {
  const [alerts, setAlerts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const loadAlerts = async (init = false) => {
    try {
      if (init) setInitialLoading(true);
      const res = await API.get("/marketplace/needs/alerts");
      setAlerts(res.data || []);
    } catch {
      setError("Failed to load alerts");
    } finally {
      if (init) setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);
    const i = setInterval(() => loadAlerts(), 5000);
    return () => clearInterval(i);
  }, []);

  const claimAlert = async (id) => {
    try {
      setLoadingId(id);
      await API.post(`/marketplace/needs/alerts/${id}/convert`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to claim");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-outfit font-bold">Marketplace</h1>
        <p className="text-sm text-on_surface_variant">
          Real-time donor intelligence and resource alerts
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 text-sm p-3 rounded">
          {error}
        </div>
      )}

      {/* LOADING */}
      {initialLoading ? (
        <div className="text-center p-10 text-on_surface_variant">
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center p-10 text-on_surface_variant">
          No alerts right now
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* 🔥 ALERT INBOX */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <h3 className="font-semibold text-lg">Alert Inbox</h3>

            {alerts.map((a) => (
              <div
                key={a.id}
                className="bg-surface_high p-5 rounded-xl border border-white/5 hover:scale-[1.01] transition"
              >
                {/* TOP */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-primary">
                    DONOR ALERT
                  </span>

                  <span className="text-[10px] text-on_surface_variant">
                    {new Date(a.created_at).toLocaleTimeString()}
                  </span>
                </div>

                {/* MESSAGE */}
                <p className="text-sm font-medium">{a.message_body}</p>

                {/* DONOR */}
                {a.donor_name && (
                  <p className="text-xs text-on_surface_variant mt-2">
                    👤 {a.donor_name}
                  </p>
                )}

                {/* ACTION */}
                <div className="mt-4 flex justify-end">
                  <button
                    disabled={loadingId === a.id}
                    onClick={() => claimAlert(a.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      loadingId === a.id
                        ? "bg-gray-400 text-white"
                        : "bg-primary text-white hover:opacity-90"
                    }`}
                  >
                    {loadingId === a.id ? "Processing..." : "Convert →"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 🔥 RIGHT PANEL (RESERVED) */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-surface_high rounded-xl p-5 h-full min-h-[400px]">
              <h3 className="font-semibold mb-4">Insights</h3>

              <div className="flex items-center justify-center h-[300px] text-sm text-on_surface_variant">
                Coming soon
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

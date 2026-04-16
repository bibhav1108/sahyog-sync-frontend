import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import DispatchVolunteersModal from "../components/DispatchVolunteersModal";
import Skeleton from "../components/Skeleton";

const ActiveNeeds = ({ sidebarOpen }) => {
  const navigate = useNavigate();

  const [needs, setNeeds] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [dispatchModal, setDispatchModal] = useState({
    open: false,
    needId: null,
  });

  const load = async (init = false) => {
    try {
      if (init) setInitialLoading(true);

      const res = await API.get("/marketplace/needs/");
      setNeeds((res.data || []).filter((x) => x.status !== "COMPLETED"));
    } catch {
      setError("Failed to load data");
    } finally {
      if (init) setInitialLoading(false);
    }
  };

  useEffect(() => {
    load(true);
    const i = setInterval(() => load(), 5000);
    return () => clearInterval(i);
  }, []);

  const filtered = needs
    .filter((n) => {
      if (filter === "OPEN") return n.status === "OPEN";
      if (filter === "IN_PROGRESS") return n.status === "DISPATCHED";
      return true;
    })
    .sort((a, b) => {
      const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return order[b.urgency] - order[a.urgency];
    });

  const urgencyBorder = (u) => {
    if (u === "HIGH") return "border-red-500/70";
    if (u === "MEDIUM") return "border-yellow-400/70";
    return "border-blue-400/70";
  };

  const statusStyle = (status) => {
    if (status === "OPEN") return "bg-green-500/20 text-green-400";
    if (status === "DISPATCHED") return "bg-blue-500/20 text-blue-400";
    return "bg-gray-500/20 text-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-6 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/marketplace")}
              className="px-3 py-2 text-sm rounded-xl border border-white/10 bg-surface transition hover:scale-105 hover:bg-slate-500 hover:text-white active:scale-95 shadow-sm"
            >
              ← Back
            </button>

            <div>
              <h1 className="text-2xl font-bold">Active Needs</h1>
              <p className="text-sm text-on_surface_variant mt-1">
                Monitor and dispatch incoming needs
              </p>
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {["ALL", "OPEN", "IN_PROGRESS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-surface border border-white/10 hover:scale-105 hover:bg-slate-500 hover:text-white active:scale-95 shadow-sm"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
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
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-surface_high p-5 space-y-3"
            >
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-10 text-center text-on_surface_variant">
          No active needs
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((n, i) => (
            <div
              key={n.id}
              className={`rounded-2xl border bg-surface_high p-5 transition hover:bg-white/5 animate-fadeIn
              ${urgencyBorder(n.urgency)}
              `}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* TOP */}
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-on_surface">
                    {n.type} • {n.quantity}
                  </p>

                  <p className="text-sm text-on_surface_variant mt-1 line-clamp-2">
                    {n.description}
                  </p>

                  <p className="text-xs text-on_surface_variant mt-2">
                    📍 {n.pickup_address}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-lg h-fit ${statusStyle(
                    n.status,
                  )}`}
                >
                  {n.status === "OPEN"
                    ? "Open"
                    : n.status === "DISPATCHED"
                      ? "Dispatched"
                      : n.status}
                </span>
              </div>

              {/* ACTION */}
              {n.status === "OPEN" && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() =>
                      setDispatchModal({
                        open: true,
                        needId: n.id,
                      })
                    }
                    className="px-4 py-2 rounded-xl text-sm bg-primary text-white hover:opacity-90"
                  >
                    Dispatch Volunteers
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <DispatchVolunteersModal
        open={dispatchModal.open}
        needId={dispatchModal.needId}
        sidebarOpen={sidebarOpen}
        onClose={() => setDispatchModal({ open: false, needId: null })}
        onSuccess={load}
      />
    </div>
  );
};

export default ActiveNeeds;

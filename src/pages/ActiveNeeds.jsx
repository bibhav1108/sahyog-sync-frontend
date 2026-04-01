import { useEffect, useState } from "react";
import API from "../services/api";

const ActiveNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVols, setSelectedVols] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [assigningId, setAssigningId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (init = false) => {
    try {
      if (init) setInitialLoading(true);

      const [n, v] = await Promise.all([
        API.get("/marketplace/needs/"),
        API.get("/volunteers"),
      ]);

      setNeeds((n.data || []).filter((x) => x.status !== "COMPLETED"));
      setVolunteers(v.data || []);
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

  // 🔥 toggle volunteer selection
  const toggleVolunteer = (needId, volId) => {
    setSelectedVols((prev) => {
      const current = prev[needId] || [];

      if (current.includes(volId)) {
        return {
          ...prev,
          [needId]: current.filter((id) => id !== volId),
        };
      }

      return {
        ...prev,
        [needId]: [...current, volId],
      };
    });
  };

  const handleDispatch = async (needId) => {
    const selected = selectedVols[needId] || [];
    if (selected.length === 0) return alert("Select at least one volunteer");

    try {
      setAssigningId(needId);

      await API.post("/marketplace/dispatches/", {
        marketplace_need_id: needId,
        volunteer_ids: selected.map(Number),
      });

      await load();

      setSelectedVols((prev) => {
        const copy = { ...prev };
        delete copy[needId];
        return copy;
      });
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to dispatch");
    } finally {
      setAssigningId(null);
    }
  };

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
    if (u === "HIGH") return "border-red-500";
    if (u === "MEDIUM") return "border-yellow-400";
    return "border-blue-400";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Active Needs</h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 text-sm p-3 rounded">
          {error}
        </div>
      )}

      {/* FILTER */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "OPEN", "IN_PROGRESS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${
              filter === f
                ? "bg-primary text-white"
                : "bg-surface_high hover:bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {initialLoading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No needs</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((n) => {
            const selected = selectedVols[n.id] || [];

            return (
              <div
                key={n.id}
                className={`border-l-4 ${urgencyBorder(
                  n.urgency,
                )} bg-surface_high p-4 rounded-xl`}
              >
                {/* INFO */}
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">
                      {n.type} • {n.quantity}
                    </p>
                    <p className="text-sm">{n.description}</p>
                    <p className="text-xs text-on_surface_variant">
                      📍 {n.pickup_address}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {n.status}
                  </span>
                </div>

                {/* 🔥 SELECT VOLUNTEERS */}
                {n.status === "OPEN" && (
                  <div className="mt-4">
                    {/* chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selected.map((id) => {
                        const v = volunteers.find((x) => x.id === id);
                        return (
                          <span
                            key={id}
                            className="text-xs bg-primary text-white px-2 py-1 rounded-full"
                          >
                            {v?.name}
                          </span>
                        );
                      })}
                    </div>

                    {/* selectable list */}
                    <div className="flex flex-wrap gap-2">
                      {volunteers.map((v) => {
                        const isSelected = selected.includes(v.id);

                        return (
                          <button
                            key={v.id}
                            onClick={() => toggleVolunteer(n.id, v.id)}
                            className={`text-xs px-3 py-1 rounded-full border transition ${
                              isSelected
                                ? "bg-primary text-white border-primary"
                                : "bg-surface border-white/10 hover:bg-white/5"
                            }`}
                          >
                            {v.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* ACTION */}
                    <button
                      onClick={() => handleDispatch(n.id)}
                      disabled={assigningId === n.id}
                      className={`mt-3 text-xs px-4 py-2 rounded ${
                        assigningId === n.id
                          ? "bg-gray-400 text-white"
                          : "bg-primary text-white hover:opacity-90"
                      }`}
                    >
                      {assigningId === n.id
                        ? "Dispatching..."
                        : "Dispatch Volunteers"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveNeeds;

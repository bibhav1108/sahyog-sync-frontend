import { useEffect, useState } from "react";
import API from "../services/api";

const ActiveNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVol, setSelectedVol] = useState({});
  const [filter, setFilter] = useState("ALL");

  const loadNeeds = async () => {
    try {
      const res = await API.get("/needs");

      const filtered = (res.data || []).filter((n) => n.status !== "COMPLETED");

      setNeeds(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVolunteers = async () => {
    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatch = async (needId) => {
    const volunteerId = selectedVol[needId];
    if (!volunteerId) return alert("Select a volunteer");

    try {
      await API.post("/dispatches", {
        need_id: needId,
        volunteer_id: Number(volunteerId),
      });

      loadNeeds();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNeeds();
    loadVolunteers();

    const interval = setInterval(() => {
      loadNeeds();
      loadVolunteers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // FILTER
  const filteredNeeds = needs.filter((n) => {
    if (filter === "OPEN") return n.status === "OPEN";
    if (filter === "IN_PROGRESS") return n.status === "DISPATCHED";
    return true;
  });

  // 🔥 BACKGROUND COLORS
  const urgencyBg = {
    LOW: "bg-blue-100",
    MEDIUM: "bg-yellow-100",
    HIGH: "bg-red-200",
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#191c1e]">Active Needs</h1>
          <p className="text-sm text-slate-500">
            Manage and assign ongoing needs
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2">
          {["ALL", "OPEN", "IN_PROGRESS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-full transition ${
                filter === f
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {f === "ALL" ? "All" : f === "OPEN" ? "Open" : "In Progress"}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      {filteredNeeds.length === 0 ? (
        <div className="p-4 text-sm text-slate-500">No needs found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNeeds.map((n) => {
            const isOpen = n.status === "OPEN";
            const isDispatched = n.status === "DISPATCHED";

            return (
              <div
                key={n.id}
                className={`rounded-2xl p-4 shadow-md transition ${
                  isDispatched
                    ? "bg-gray-200 opacity-80"
                    : urgencyBg[n.urgency] || "bg-white"
                } hover:shadow-lg`}
              >
                {/* TITLE */}
                <p className="text-sm font-semibold text-[#111]">{n.type}</p>

                {/* STATUS + URGENCY */}
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                      isOpen
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {isOpen ? "OPEN" : "IN PROGRESS"}
                  </span>

                  <span
                    className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                      n.urgency === "HIGH"
                        ? "bg-red-600 text-white"
                        : n.urgency === "MEDIUM"
                          ? "bg-yellow-600 text-white"
                          : "bg-blue-600 text-white"
                    }`}
                  >
                    {n.urgency}
                  </span>
                </div>

                {/* DESC */}
                <p className="text-sm text-slate-700 mt-3">{n.description}</p>

                {/* DETAILS */}
                <p className="text-xs mt-2 text-slate-600">Qty: {n.quantity}</p>

                <p className="text-xs text-slate-600">{n.pickup_address}</p>

                {/* SELECT */}
                <select
                  disabled={!isOpen}
                  className="mt-4 w-full rounded-lg bg-white border px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                  value={selectedVol[n.id] || ""}
                  onChange={(e) =>
                    setSelectedVol((prev) => ({
                      ...prev,
                      [n.id]: e.target.value,
                    }))
                  }
                >
                  <option value="">
                    {isOpen ? "Select volunteer" : "Assigned"}
                  </option>
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>

                {/* BUTTON */}
                <button
                  disabled={!isOpen}
                  onClick={() => handleDispatch(n.id)}
                  className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold ${
                    isOpen
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
                >
                  {isDispatched ? "In Progress" : "Assign"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveNeeds;

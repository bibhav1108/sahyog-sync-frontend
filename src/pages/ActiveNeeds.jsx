import { useEffect, useState } from "react";
import API from "../services/api";

const ActiveNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVol, setSelectedVol] = useState({});
  const [filter, setFilter] = useState("ALL");

  const [otp, setOtp] = useState("");
  const [dispatchId, setDispatchId] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [newNeed, setNewNeed] = useState({
    type: "FOOD",
    description: "",
    quantity: "",
    pickupAddress: "",
    urgency: "MEDIUM",
    deadline: "",
  });

  const loadNeeds = async (isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);

      const res = await API.get("/marketplace/needs/");
      const filtered = (res.data || []).filter((n) => n.status !== "COMPLETED");

      setNeeds(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setInitialLoading(false);
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

  const createNeed = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (
      !newNeed.type ||
      !newNeed.description.trim() ||
      !newNeed.quantity.trim() ||
      !newNeed.pickupAddress.trim()
    ) {
      setCreateError("All fields are required");
      return;
    }

    try {
      setCreating(true);

      await API.post("/needs", {
        type: newNeed.type,
        description: newNeed.description.trim(),
        quantity: newNeed.quantity.trim(),
        pickup_address: newNeed.pickupAddress.trim(),
        urgency: newNeed.urgency,
        pickup_deadline: newNeed.deadline || null,
      });

      setNewNeed({
        type: "FOOD",
        description: "",
        quantity: "",
        pickupAddress: "",
        urgency: "MEDIUM",
        deadline: "",
      });

      setShowForm(false);
      loadNeeds();
    } catch (err) {
      console.error(err);
      setCreateError(err?.response?.data?.detail || "Failed to create need");
    } finally {
      setCreating(false);
    }
  };

  const handleDispatch = async (needId) => {
    const volunteerId = selectedVol[needId];
    if (!volunteerId) return alert("Select a volunteer");

    try {
      setAssigningId(needId);

      const res = await API.post("/marketplace/dispatches/", {
        marketplace_need_id: needId,
        volunteer_id: Number(volunteerId),
      });

      setDispatchId(res.data?.dispatch_id);
      loadNeeds();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningId(null);
    }
  };

  const verifyOtp = async () => {
    if (!otp || !dispatchId) return;

    try {
      setVerifying(true);

      await API.post("/marketplace/dispatches/verify-otp", {
        dispatch_id: dispatchId,
        otp_code: otp,
      });

      setOtp("");
      setDispatchId(null);
      loadNeeds();
    } catch {
      alert("Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    loadNeeds(true);
    loadVolunteers();

    const interval = setInterval(() => {
      loadNeeds();
      loadVolunteers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredNeeds = needs.filter((n) => {
    if (filter === "OPEN") return n.status === "OPEN";
    if (filter === "IN_PROGRESS") return n.status === "DISPATCHED";
    return true;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedNeeds = [...filteredNeeds].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === "urgency") {
      const map = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      aVal = map[a.urgency] || 0;
      bVal = map[b.urgency] || 0;
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const urgencyColor = (u) => {
    if (u === "HIGH") return "bg-red-100 text-red-700";
    if (u === "MEDIUM") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const statusColor = (s) => {
    if (s === "DISPATCHED") return "bg-indigo-100 text-indigo-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Active Needs</h1>
          <p className="text-sm text-slate-500">Live dispatch control</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "OPEN", "IN_PROGRESS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-full transition ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              {f}
            </button>
          ))}

          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white px-4 py-2 rounded-full text-sm shadow-sm"
          >
            + Create Need
          </button>
        </div>
      </div>

      {/* CREATE NEED MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-white/40 bg-white/90 backdrop-blur-xl p-6 shadow-xl animate-slide-in">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#191c1e]">
                Create Relief Need
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createNeed} className="space-y-4">
              <select
                className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                value={newNeed.type}
                onChange={(e) =>
                  setNewNeed((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="FOOD">Food</option>
                <option value="WATER">Water</option>
                <option value="KIT">Kit</option>
                <option value="BLANKET">Blanket</option>
                <option value="MEDICAL">Medical</option>
                <option value="VEHICLE">Vehicle</option>
                <option value="OTHER">Other</option>
              </select>

              <textarea
                className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Describe the need"
                rows={3}
                value={newNeed.description}
                onChange={(e) =>
                  setNewNeed((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              <input
                className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="e.g. 50 packets"
                value={newNeed.quantity}
                onChange={(e) =>
                  setNewNeed((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />

              <textarea
                className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Pickup address"
                rows={2}
                value={newNeed.pickupAddress}
                onChange={(e) =>
                  setNewNeed((prev) => ({
                    ...prev,
                    pickupAddress: e.target.value,
                  }))
                }
              />

              <select
                className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                value={newNeed.urgency}
                onChange={(e) =>
                  setNewNeed((prev) => ({ ...prev, urgency: e.target.value }))
                }
              >
                <option value="LOW">Low urgency</option>
                <option value="MEDIUM">Medium urgency</option>
                <option value="HIGH">High urgency</option>
              </select>

              <input
                type="datetime-local"
                className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                value={newNeed.deadline}
                onChange={(e) =>
                  setNewNeed((prev) => ({ ...prev, deadline: e.target.value }))
                }
              />

              {createError && (
                <div className="text-sm text-red-500">{createError}</div>
              )}

              <button
                disabled={creating}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Need"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP BOX */}
      {dispatchId && (
        <div className="max-w-sm rounded-xl bg-white p-4 shadow animate-slide-in">
          <p className="mb-2 text-sm font-medium">Enter OTP</p>

          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mb-2 w-full rounded border px-3 py-2"
          />

          <button
            onClick={verifyOtp}
            disabled={verifying}
            className="flex w-full items-center justify-center gap-2 rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {verifying && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        {initialLoading ? (
          <div className="space-y-2 p-6 text-center">
            <div className="animate-pulse text-slate-400">
              Loading active needs...
            </div>

            <div className="h-1 overflow-hidden rounded bg-slate-200">
              <div className="h-full animate-progress bg-indigo-500" />
            </div>
          </div>
        ) : sortedNeeds.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No active needs right now
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                <tr>
                  {["description", "urgency", "status"].map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="cursor-pointer px-4 py-3 text-left hover:text-indigo-600"
                    >
                      {col.toUpperCase()}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">Volunteer</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {sortedNeeds.map((n) => {
                  const isOpen = n.status === "OPEN";
                  const isInProgress = n.status === "DISPATCHED";

                  return (
                    <tr
                      key={n.id}
                      className={`animate-slide-in transition hover:bg-slate-50 ${
                        isInProgress ? "opacity-60" : ""
                      }`}
                    >
                      <td className="max-w-[250px] truncate px-4 py-3 font-medium">
                        {n.description}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${urgencyColor(
                            n.urgency,
                          )}`}
                        >
                          {n.urgency}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${statusColor(
                            n.status,
                          )}`}
                        >
                          {isInProgress ? "In Progress" : n.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {isOpen ? (
                          <select
                            value={selectedVol[n.id] || ""}
                            onChange={(e) =>
                              setSelectedVol((prev) => ({
                                ...prev,
                                [n.id]: e.target.value,
                              }))
                            }
                            className="rounded border bg-white px-2 py-1 text-xs"
                          >
                            <option value="">Select</option>
                            {volunteers.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs italic text-slate-500">
                            Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          disabled={!isOpen || assigningId === n.id}
                          onClick={() => handleDispatch(n.id)}
                          className={`flex items-center gap-2 rounded px-3 py-1 text-xs ${
                            isOpen
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-300 text-slate-600"
                          }`}
                        >
                          {assigningId === n.id && (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          )}
                          {assigningId === n.id
                            ? "Assigning..."
                            : isInProgress
                              ? "Assigned"
                              : "Assign"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveNeeds;

import { useEffect, useState } from "react";
import API from "../services/api";
import Skeleton from "./Skeleton";

const DispatchVolunteersModal = ({ open, onClose, needId, onSuccess }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [volunteersLoading, setVolunteersLoading] = useState(false);

  useEffect(() => {
    if (open) loadVolunteers();
  }, [open]);

  const loadVolunteers = async () => {
    try {
      setVolunteersLoading(true);
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch {
      setVolunteers([]);
    } finally {
      setVolunteersLoading(false);
    }
  };

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDispatch = async () => {
    if (selected.length === 0) {
      return alert("Select at least one volunteer");
    }

    try {
      setLoading(true);

      await API.post("/marketplace/dispatches/", {
        marketplace_need_id: needId,
        volunteer_ids: selected.map(Number),
      });

      onSuccess?.();
      onClose();
      setSelected([]);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to dispatch");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const filtered = volunteers.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedVols = volunteers.filter((v) => selected.includes(v.id));

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* MODAL CONTAINER */}
      <div
        className="relative w-full max-w-6xl h-[80vh] rounded-2xl border border-white/10 bg-surface_high/95 backdrop-blur-xl shadow-2xl flex gap-6 p-6 pt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MAIN MODAL CLOSE BUTTON - NOW ACTUALLY RED */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 shadow-sm"
          title="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* LEFT PANEL: AVAILABLE VOLUNTEERS */}
        <div className="flex-[3] flex flex-col bg-surface/40 border border-white/5 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Available Volunteers</h2>
          <input
            placeholder="Search volunteers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 px-4 py-2 rounded-xl bg-surface border border-white/10 focus:outline-none focus:border-primary/50 transition-colors"
          />

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {volunteersLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/5 bg-surface p-3"
                  >
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              : filtered.map((v) => {
                  const isSelected = selected.includes(v.id);

                  return (
                    <div
                      key={v.id}
                      onClick={() => toggle(v.id)}
                      className={`p-3 rounded-xl cursor-pointer flex justify-between items-center border transition-all duration-200
                        ${
                          isSelected
                            ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(var(--color-primary),0.2)]"
                            : "bg-surface border-white/10 hover:bg-white/5 hover:border-white/20"
                        }
                      `}
                    >
                      <span className="text-sm font-medium">{v.name}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED VOLUNTEERS */}
        <div className="flex-[2] flex flex-col bg-surface/40 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Selected</h3>
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
              {selected.length}{" "}
              {selected.length === 1 ? "Volunteer" : "Volunteers"}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {volunteersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))
            ) : selectedVols.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-sm text-center">
                  No volunteers selected yet.
                </p>
              </div>
            ) : (
              selectedVols.map((v) => (
                <div
                  key={v.id}
                  className="group flex items-center justify-between bg-surface border border-white/10 px-3 py-2.5 rounded-lg transition-colors hover:border-white/20"
                >
                  <span className="text-sm">{v.name}</span>
                  {/* DESELECT VOLUNTEER BUTTON - NOW ACTUALLY RED */}
                  <button
                    onClick={() => toggle(v.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                    title={`Remove ${v.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleDispatch}
            disabled={loading || selected.length === 0}
            className={`mt-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg
              ${
                loading || selected.length === 0
                  ? "bg-white/5 text-white/40 cursor-not-allowed border border-white/5"
                  : "bg-primary text-white hover:opacity-90 hover:shadow-primary/20 border border-primary"
              }
            `}
          >
            {loading ? "Dispatching..." : `Dispatch (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchVolunteersModal;

import { useState, useEffect } from "react";
import API from "../services/api";
import Skeleton from "../components/Skeleton";

const Volunteers = ({ sidebarOpen }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [seenIds, setSeenIds] = useState(new Set());

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    zone: "",
    skills: "",
  });

  // INITIAL + POLLING (no flicker)
  useEffect(() => {
    loadVolunteers(true);

    const i = setInterval(() => {
      loadVolunteers(false);
    }, 5000);

    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowForm(false);
        setSelected(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // SMART LOAD (merge instead of replace)
  const loadVolunteers = async (initial = false) => {
    try {
      if (initial) setLoading(true);

      const res = await API.get("/volunteers");
      const incoming = res.data || [];

      setVolunteers((prev) => {
        const map = new Map(prev.map((v) => [v.id, v]));
        const newOnes = [];

        incoming.forEach((v) => {
          if (!map.has(v.id)) newOnes.push(v.id);
          map.set(v.id, v);
        });

        // track new ones
        setSeenIds((prevIds) => {
          const updated = new Set(prevIds);
          newOnes.forEach((id) => updated.add(id));
          return updated;
        });

        return Array.from(map.values()).sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        );
      });
    } catch {
    } finally {
      if (initial) setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.phone_number) {
      return alert("Name and phone required");
    }

    try {
      setCreating(true);

      await API.post("/volunteers", {
        name: form.name,
        phone_number: form.phone_number,
        zone: form.zone || null,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
      });

      setForm({
        name: "",
        phone_number: "",
        zone: "",
        skills: "",
      });

      setShowForm(false);
      loadVolunteers(false);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to create volunteer");
    } finally {
      setCreating(false);
    }
  };

  const getSuccessRate = (v) => {
    const c = Number(v.completions || 0);
    const n = Number(v.no_shows || 0);
    const total = c + n;
    if (total === 0) return 0;
    return Math.round(((c - n) / total) * 100);
  };

  const filtered = volunteers.filter((v) =>
    (v.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-white/10 bg-surface_high/80 backdrop-blur p-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on_surface">
            Volunteer Force
          </h1>
          <p className="text-sm text-on_surface_variant">
            Manage and deploy your human network
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold text-on_surface">
              {volunteers.length}
            </p>
            <p className="text-xs text-on_surface_variant">Active Volunteers</p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90"
          >
            + Add
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search volunteers..."
        className="w-full max-w-md px-4 py-3 rounded-xl bg-surface_high border border-white/10 text-on_surface placeholder:text-on_surface_variant focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LIST */}
      <div className="rounded-2xl border border-white/10 bg-surface_high/80 backdrop-blur p-2 space-y-2">
        {/* HEADER */}
        <div className="grid grid-cols-12 px-4 py-2 text-xs text-on_surface_variant">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Phone</div>
          <div className="col-span-2">Zone</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Success</div>
        </div>

        {/* LOADING */}
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-12 px-4 py-3 items-center bg-surface rounded-lg border border-white/5"
              >
                <div className="col-span-4 flex gap-3 items-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          : filtered.map((v) => {
              const rate = getSuccessRate(v);

              return (
                <div
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`grid grid-cols-12 items-center px-4 py-3 cursor-pointer transition rounded-lg border border-white/10 shadow-sm hover:bg-white/5 ${!seenIds.has(v.id) ? "animate-fadeIn" : ""}`}
                >
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {(v.name || "?")[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-sm truncate text-on_surface">
                      {v.name}
                    </span>
                  </div>

                  <div className="col-span-3 text-sm truncate text-on_surface">
                    {v.phone_number}
                  </div>

                  <div className="col-span-2 text-sm truncate text-on_surface">
                    {v.zone || "—"}
                  </div>

                  <div className="col-span-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        v.telegram_active
                          ? "bg-green-200 text-green-900"
                          : "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {v.telegram_active ? "Online" : "Offline"}
                    </span>
                  </div>

                  <div className="col-span-2 text-right text-sm font-semibold text-on_surface">
                    {rate > 0 ? `+${rate}` : rate}%
                  </div>
                </div>
              );
            })}
      </div>

      {/* CREATE FORM MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-surface_high w-full max-w-md p-6 rounded-2xl space-y-4 border border-white/10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-on_surface_variant hover:text-on_surface"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="font-bold text-xl text-on_surface">Add Volunteer</h2>

            {["name", "phone_number", "zone", "skills"].map((field) => (
              <input
                key={field}
                placeholder={
                  field === "skills"
                    ? "Skills (comma separated)"
                    : field.replace("_", " ")
                }
                value={form[field]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [field]: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-surface border border-white/10 text-on_surface focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-capitalize"
              />
            ))}

            <button
              onClick={handleCreate}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
            >
              {creating ? "Creating..." : "Create Volunteer"}
            </button>
          </div>
        </div>
      )}

      {/* VOLUNTEER DETAILS MODAL */}
      {selected && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface_high w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-white/10 relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Cross Button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-on_surface_variant hover:text-on_surface transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-inner">
                {(selected.name || "?")[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-on_surface">
                  {selected.name}
                </h2>
                <p className="text-on_surface_variant">
                  {selected.phone_number}
                </p>
              </div>
            </div>

            {/* Stats / Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-surface p-3 rounded-xl border border-white/5">
                <span className="text-on_surface_variant block mb-1 text-xs uppercase tracking-wider">
                  Zone
                </span>
                <span className="text-on_surface font-medium">
                  {selected.zone || "Unassigned"}
                </span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-white/5">
                <span className="text-on_surface_variant block mb-1 text-xs uppercase tracking-wider">
                  Status
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    selected.telegram_active
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {selected.telegram_active ? "Online" : "Offline"}
                </span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-white/5">
                <span className="text-on_surface_variant block mb-1 text-xs uppercase tracking-wider">
                  Completions
                </span>
                <span className="text-on_surface font-medium text-lg">
                  {selected.completions || 0}
                </span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-white/5">
                <span className="text-on_surface_variant block mb-1 text-xs uppercase tracking-wider">
                  No Shows
                </span>
                <span className="text-on_surface font-medium text-lg text-red-400">
                  {selected.no_shows || 0}
                </span>
              </div>
            </div>

            {/* Skills Badges */}
            {selected.skills && selected.skills.length > 0 && (
              <div className="mt-4 bg-surface p-4 rounded-xl border border-white/5">
                <span className="text-on_surface_variant block mb-3 text-xs uppercase tracking-wider">
                  Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selected.skills) ? (
                    selected.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-on_surface"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-on_surface">
                      {selected.skills}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Success Rate Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm text-on_surface_variant">
                Overall Success Rate
              </span>
              <span className="text-lg font-bold text-on_surface">
                {getSuccessRate(selected)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;

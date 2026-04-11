import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Skeleton from "../components/Skeleton";

const DispatchHistory = () => {
  const navigate = useNavigate();

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [view, setView] = useState("day"); // day | month | year

  const loadDispatches = async () => {
    try {
      setLoading(true);

      const res = await API.get("/marketplace/dispatches/");
      const completed = (res.data || [])
        .filter((d) => d.status === "COMPLETED")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setDispatches(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  const groupDispatches = () => {
    const groups = {};

    dispatches.forEach((d) => {
      const date = new Date(d.created_at);

      let key;
      if (view === "day") {
        key = date.toDateString();
      } else if (view === "month") {
        key = `${date.toLocaleString("default", {
          month: "long",
        })} ${date.getFullYear()}`;
      } else {
        key = `${date.getFullYear()}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });

    return groups;
  };

  const grouped = groupDispatches();
  const groupKeys = Object.keys(grouped);

  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const collapseAll = () => {
    const all = {};
    groupKeys.forEach((k) => {
      all[k] = true;
    });
    setCollapsedGroups(all);
  };

  const expandAll = () => {
    setCollapsedGroups({});
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/marketplace")}
              className="px-3 py-2 text-sm rounded-xl border border-white/10 bg-surface hover:bg-white/5"
            >
              ← Back
            </button>

            <div>
              <h1 className="text-2xl font-bold">Dispatch Timeline</h1>
              <p className="text-sm opacity-70">
                Completed deliveries and execution logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-surface rounded-xl p-1">
              {["day", "month", "year"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 text-xs rounded-lg capitalize transition ${
                    view === v
                      ? "bg-primary text-white"
                      : "text-on_surface_variant hover:bg-white/5"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              onClick={expandAll}
              className="text-xs px-3 py-1 rounded-lg bg-surface border border-white/10 hover:bg-white/5"
            >
              Expand All
            </button>

            <button
              onClick={collapseAll}
              className="text-xs px-3 py-1 rounded-lg bg-surface border border-white/10 hover:bg-white/5"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="relative space-y-6">
          <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-surface_high" />

          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="relative pl-10">
              {/* DOT */}
              <div className="absolute left-[2px] top-3 w-3 h-3 bg-primary/50 rounded-full" />

              {/* SKELETON CARD */}
              <div className="bg-surface_high/90 border border-white/5 p-5 rounded-2xl space-y-4">
                {/* TOP TITLE */}
                <Skeleton className="h-4 w-3/4" />

                {/* SMALL META LINE */}
                <Skeleton className="h-3 w-40" />

                {/* META ROW */}
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>

                {/* DETAILS BLOCK */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : dispatches.length === 0 ? (
        <p className="text-center p-10 opacity-60">No completed dispatches</p>
      ) : (
        <div className="relative">
          {/* TIMELINE LINE */}
          <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-white/10" />

          <div className="space-y-8">
            {groupKeys.map((group) => {
              const items = grouped[group];
              const collapsed = collapsedGroups[group];

              return (
                <div key={group} className="space-y-3">
                  {/* GROUP HEADER */}
                  <div
                    onClick={() => toggleGroup(group)}
                    className="pl-10 flex items-center justify-between cursor-pointer select-none"
                  >
                    <span className="text-sm font-semibold text-primary/90">
                      {group}
                    </span>

                    <span className="text-xs text-on_surface_variant">
                      {collapsed ? "▶" : "▼"}
                    </span>
                  </div>

                  {!collapsed &&
                    items.map((d, i) => (
                      <div key={d.id} className="relative pl-10">
                        {/* DOT */}
                        <div className="absolute left-[2px] top-2 w-3 h-3 bg-primary rounded-full" />

                        {/* CARD */}
                        <div
                          onClick={() =>
                            setExpanded(expanded === d.id ? null : d.id)
                          }
                          className="bg-surface_high/90 border border-white/5 p-5 rounded-2xl cursor-pointer transition hover:bg-white/5 animate-fadeIn"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <div className="flex justify-between gap-3">
                            <div className="flex-1">
                              {d.description ? (
                                <p className="font-semibold text-sm text-on_surface line-clamp-2">
                                  {d.description}
                                </p>
                              ) : (
                                <div>
                                  <p className="font-semibold text-sm text-on_surface">
                                    {d.item_type}
                                  </p>
                                  <p className="text-xs text-on_surface_variant">
                                    Qty: {d.item_quantity}
                                  </p>
                                </div>
                              )}

                              <p className="text-xs text-on_surface_variant mt-1">
                                #{d.id} • {d.volunteer_name}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-on_surface_variant">
                            <span>📍 {d.pickup_address}</span>
                            <span>
                              🕒 {new Date(d.created_at).toLocaleString()}
                            </span>
                          </div>

                          {expanded === d.id && (
                            <div className="mt-4 pt-4 border-t border-white/10 text-sm space-y-2">
                              {!d.description && (
                                <>
                                  <p>📦 Item: {d.item_type}</p>
                                  <p>📊 Quantity: {d.item_quantity}</p>
                                </>
                              )}

                              <p>📍 Pickup: {d.pickup_address}</p>
                              <p>
                                🕒 Created:{" "}
                                {new Date(d.created_at).toLocaleString()}
                              </p>

                              {d.description && (
                                <p>📝 Notes: {d.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchHistory;

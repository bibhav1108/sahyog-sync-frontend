import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const DispatchHistory = () => {
  const navigate = useNavigate();

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
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

  // -------- GROUPING LOGIC --------
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

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/marketplace")}
            className="px-3 py-2 text-sm bg-surface_high rounded-lg border border-white/10 hover:opacity-80"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-2xl font-bold">Dispatch Timeline</h1>
            <p className="text-sm text-on_surface_variant">
              Completed deliveries and execution logs
            </p>
          </div>
        </div>

        {/* TOGGLE */}
        <div className="flex bg-surface_high rounded-lg p-1">
          {["day", "month", "year"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs rounded-md capitalize transition ${
                view === v ? "bg-primary text-white" : "text-on_surface_variant"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center p-10">Loading...</p>
      ) : dispatches.length === 0 ? (
        <p className="text-center p-10 text-on_surface_variant">
          No completed dispatches
        </p>
      ) : (
        <div className="relative">
          {/* TIMELINE LINE */}
          <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-surface_high" />

          <div className="space-y-10">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="space-y-4">
                {/* GROUP LABEL */}
                <div className="pl-10 text-sm font-semibold text-on_surface_variant">
                  {group}
                </div>

                {items.map((d) => (
                  <div key={d.id} className="relative pl-10">
                    {/* DOT */}
                    <div className="absolute left-[2px] top-2 w-3 h-3 bg-primary rounded-full" />

                    {/* CARD */}
                    <div
                      onClick={() =>
                        setExpanded(expanded === d.id ? null : d.id)
                      }
                      className="bg-surface_high p-5 rounded-xl cursor-pointer hover:scale-[1.01] transition border border-white/5"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          {d.description ? (
                            <p className="font-semibold leading-snug line-clamp-2">
                              {d.description}
                            </p>
                          ) : (
                            <div>
                              <p className="font-semibold text-on_surface_variant">
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

                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-on_surface_variant">
                        <span>📍 {d.pickup_address}</span>
                        <span>
                          🕒 {new Date(d.created_at).toLocaleString()}
                        </span>

                        <span
                          className={`px-2 py-1 rounded ${
                            d.otp_used
                              ? "bg-primary/10 text-primary"
                              : "bg-surface text-on_surface_variant"
                          }`}
                        >
                          OTP {d.otp_used ? "Used" : "Unused"}
                        </span>
                      </div>

                      {expanded === d.id && (
                        <div className="mt-4 pt-4 border-t text-sm space-y-2">
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

                          {d.description && <p>📝 Notes: {d.description}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchHistory;

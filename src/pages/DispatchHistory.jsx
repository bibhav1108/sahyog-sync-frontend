import { useEffect, useState } from "react";
import API from "../services/api";

const DispatchHistory = () => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

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

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Dispatch Timeline</h1>
        <p className="text-sm text-on_surface_variant">
          Completed deliveries and execution logs
        </p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center p-10">Loading...</p>
      ) : dispatches.length === 0 ? (
        <p className="text-center p-10 text-on_surface_variant">
          No completed dispatches
        </p>
      ) : (
        <div className="relative pl-6 border-l border-surface_high space-y-6">
          {dispatches.map((d) => (
            <div key={d.id} className="relative">
              {/* DOT */}
              <div className="absolute -left-[10px] top-2 w-4 h-4 bg-primary rounded-full" />

              {/* CARD */}
              <div
                onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                className="bg-surface_high p-5 rounded-xl cursor-pointer hover:scale-[1.01] transition"
              >
                {/* TOP */}
                <div className="flex justify-between items-start gap-3">
                  {/* TITLE */}
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

                  {/* STATUS */}
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>

                {/* META */}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-on_surface_variant">
                  <span>📍 {d.pickup_address}</span>
                  <span>🕒 {new Date(d.created_at).toLocaleString()}</span>

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

                {/* EXPANDED */}
                {expanded === d.id && (
                  <div className="mt-4 pt-4 border-t text-sm space-y-2">
                    {!d.description && (
                      <>
                        <p>📦 Item: {d.item_type}</p>
                        <p>📊 Quantity: {d.item_quantity}</p>
                      </>
                    )}

                    <p>📍 Pickup: {d.pickup_address}</p>
                    <p>🕒 Created: {new Date(d.created_at).toLocaleString()}</p>

                    {d.description && <p>📝 Notes: {d.description}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DispatchHistory;

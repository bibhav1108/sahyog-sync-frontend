import { useEffect, useState } from "react";
import API from "../services/api";

const DispatchHistory = () => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDispatches = async () => {
    try {
      setLoading(true);

      // ✅ FIXED endpoint
      const res = await API.get("/marketplace/dispatches/");

      console.log("DISPATCHES:", res.data);

      // ✅ filter completed on frontend
      const completed = (res.data || []).filter(
        (d) => d.status === "COMPLETED",
      );

      setDispatches(completed);
    } catch (err) {
      console.error("Failed to load dispatches", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dispatch History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : dispatches.length === 0 ? (
        <p>No completed dispatches</p>
      ) : (
        dispatches.map((d) => (
          <div key={d.id} className="p-4 bg-white rounded shadow space-y-1">
            <p>
              <span className="font-medium">Dispatch ID:</span> {d.id}
            </p>

            <p>
              <span className="font-medium">Volunteer:</span> {d.volunteer_name}
            </p>

            <p>
              <span className="font-medium">Item:</span> {d.item_type}
            </p>

            <p>
              <span className="font-medium">Quantity:</span> {d.item_quantity}
            </p>

            <p>
              <span className="font-medium">Pickup:</span> {d.pickup_address}
            </p>

            <p>
              <span className="font-medium">Status:</span>{" "}
              <span className="text-green-600 font-semibold">{d.status}</span>
            </p>

            <p>
              <span className="font-medium">Completed At:</span>{" "}
              {new Date(d.created_at).toLocaleString()}
            </p>

            <p>
              <span className="font-medium">OTP Used:</span>{" "}
              {d.otp_used ? "Yes" : "No"}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default DispatchHistory;

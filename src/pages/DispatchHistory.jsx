import { useEffect, useState } from "react";
import API from "../services/api";

const DispatchHistory = () => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDispatches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/dispatches");

      console.log("DISPATCHES:", res.data); // 🔥 debug

      const filtered = (res.data || []).filter((d) => d.status === "COMPLETED");

      setDispatches(filtered);
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
          <div key={d.id} className="p-4 bg-white rounded shadow">
            <p>{d.need?.type}</p>
            <p>{d.need?.description}</p>
            <p>{d.volunteer?.name}</p>
            <p>{d.status}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default DispatchHistory;

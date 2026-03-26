import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../services/api";

const Layout = ({ children }) => {
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVol, setSelectedVol] = useState({});

  // 🔒 Prevent overlapping calls
  const loadingRef = useRef({
    volunteers: false,
    notifications: false,
  });

  // 🔥 Load needs
  const loadNotifications = async () => {
    if (loadingRef.current.notifications) return;
    loadingRef.current.notifications = true;

    try {
      const res = await API.get("/needs");

      const filtered = (res.data || []).filter((n) => n.status !== "COMPLETED");

      setNotifications(filtered.slice(0, 5));
    } catch (err) {
      if (err.code !== "ERR_CANCELED") {
        console.error("Failed to load needs", err);
      }
    } finally {
      loadingRef.current.notifications = false;
    }
  };

  // 🔥 Load volunteers
  const loadVolunteers = async () => {
    if (loadingRef.current.volunteers) return;
    loadingRef.current.volunteers = true;

    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch (err) {
      if (err.code !== "ERR_CANCELED") {
        console.error("Failed to load volunteers", err);
      }
    } finally {
      loadingRef.current.volunteers = false;
    }
  };

  // 🔥 Dispatch function
  const handleDispatch = async (needId) => {
    const volunteerId = selectedVol[needId];

    if (!volunteerId) {
      alert("Select a volunteer first");
      return;
    }

    try {
      const res = await API.post("/dispatches", {
        need_id: needId,
        volunteer_id: Number(volunteerId),
      });

      alert(res.data.message || "Dispatch created!");

      loadNotifications(); // refresh
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert("Dispatch failed");
      }
    }
  };

  // 🔥 Initial load + auto refresh
  useEffect(() => {
    loadNotifications();
    loadVolunteers();

    const interval = setInterval(() => {
      loadNotifications();
      loadVolunteers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 Auto open notifications on dashboard
  useEffect(() => {
    setShowNotifications(location.pathname === "/dashboard");
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-5">
        <h1 className="text-xl font-bold mb-6">Sahyog Setu</h1>

        <nav className="flex flex-col gap-3">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create">Create Need</Link>
          <Link to="/surplus">Surplus Alerts</Link>
          <Link to="/volunteers">Volunteers</Link>
        </nav>
      </div>

      {/* 🔔 Notifications Panel */}
      {showNotifications && (
        <div className="w-72 bg-white border-r p-4 flex flex-col gap-3">
          <h2 className="font-semibold mb-2">Notifications</h2>

          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-gray-50 shadow-sm border hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-semibold">{n.type}</p>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded ${
                      n.urgency === "HIGH"
                        ? "bg-red-100 text-red-600"
                        : n.urgency === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {n.urgency}
                  </span>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200">
                  {n.status}
                </span>

                <p className="text-xs text-gray-500 mt-1">{n.quantity}</p>
                <p className="text-xs text-gray-400 truncate">
                  {n.pickup_address}
                </p>
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(n.created_at).toLocaleTimeString()}
                </p>

                <select
                  className="w-full mt-2 p-1 border rounded text-xs"
                  value={selectedVol[n.id] || ""}
                  onChange={(e) =>
                    setSelectedVol((prev) => ({
                      ...prev,
                      [n.id]: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Volunteer</option>
                  {volunteers
                    .filter((v) => v.telegram_active)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ✅
                      </option>
                    ))}
                </select>

                {volunteers.filter((v) => v.telegram_active).length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No Telegram-connected volunteers
                  </p>
                )}

                <button
                  disabled={n.status === "DISPATCHED"}
                  onClick={() => handleDispatch(n.id)}
                  className={`w-full mt-2 text-xs p-1 rounded ${
                    n.status === "DISPATCHED"
                      ? "bg-gray-300 text-gray-500"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {n.status === "DISPATCHED" ? "Assigned" : "Assign Volunteer"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No notifications</p>
          )}
        </div>
      )}

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔 Toggle Notifications
          </button>

          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Layout;

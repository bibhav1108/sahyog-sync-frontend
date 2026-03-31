import { useEffect, useState } from "react";
import API from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const Dashboard = () => {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const n = await API.get("/needs");
        const v = await API.get("/volunteers/");
        setNeeds(n.data || []);
        setVolunteers(v.data || []);
      } catch {}
    };

    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  const center = [26.8467, 80.9462];

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* ================= LEFT ================= */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        {/* HEADER */}
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-widest">
            Operations Overview
          </p>
          <h1 className="text-3xl font-outfit font-bold mt-1">Dashboard</h1>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Active Needs" value={needs.length} icon="inventory_2" />
          <Card
            title="Active Missions"
            value={needs.filter((n) => n.status !== "completed").length}
            icon="rocket_launch"
          />
          <Card title="Volunteers" value={volunteers.length} icon="groups" />
        </div>

        {/* MAP */}
        <div className="bg-surface_high rounded-xl p-4 h-[420px]">
          <MapContainer
            center={center}
            zoom={6}
            className="h-full w-full rounded-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {needs.map((n) => (
              <Marker
                key={n.id}
                position={[24 + Math.random() * 6, 78 + Math.random() * 6]}
              >
                <Popup>
                  {n.type} — {n.quantity}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 🔥 TOP VOLUNTEERS (MOVED HERE) */}
        <div className="bg-surface_high rounded-xl p-5 space-y-5">
          <h3 className="font-semibold">Top Volunteers</h3>

          {volunteers
            .sort((a, b) => b.completions - a.completions)
            .slice(0, 5)
            .map((v) => {
              const progress = Math.min((v.completions / 10) * 100, 100);

              return (
                <div key={v.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {/* avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {v.name?.[0]}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold">{v.name}</p>
                      <p className="text-xs text-on_surface_variant">
                        {v.completions} completions
                      </p>
                    </div>

                    {/* tier */}
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {v.trust_tier}
                    </span>
                  </div>

                  {/* progress */}
                  <div className="w-full h-2 bg-surface rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="col-span-12 lg:col-span-4">
        {/* 🔥 RECENT EVENTS PANEL (EMPTY FOR NOW) */}
        <div className="bg-surface_high rounded-xl p-5 h-full min-h-[500px]">
          <h3 className="font-semibold mb-4">Recent Events</h3>

          <div className="flex items-center justify-center h-[400px] text-sm text-on_surface_variant">
            No events yet
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const Card = ({ title, value, icon }) => (
  <div className="bg-surface_high p-5 rounded-xl">
    <span className="material-symbols-outlined text-primary">{icon}</span>
    <p className="text-xs text-on_surface_variant mt-4">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Dashboard;

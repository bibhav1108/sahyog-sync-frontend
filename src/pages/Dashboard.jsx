import { useEffect, useState } from "react";
import API from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Skeleton from "../components/Skeleton";

const Dashboard = () => {
  const [needs, setNeeds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const n = await API.get("/needs");
        const v = await API.get("/volunteers/");
        const c = await API.get("/campaigns");

        setNeeds(n.data || []);
        setVolunteers(v.data || []);
        setCampaigns(c.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  const center = [26.8467, 80.9462];

  const activeNeeds = needs.filter((n) => n.status === "OPEN");
  const activeCampaigns = campaigns.filter((c) => c.status !== "COMPLETED");

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-widest">
            Operations Overview
          </p>
          <h1 className="mt-1 text-3xl font-outfit font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-surface_high p-5 space-y-3">
                <Skeleton className="h-5 w-5" variant="circle" />
                <Skeleton className="h-2 w-24" variant="text" />
                <Skeleton className="h-6 w-16" variant="text" />
              </div>
            ))
          ) : (
            <>
              <Card
                title="Active Needs"
                value={activeNeeds.length}
                icon="inventory_2"
                index={0}
              />
              <Card
                title="Active Campaigns"
                value={activeCampaigns.length}
                icon="campaign"
                index={1}
              />
              <Card
                title="Volunteers"
                value={volunteers.length}
                icon="groups"
                index={2}
              />
            </>
          )}
        </div>

        <div className="relative z-0 h-[420px] rounded-xl bg-surface_high p-4">
          <MapContainer
            center={center}
            zoom={6}
            className="z-0 h-full w-full rounded-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {activeNeeds.map((n) => (
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

        <div className="space-y-5 rounded-xl bg-surface_high p-5">
          <h3 className="font-semibold">Top Volunteers</h3>

          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg bg-surface p-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9" variant="circle" />

                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-32" variant="text" />
                      <Skeleton className="h-2 w-24" variant="text" />
                    </div>

                    <Skeleton
                      className="h-5 w-14 rounded-full"
                      variant="default"
                    />
                  </div>

                  <Skeleton
                    className="h-2 w-full rounded-full"
                    variant="default"
                  />
                </div>
              ))
            : volunteers
                .sort((a, b) => b.completions - a.completions)
                .slice(0, 5)
                .map((v, i) => {
                  const progress = Math.min((v.completions / 10) * 100, 100);

                  return (
                    <div
                      key={v.id}
                      className="space-y-2 animate-fadeIn"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                          {v.name?.[0]}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-semibold">{v.name}</p>
                          <p className="text-xs text-on_surface_variant">
                            {v.completions} completions
                          </p>
                        </div>

                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                          {v.trust_tier}
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <div className="h-full min-h-[500px] rounded-xl bg-surface_high p-5">
          <h3 className="mb-4 font-semibold">Recent Events</h3>

          <div className="flex h-[400px] items-center justify-center text-sm text-on_surface_variant">
            No events yet
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon, index }) => (
  <div
    className="rounded-xl bg-surface_high p-5 animate-fadeIn"
    style={{ animationDelay: `${index * 40}ms` }}
  >
    <span className="material-symbols-outlined text-primary">{icon}</span>
    <p className="mt-4 text-xs text-on_surface_variant">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Dashboard;

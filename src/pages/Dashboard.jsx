import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Skeleton from "../components/Skeleton";
import { resolveProfileImage } from "../utils/imageUtils";
import VerificationBadge from "../components/VerificationBadge";

const Dashboard = () => {
  const [needs, setNeeds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [n, v, c, a] = await Promise.all([
          API.get("/needs"),
          API.get("/volunteers/"),
          API.get("/campaigns"),
          API.get("/audit/"),
        ]);

        setNeeds(n.data || []);
        setVolunteers(v.data || []);
        setCampaigns(c.data || []);
        setAuditLogs(a.data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    const i = setInterval(load, 10000);
    return () => clearInterval(i);
  }, []);

  const center = [26.8467, 80.9462];

  const activeNeeds = needs.filter((n) => n.status === "OPEN");
  const activeCampaigns = campaigns.filter((c) => c.status !== "COMPLETED");

  const getEventIcon = (type) => {
    switch (type) {
      case "MISSION_LAUNCHED": return "rocket_launch";
      case "MISSION_COMPLETED": return "task_alt";
      case "PARTICIPANT_APPROVED": return "person_add_alt";
      case "VOLUNTEER_REGISTERED": return "person_add";
      case "INVENTORY_ADDED": return "inventory_2";
      case "INVENTORY_UPDATED": return "edit_note";
      default: return "notifications";
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "MISSION_LAUNCHED": return "text-blue-500 bg-blue-50";
      case "MISSION_COMPLETED": return "text-green-500 bg-green-50";
      case "INVENTORY_ADDED": return "text-amber-500 bg-amber-50";
      case "VOLUNTEER_REGISTERED": return "text-primary bg-primary/5";
      default: return "text-on_surface_variant bg-surface";
    }
  };

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
                .sort((a, b) => (b.completions || 0) - (a.completions || 0))
                .slice(0, 5)
                .map((v, i) => {
                  const progress = Math.min(((v.completions || 0) / 10) * 100, 100);

                  return (
                    <div
                      key={v.id}
                      className="space-y-2 animate-fadeIn"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/10 shadow-sm">
                          <img 
                            src={resolveProfileImage(v.profile_image_url)} 
                            alt={v.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-semibold">
                            <span className="text-sm">{v.name}</span>
                            <VerificationBadge trustTier={v.trust_tier} telegramActive={v.telegram_active} />
                          </div>
                          <p className="text-xs text-on_surface_variant">
                            {v.completions || 0} completions
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
        <div className="h-full min-h-[500px] rounded-xl bg-surface_high p-5 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Recent Events</h3>
            <Link to="/activity-history" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 shrink-0" variant="circle" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" variant="text" />
                    <Skeleton className="h-2 w-1/4" variant="text" />
                  </div>
                </div>
              ))
            ) : auditLogs.length > 0 ? (
              auditLogs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={log.id} 
                  className="flex gap-4 group"
                >
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${getEventColor(log.event_type)}`}>
                    <span className="material-symbols-outlined text-xl">{getEventIcon(log.event_type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on_surface leading-snug">
                      {log.notes}
                    </p>
                    <p className="text-[10px] text-on_surface_variant/60 font-black uppercase tracking-widest mt-1">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-on_surface_variant opacity-50 flex-col gap-2">
                <span className="material-symbols-outlined text-4xl">history</span>
                No events yet
              </div>
            )}
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

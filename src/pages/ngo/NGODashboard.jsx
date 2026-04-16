import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import DataRow from "../../components/shared/DataRow";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import { resolveProfileImage } from "../../utils/imageUtils";
import VerificationBadge from "../../components/shared/VerificationBadge";

// Fix Leaflet's default icon issue in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Generator for Needs
const createNeedIcon = (urgency) => {
  const urgencyClass = urgency === "HIGH" ? "marker-high marker-pulse" : 
                       urgency === "MEDIUM" ? "marker-medium" : 
                       "marker-low";
  
  return L.divIcon({
    className: "need-marker-container",
    html: `<div class="need-marker-content ${urgencyClass}">N</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const NGODashboard = () => {
  const [needs, setNeeds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [n, v, c, a] = await Promise.all([
          API.get("needs"),
          API.get("volunteers/"),
          API.get("campaigns"),
          API.get("audit/"),
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

  const dashboardSkeletonLayout = [
    { type: 'grid', cols: 3, item: { type: 'rect', height: 140 } },
    { type: 'grid', cols: 12, gap: 8, items: [
        { type: 'rect', height: 420, className: "lg:col-span-8" },
        { type: 'rect', height: 420, className: "lg:col-span-4" }
    ]},
    { type: 'grid', cols: 1, item: { type: 'rect', height: 300 } }
  ];

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

  if (loading) {
    return (
        <div className="space-y-8 mt-10">
            <SkeletonStructure layout={dashboardSkeletonLayout} />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-8 selection:bg-primary/10">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-primary text-[10px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1">
            Operations Intelligence
          </p>
          <h1 className="text-3xl sm:text-4xl font-outfit font-black text-on_surface tracking-tight">NGO Dashboard</h1>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          <MetricCard label="Active Needs" value={activeNeeds.length} icon="inventory_2" delay="100ms" className="bg-white/80" />
          <MetricCard label="Active Campaigns" value={activeCampaigns.length} icon="campaign" delay="200ms" className="bg-white/80" />
          <MetricCard label="Total Volunteers" value={volunteers.length} icon="groups" highlight delay="300ms" />
        </div>

        <div className="relative z-0 h-[300px] sm:h-[420px] rounded-[1.5rem] sm:rounded-[2rem] bg-surface_high/60 border-2 border-white/20 overflow-hidden shadow-soft animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <MapContainer center={center} zoom={6} className="z-0 h-full w-full">
            <TileLayer 
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" 
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
            {activeNeeds.filter(n => n.latitude && n.longitude).map((n) => (
              <Marker key={n.id} position={[parseFloat(n.latitude), parseFloat(n.longitude)]} icon={createNeedIcon(n.urgency)}>
                <Popup className="premium-popup">
                  <div className="p-1 min-w-[150px]">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                       <p className="font-outfit font-black text-sm uppercase tracking-tight text-primary">{n.type}</p>
                    </div>
                    <p className="text-xs font-bold text-on_surface mb-1">{n.quantity}</p>
                    <p className="text-[10px] leading-relaxed text-on_surface_variant border-t border-white/10 pt-1">
                        <span className="material-symbols-outlined text-[10px] align-middle mr-1">location_on</span>
                        {n.pickup_address || "Location provided by donor"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <ContentSection title="Top Performing Volunteers" icon="star" delay="500ms">
            <div className="space-y-6">
                {volunteers
                .sort((a, b) => (b.completions || 0) - (a.completions || 0))
                .slice(0, 5)
                .map((v, i) => {
                    const progress = Math.min(((v.completions || 0) / 10) * 100, 100);
                    return (
                        <div key={v.id} className="space-y-2 group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-soft group-hover:scale-110 transition-transform">
                                        <img src={resolveProfileImage(v.profile_image_url)} alt={v.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 font-bold text-on_surface">
                                            <span>{v.name}</span>
                                            <VerificationBadge trustTier={v.trust_tier} telegramActive={v.telegram_active} />
                                        </div>
                                        <p className="text-[10px] text-on_surface_variant uppercase font-black tracking-widest opacity-60">
                                            {v.completions || 0} Missions Completed
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                    v.trust_tier === 'ELITE' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'
                                }`}>
                                    {v.trust_tier}
                                </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-surface_highest overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${progress}%` }} 
                                    className="h-full bg-primaryGradient rounded-full" 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </ContentSection>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <ContentSection title="Recent Network Events" icon="explore" className="h-full" delay="600ms">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant opacity-40">Live Feed</h3>
            <Link to="/activity-history" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 transition-all hover:gap-2">
              View All <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-6 pr-2">
            {auditLogs.length > 0 ? (
              auditLogs.map((log, i) => (
                <DataRow 
                    key={log.id}
                    label={log.notes}
                    description={`${new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(log.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}`}
                    icon={getEventIcon(log.event_type)}
                    className="hover:translate-x-1"
                />
              ))
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-on_surface_variant opacity-50 flex-col gap-2">
                <span className="material-symbols-outlined text-4xl">history</span>
                No network events detected
              </div>
            )}
          </div>
        </ContentSection>
      </div>
    </div>
  );
};

export default NGODashboard;
;

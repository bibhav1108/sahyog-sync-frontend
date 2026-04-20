import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../services/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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
  });
};

const createAlertIcon = () => {
  return L.divIcon({
    className: "alert-marker-container",
    html: `<div class="alert-marker-content"><span class="material-symbols-outlined" style="font-size: 16px;">sensors</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Map Controller for dynamic movements
const MapController = ({ center, zoom, isFullscreen }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { duration: 1.5 });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    // Initial invalidate
    map.invalidateSize();
    // Delayed invalidate for transition end
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [isFullscreen, map]);

  return null;
};

const NGODashboard = () => {
  const [needs, setNeeds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [mapView, setMapView] = useState("all");
  const [mapCenter, setMapCenter] = useState([26.8467, 80.9462]);
  const [mapZoom, setMapZoom] = useState(6);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMarkerId, setExpandedMarkerId] = useState(null);
  const focusProcessedRef = useRef(null);

  const location = useLocation();

  const [org, setOrg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [n, v, c, a, o, al] = await Promise.all([
          API.get("needs"),
          API.get("volunteers/"),
          API.get("campaigns"),
          API.get("audit/"),
          API.get("/organizations/me").catch(() => ({ data: null })),
          API.get("/marketplace/needs/alerts").catch(() => ({ data: [] }))
        ]);

        setNeeds(n.data || []);
        setVolunteers(v.data || []);
        setCampaigns(c.data || []);
        setAuditLogs(a.data.items || []);
        setOrg(o?.data);
        setAlerts(al.data || []);
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

  // Handle auto-focus from navigation
  useEffect(() => {
    const focusKey = location.key + location.state?.focusId;
    if (location.state?.focusId && !loading && focusProcessedRef.current !== focusKey) {
      const { focusId, focusType } = location.state;
      const target = focusType === 'alert' 
        ? alerts.find(a => a.id === focusId)
        : needs.find(n => n.id === focusId);

      if (target && target.latitude && target.longitude) {
        setMapCenter([parseFloat(target.latitude), parseFloat(target.longitude)]);
        setMapZoom(14);
        setMapView(focusType === 'alert' ? 'alerts' : 'needs');
        setExpandedMarkerId(`${focusType}-${focusId}`);
        focusProcessedRef.current = focusKey; // Mark this specific navigation event as handled
      }
    }
  }, [location.state, location.key, loading, alerts, needs]);

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

  if (org?.status !== 'active') {
    const isNotOnboarded = !org;
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 animate-fadeIn">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/10 text-primary mb-4 animate-pulse">
            <span className="material-symbols-outlined text-4xl">{isNotOnboarded ? 'architecture' : 'shield_person'}</span>
          </div>
          <h1 className="text-4xl font-outfit font-black text-on_surface tracking-tight">
            {isNotOnboarded ? 'Action Required: NGO Profile' : 'Administrative Initialization'}
          </h1>
          <p className="text-on_surface_variant max-w-lg mx-auto font-medium">
            {isNotOnboarded 
              ? "You have successfully registered as an administrator. Your next step is to establish your organization's identity on the network."
              : "Welcome to the Sahyog Sync Network. Your administrator account is active, but your organization's campaign capabilities are currently locked."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-8 rounded-[2.5rem] border space-y-4 transition-all ${
            isNotOnboarded ? 'bg-primary/5 border-primary/20 scale-[1.02] shadow-xl' : 'bg-surface_high/50 border-white/20'
          }`}>
            <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">{isNotOnboarded ? 'notification_important' : 'hourglass_empty'}</span>
              Step 1: {isNotOnboarded ? 'NGO Onboarding' : 'Verification'}
            </div>
            <h3 className="text-xl font-outfit font-black text-on_surface">
              {isNotOnboarded ? 'Establish Identity' : 'Review in Progress'}
            </h3>
            <p className="text-sm text-on_surface_variant leading-relaxed">
              {isNotOnboarded 
              ? "Provide your organization's base details, about statement, and official contact channels to begin the verification process."
                : "System administrators are currently verifying your institutional credentials. This process ensures all organizations on the network are legitimate and secure."}
            </p>
            <div className="pt-4 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${isNotOnboarded ? 'bg-red-500' : 'bg-amber-500'} animate-pulse`}></span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isNotOnboarded ? 'text-red-500' : 'text-amber-500'}`}>
                {isNotOnboarded ? 'Status: ACTION REQUIRED' : `Current Status: ${org?.status || 'PENDING'}`}
              </span>
            </div>
            {isNotOnboarded && (
                <button 
                  onClick={() => window.location.href='/ngo/onboarding'}
                  className="w-full mt-4 py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-1 transition-all"
                >
                    Launch Onboarding
                </button>
            )}
          </div>

          <div className="bg-on_surface p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Step 2: Team Setup
            </div>
            <h3 className="text-xl font-outfit font-black text-white">Initialize Staff</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Once approved, a <b>'Add Coordinator'</b> option will manifest in your Management Hub. You can then begin deploying your staff to the network.
            </p>
            <Link 
              to="/ngo/management"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
            >
              Go to Management Hub <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="p-8 border-2 border-dashed border-white/10 rounded-[3rem] text-center">
          <p className="text-xs font-bold text-on_surface_variant/40 uppercase tracking-[0.2em]">
            Institutional Control Hub Locked • Clearance Level: ADMIN_INIT
          </p>
        </div>
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

        <div className={`transition-all duration-500 overflow-hidden ${
          isMapFullscreen 
            ? "fixed inset-0 z-[2000] p-4 sm:p-10 bg-black/60 backdrop-blur-xl h-screen w-screen" 
            : "relative z-0 h-[300px] sm:h-[420px] rounded-[1.5rem] sm:rounded-[2rem] bg-surface_high/60 border-2 border-white/20 shadow-soft animate-fadeIn"
        }`}>
          
          {/* Map Controls */}
          <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-[1000] flex gap-2 items-center">
            <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg">
              {[
                { id: 'all', label: 'All', icon: 'border_all' },
                { id: 'needs', label: 'Needs', icon: 'inventory_2' },
                { id: 'alerts', label: 'Alerts', icon: 'sensors' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setMapView(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    mapView === mode.id 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-on_surface_variant hover:bg-black/5"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{mode.icon}</span>
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            <button 
                onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                className="p-2.5 bg-on_surface text-white rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                title={isMapFullscreen ? "Exit Fullscreen" : "Enlarge Map"}
            >
                <span className="material-symbols-outlined text-[20px]">
                    {isMapFullscreen ? 'close_fullscreen' : 'expand_content'}
                </span>
            </button>
          </div>

          <div className="h-full w-full">
            <MapContainer center={center} zoom={mapZoom} className="z-0 h-full w-full outline-none">
                <MapController center={mapCenter} zoom={mapZoom} isFullscreen={isMapFullscreen} />
                <TileLayer 
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" 
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />
            
            {/* Render Needs */}
            {(mapView === 'all' || mapView === 'needs') && activeNeeds.filter(n => n.latitude && n.longitude).map((n) => (
              <Marker 
                key={`need-${n.id}`} 
                position={[parseFloat(n.latitude), parseFloat(n.longitude)]} 
                icon={createNeedIcon(n.urgency)}
                eventHandlers={{
                  add: (e) => {
                    if (expandedMarkerId === `need-${n.id}`) {
                      e.target.openPopup();
                    }
                  }
                }}
              >
                <Popup className="premium-popup">
                  <div className="p-3 min-w-[220px] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                       <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <p className="font-outfit font-black text-sm uppercase tracking-tight text-primary">{n.type}</p>
                       </div>
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                        n.urgency === 'HIGH' ? 'bg-red-500 text-white' : 'bg-primary/10 text-primary'
                       }`}>{n.urgency}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-on_surface">{n.quantity}</p>
                      <p className="text-[10px] leading-relaxed text-on_surface_variant line-clamp-2 italic opacity-80">
                        {n.description || "No additional details provided."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-on_surface/5 space-y-1.5">
                      <p className="text-[9px] flex items-center gap-1.5 text-on_surface_variant font-medium">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {n.pickup_address || "Location TBD"}
                      </p>
                      <p className="text-[9px] flex items-center gap-1.5 text-on_surface_variant/60 font-medium">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          Requested {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render Alerts */}
            {(mapView === 'all' || mapView === 'alerts') && alerts.filter(a => a.latitude && a.longitude).map((a) => (
              <Marker 
                key={`alert-${a.id}`} 
                position={[parseFloat(a.latitude), parseFloat(a.longitude)]} 
                icon={createAlertIcon()}
                eventHandlers={{
                  add: (e) => {
                    if (expandedMarkerId === `alert-${a.id}`) {
                      e.target.openPopup();
                    }
                  }
                }}
              >
                <Popup className="premium-popup alert-popup">
                  <div className="p-3 min-w-[240px] space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <p className="font-outfit font-black text-sm uppercase tracking-tight text-indigo-600">Signal: {a.item || "Unidentified"}</p>
                       </div>
                    </div>

                    {a.notes && a.notes !== "N/A" ? (
                      <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                        <p className="text-[9px] text-indigo-700 font-bold leading-tight line-clamp-2">AI: {a.notes}</p>
                      </div>
                    ) : (
                      <p className="text-[10px] leading-relaxed text-on_surface_variant italic">"{a.message_body?.slice(0, 80)}..."</p>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-on_surface/5">
                        <div className="flex items-center justify-between text-[9px] font-medium text-on_surface_variant">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">person</span> {a.donor_name || "Citizen"}</span>
                          <span className="opacity-60">{new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-[9px] flex items-center gap-1.5 text-on_surface_variant font-medium">
                          <span className="material-symbols-outlined text-[12px]">near_me</span>
                          {a.location || "Coordinates Received"}
                        </p>
                    </div>

                    <Link to="/marketplace" className="claim-btn block w-full text-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Claim This Donation
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          </div>
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
                                            {v.completions || 0} Campaigns Completed
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
        <ContentSection title="Recent Network Events" icon="explore" delay="600ms">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant opacity-40">Live Feed</h3>
            <Link to="/activity-history" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 transition-all hover:gap-2">
              View All <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-6 pr-2">
            {auditLogs.length > 0 ? (
              auditLogs.slice(0, 5).map((log, i) => (
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

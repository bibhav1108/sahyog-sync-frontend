import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import ActionInput from "../../components/shared/ActionInput";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import Modal from "../../components/shared/Modal";

const TYPE_OPTIONS = [
  "HEALTH",
  "EDUCATION",
  "BASIC_NEEDS",
  "AWARENESS",
  "EMERGENCY",
  "ENVIRONMENT",
  "SKILLS",
  "OTHER",
];

const STATUS_ORDER = {
  ACTIVE: 0,
  PLANNED: 1,
  COMPLETED: 2,
};

const MIN_CAMPAIGNS = 6;
const MIN_READINESS = 4;

const Campaigns = () => {
  // --- STATE ---
  const [campaigns, setCampaigns] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pool, setPool] = useState([]);
  const [loadingPool, setLoadingPool] = useState(false);

  const [readiness, setReadiness] = useState([]);
  const [loadingReadiness, setLoadingReadiness] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("OTHER");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [items, setItems] = useState([{ key: "", value: "" }]);
  const [volunteersRequired, setVolunteersRequired] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [formError, setFormError] = useState("");

  // --- API METHODS ---
  const loadCampaigns = async () => {
    try {
      const res = await API.get("/campaigns/");
      const data = res.data || [];
      setCampaigns(data);
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const loadInventory = async () => {
    try {
      const res = await API.get("/inventory/");
      setInventory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVolunteerReadiness = async (campaignData = null) => {
    try {
      setLoadingReadiness(true);
      const source = campaignData ?? campaigns;
      const ongoingCampaigns = source.filter((c) => c.status === "PLANNED");

      const rows = await Promise.all(
        ongoingCampaigns.map(async (campaign) => {
          try {
            const res = await API.get(`/campaigns/${campaign.id}/pool`);
            const normalizeStatus = (s) => {
              if (!s) return "";
              if (typeof s === "string") return s;
              if (s.value) return s.value;
              return String(s);
            };

            const approvedVolunteers = (res.data || []).filter(
              (v) => normalizeStatus(v.status) === "APPROVED",
            );

            return { campaign, approvedVolunteers };
          } catch (err) {
            console.error(err);
            return { campaign, approvedVolunteers: [] };
          }
        }),
      );

      setReadiness(rows.filter((row) => row.approvedVolunteers.length > 0));
    } catch (err) {
      console.error(err);
      setReadiness([]);
    } finally {
      setLoadingReadiness(false);
    }
  };

  const refreshDashboard = async () => {
    const campaignData = await loadCampaigns();
    await loadVolunteerReadiness(campaignData);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [campaignData] = await Promise.all([
        loadCampaigns(),
        loadInventory(),
      ]);
      await loadVolunteerReadiness(campaignData);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  // --- ACTIONS & HANDLERS ---
  const resetForm = () => {
    setName("");
    setDescription("");
    setTargetQuantity("");
    setItems([{ key: "", value: "" }]);
    setVolunteersRequired("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setSkills("");
    setType("OTHER");
    setFormError("");
  };

  const triggerBroadcast = async (campaignId) => {
    try {
      setActionLoadingId(`broadcast-${campaignId}`);
      await API.post(`/campaigns/${campaignId}/broadcast`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const normalizeDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      if (typeof value === "string") return value.slice(0, 16);
      return "";
    }
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setLoadingAI(true);
      const res = await API.post("/campaigns/draft", { prompt: aiPrompt });
      const data = res.data || {};
      setName(data.name || "");
      setDescription(data.description || "");
      setType(data.type || "OTHER");
      setTargetQuantity(String(data.target_quantity ?? ""));
      setShowAIModal(false);
      setShowForm(true);
    } catch (err) {
      console.error("AI ERROR:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  const createCampaign = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !description.trim()) return;

    const formattedItems = {};
    items.forEach((i) => {
      if (i.key && i.value) formattedItems[i.key] = Number(i.value);
    });

    try {
      setCreating(true);
      await API.post("/campaigns/", {
        name: trimmedName,
        description: description.trim(),
        type,
        target_quantity: targetQuantity,
        items: formattedItems,
        volunteers_required: Number(volunteersRequired) || 0,
        start_time: startTime || null,
        end_time: endTime || null,
        location_address: location || null,
        required_skills: skills ? skills.split(",").map((s) => s.trim()) : [],
      });
      setShowForm(false);
      resetForm();
      await refreshDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const openDetails = async (campaign) => {
    setSelectedCampaign(campaign);
    try {
      setLoadingPool(true);
      const res = await API.get(`/campaigns/${campaign.id}/pool`);
      setPool(res.data || []);
    } catch {
      setPool([]);
    } finally {
      setLoadingPool(false);
    }
  };

  const completeCampaign = async (id) => {
    try {
      setActionLoadingId(`complete-${id}`);
      await API.post(`/campaigns/${id}/complete`);
      setSelectedCampaign(null);
      await refreshDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- MEMOIZED DATA ---
  const campaignList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return [...campaigns]
      .filter((c) => c.status === "ACTIVE" || c.status === "PLANNED")
      .filter((c) => filterType === "ALL" || c.type === filterType)
      .filter((c) => (c.name + c.description).toLowerCase().includes(q))
      .sort((a, b) => (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0));
  }, [campaigns, filterType, searchTerm]);

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "ACTIVE").length;
    const planned = campaigns.filter((c) => c.status === "PLANNED").length;
    const completed = campaigns.filter((c) => c.status === "COMPLETED").length;
    return { active, planned, completed, total: campaigns.length };
  }, [campaigns]);

  const ITEMS_PER_PAGE = 6;
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return campaignList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [campaignList, currentPage]);

  const totalPages = Math.ceil(campaignList.length / ITEMS_PER_PAGE);

  const campaignSkeletonLayout = [
    { type: 'row', cols: [{ type: 'text', width: 200 }, { type: 'rect', width: 100, height: 40 }] },
    { type: 'stack', gap: 4, items: Array(4).fill({ type: 'rect', height: 100, className: "rounded-2xl" }) }
  ];

  return (
    <>
    <div className="space-y-8 selection:bg-primary/10 animate-fadeIn">
      {/* HEADER: Campaigns */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <p className="text-primary text-[10px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1">NGO Operations</p>
          <h1 className="text-3xl sm:text-4xl font-outfit font-black text-on_surface tracking-tight">Campaign Management</h1>
          <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Manage your active campaigns and volunteer coordination.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link to="/campaign-history" className="px-4 sm:px-5 py-2.5 bg-surface_high hover:bg-surface_highest rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">History</Link>
          <button onClick={() => setShowAIModal(true)} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/20">
            <span className="material-symbols-outlined text-sm">magic_button</span> AI Draft
          </button>
          <button onClick={() => setShowForm(true)} className="px-5 sm:px-6 py-2.5 bg-primaryGradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">New Campaign</button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <MetricCard label="Total Campaigns" value={stats.total} icon="rocket_launch" />
        <MetricCard label="Currently Active" value={stats.active} icon="play_circle" />
        <MetricCard label="Upcoming" value={stats.planned} icon="event_upcoming" />
        <MetricCard label="Completed" value={stats.completed} icon="check_circle" />
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* LEFT: Campaigns Registry */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <ContentSection title="Active & Planned Campaigns" icon="list_alt">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-30">search</span>
                    <input
                        placeholder="Search campaigns..."
                        className="w-full bg-white border border-on_surface/5 pl-10 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full md:w-48 bg-white border border-on_surface/5 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option value="ALL">All Categories</option>
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
                </select>
            </div>

            {loading ? (
                <SkeletonStructure layout={campaignSkeletonLayout} />
            ) : campaignList.length === 0 ? (
                <div className="text-center py-20 bg-surface_high/30 rounded-3xl border border-dashed border-white/20">
                    <span className="material-symbols-outlined text-5xl opacity-10 mb-2">dashboard_customize</span>
                    <p className="text-sm font-bold opacity-30">No active campaigns found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedCampaigns.map((c, i) => (
                        <motion.div 
                            key={c.id}
                            layout
                            onClick={() => openDetails(c)}
                            className={`group p-6 rounded-3xl border transition-all cursor-pointer ${
                                selectedCampaign?.id === c.id ? "bg-white border-primary shadow-xl ring-1 ring-primary/50" : "bg-white/60 border-on_surface/5 hover:bg-white hover:border-on_surface/20 hover:-translate-y-1"
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${
                                            c.status === 'ACTIVE' ? "bg-green-500 text-white" : "bg-primary text-white"
                                        }`}>{c.status}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{c.type}</span>
                                    </div>
                                    <h3 className="text-xl font-outfit font-black text-on_surface tracking-tight group-hover:text-primary transition-colors">{c.name}</h3>
                                    <p className="text-xs text-on_surface_variant line-clamp-1 opacity-70">{c.description}</p>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1 leading-none">Start Date</p>
                                    <p className="text-sm font-black text-on_surface">
                                        {c.start_time ? new Date(c.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Flexible'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
          </ContentSection>
        </div>

        {/* RIGHT: Readiness Tracking */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
            <ContentSection title="Volunteer Readiness" icon="verified_user">
                <p className="text-[10px] font-bold text-on_surface_variant/60 mb-6 leading-relaxed">Information on approved volunteers for upcoming campaigns.</p>
                <div className="space-y-3">
                    {loadingReadiness ? (
                        <SkeletonStructure layout={Array(3).fill({ type: 'rect', height: 80, className: "rounded-2xl" })} />
                    ) : readiness.length === 0 ? (
                        <div className="text-center py-10 opacity-20"><p className="text-xs font-bold">No volunteers currently ready</p></div>
                    ) : (
                        readiness.map(r => (
                            <div key={r.campaign.id} className="p-4 bg-surface_high/40 rounded-2xl border border-white/50">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-3 truncate">{r.campaign.name}</p>
                                <div className="flex flex-wrap gap-2">
                                    {r.approvedVolunteers.slice(0, 4).map(v => (
                                        <span key={v.volunteer_id} className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            {v.volunteer_name.split(' ')[0]}
                                        </span>
                                    ))}
                                    {r.approvedVolunteers.length > 4 && <span className="text-[9px] font-black opacity-30">+{r.approvedVolunteers.length - 4} More</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ContentSection>

            {/* Quick Actions */}
            <div className="grid gap-3">
                <Link to="/inventory" className="flex items-center justify-between p-4 bg-primaryGradient text-white rounded-2xl group hover:-translate-x-1 transition-all shadow-lg shadow-primary/10">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Inventory</span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">arrow_forward</span>
                </Link>
                <Link to="/volunteers" className="flex items-center justify-between p-4 bg-surface_high hover:bg-surface_highest rounded-2xl group hover:-translate-x-1 transition-all border border-white/20">
                    <div className="flex items-center gap-3 text-on_surface">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Volunteer Portal</span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">arrow_forward</span>
                </Link>
            </div>
        </div>
      </div>

      {/* MODALS ARE PORTALED BELOW */}
    </div>
      {/* CAMPAIGN DETAILS MODAL */}
      <Modal
        isOpen={!!selectedCampaign}
        onClose={() => { setSelectedCampaign(null); setPool([]); }}
        title="Campaign Details"
        maxWidth="max-w-5xl"
      >
        {selectedCampaign && (
          <div className="space-y-8 relative overflow-hidden">
            {/* 🎭 BACKGROUND DECORATION */}
            <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none rotate-12">
                <span className="material-symbols-outlined text-[300px]">
                    {selectedCampaign.type === 'HEALTH' ? 'medical_services' : 
                     selectedCampaign.type === 'EDUCATION' ? 'menu_book' :
                     selectedCampaign.type === 'EMERGENCY' ? 'emergency' : 'campaign'}
                </span>
            </div>

            <div className="relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                 selectedCampaign.status === 'ACTIVE' 
                                    ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                    : "bg-primary/10 text-primary border-primary/20"
                             }`}>
                                {selectedCampaign.status}
                             </span>
                             <span className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">category</span>
                                {selectedCampaign.type?.replaceAll("_", " ")}
                             </span>
                        </div>
                        <h2 className="text-3xl font-outfit font-black text-on_surface tracking-tight leading-tight max-w-2xl">
                            {selectedCampaign.name}
                        </h2>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-8">
                        {/* 📝 DESCRIPTION CARD */}
                        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] border border-white p-8 shadow-soft relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">description</span>
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Campaign Description</h3>
                            <p className="text-sm md:text-base text-on_surface_variant leading-relaxed font-medium italic">
                                "{selectedCampaign.description}"
                            </p>
                        </div>

                        {/* 📍 CORE METRICS GRID */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-on_surface/5 shadow-sm space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-azure/10 text-azure flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">location_on</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Location</p>
                                    <p className="text-sm font-black text-on_surface truncate">{selectedCampaign.location_address || "TBD Area"}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-on_surface/5 shadow-sm space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">flag</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Target Goal</p>
                                    <p className="text-sm font-black text-on_surface">{selectedCampaign.target_quantity || "N/A"}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-on_surface/5 shadow-sm space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">groups</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Volunteers Needed</p>
                                    <p className="text-sm font-black text-on_surface">{selectedCampaign.volunteers_required || 0} Volunteers</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-on_surface/5 shadow-sm space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">handyman</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Skills Needed</p>
                                    <p className="text-sm font-black text-on_surface truncate">
                                        {selectedCampaign?.required_skills?.length ? selectedCampaign.required_skills[0] : "General Help"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 📦 ITEMS CARD */}
                        <div className="bg-surface_high/40 rounded-[2.5rem] border border-white p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-outfit font-black text-lg tracking-tight uppercase">Needed Items</h3>
                                <div className="p-2 bg-white rounded-lg border border-on_surface/5">
                                    <span className="material-symbols-outlined text-sm opacity-40">inventory_2</span>
                                </div>
                            </div>
                            
                            {selectedCampaign.items && Object.keys(selectedCampaign.items).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(selectedCampaign.items).map(([k, v]) => (
                                        <div key={k} className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-on_surface/5 group hover:border-primary/30 transition-colors shadow-sm">
                                            <span className="text-xs font-black text-on_surface uppercase tracking-tight">{k}</span>
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">{v} Units</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-30 italic text-xs font-bold">No items defined</div>
                            )}
                        </div>
                    </div>

                    {/* 👤 VOLUNTEER ROSTER CARD */}
                    <div className="bg-white/80 rounded-[2.5rem] border border-white shadow-xl shadow-on_surface/5 flex flex-col max-h-[700px]">
                        <div className="p-8 border-b border-on_surface/5 flex items-center justify-between shrink-0">
                             <div>
                                <h3 className="font-outfit font-black text-xl tracking-tight uppercase leading-none">Volunteer List</h3>
                                <p className="text-[10px] font-bold text-on_surface_variant/40 mt-1 uppercase tracking-widest">Managing {pool.length} Applicants</p>
                             </div>
                             <div className="w-12 h-12 rounded-2xl bg-primaryGradient text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined">person_add</span>
                             </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {loadingPool ? (
                                <SkeletonStructure layout={Array(4).fill({ type: 'rect', height: 100, className: "rounded-[2rem]" })} />
                            ) : pool.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20 italic">
                                    <span className="material-symbols-outlined text-5xl mb-4">groups_3</span>
                                    <p className="text-xs font-black uppercase tracking-widest text-center">No active applications<br/>for this campaign</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pool.map((v) => (
                                        <div key={v.volunteer_id} className="p-6 rounded-[2rem] bg-surface_high/30 border border-white hover:bg-white hover:shadow-lg transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-10 h-10 rounded-full bg-primaryGradient text-white flex items-center justify-center text-xs font-black shadow-md uppercase">
                                                        {v.volunteer_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-outfit font-black text-on_surface tracking-tight leading-none">{v.volunteer_name}</p>
                                                        <p className="text-[10px] font-bold text-on_surface_variant/40 mt-1 uppercase truncate max-w-[150px]">
                                                            {v.skills?.join(", ") || "General Aid"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                    v.status === 'APPROVED' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                                                    v.status === 'REJECTED' ? "bg-red-500/10 text-red-600 border-red-500/20" : 
                                                    "bg-azure/10 text-azure border-azure/20"
                                                }`}>
                                                    {v.status}
                                                </div>
                                            </div>

                                            {v.status === "PENDING" && (
                                                <button
                                                  onClick={() => approve(selectedCampaign.id, v.volunteer_id)}
                                                  className="w-full py-3 bg-primaryGradient text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mb-4"
                                                >
                                                  Approve Volunteer
                                                </button>
                                            )}

                                            {v.match_score != null && (
                                                <div className="pt-4 border-t border-on_surface/5">
                                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-2">
                                                        <span className="opacity-40">Skill Match</span>
                                                        <span className="text-primary">{v.match_score}%</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-on_surface/5 overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${v.match_score}%` }}
                                                            className="h-full bg-primaryGradient rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </Modal>

      {/* AI DRAFT MODAL */}
      <Modal
        isOpen={showAIModal}
        onClose={() => { setShowAIModal(false); setFormError(""); }}
        title="AI Campaign Assistant"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
            <p className="text-xs font-bold text-on_surface_variant/60 leading-relaxed italic">Describe your goal. Our AI will suggest a campaign structure and prefill the details for you.</p>

            {formError && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-black uppercase text-red-500 flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">warning</span>
                {formError}
              </div>
            )}

            <textarea
              className="min-h-[200px] w-full rounded-2xl border-2 border-transparent bg-white p-5 text-sm font-medium text-on_surface placeholder-on_surface/30 shadow-sm outline-none transition focus:border-primary/20 focus:ring-4 focus:ring-primary/5"
              placeholder="e.g. Distribute 100 food packets in Varanasi this Sunday. Need 5 volunteers for 2 hours..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />

            <div className="flex gap-4 pt-4">
              <button
                disabled={loadingAI || !aiPrompt.trim()}
                onClick={handleAIGenerate}
                className="flex-[2] rounded-2xl bg-primaryGradient py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 transition hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loadingAI ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">auto_awesome</span>}
                {loadingAI ? "Drafting..." : "Generate Campaign Draft"}
              </button>
              <button
                onClick={() => setShowAIModal(false)}
                className="flex-1 rounded-2xl border border-on_surface/5 bg-surface_high px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-surface_highest text-on_surface_variant/60"
              >
                Cancel
              </button>
            </div>
        </div>
      </Modal>

      {/* CREATE FORM MODAL */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); resetForm(); setFormError(""); }}
        title="Setup Campaign"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-8">
            <p className="text-xs font-bold text-on_surface_variant/60 leading-relaxed italic">Define the scope, timeline, required items, and volunteer needs.</p>

            {formError && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 font-black uppercase text-xs text-red-500 flex items-center gap-3">
                <span className="material-symbols-outlined text-sm font-black">warning</span>
                {formError}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <ActionInput label="Campaign Name" bgClassName="bg-white" placeholder="e.g. Community Meal Drive" value={name} onChange={setName} />
                
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">Campaign Description</label>
                    <textarea
                        className="min-h-[140px] w-full rounded-2xl border-2 border-transparent bg-white p-5 text-sm font-medium text-on_surface placeholder-on_surface/30 shadow-sm outline-none transition focus:border-primary/20 focus:ring-4 focus:ring-primary/5"
                        placeholder="Brief description of what you want to achieve..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">Category</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-2xl border-2 border-transparent bg-white px-5 py-3.5 text-xs font-black uppercase tracking-widest shadow-sm outline-none cursor-pointer focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt.replaceAll("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <ActionInput label="Target Goal" bgClassName="bg-white" placeholder="e.g. 100 meals" value={targetQuantity} onChange={setTargetQuantity} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ActionInput label="Start Date" bgClassName="bg-white" type="datetime-local" value={startTime} onChange={setStartTime} />
                  <ActionInput label="End Date" bgClassName="bg-white" type="datetime-local" value={endTime} onChange={setEndTime} />
                </div>

                <ActionInput label="Location" bgClassName="bg-white" placeholder="e.g. Ward 12, City Hospital" value={location} onChange={setLocation} />

                <div className="grid gap-4 md:grid-cols-2">
                   <ActionInput label="Required Skills" bgClassName="bg-white" placeholder="medical, logistics" value={skills} onChange={setSkills} />
                   <ActionInput label="Volunteers Needed" bgClassName="bg-white" type="number" placeholder="e.g. 5" value={volunteersRequired} onChange={setVolunteersRequired} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white bg-white/40 p-8 shadow-inner min-h-full">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-outfit font-black text-lg tracking-tight">Required Items</h3>
                    <button
                      onClick={() => setItems([...items, { key: "", value: "" }])}
                      className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      + ADD ITEM
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex-1 space-y-2">
                            <select
                                value={item.key}
                                onChange={(e) => { const n = [...items]; n[idx].key = e.target.value; setItems(n); }}
                                className="w-full rounded-xl border border-on_surface/5 bg-white px-4 py-3 text-xs font-bold text-on_surface shadow-sm outline-none cursor-pointer"
                            >
                                <option value="">Select Resource...</option>
                                {inventory.map((inv) => (
                                    <option key={inv.id} value={inv.item_name}>
                                        {inv.item_name} ({inv.quantity} {inv.unit})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.value}
                          onChange={(e) => { const n = [...items]; n[idx].value = e.target.value; setItems(n); }}
                          className="w-24 rounded-xl border border-on_surface/5 bg-white px-4 py-3 text-xs font-bold text-on_surface outline-none"
                        />
                        {items.length > 1 && (
                            <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
                                <span className="material-symbols-outlined text-sm font-black">delete</span>
                            </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex gap-4">
                    <button
                        disabled={creating}
                        onClick={createCampaign}
                        className="flex-[2] rounded-2xl bg-primaryGradient py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-lg">check_circle</span>}
                        {creating ? "Creating..." : "Create Campaign"}
                    </button>
                    <button
                        onClick={() => setShowForm(false)}
                        className="flex-1 rounded-2xl border border-on_surface/5 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-surface_high text-on_surface_variant/60"
                    >
                        Discard
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </Modal>
    </>
  );
};

// UI Sub-components
const StatCard = ({ label, value, icon }) => (
  <div className="rounded-2xl border border-on_surface/5 bg-surface_high p-5 shadow-soft transition hover:scale-[1.02]">
    <div className="mb-4 flex items-center justify-between">
      <div className="rounded-xl bg-primary/10 p-2.5 text-primary border border-primary/10">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on_surface_variant">
      {label}
    </p>
    <p className="mt-1 text-3xl font-black text-on_surface">{value}</p>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block space-y-2">
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on_surface_variant ml-1">
      {label}
    </span>
    {children}
  </label>
);

export default Campaigns;

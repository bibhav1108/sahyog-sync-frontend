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
      {/* HEADER: Mission Control */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <p className="text-primary text-[10px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1">Strategic Operations</p>
          <h1 className="text-3xl sm:text-4xl font-outfit font-black text-on_surface tracking-tight">Mission Control</h1>
          <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Deploying resources and coordinating volunteer movements.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link to="/campaign-history" className="px-4 sm:px-5 py-2.5 bg-surface_high hover:bg-surface_highest rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">History</Link>
          <button onClick={() => setShowAIModal(true)} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/20">
            <span className="material-symbols-outlined text-sm">magic_button</span> AI
          </button>
          <button onClick={() => setShowForm(true)} className="px-5 sm:px-6 py-2.5 bg-primaryGradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Launch</button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <MetricCard label="Total Ops" value={stats.total} icon="rocket_launch" />
        <MetricCard label="Active" value={stats.active} icon="play_circle" />
        <MetricCard label="Planned" value={stats.planned} icon="event_upcoming" />
        <MetricCard label="Success" value={stats.completed} icon="check_circle" />
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* LEFT: Campaigns Registry */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <ContentSection title="Active & Planned Deployments" icon="list_alt">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-30">search</span>
                    <input
                        placeholder="Filter missions..."
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
                    <option value="ALL">All Sectors</option>
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {loading ? (
                <SkeletonStructure layout={campaignSkeletonLayout} />
            ) : campaignList.length === 0 ? (
                <div className="text-center py-20 bg-surface_high/30 rounded-3xl border border-dashed border-white/20">
                    <span className="material-symbols-outlined text-5xl opacity-10 mb-2">dashboard_customize</span>
                    <p className="text-sm font-bold opacity-30">No active operations in sector</p>
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
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1 leading-none">Launch Date</p>
                                    <p className="text-sm font-black text-on_surface">
                                        {c.start_time ? new Date(c.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
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
            <ContentSection title="Personnel Readiness" icon="verified_user">
                <p className="text-[10px] font-bold text-on_surface_variant/60 mb-6 leading-relaxed">Intelligence on approved volunteers for upcoming deployments.</p>
                <div className="space-y-3">
                    {loadingReadiness ? (
                        <SkeletonStructure layout={Array(3).fill({ type: 'rect', height: 80, className: "rounded-2xl" })} />
                    ) : readiness.length === 0 ? (
                        <div className="text-center py-10 opacity-20"><p className="text-xs font-bold">No active readiness stream</p></div>
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
                <Link to="/inventory" className="flex items-center justify-between p-4 bg-on_surface text-white rounded-2xl group hover:-translate-x-1 transition-all">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Inventory</span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">arrow_forward</span>
                </Link>
                <Link to="/volunteers" className="flex items-center justify-between p-4 bg-surface_high hover:bg-surface_highest rounded-2xl group hover:-translate-x-1 transition-all border border-white/20">
                    <div className="flex items-center gap-3 text-on_surface">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Team Portal</span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-30 group-hover:opacity-100">arrow_forward</span>
                </Link>
            </div>
        </div>
      </div>

      {/* MODALS ARE PORTALED BELOW */}
    </div>
      {/* MISSION DETAILS MODAL */}
      <Modal
        isOpen={!!selectedCampaign}
        onClose={() => { setSelectedCampaign(null); setPool([]); }}
        title="Mission Details"
        maxWidth="max-w-5xl"
      >
        {selectedCampaign && (
          <div className="space-y-8">
            <div className="pr-10">
                <p className="mt-2 text-sm text-on_surface_variant opacity-80 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1 bg-primary/5 rounded-r-xl">
                  {selectedCampaign.description}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                <div className="rounded-3xl bg-surface_high/50 p-6 border border-white/20">
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      {selectedCampaign.status}
                    </span>
                    <span className="rounded-full bg-surface_high border border-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-on_surface">
                      {selectedCampaign.type || "OTHER"}
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Intelligence Zone</p>
                      <p className="text-sm font-black text-on_surface">{selectedCampaign.location_address || "TBD Sector"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Tactical Goal</p>
                      <p className="text-sm font-black text-on_surface">{selectedCampaign.target_quantity || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Personnel Requirement</p>
                      <p className="text-sm font-black text-on_surface">{selectedCampaign.volunteers_required || 0} Assets</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Specialized Skills</p>
                      <p className="text-sm font-black text-on_surface">
                        {selectedCampaign?.required_skills?.length ? selectedCampaign.required_skills.join(", ") : "General"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/20 bg-surface_high/50 p-6 flex flex-col">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-outfit font-black text-lg tracking-tight">Inventory Loadout</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                      {selectedCampaign.items ? Object.keys(selectedCampaign.items).length : 0} Entries
                    </span>
                  </div>

                  {selectedCampaign.items && Object.keys(selectedCampaign.items).length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(selectedCampaign.items).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 border border-on_surface/5 shadow-sm group hover:scale-[1.02] transition-transform">
                          <span className="text-xs font-black text-on_surface uppercase tracking-tight">{k}</span>
                          <span className="text-sm font-black text-primary bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">{v} Units</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-bold opacity-30 text-center py-10 italic">No resource assets mapped</p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-white/20 bg-surface_high/50 p-6 flex flex-col min-h-[400px]">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-outfit font-black text-lg tracking-tight">Personnel Roster</h3>
                    <div className="flex gap-2">
                         <span className="px-3 py-1 bg-surface_high text-on_surface_variant/60 rounded-lg text-[9px] font-black border border-white/20 tracking-widest uppercase">
                            {pool.length} Tracked
                         </span>
                    </div>
                  </div>

                  {loadingPool ? (
                    <div className="space-y-3 p-4">
                      <SkeletonStructure layout={Array(3).fill({ type: 'rect', height: 80, className: "rounded-2xl" })} />
                    </div>
                  ) : pool.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-10 border-2 border-dashed border-on_surface/5 rounded-[2rem] mx-4 mb-4">
                      <span className="material-symbols-outlined text-5xl mb-3">groups</span>
                      <p className="text-xs font-black uppercase tracking-widest">No applicants assigned</p>
                    </div>
                  ) : (
                    <div className="space-y-3 px-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {pool.map((v) => (
                        <div key={v.volunteer_id} className="group rounded-2xl border border-white bg-white p-5 hover:border-primary/40 hover:shadow-xl transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-outfit font-black text-on_surface tracking-tight truncate">{v.volunteer_name}</p>
                              <p className="text-[10px] font-bold text-on_surface_variant/40 line-clamp-1 mb-3">{v.skills?.length ? v.skills.join(", ") : "General Support"}</p>
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                                  v.status === 'APPROVED' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                                  v.status === 'REJECTED' ? "bg-red-500/10 text-red-600 border-red-500/20" : 
                                  "bg-primary/10 text-primary border-primary/20"
                              }`}>
                                {v.status}
                              </span>
                            </div>

                            {v.status === "PENDING" && (
                              <button
                                onClick={() => approve(selectedCampaign.id, v.volunteer_id)}
                                className="shrink-0 rounded-xl bg-on_surface px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-on_surface/20 transition-all hover:bg-primary active:scale-95"
                              >
                                Approve
                              </button>
                            )}
                          </div>

                          {v.match_score != null && (
                            <div className="mt-4 pt-4 border-t border-on_surface/5">
                              <div className="mb-2 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                                <span>Tactical Match</span>
                                <span>{v.match_score}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-surface_high overflow-hidden border border-on_surface/5">
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
        )}
      </Modal>

      {/* AI DRAFT MODAL */}
      <Modal
        isOpen={showAIModal}
        onClose={() => { setShowAIModal(false); setFormError(""); }}
        title="Intelligence Assistant"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
            <p className="text-xs font-bold text-on_surface_variant/60 leading-relaxed italic">Describe the operation. Our AI will parse requirements and prefill the strategic mission briefing.</p>

            {formError && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-black uppercase text-red-500 flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">warning</span>
                {formError}
              </div>
            )}

            <textarea
              className="min-h-[200px] w-full rounded-2xl border border-on_surface/5 bg-white p-5 text-sm font-medium text-on_surface placeholder-on_surface/30 shadow-inner outline-none transition focus:ring-2 focus:ring-primary/20"
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
                {loadingAI ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">rocket_launch</span>}
                {loadingAI ? "Syncing Logic..." : "Compose Mission Blueprint"}
              </button>
              <button
                onClick={() => setShowAIModal(false)}
                className="flex-1 rounded-2xl border border-on_surface/5 bg-surface_high px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-surface_highest text-on_surface/60"
              >
                Abort
              </button>
            </div>
        </div>
      </Modal>

      {/* CREATE FORM MODAL */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); resetForm(); setFormError(""); }}
        title="Mission Blueprint"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-8">
            <p className="text-xs font-bold text-on_surface_variant/60 leading-relaxed italic">Define scope, timeline, inventory loadout, and personnel requirements.</p>

            {formError && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 font-black uppercase text-xs text-red-500 flex items-center gap-3">
                <span className="material-symbols-outlined text-sm font-black">warning</span>
                {formError}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <ActionInput label="Mission Designation" placeholder="e.g. Community Meal Drive" value={name} onChange={setName} />
                
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">Tactical Objective</label>
                    <textarea
                        className="min-h-[140px] w-full rounded-2xl border border-on_surface/5 bg-white p-5 text-sm font-medium text-on_surface placeholder-on_surface/30 shadow-inner outline-none transition focus:ring-2 focus:ring-primary/20"
                        placeholder="Brief description of operations..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">Mission Sector</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-2xl border border-on_surface/5 bg-white px-5 py-3.5 text-xs font-black uppercase tracking-widest shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt.replaceAll("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <ActionInput label="Success Metric" placeholder="e.g. 100 meals" value={targetQuantity} onChange={setTargetQuantity} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ActionInput label="Launch Window" type="datetime-local" value={startTime} onChange={setStartTime} />
                  <ActionInput label="Terminal Window" type="datetime-local" value={endTime} onChange={setEndTime} />
                </div>

                <ActionInput label="Operational Zone" placeholder="e.g. Ward 12, City Hospital" value={location} onChange={setLocation} />

                <div className="grid gap-4 md:grid-cols-2">
                   <ActionInput label="Specialized Skills" placeholder="medical, logistics" value={skills} onChange={setSkills} />
                   <ActionInput label="Personnel Target" type="number" placeholder="e.g. 5" value={volunteersRequired} onChange={setVolunteersRequired} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white bg-white/40 p-8 shadow-inner min-h-full">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-outfit font-black text-lg tracking-tight">Loadout Mapping</h3>
                    <button
                      onClick={() => setItems([...items, { key: "", value: "" }])}
                      className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      + ADD ASSET
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
                                <option value="">Identify Resource...</option>
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
                        className="flex-[2] rounded-2xl bg-on_surface py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-lg">rocket_launch</span>}
                        {creating ? "Launching..." : "Authorize Deployment"}
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

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import API from "../services/api";
import Skeleton from "../components/Skeleton";

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
      await API.post(`/campaigns/${campaignId}/broadcast`);
      alert("Broadcast triggered successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to trigger broadcast");
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

  const openAIModal = () => {
    setAiPrompt("");
    setFormError("");
    setShowAIModal(true);
  };

  const applyAIDraftToForm = (data) => {
    const draftItems =
      data?.items &&
      typeof data.items === "object" &&
      !Array.isArray(data.items)
        ? Object.entries(data.items).map(([key, value]) => ({
            key,
            value: String(value ?? ""),
          }))
        : [{ key: "", value: "" }];

    setName(data?.name || "");
    setDescription(data?.description || "");
    setType(data?.type || "OTHER");
    setTargetQuantity(String(data?.target_quantity ?? ""));
    setItems(draftItems.length > 0 ? draftItems : [{ key: "", value: "" }]);
    setVolunteersRequired(String(data?.volunteers_required ?? ""));
    setStartTime(normalizeDateTimeLocal(data?.start_time));
    setEndTime(normalizeDateTimeLocal(data?.end_time));
    setLocation(data?.location_address || "");
    setSkills(
      Array.isArray(data?.required_skills)
        ? data.required_skills.join(", ")
        : typeof data?.required_skills === "string"
          ? data.required_skills
          : "",
    );
    setFormError("");
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setFormError("Write a short campaign description first.");
      return;
    }

    try {
      setLoadingAI(true);
      setFormError("");

      const res = await API.post("/campaigns/draft", {
        prompt: aiPrompt,
      });

      applyAIDraftToForm(res.data || {});
      setShowAIModal(false);
      setShowForm(true);
    } catch (err) {
      console.error("AI ERROR:", err);
      setFormError(
        err?.response?.data?.detail || "Failed to generate campaign draft",
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const createCampaign = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName || !trimmedDescription) {
      setFormError("Name and description are required.");
      return;
    }

    const formattedItems = {};
    items.forEach((i) => {
      if (!i.key || !i.value) return;
      const qty = Number(i.value);
      if (Number.isNaN(qty) || qty <= 0) return;
      formattedItems[i.key] = (formattedItems[i.key] || 0) + qty;
    });

    if (Object.keys(formattedItems).length === 0) {
      setFormError("Add at least one valid item.");
      return;
    }

    try {
      setCreating(true);
      setFormError("");

      await API.post("/campaigns/", {
        name: trimmedName,
        description: trimmedDescription,
        type,
        target_quantity: targetQuantity,
        items: formattedItems,
        volunteers_required: Number(volunteersRequired) || 0,
        start_time: startTime || null,
        end_time: endTime || null,
        location_address: trimmedLocation || null,
        required_skills: skills
          ? skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      });

      setShowForm(false);
      resetForm();
      await refreshDashboard();
    } catch (err) {
      console.error(err.response?.data || err);
      setFormError(err?.response?.data?.detail || "Error creating campaign");
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

  const approve = async (campaignId, volId) => {
    try {
      await API.post(`/campaigns/${campaignId}/approve-volunteer/${volId}`);
      if (selectedCampaign) {
        await openDetails(selectedCampaign);
      }
      await refreshDashboard();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to approve volunteer");
    }
  };

  const completeCampaign = async (id) => {
    try {
      await API.post(`/campaigns/${id}/complete`);
      setSelectedCampaign(null);
      setPool([]);
      await refreshDashboard();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to complete campaign");
    }
  };

  // --- STYLING HELPERS ---
  const getStatusStyle = (s) => {
    if (s === "ACTIVE")
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    if (s === "COMPLETED")
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (s === "PLANNED")
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-white/10 text-gray-300 border border-white/20";
  };

  // --- MEMOIZED DATA ---
  const campaignList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return [...campaigns]
      .filter((c) => c.status === "ACTIVE" || c.status === "PLANNED")
      .filter((c) => filterType === "ALL" || c.type === filterType)
      .filter((c) => {
        if (!q) return true;
        const haystack = [
          c.name,
          c.description,
          c.location_address,
          c.type,
          c.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const rankA = STATUS_ORDER[a.status] ?? 99;
        const rankB = STATUS_ORDER[b.status] ?? 99;
        if (rankA !== rankB) return rankA - rankB;

        const aTime = new Date(a.start_time || a.created_at || 0).getTime();
        const bTime = new Date(b.start_time || b.created_at || 0).getTime();
        return bTime - aTime;
      });
  }, [campaigns, filterType, searchTerm]);

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "ACTIVE").length;
    const planned = campaigns.filter((c) => c.status === "PLANNED").length;
    const completed = campaigns.filter((c) => c.status === "COMPLETED").length;
    return { active, planned, completed, total: campaigns.length };
  }, [campaigns]);

  const pendingCount = pool.filter((v) => v.status === "PENDING").length;
  const approvedCount = pool.filter((v) => v.status === "APPROVED").length;

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(
    1,
    Math.ceil(campaignList.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return campaignList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [campaignList, currentPage]);

  const pageButtons = useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, currentPage]);
    for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
      if (i > 1 && i < totalPages) pages.add(i);
    }
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i += 1) {
      result.push(sorted[i]);
      if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
        result.push("...");
      }
    }
    return result;
  }, [currentPage, totalPages]);

  const totalApprovedReadiness = readiness.reduce(
    (sum, row) => sum + row.approvedVolunteers.length,
    0,
  );

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* HEADER SECTION */}
      <div className="rounded-2xl border border-white/10 bg-surface_high/90 backdrop-blur-sm p-6 shadow-lg shadow-black/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.28em]">
              Mission Control
            </p>
            <h1 className="mt-1 text-3xl font-bold">Campaigns</h1>
            <p className="mt-2 flex items-center gap-2 text-sm opacity-70">
              Launch missions, track readiness, and deploy operations.
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/campaign-history"
              className="rounded-xl border border-white/10 bg-surface px-5 py-2.5 text-sm font-semibold transition hover:bg-white/5"
            >
              Past Campaigns
            </Link>
            <button
              onClick={openAIModal}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">
                magic_button
              </span>
              AI Draft
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Campaign
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard
          label="Total Missions"
          value={stats.total}
          icon="rocket_launch"
        />
        <StatCard label="Active Now" value={stats.active} icon="play_circle" />
        <StatCard label="Planned" value={stats.planned} icon="event_upcoming" />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon="check_circle"
        />
      </div>

      <div className="grid grid-cols-12 items-start gap-6">
        {/* LEFT COLUMN: CAMPAIGN LIST */}
        <section className="col-span-12 space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-6 shadow-lg shadow-black/10 backdrop-blur-sm">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* === LIGHT, HIGH-CONTRAST SEARCHBAR & TOGGLE === */}
              <div className="flex flex-col md:flex-row w-full gap-4">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-gray-500">
                    search
                  </span>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full rounded-xl border border-gray-300 bg-white/90 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-500 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full md:w-auto min-w-[160px] rounded-xl border border-gray-300 bg-white/90 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm outline-none transition cursor-pointer focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ALL">All types</option>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-5">
                {Array.from({ length: MIN_CAMPAIGNS }).map((_, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface_high/40 p-5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 w-2/3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : campaignList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-surface p-10 text-center">
                <p className="text-sm font-medium opacity-70">
                  No active or planned campaigns found.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {paginatedCampaigns.map((c, i) => {
                    const isSelected = selectedCampaign?.id === c.id;
                    const itemsCount = c.items
                      ? Object.values(c.items).reduce(
                          (sum, v) => sum + (Number(v) || 0),
                          0,
                        )
                      : 0;
                    const dateLabel = c.start_time
                      ? new Date(c.start_time).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "TBD";

                    return (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openDetails(c)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            openDetails(c);
                        }}
                        className={`group cursor-pointer rounded-2xl border p-5 transition-all hover:-translate-y-0.5 shadow-lg ${
                          isSelected
                            ? "border-primary bg-white ring-2 ring-primary/50"
                            : "border-transparent bg-white/90 hover:bg-white"
                        }`}
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary drop-shadow-sm">
                                {c.type || "OTHER"}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-gray-400" />
                              <span
                                className={`text-[10px] font-bold uppercase tracking-widest ${
                                  c.status === "ACTIVE"
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>

                            <h3 className="truncate text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {c.name}
                            </h3>

                            <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                              {c.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-gray-700">
                              <span className="rounded-md bg-gray-100 border border-gray-200 px-2 py-1">
                                {itemsCount} items
                              </span>
                              <span className="rounded-md bg-gray-100 border border-gray-200 px-2 py-1">
                                {c.location_address || "No location"}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-row items-center gap-2 md:flex-col md:items-end md:text-right">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                              Starts
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {dateLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-3 border-t border-white/10 pt-5">
                    <div className="text-sm opacity-60">
                      Page{" "}
                      <span className="font-semibold text-white">
                        {currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-white">
                        {totalPages}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        className="rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-sm font-medium transition hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                      >
                        Prev
                      </button>

                      {pageButtons.map((page, idx) =>
                        page === "..." ? (
                          <span
                            key={`dots-${idx}`}
                            className="px-2 text-sm opacity-40"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-8 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                              currentPage === page
                                ? "bg-primary text-white"
                                : "border border-white/10 bg-surface hover:bg-white/5"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
                        className="rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-sm font-medium transition hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className="col-span-12 space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-white/10 bg-surface_high/90 p-6 shadow-lg shadow-black/10 backdrop-blur-sm lg:sticky lg:top-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Volunteer Readiness</h3>
                <p className="mt-1 text-xs opacity-70">
                  Approved personnel for upcoming ops.
                </p>
              </div>
              <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-green-400 border border-green-500/20">
                {totalApprovedReadiness} Total
              </span>
            </div>

            <div className="space-y-3">
              {loadingReadiness ? (
                Array.from({ length: MIN_READINESS }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16 rounded-lg" />
                      <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                  </div>
                ))
              ) : readiness.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-surface/50 p-6 text-center">
                  <p className="text-sm opacity-70">
                    No approved volunteers yet.
                  </p>
                </div>
              ) : (
                readiness.map((r) => (
                  <div
                    key={r.campaign.id}
                    className="rounded-xl bg-white/5 p-4 border border-white/5"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3 truncate">
                      {r.campaign.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {r.approvedVolunteers.map((v) => (
                        <div
                          key={v.volunteer_id}
                          className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2 py-1 text-[11px] font-medium text-green-400 border border-green-500/20"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            person
                          </span>
                          {v.volunteer_name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-3">
                Quick Actions
              </h3>
              <div className="grid gap-2">
                <Link
                  to="/inventory"
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      inventory_2
                    </span>
                    Inventory
                  </span>
                  <span className="material-symbols-outlined text-[16px] opacity-40">
                    chevron_right
                  </span>
                </Link>

                <Link
                  to="/volunteers"
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      groups
                    </span>
                    Volunteers
                  </span>
                  <span className="material-symbols-outlined text-[16px] opacity-40">
                    chevron_right
                  </span>
                </Link>
              </div>
            </div>

            {selectedCampaign && (
              <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                <button
                  onClick={() => {
                    if (selectedCampaign.status === "COMPLETED") return;
                    triggerBroadcast(selectedCampaign.id);
                  }}
                  disabled={selectedCampaign.status === "COMPLETED"}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                    selectedCampaign.status === "COMPLETED"
                      ? "cursor-not-allowed bg-white/10 opacity-50"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  Trigger Broadcast
                </button>

                {selectedCampaign.status !== "COMPLETED" && (
                  <button
                    onClick={() => completeCampaign(selectedCampaign.id)}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Mark Campaign Completed
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* DETAILS MODAL */}
      {selectedCampaign &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
            onClick={() => {
              setSelectedCampaign(null);
              setPool([]);
            }}
          >
            <div
              className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl border border-white/10 bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setSelectedCampaign(null);
                  setPool([]);
                }}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="overflow-y-auto p-6 md:p-8">
                <div className="mb-6 pr-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Mission Details
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-on_surface">
                    {selectedCampaign.name}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm text-on_surface_variant opacity-80">
                    {selectedCampaign.description}
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-surface_high/50 p-5 border border-white/5">
                      <div className="flex flex-wrap items-center gap-2 mb-5">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(selectedCampaign.status)}`}
                        >
                          {selectedCampaign.status}
                        </span>
                        <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                          {selectedCampaign.type || "OTHER"}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Location
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedCampaign.location_address || "No location"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Goal
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedCampaign.target_quantity || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Required Personnel
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedCampaign.volunteers_required || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Required Skills
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedCampaign?.required_skills?.length
                              ? selectedCampaign.required_skills.join(", ")
                              : "General"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-surface_high/50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold">Inventory Requirements</h3>
                        <span className="text-xs opacity-50">
                          {selectedCampaign.items
                            ? Object.keys(selectedCampaign.items).length
                            : 0}{" "}
                          entries
                        </span>
                      </div>

                      {selectedCampaign.items &&
                      Object.keys(selectedCampaign.items).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(selectedCampaign.items).map(
                            ([k, v]) => (
                              <div
                                key={k}
                                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 border border-white/5"
                              >
                                <span className="text-sm font-medium">{k}</span>
                                <span className="text-sm font-bold text-primary">
                                  {v}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-sm opacity-50">
                          No items specified.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/5 bg-surface_high/50 p-5 min-h-[300px]">
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="font-bold">Volunteer Pool</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                          {loadingPool
                            ? "Syncing..."
                            : `${pendingCount} pending • ${approvedCount} approved`}
                        </span>
                      </div>

                      {loadingPool ? (
                        <div className="space-y-3">
                          <Skeleton className="h-16 w-full rounded-2xl" />
                          <Skeleton className="h-16 w-full rounded-2xl" />
                        </div>
                      ) : pool.length === 0 ? (
                        <div className="rounded-xl bg-surface p-8 text-center border border-white/5">
                          <p className="text-sm opacity-50">
                            No volunteers matched or applied yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pool.map((v) => (
                            <div
                              key={v.volunteer_id}
                              className="rounded-xl border border-white/5 bg-white/5 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {v.volunteer_name}
                                  </p>
                                  <p className="mt-1 text-xs opacity-60">
                                    {v.skills?.length
                                      ? v.skills.join(", ")
                                      : "No skills"}
                                  </p>
                                  <span
                                    className={`mt-2 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                                      v.status === "APPROVED"
                                        ? "bg-green-500/10 text-green-400"
                                        : v.status === "REJECTED"
                                          ? "bg-red-500/10 text-red-400"
                                          : "bg-amber-500/10 text-amber-400"
                                    }`}
                                  >
                                    {v.status}
                                  </span>
                                </div>

                                {v.status === "PENDING" && (
                                  <button
                                    onClick={() =>
                                      approve(
                                        selectedCampaign.id,
                                        v.volunteer_id,
                                      )
                                    }
                                    className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-500"
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>

                              {v.match_score != null && (
                                <div className="mt-4">
                                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-50">
                                    <span>Match score</span>
                                    <span>{v.match_score}%</span>
                                  </div>
                                  <div className="h-1 rounded-full bg-white/10">
                                    <div
                                      className="h-1 rounded-full bg-primary"
                                      style={{
                                        width: `${Math.max(0, Math.min(100, v.match_score))}%`,
                                      }}
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
          </div>,
          document.body,
        )}

      {/* AI DRAFT MODAL */}
      {showAIModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
            onClick={() => {
              setShowAIModal(false);
              setFormError("");
            }}
          >
            <div
              className="relative w-full max-w-3xl max-h-[95vh] flex flex-col rounded-3xl border border-white/10 bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowAIModal(false);
                  setFormError("");
                }}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="overflow-y-auto p-6 md:p-8">
                <div className="mb-6 pr-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Intelligence Assistant
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-on_surface">
                    Generate Blueprint
                  </h2>
                  <p className="mt-2 text-sm text-on_surface_variant opacity-80">
                    Describe the operation. The AI will parse requirements and
                    prefill the form.
                  </p>
                </div>

                {formError && (
                  <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {formError}
                  </div>
                )}

                <textarea
                  className="min-h-[180px] w-full rounded-2xl border border-on_surface/10 bg-surface_low px-4 py-3 text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  placeholder="Example: Distribute 100 food packets in Varanasi this Sunday. Need 5 volunteers for 2 hours..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleAIGenerate}
                    disabled={loadingAI}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingAI ? "Parsing Intelligence..." : "Generate Draft"}
                  </button>
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="rounded-xl border border-on_surface/10 bg-surface_high px-6 py-3 text-sm font-semibold transition hover:bg-surface_highest text-on_surface"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* CREATE FORM MODAL */}
      {showForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
            onClick={() => {
              setShowForm(false);
              setFormError("");
            }}
          >
            <div
              className="relative w-full max-w-4xl max-h-[95vh] flex flex-col rounded-3xl border border-white/10 bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="overflow-y-auto p-6 md:p-8">
                <div className="mb-6 pr-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Mission Blueprint
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-on_surface">
                    Create Campaign
                  </h2>
                  <p className="mt-2 text-sm text-on_surface_variant opacity-80">
                    Define scope, timeline, inventory limits, and personnel
                    requirements.
                  </p>
                </div>

                {formError && (
                  <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {formError}
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <Field label="Name">
                      <input
                        className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Community Meal Drive"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Field>

                    <Field label="Description">
                      <textarea
                        className="min-h-[120px] w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="Brief description of operations..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Type">
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          {TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Target Goal">
                        <input
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 100 meals"
                          value={targetQuantity}
                          onChange={(e) => setTargetQuantity(e.target.value)}
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Start Time">
                        <input
                          type="datetime-local"
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </Field>

                      <Field label="End Time">
                        <input
                          type="datetime-local"
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Location">
                      <input
                        className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Ward 12, City Hospital"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Required Skills (CSV)">
                        <input
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          placeholder="medical, logistics"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                        />
                      </Field>

                      <Field label="Personnel Needed">
                        <input
                          type="number"
                          className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 5"
                          value={volunteersRequired}
                          onChange={(e) =>
                            setVolunteersRequired(e.target.value)
                          }
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-surface_high/50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold">Item Loadout</h3>
                        <button
                          onClick={() =>
                            setItems([...items, { key: "", value: "" }])
                          }
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          + ADD ITEM
                        </button>
                      </div>

                      <div className="space-y-3">
                        {items.map((item, idx) => (
                          <div key={idx} className="grid gap-3 md:grid-cols-2">
                            <select
                              value={item.key}
                              onChange={(e) =>
                                updateItem(idx, "key", e.target.value)
                              }
                              className="w-full rounded-xl border border-on_surface/10 bg-surface px-4 py-3 text-sm text-on_surface shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                            >
                              <option value="">Select inventory...</option>
                              {inventory.map((inv) => (
                                <option key={inv.id} value={inv.item_name}>
                                  {inv.item_name} ({inv.quantity} {inv.unit})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              placeholder="Quantity"
                              value={item.value}
                              onChange={(e) =>
                                updateItem(idx, "value", e.target.value)
                              }
                              className="w-full rounded-xl border border-on_surface/10 bg-surface_low px-4 py-3 text-sm text-on_surface placeholder-on_surface/40 shadow-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <button
                        onClick={createCampaign}
                        disabled={creating}
                        className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {creating ? "Processing..." : "Deploy Campaign"}
                      </button>
                      <button
                        onClick={() => setShowForm(false)}
                        className="rounded-xl border border-on_surface/10 bg-surface_high px-6 py-3 text-sm font-semibold transition hover:bg-surface_highest text-on_surface"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
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

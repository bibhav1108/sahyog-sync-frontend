import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

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

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pool, setPool] = useState([]);
  const [loadingPool, setLoadingPool] = useState(false);

  const [readiness, setReadiness] = useState([]);
  const [loadingReadiness, setLoadingReadiness] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
            console.log(res.data);
            const normalizeStatus = (s) => {
              if (!s) return "";
              if (typeof s === "string") return s;
              if (s.value) return s.value;
              return String(s);
            };

            const approvedVolunteers = (res.data || []).filter(
              (v) => normalizeStatus(v.status) === "APPROVED",
            );

            return {
              campaign,
              approvedVolunteers,
            };
          } catch (err) {
            console.error(err);
            return {
              campaign,
              approvedVolunteers: [],
            };
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
      const [campaignData] = await Promise.all([
        loadCampaigns(),
        loadInventory(),
      ]);
      await loadVolunteerReadiness(campaignData);
    };

    init();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

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

  const getStatusClass = (s) => {
    if (s === "ACTIVE") return "bg-blue-100 text-blue-700";
    if (s === "COMPLETED") return "bg-emerald-100 text-emerald-700";
    if (s === "PLANNED") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  const getTypeTone = (t) => {
    if (t === "HEALTH") return "bg-rose-50 text-rose-700";
    if (t === "EMERGENCY") return "bg-orange-50 text-orange-700";
    if (t === "BASIC_NEEDS") return "bg-sky-50 text-sky-700";
    if (t === "EDUCATION") return "bg-violet-50 text-violet-700";
    if (t === "ENVIRONMENT") return "bg-emerald-50 text-emerald-700";
    if (t === "SKILLS") return "bg-cyan-50 text-cyan-700";
    if (t === "AWARENESS") return "bg-fuchsia-50 text-fuchsia-700";
    return "bg-slate-100 text-slate-700";
  };

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

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

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
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

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
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Campaigns
          </h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Launch campaigns, inspect volunteer readiness, and keep live mission
            flow organized in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/campaign-history"
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            View Past Campaigns
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #005da9 0%, #0075d4 100%)",
            }}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Campaign
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard
          label="Total Campaigns"
          value={stats.total}
          hint="All records"
          icon="rocket_launch"
        />
        <StatCard
          label="Active Campaigns"
          value={stats.active}
          hint="Currently running"
          icon="play_circle"
        />
        <StatCard
          label="Planned Campaigns"
          value={stats.planned}
          hint="Awaiting launch"
          icon="event_upcoming"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          hint="Closed campaigns"
          icon="check_circle"
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 items-start gap-6">
        {/* LEFT COLUMN */}
        <section className="col-span-12 space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-white/30 bg-white/70 p-6 shadow-[0_40px_60px_-20px_rgba(32,25,36,0.08)] backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                    search
                  </span>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-300 focus:bg-white lg:w-72"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white"
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

            {campaignList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No campaigns found.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Launch a new mission blueprint to get started.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {paginatedCampaigns.map((c) => {
                    const isSelected = selectedCampaign?.id === c.id;
                    const itemsCount = c.items
                      ? Object.values(c.items).reduce(
                          (sum, v) => sum + (Number(v) || 0),
                          0,
                        )
                      : 0;

                    return (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openDetails(c)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            openDetails(c);
                          }
                        }}
                        className={`cursor-pointer rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                          isSelected
                            ? "border-blue-300 ring-2 ring-blue-100"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getTypeTone(
                              c.type,
                            )}`}
                          >
                            {c.type || "OTHER"}
                          </span>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusClass(
                              c.status,
                            )}`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <h3 className="truncate text-lg font-bold text-slate-900">
                          {c.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                          {c.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-200 pt-5">
                    <div className="text-sm text-slate-500">
                      Page{" "}
                      <span className="font-semibold text-slate-800">
                        {currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-slate-800">
                        {totalPages}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
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
                            className="px-2 text-sm text-slate-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
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
        <section className="col-span-12 space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-white/30 bg-white/70 p-6 shadow-[0_40px_60px_-20px_rgba(32,25,36,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Volunteer Readiness
                </h3>
                <p className="text-sm text-slate-500">
                  Approved volunteers for ongoing campaigns.
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                {totalApprovedReadiness} approved
              </span>
            </div>

            {loadingReadiness ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : readiness.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-600">
                  No ongoing campaigns with approved volunteers yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {readiness.flatMap(({ campaign, approvedVolunteers }) =>
                  approvedVolunteers.map((v) => (
                    <div
                      key={`${campaign.id}-${v.volunteer_id}`}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-slate-900">
                        {v.volunteer_name}
                      </span>
                      <span className="max-w-[120px] truncate text-xs text-slate-500">
                        {campaign.name}
                      </span>
                    </div>
                  )),
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/70 p-6 shadow-[0_40px_60px_-20px_rgba(32,25,36,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Quick Actions
                </h3>
                <p className="text-sm text-slate-500">
                  Fast navigation for mission ops.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <Link
                to="/inventory"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">
                    inventory_2
                  </span>
                  Inventory
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  chevron_right
                </span>
              </Link>

              <Link
                to="/volunteers"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">
                    groups
                  </span>
                  Volunteers
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  chevron_right
                </span>
              </Link>

              <Link
                to="/marketplace"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">
                    storefront
                  </span>
                  Marketplace
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  chevron_right
                </span>
              </Link>
            </div>

            {selectedCampaign && (
              <div className="mt-5 space-y-3">
                <button
                  onClick={() => {
                    if (selectedCampaign.status === "COMPLETED") return;
                    triggerBroadcast(selectedCampaign.id);
                  }}
                  disabled={selectedCampaign.status === "COMPLETED"}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${
                    selectedCampaign.status === "COMPLETED"
                      ? "cursor-not-allowed bg-slate-300 opacity-70"
                      : "hover:opacity-95"
                  }`}
                  style={{
                    background:
                      selectedCampaign.status === "COMPLETED"
                        ? "#cbd5e1"
                        : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  }}
                >
                  Trigger Broadcast
                </button>

                {selectedCampaign.status === "COMPLETED" ? (
                  <button
                    disabled
                    className="cursor-not-allowed rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700 opacity-80"
                  >
                    Completed
                  </button>
                ) : (
                  <button
                    onClick={() => completeCampaign(selectedCampaign.id)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
                    style={{
                      background:
                        "linear-gradient(135deg, #005da9 0%, #0075d4 100%)",
                    }}
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
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-10">
          <div className="w-full max-w-5xl rounded-3xl border border-white/20 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Mission Details
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  {selectedCampaign.name}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                  {selectedCampaign.description}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCampaign(null);
                  setPool([]);
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                aria-label="Close details"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${getStatusClass(
                        selectedCampaign.status,
                      )}`}
                    >
                      {selectedCampaign.status}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${getTypeTone(
                        selectedCampaign.type,
                      )}`}
                    >
                      {selectedCampaign.type || "OTHER"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Location
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedCampaign.location_address || "No location"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Volunteers Required
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedCampaign.volunteers_required || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Goal
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedCampaign.target_quantity || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Skills
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedCampaign?.required_skills?.length
                          ? selectedCampaign.required_skills.join(", ")
                          : "General"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Items</h3>
                    <span className="text-xs text-slate-400">
                      {selectedCampaign.items
                        ? Object.keys(selectedCampaign.items).length
                        : 0}{" "}
                      entries
                    </span>
                  </div>

                  {selectedCampaign.items &&
                  Object.keys(selectedCampaign.items).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(selectedCampaign.items).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                        >
                          <span className="font-medium text-slate-700">
                            {k}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No item breakdown available.
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Mission stage</span>
                    <span>
                      {selectedCampaign.status === "ACTIVE"
                        ? "72%"
                        : selectedCampaign.status === "PLANNED"
                          ? "34%"
                          : selectedCampaign.status === "COMPLETED"
                            ? "100%"
                            : "18%"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${selectedCampaign.status === "ACTIVE" ? 72 : selectedCampaign.status === "PLANNED" ? 34 : selectedCampaign.status === "COMPLETED" ? 100 : 18}%`,
                        background:
                          "linear-gradient(135deg, #005da9 0%, #0075d4 100%)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    onClick={() => {
                      if (selectedCampaign.status === "COMPLETED") return;
                      triggerBroadcast(selectedCampaign.id);
                    }}
                    disabled={selectedCampaign.status === "COMPLETED"}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                      selectedCampaign.status === "COMPLETED"
                        ? "cursor-not-allowed bg-slate-300 opacity-70"
                        : "hover:opacity-95"
                    }`}
                    style={{
                      background:
                        selectedCampaign.status === "COMPLETED"
                          ? "#cbd5e1"
                          : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    }}
                  >
                    Trigger Broadcast
                  </button>

                  {selectedCampaign.status === "COMPLETED" ? (
                    <button
                      disabled
                      className="cursor-not-allowed rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700 opacity-80"
                    >
                      Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => completeCampaign(selectedCampaign.id)}
                      className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                      style={{
                        background:
                          "linear-gradient(135deg, #005da9 0%, #0075d4 100%)",
                      }}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Volunteer Pool</h3>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                      {loadingPool
                        ? "Loading..."
                        : `${pendingCount} pending • ${approvedCount} approved`}
                    </span>
                  </div>

                  {loadingPool ? (
                    <div className="space-y-3">
                      <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                      <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                  ) : pool.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center">
                      <p className="text-sm text-slate-500">
                        No volunteers yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pool.map((v) => (
                        <div
                          key={v.volunteer_id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {v.volunteer_name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {v.skills?.length
                                  ? v.skills.join(", ")
                                  : "No skills"}
                              </p>

                              <span
                                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                  v.status === "APPROVED"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : v.status === "REJECTED"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {v.status}
                              </span>
                            </div>

                            {v.status === "PENDING" ? (
                              <button
                                onClick={() =>
                                  approve(selectedCampaign.id, v.volunteer_id)
                                }
                                className="shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            ) : (
                              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                                {v.status === "APPROVED"
                                  ? "Approved"
                                  : "Rejected"}
                              </span>
                            )}
                          </div>

                          {v.match_score != null && (
                            <div className="mt-3">
                              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <span>Match score</span>
                                <span>{v.match_score}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100">
                                <div
                                  className="h-1.5 rounded-full bg-blue-500"
                                  style={{
                                    width: `${Math.max(
                                      0,
                                      Math.min(100, v.match_score),
                                    )}%`,
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

                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                    Ops note
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    Once volunteers are approved, they stay visible in the pool
                    with their current status. This makes it easier to track who
                    is pending, approved, or rejected without losing the full
                    picture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-10">
          <div className="mb-10 w-full max-w-4xl rounded-3xl border border-white/20 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Mission Blueprint
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Create Campaign
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Define the campaign scope, inventory requirements, timeline,
                  and volunteer needs.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                aria-label="Close form"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {formError}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Field label="Name">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
                    placeholder="e.g. Community Meal Drive"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
                    placeholder="Write a short description of the campaign"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Type">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Goal">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </Field>

                  <Field label="End Time">
                    <input
                      type="datetime-local"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Location">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
                    placeholder="e.g. Ward 12, City Hospital"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Field>

                <Field label="Required Skills">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
                    placeholder="e.g. medical, logistics, coordination"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </Field>

                <Field label="Volunteers Required">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white"
                    placeholder="e.g. 5"
                    value={volunteersRequired}
                    onChange={(e) => setVolunteersRequired(e.target.value)}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Item Breakdown</h3>
                    <button
                      onClick={() =>
                        setItems([...items, { key: "", value: "" }])
                      }
                      className="text-sm font-semibold text-blue-600"
                    >
                      + Add item
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
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-300"
                        >
                          <option value="">Select item</option>
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
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">
                    Blueprint notes
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Pick items from inventory, define the volunteer load, and
                    set a realistic timeline. Campaigns can be updated later
                    from the mission details view.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={createCampaign}
                    disabled={creating}
                    className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    style={{
                      background:
                        "linear-gradient(135deg, #005da9 0%, #0075d4 100%)",
                    }}
                  >
                    {creating ? "Creating..." : "Create Campaign"}
                  </button>

                  <button
                    onClick={() => {
                      setShowForm(false);
                      setFormError("");
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, hint, icon }) => (
  <div className="rounded-2xl border border-white/30 bg-white/70 p-5 shadow-[0_40px_60px_-20px_rgba(32,25,36,0.08)] backdrop-blur-xl">
    <div className="flex items-start justify-between gap-4">
      <div className="rounded-2xl bg-slate-100 p-3 text-blue-600">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
        Live
      </span>
    </div>

    <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
    <p className="mt-2 text-xs text-slate-500">{hint}</p>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block space-y-2">
    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
      {label}
    </span>
    {children}
  </label>
);

export default Campaigns;

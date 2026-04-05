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

const ITEMS_PER_PAGE = 6;

const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pool, setPool] = useState([]);
  const [loadingPool, setLoadingPool] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    API.get("/campaigns/")
      .then((res) => setCampaigns(res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const openDetails = async (c) => {
    setSelectedCampaign(c);
    setLoadingPool(true);
    try {
      const res = await API.get(`/campaigns/${c.id}/pool`);
      setPool(res.data || []);
    } catch {
      setPool([]);
    } finally {
      setLoadingPool(false);
    }
  };

  const getTypeTone = (t) => {
    if (t === "HEALTH") return "bg-rose-50 text-rose-700";
    if (t === "EMERGENCY") return "bg-orange-50 text-orange-700";
    if (t === "BASIC_NEEDS") return "bg-sky-50 text-sky-700";
    if (t === "EDUCATION") return "bg-violet-50 text-violet-700";
    if (t === "ENVIRONMENT") return "bg-emerald-50 text-emerald-700";
    if (t === "SKILLS") return "bg-cyan-50 text-cyan-700";
    return "bg-slate-100 text-slate-700";
  };

  const campaignList = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return campaigns
      .filter((c) => c.status === "COMPLETED")
      .filter((c) => filterType === "ALL" || c.type === filterType)
      .filter(
        (c) =>
          !q ||
          c.name?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );
  }, [campaigns, searchTerm, filterType]);

  const totalPages = Math.ceil(campaignList.length / ITEMS_PER_PAGE) || 1;

  const paginated = campaignList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link to="/campaigns" className="p-2 bg-slate-100 rounded-full">
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Campaign History</h1>
          <p className="text-sm text-slate-500">Completed campaigns</p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3">
        <input
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-full border bg-slate-50"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-full border bg-slate-50"
        >
          <option value="ALL">All types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((c) => (
          <div
            key={c.id}
            onClick={() => openDetails(c)}
            className="cursor-pointer border rounded-xl p-4 bg-white hover:shadow"
          >
            <div className="flex justify-between mb-2">
              <span
                className={`text-xs px-2 py-1 rounded ${getTypeTone(c.type)}`}
              >
                {c.type}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                COMPLETED
              </span>
            </div>

            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">
              {c.description}
            </p>
          </div>
        ))}
      </div>

      {/* MODAL (FULL VERSION) */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-10">
          <div className="w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl">
            {/* HEADER */}
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-black">{selectedCampaign.name}</h2>
                <p className="text-sm text-slate-500 mt-2">
                  {selectedCampaign.description}
                </p>
              </div>

              <button onClick={() => setSelectedCampaign(null)}>✕</button>
            </div>

            {/* STATUS */}
            <div className="mt-4">
              <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">
                COMPLETED
              </span>
            </div>

            {/* INFO GRID */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div>Location: {selectedCampaign.location_address || "N/A"}</div>
              <div>Volunteers: {selectedCampaign.volunteers_required}</div>
              <div>Goal: {selectedCampaign.target_quantity}</div>
              <div>
                Skills:{" "}
                {selectedCampaign.required_skills?.join(", ") || "General"}
              </div>
            </div>

            {/* ITEMS */}
            <div className="mt-6">
              <h3 className="font-bold mb-2">Items</h3>
              {Object.entries(selectedCampaign.items || {}).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between bg-slate-50 p-2 rounded"
                >
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>

            {/* VOLUNTEERS */}
            <div className="mt-6">
              <h3 className="font-bold mb-2">Volunteer Pool</h3>

              {loadingPool
                ? "Loading..."
                : pool.map((v) => (
                    <div
                      key={v.volunteer_id}
                      className="flex justify-between bg-slate-50 p-2 rounded mb-1"
                    >
                      <span>{v.volunteer_name}</span>
                      <span>{v.status}</span>
                    </div>
                  ))}
            </div>

            {/* COMPLETED LABEL */}
            <div className="mt-6 text-center bg-emerald-100 text-emerald-700 py-3 rounded-xl font-semibold">
              Campaign Completed
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;

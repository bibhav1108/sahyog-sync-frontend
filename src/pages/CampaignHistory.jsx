import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CampaignHistory = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState("day"); // day | month | year

  const loadCampaigns = async () => {
    try {
      setLoading(true);

      const res = await API.get("/campaigns/");
      const completed = (res.data || [])
        .filter((c) => c.status === "COMPLETED")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setCampaigns(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // -------- GROUPING --------
  const groupCampaigns = () => {
    const groups = {};

    campaigns.forEach((c) => {
      const date = new Date(c.created_at);

      let key;
      if (view === "day") {
        key = date.toDateString();
      } else if (view === "month") {
        key = `${date.toLocaleString("default", {
          month: "long",
        })} ${date.getFullYear()}`;
      } else {
        key = `${date.getFullYear()}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });

    return groups;
  };

  const grouped = groupCampaigns();

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/campaigns")}
            className="px-3 py-2 text-sm bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-2xl font-bold">Campaign Timeline</h1>
            <p className="text-sm text-slate-500">
              Completed campaigns history
            </p>
          </div>
        </div>

        {/* TOGGLE */}
        <div className="flex bg-slate-100 rounded-lg p-1">
          {["day", "month", "year"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs rounded-md capitalize transition ${
                view === v ? "bg-black text-white" : "text-slate-500"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center p-10">Loading...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-center p-10 text-slate-500">
          No completed campaigns
        </p>
      ) : (
        <div className="relative">
          {/* TIMELINE LINE */}
          <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-slate-200" />

          <div className="space-y-10">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="space-y-4">
                {/* GROUP LABEL */}
                <div className="pl-10 text-sm font-semibold text-slate-500">
                  {group}
                </div>

                {items.map((c) => (
                  <div key={c.id} className="relative pl-10">
                    {/* DOT */}
                    <div className="absolute left-[2px] top-2 w-3 h-3 bg-black rounded-full" />

                    {/* ROW */}
                    <div
                      onClick={() =>
                        setExpanded(expanded === c.id ? null : c.id)
                      }
                      className="bg-white p-5 rounded-xl cursor-pointer hover:scale-[1.01] transition border"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold leading-snug line-clamp-2">
                            {c.name}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {c.type} • {c.location_address || "No location"}
                          </p>
                        </div>

                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>
                          🕒 {new Date(c.created_at).toLocaleString()}
                        </span>
                        <span>👥 {c.volunteers_required} volunteers</span>
                        <span>🎯 Target: {c.target_quantity}</span>
                      </div>

                      {/* EXPANDED */}
                      {expanded === c.id && (
                        <div className="mt-4 pt-4 border-t text-sm space-y-2">
                          <p>📍 Location: {c.location_address || "N/A"}</p>

                          <p>
                            🧠 Skills:{" "}
                            {c.required_skills?.join(", ") || "General"}
                          </p>

                          {c.description && (
                            <p>📝 Description: {c.description}</p>
                          )}

                          {/* ITEMS */}
                          <div>
                            <p className="font-medium mt-2">Items:</p>
                            {Object.entries(c.items || {}).map(([k, v]) => (
                              <div
                                key={k}
                                className="flex justify-between text-xs bg-slate-50 px-2 py-1 rounded"
                              >
                                <span>{k}</span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;

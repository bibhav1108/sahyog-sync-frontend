import { useEffect, useState } from "react";
import API from "../services/api";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filterType, setFilterType] = useState("ALL");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pool, setPool] = useState([]);
  const [loadingPool, setLoadingPool] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // FORM STATE
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

  // ================= LOAD =================
  const loadCampaigns = async () => {
    try {
      const res = await API.get("/campaigns/");
      setCampaigns(res.data || []);
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    loadCampaigns();
    loadInventory();
  }, []);

  // ================= CREATE =================
  const createCampaign = async () => {
    const formattedItems = {};

    items.forEach((i) => {
      if (!i.key || !i.value) return;

      const qty = Number(i.value);
      if (isNaN(qty) || qty <= 0) return;

      if (formattedItems[i.key]) {
        formattedItems[i.key] += qty;
      } else {
        formattedItems[i.key] = qty;
      }
    });

    if (Object.keys(formattedItems).length === 0) {
      alert("Add at least one valid item");
      return;
    }

    try {
      await API.post("/campaigns/", {
        name,
        description,
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

      loadCampaigns();
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.detail || "Error creating campaign");
    }
  };

  // ================= DETAILS =================
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
    await API.post(`/campaigns/${campaignId}/approve-volunteer/${volId}`);
    openDetails(selectedCampaign);
  };

  const completeCampaign = async (id) => {
    await API.post(`/campaigns/${id}/complete`);
    setSelectedCampaign(null);
    loadCampaigns();
  };

  const getStatusStyle = (s) => {
    if (s === "ACTIVE") return "bg-blue-100 text-blue-700";
    if (s === "COMPLETED") return "bg-green-100 text-green-700";
    if (s === "PLANNED") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-200";
  };

  // ================= UI =================
  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-700">
          Campaign Intelligence
        </h1>

        <div className="flex gap-3">
          {/* FILTER */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="ALL">All</option>
            <option value="HEALTH">Health</option>
            <option value="EDUCATION">Education</option>
            <option value="BASIC_NEEDS">Basic Needs</option>
            <option value="AWARENESS">Awareness</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="ENVIRONMENT">Environment</option>
            <option value="SKILLS">Skills</option>
            <option value="OTHER">Other</option>
          </select>

          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl"
          >
            + Launch Campaign
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns
          .filter((c) => filterType === "ALL" || c.type === filterType)
          .map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-6 shadow">
              <div className="flex justify-between mb-2">
                <span className="font-bold">{c.name}</span>
                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusStyle(c.status)}`}
                >
                  {c.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-2">{c.description}</p>

              <div className="text-xs mb-1">🏷 Type: {c.type || "OTHER"}</div>
              <div className="text-xs mb-1">
                🎯 Goal: {c.target_quantity || "N/A"}
              </div>
              <div className="text-xs mb-1">
                📍 {c.location_address || "No location"}
              </div>
              <div className="text-xs mb-2">
                👥 Required: {c.volunteers_required}
              </div>

              {c.items && (
                <div className="text-xs mb-2">
                  {Object.entries(c.items).map(([k, v]) => (
                    <div key={k}>
                      {v} {k}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => openDetails(c)}
                className="text-indigo-600 text-sm font-semibold"
              >
                View Details →
              </button>
            </div>
          ))}
      </div>

      {/* DETAILS MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl space-y-4">
            <h2 className="text-lg font-bold">{selectedCampaign.name}</h2>

            <p className="text-sm text-gray-500">
              {selectedCampaign.description}
            </p>

            <div className="text-xs">🏷 {selectedCampaign.type}</div>
            <div className="text-xs">
              📍 {selectedCampaign.location_address}
            </div>

            <div className="text-xs">
              🧠 Skills:{" "}
              {selectedCampaign?.required_skills?.length
                ? selectedCampaign.required_skills.join(", ")
                : "General"}
            </div>

            {/* POOL */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Volunteer Pool</h3>

              {loadingPool ? (
                <p>Loading...</p>
              ) : pool.length === 0 ? (
                <p className="text-gray-400 text-sm">No volunteers yet</p>
              ) : (
                pool.map((v) => (
                  <div
                    key={v.volunteer_id}
                    className="flex justify-between items-center border p-2 rounded mb-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{v.volunteer_name}</p>
                      <p className="text-xs text-gray-400">
                        {v.skills?.join(", ") || "No skills"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        approve(selectedCampaign.id, v.volunteer_id)
                      }
                      className="bg-green-600 text-white px-3 py-1 text-xs rounded"
                    >
                      Approve
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => completeCampaign(selectedCampaign.id)}
              className="w-full bg-indigo-600 text-white py-2 rounded"
            >
              Mark Completed
            </button>

            <button
              onClick={() => setSelectedCampaign(null)}
              className="w-full text-gray-500 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CREATE FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-24 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-4 mb-10">
            <h2 className="font-bold text-xl text-indigo-700">
              Create Campaign
            </h2>

            <input
              className="input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="input"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input"
            >
              <option value="HEALTH">Health</option>
              <option value="EDUCATION">Education</option>
              <option value="BASIC_NEEDS">Basic Needs</option>
              <option value="AWARENESS">Awareness</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="ENVIRONMENT">Environment</option>
              <option value="SKILLS">Skills</option>
              <option value="OTHER">Other</option>
            </select>

            <input
              className="input"
              placeholder="Goal (e.g. 100 meals)"
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(e.target.value)}
            />

            <input
              type="datetime-local"
              className="input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <input
              type="datetime-local"
              className="input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />

            <input
              className="input"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              className="input"
              placeholder="Required Skills (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <input
              className="input"
              placeholder="Volunteers Required"
              value={volunteersRequired}
              onChange={(e) => setVolunteersRequired(e.target.value)}
            />

            <p className="text-sm font-semibold text-gray-600">
              Item Breakdown
            </p>

            {items.map((i, idx) => (
              <div key={idx} className="flex gap-2">
                <select
                  value={i.key}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].key = e.target.value;
                    setItems(updated);
                  }}
                  className="input w-1/2"
                >
                  <option value="">Select Item</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.item_name}>
                      {inv.item_name} ({inv.quantity} {inv.unit})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  value={i.value}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].value = e.target.value;
                    setItems(updated);
                  }}
                  className="input w-1/2"
                />
              </div>
            ))}

            <button
              onClick={() => setItems([...items, { key: "", value: "" }])}
              className="text-indigo-600 text-sm"
            >
              + Add Item
            </button>

            <button
              onClick={createCampaign}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg"
            >
              Create Campaign
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="w-full text-gray-500 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .input {
          border: 1px solid #ddd;
          padding: 10px;
          width: 100%;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Campaigns;

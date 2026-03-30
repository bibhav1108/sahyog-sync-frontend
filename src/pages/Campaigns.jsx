import { useEffect, useState } from "react";
import API from "../services/api";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [participants, setParticipants] = useState([]);

  // 🔥 LOAD CAMPAIGNS (will fail if endpoint missing)
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await API.get("/campaigns/");
      setCampaigns(res.data || []);
    } catch (err) {
      console.warn("No GET /campaigns/ endpoint yet");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CREATE
  const createCampaign = async () => {
    if (!name) return alert("Name required");

    try {
      await API.post("/campaigns/", {
        name,
        description,
        volunteers_required: 2,
      });

      setName("");
      setDescription("");

      alert("Campaign created");

      loadCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 LOAD PARTICIPANTS (POOL)
  const loadParticipants = async (id) => {
    try {
      const res = await API.get(`/campaigns/${id}/pool`);
      setParticipants(res.data || []);
      setSelectedCampaign(id);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 APPROVE
  const approveVolunteer = async (campaignId, volId) => {
    try {
      await API.post(`/campaigns/${campaignId}/approve-volunteer/${volId}`);

      alert("Approved");

      loadParticipants(campaignId);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Error");
    }
  };

  // 🔥 COMPLETE
  const completeCampaign = async (id) => {
    try {
      const res = await API.post(`/campaigns/${id}/complete`);
      alert(res.data?.message || "Completed");
      loadCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Mission Control</h1>

      {/* CREATE */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign name"
          className="border p-2 w-full"
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-2 w-full"
        />

        <button
          onClick={createCampaign}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Create Campaign
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : campaigns.length === 0 ? (
        <p>No campaigns (or GET endpoint not implemented)</p>
      ) : (
        campaigns.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded shadow space-y-2">
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-slate-600">{c.description}</p>
            <p className="text-xs">Status: {c.status}</p>

            <div className="flex gap-2">
              <button
                onClick={() => loadParticipants(c.id)}
                className="text-blue-600 text-sm"
              >
                View Pool
              </button>

              <button
                onClick={() => completeCampaign(c.id)}
                className="text-green-600 text-sm"
              >
                Complete
              </button>
            </div>
          </div>
        ))
      )}

      {/* PARTICIPANTS */}
      {selectedCampaign && (
        <div className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="font-semibold">Volunteer Pool</h2>

          {participants.length === 0 ? (
            <p className="text-sm text-slate-500">No volunteers yet</p>
          ) : (
            participants.map((p) => (
              <div
                key={p.volunteer_id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <div>
                  <p className="font-medium">{p.volunteer_name}</p>
                  <p className="text-xs text-slate-500">
                    {p.skills?.join(", ") || "No skills"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    approveVolunteer(selectedCampaign, p.volunteer_id)
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Campaigns;

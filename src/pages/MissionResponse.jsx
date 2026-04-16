import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

const MissionResponse = () => {
  const { campaign_id } = useParams();
  const [searchParams] = useSearchParams();
  const vol_id = searchParams.get("vol_id");

  const [campaign, setCampaign] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await API.get(`/campaigns/${campaign_id}`);
        setCampaign(res.data);
      } catch (err) {
        console.error(err);
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaign_id]);

  const handleAccept = async () => {
    try {
      const res = await API.post(
        `/campaigns/${campaign_id}/opt-in?vol_id=${vol_id}`,
      );
      setStatus(res.data.message || "Accepted successfully");
    } catch {
      setStatus("Error while accepting");
    }
  };

  const handleReject = async () => {
    try {
      const res = await API.post(
        `/campaigns/${campaign_id}/reject?vol_id=${vol_id}`,
      );
      setStatus(res.data.message || "Rejected");
    } catch {
      setStatus("Error while rejecting");
    }
  };

  // 🚨 invalid link guard
  if (!vol_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-semibold">
        Invalid access link (missing volunteer ID)
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Skeleton width={320} height={160} className="rounded-2xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Failed to load campaign
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl border border-slate-200 p-8 space-y-6">
        {/* HEADER */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Mission Invitation
          </p>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {campaign.name}
          </h1>
          <p className="text-sm text-slate-500 mt-2">{campaign.description}</p>
        </div>

        {/* INFO */}
        <div className="grid gap-4 text-sm">
          <Info
            label="📍 Location"
            value={campaign.location_address || "N/A"}
          />
          <Info
            label="🛠 Skills"
            value={
              campaign.required_skills?.length
                ? campaign.required_skills.join(", ")
                : "General"
            }
          />
          <Info
            label="👥 Volunteers Needed"
            value={campaign.volunteers_required || 0}
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleAccept}
            className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #0D7377 0%, #14919B 100%)",
            }}
          >
            Accept
          </button>

          <button
            onClick={handleReject}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reject
          </button>
        </div>

        {/* STATUS */}
        {status && (
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 text-center">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 px-4 py-3 flex justify-between items-center">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900 text-right">{value}</span>
  </div>
);

export default MissionResponse;

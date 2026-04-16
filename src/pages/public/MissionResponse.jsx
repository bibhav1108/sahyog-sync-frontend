import { useParams, useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

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
      setStatus("processing");
      const res = await API.post(
        `/campaigns/${campaign_id}/opt-in?vol_id=${vol_id}`,
      );
      setStatus("ACCEPTED");
    } catch {
      setStatus("ERROR_ACCEPT");
    }
  };

  const handleReject = async () => {
    try {
      setStatus("processing");
      await API.post(
        `/campaigns/${campaign_id}/reject?vol_id=${vol_id}`,
      );
      setStatus("REJECTED");
    } catch {
      setStatus("ERROR_REJECT");
    }
  };

  if (!vol_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6 font-outfit">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-red-500/20 p-10 rounded-[2.5rem] text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">link_off</span>
          </div>
          <h1 className="text-2xl font-black text-on_surface mb-2">Access Denied</h1>
          <p className="text-on_surface_variant text-sm leading-relaxed">
            The mission invitation link is invalid or missing a volunteer signature. Please contact your NGO coordinator.
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-xl">
             <SkeletonStructure 
                layout={[
                    { type: 'rect', height: 40, className: "w-1/3 rounded-full mb-4" },
                    { type: 'rect', height: 300, className: "rounded-[2.5rem]" }
                ]} 
            />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6 text-on_surface_variant">
        <div className="text-center space-y-4">
             <span className="material-symbols-outlined text-6xl opacity-20">inventory_2</span>
             <h2 className="text-xl font-black">Mission Not Found</h2>
             <p className="text-sm">This movement may have concluded or been archived.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-outfit flex items-center justify-center p-6 selection:bg-primary/30 relative overflow-hidden">
      {/* 🔮 Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-azure/10 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-[3rem] bg-white shadow-2xl border border-white/50 p-8 md:p-12 relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primaryGradient transition-all" />
        
        {/* HEADER */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            Urgent Mobilization
          </div>
          
          <div>
            <h1 className="text-4xl font-black text-on_surface leading-[1.1] tracking-tighter">
              {campaign.name}
            </h1>
            <p className="text-on_surface_variant mt-4 leading-relaxed font-medium">
              {campaign.description}
            </p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <DetailBox 
                icon="location_on" 
                label="Primary Zone" 
                value={campaign.location_address || "On-Field Activation"} 
            />
            <DetailBox 
                icon="construction" 
                label="Capability Needed" 
                value={campaign.required_skills?.length ? campaign.required_skills.join(", ") : "General Support"} 
            />
            <DetailBox 
                icon="group" 
                label="Force Strength" 
                value={`${campaign.volunteers_required || 0} Operatives Needed`} 
            />
            <DetailBox 
                icon="verified" 
                label="Verified Request" 
                value="Authorized NGO" 
            />
        </div>

        {/* ACTION UI */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            {!status || status === "processing" ? (
              <motion.div 
                key="actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={handleAccept}
                  disabled={status === "processing"}
                  className="flex-1 bg-primaryGradient text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {status === "processing" ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Accept Mission"}
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </button>

                <button
                  onClick={handleReject}
                  disabled={status === "processing"}
                  className="px-8 py-5 bg-surface_high text-on_surface_variant rounded-2xl font-black text-sm uppercase tracking-widest border border-white/50 hover:bg-white hover:border-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Decline
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="status"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-8 rounded-[2rem] text-center border-2 ${
                    status === 'ACCEPTED' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 
                    status === 'REJECTED' ? 'bg-red-500/5 border-red-500/20 text-red-600' : 'bg-surface_high border-surface_highest text-on_surface'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    status === 'ACCEPTED' ? 'bg-emerald-500 text-white' : 
                    status === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                }`}>
                    <span className="material-symbols-outlined text-3xl">
                        {status === 'ACCEPTED' ? 'check_circle' : status === 'REJECTED' ? 'cancel' : 'info'}
                    </span>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    {status === 'ACCEPTED' ? 'Protocol Activated' : status === 'REJECTED' ? 'Response Logged' : 'Update Received'}
                </h3>
                <p className="text-sm font-medium opacity-80 leading-relaxed max-w-xs mx-auto mb-6">
                    {status === 'ACCEPTED' ? 'Your participation is confirmed. Check the dashboard for coordination details.' : 
                     status === 'REJECTED' ? 'No worries. We will notify you of future missions in your area.' : 'There was an issue processing your request.'}
                </p>
                
                <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-white/50 rounded-xl text-xs font-black uppercase tracking-widest text-on_surface_variant hover:bg-surface_lowest transition-all">
                    Visit Portal
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on_surface_variant/40">
                Secured Humanitarian Network • 256-bit AES
            </p>
        </div>
      </motion.div>
    </div>
  );
};

const DetailBox = ({ icon, label, value }) => (
  <div className="p-5 rounded-3xl bg-surface_high/50 border border-white/5 transition-all hover:bg-white hover:shadow-soft group/item">
    <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-[18px] text-primary transition-transform group-hover/item:scale-110">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/60">{label}</span>
    </div>
    <span className="text-sm font-bold text-on_surface leading-tight block">{value}</span>
  </div>
);

export default MissionResponse;

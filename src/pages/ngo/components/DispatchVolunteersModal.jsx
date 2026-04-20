import { useEffect, useState } from "react";
import API from "../../../services/api";
import { resolveProfileImage, handleImageError } from "../../../utils/imageUtils";
import VerificationBadge from "../../../components/shared/VerificationBadge";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import Modal from "../../../components/shared/Modal";
import { useToast } from "../../../context/ToastContext";

const DispatchVolunteersModal = ({ open, onClose, needId, onSuccess }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const { addToast } = useToast();

  const filtered = volunteers.filter((v) =>
    (v.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const selectedVols = volunteers.filter((v) => selected.includes(v.id));

  const volunteerSkeletonLayout = [
    { type: 'stack', gap: 3, items: Array(6).fill({ type: 'rect', height: 72, className: "rounded-2xl" }) }
  ];

  useEffect(() => {
    if (open) loadVolunteers();
  }, [open]);

  const loadVolunteers = async () => {
    try {
      setVolunteersLoading(true);
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch {
      setVolunteers([]);
    } finally {
      setVolunteersLoading(false);
    }
  };

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDispatch = async () => {
    if (selected.length === 0) {
      return addToast("Select at least one volunteer", "warning");
    }

    try {
      setLoading(true);

      await API.post("/marketplace/dispatches/", {
        marketplace_need_id: needId,
        volunteer_ids: selected.map(Number),
      });

      addToast("Team deployed successfully! 🚀", "success");
      onSuccess?.();
      onClose();
      setSelected([]);
    } catch (err) {
      addToast(err?.response?.data?.detail || "Failed to dispatch", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      maxWidth="max-w-6xl"
      className="h-auto md:h-[85vh]"
      bodyPadding={false}
      showClose={false}
    >
      <div className="relative w-full h-auto md:h-full flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:px-6 sm:pb-6 sm:pt-4 overflow-y-auto md:overflow-hidden">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-surface_high border border-on_surface/5 text-on_surface_variant hover:bg-error hover:text-white hover:border-error transition-all duration-300 shadow-lg z-20"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        {/* LEFT PANEL: SELECTION */}
        <div className="flex-[3] min-h-0 flex flex-col bg-surface_high/30 border border-on_surface/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 overflow-hidden relative">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Assign Volunteers</h1>
            <div className="w-12 h-1 bg-primaryGradient rounded-full mb-4" />
            <h2 className="text-xl sm:text-2xl font-outfit font-black text-on_surface tracking-tight">Available Volunteers</h2>
            <p className="text-[10px] sm:text-xs font-bold text-on_surface_variant/40 mt-1">Choose people to dispatch for this task.</p>
          </div>

          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on_surface_variant/40 text-lg">search</span>
            <input
              placeholder="Search volunteers by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-on_surface/5 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold shadow-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-[400px] md:min-h-0 space-y-2 pr-2 sm:pr-4 custom-scrollbar">
            {volunteersLoading ? (
              <SkeletonStructure layout={volunteerSkeletonLayout} />
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 opacity-20 italic text-[10px] font-black uppercase tracking-widest">No volunteers found</div>
            ) : filtered.map((v) => {
              const isSelected = selected.includes(v.id);
              return (
                <div
                  key={v.id}
                  onClick={() => toggle(v.id)}
                  className={`group p-3 sm:p-4 rounded-2xl cursor-pointer flex justify-between items-center border-2 transition-all duration-300
                    ${isSelected ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-white/50 border-white hover:border-primary/20 hover:bg-white"}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] overflow-hidden border border-on_surface/5 shadow-lg relative group">
                      <img src={resolveProfileImage(v.profile_image_url)} alt={v.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" onError={handleImageError} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                           <span className="text-xs sm:text-sm font-black text-on_surface uppercase tracking-tight">{v.name}</span>
                           <VerificationBadge trustTier={v.trust_tier} telegramActive={v.telegram_active} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500 mt-0.5">Available for work</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-primary border-primary scale-110 shadow-lg" : "border-on_surface/10"}`}>
                    {isSelected && <span className="material-symbols-outlined text-white text-[10px] sm:text-xs font-black">check</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: SUMMARY */}
        <div className="flex-[2] min-h-0 flex flex-col bg-primary/5 border-2 border-primary/10 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary opacity-10 blur-[100px] group-hover:opacity-20 transition-opacity" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-outfit font-black text-on_surface tracking-tight">Active Team</h3>
              <span className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">
                {selected.length} {selected.length === 1 ? 'Person' : 'People'}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {volunteersLoading ? (
                <SkeletonStructure layout={[{type: 'stack', gap: 3, items: Array(3).fill({type: 'rect', height: 48, className: "rounded-xl"})}]} />
              ) : selectedVols.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 py-10 sm:py-20">
                  <span className="material-symbols-outlined text-4xl sm:text-5xl">group_add</span>
                  <p className="text-[9px] font-black uppercase tracking-widest text-center">Choose volunteers to dispatch</p>
                </div>
              ) : (
                selectedVols.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-2xl group/item hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={resolveProfileImage(v.profile_image_url)} alt={v.name} className="w-full h-full object-cover transition-transform group-hover/item:scale-110" onError={handleImageError} />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-black text-on_surface uppercase tracking-tight">{v.name}</span>
                    </div>
                    <button onClick={() => toggle(v.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/20 text-on_surface/20 hover:text-error transition-all">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleDispatch}
              disabled={loading || selected.length === 0}
              className={`mt-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl
                ${loading || selected.length === 0
                  ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                  : "bg-primaryGradient text-white hover:scale-[1.02] active:scale-95 shadow-primary/20 border-t border-white/20"}
              `}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : `Confirm Dispatch`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DispatchVolunteersModal;

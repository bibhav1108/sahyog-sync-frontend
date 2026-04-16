import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import { useToast } from "../../context/ToastContext";

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/volunteers");
      setVolunteers(res.data);
    } catch (err) {
      console.error("Failed to fetch volunteers", err);
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(v => 
    v.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStructure 
            layout={[
                { type: 'rect', height: 100, className: "rounded-3xl" },
                { type: 'stack', gap: 4, items: Array(6).fill({ type: 'rect', height: 80, className: "rounded-3xl" }) }
            ]} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black tracking-tight">Volunteer Network</h1>
          <p className="text-sm text-on_surface_variant border-l-2 border-primary pl-3 ml-1 mt-1 font-medium">
            Overseeing the platform's global humanitarian workforce
          </p>
        </div>
        <div className="relative group max-w-xs w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on_surface_variant transition-colors group-focus-within:text-primary">search</span>
          <input 
            type="text" 
            placeholder="Search volunteers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-surface_highest focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium shadow-soft"
          />
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-surface_highest shadow-soft overflow-hidden">
        {filteredVolunteers.length > 0 ? (
          <>
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface_lowest/50 text-[10px] uppercase font-black tracking-widest text-on_surface_variant border-b border-surface_highest">
                  <tr>
                    <th className="px-8 py-5">Volunteer Info</th>
                    <th className="px-8 py-5">Status & Trust</th>
                    <th className="px-8 py-5 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface_highest">
                  <AnimatePresence mode="popLayout">
                    {filteredVolunteers.map((vol) => (
                      <motion.tr
                        key={vol.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group hover:bg-surface_lowest/30 transition-all"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                              {vol.full_name?.[0] || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-black text-on_surface leading-tight">{vol.full_name}</p>
                              <p className="text-[10px] text-on_surface_variant font-bold opacity-50 lowercase tracking-tight">{vol.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest ${vol.status === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {vol.status || "UNKNOWN"}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] font-black text-on_surface_variant">
                                    <span className="material-symbols-outlined text-xs text-primary">shield</span>
                                    {vol.trust_tier || "INITIAL"}
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className="p-2.5 bg-surface_lowest text-on_surface_variant rounded-xl hover:text-primary transition-colors">
                             <span className="material-symbols-outlined">more_vert</span>
                           </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden divide-y divide-surface_highest">
                <AnimatePresence mode="popLayout">
                    {filteredVolunteers.map((vol) => (
                        <motion.div
                            key={vol.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                       {vol.full_name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-on_surface leading-tight">{vol.full_name}</h4>
                                        <p className="text-[10px] font-bold text-on_surface_variant lowercase opacity-50">{vol.email}</p>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest ${vol.status === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {vol.status || "UNKNOWN"}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-on_surface_variant bg-surface_lowest px-2.5 py-1 rounded-lg border border-surface_highest">
                                    <span className="material-symbols-outlined text-[14px] text-primary">shield_person</span>
                                    {vol.trust_tier || "INITIAL"} TRUST
                                </div>
                                <button className="p-2 text-on_surface_variant">
                                    <span className="material-symbols-outlined text-xl">more_horiz</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="p-20 text-center">
            <span className="material-symbols-outlined text-6xl text-surface_highest mb-4">groups</span>
            <h3 className="text-xl font-black text-on_surface">Network Empty</h3>
            <p className="text-sm text-on_surface_variant">No matching volunteers found in the registry.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVolunteers;

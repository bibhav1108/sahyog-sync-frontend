import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import { useToast } from "../../context/ToastContext";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await API.get("/feedback/list?type_filter=REVIEW");
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      addToast("Failed to load community reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStructure 
            layout={[
                { type: 'rect', height: 100, className: "rounded-3xl" },
                { type: 'stack', gap: 4, items: Array(4).fill({ type: 'rect', height: 150, className: "rounded-3xl" }) }
            ]} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black tracking-tight">Platform Reviews</h1>
          <p className="text-sm text-on_surface_variant border-l-2 border-primary pl-3 ml-1 mt-1 font-medium">
            Monitoring community sentiment and user satisfaction
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-500/10 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">reviews</span>
            {reviews.length} Total Submissions
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[2rem] border border-surface_highest shadow-soft hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface_lowest flex items-center justify-center text-primary font-black text-lg shadow-inner">
                    {review.user_name?.[0] || "?"}
                  </div>
                  <div>
                    <h4 className="font-black text-on_surface leading-tight">{review.user_name}</h4>
                    <p className="text-[10px] text-on_surface_variant uppercase font-bold tracking-widest opacity-60">
                      {review.user_role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`material-symbols-outlined text-sm ${i < (review.rating || 0) ? 'text-amber-400 fill-current' : 'text-surface_highest'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-on_surface_variant text-sm leading-relaxed italic relative">
                  <span className="text-4xl text-primary/10 absolute -left-4 -top-4 font-serif">"</span>
                  {review.content}
              </p>

              <div className="mt-6 pt-6 border-t border-surface_lowest flex items-center justify-between">
                <span className="text-[10px] text-on_surface_variant font-medium opacity-40">
                  ID: #{review.id} • {new Date(review.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-tighter">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  AUTHENTICATED
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {reviews.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-surface_highest">
          <span className="material-symbols-outlined text-6xl text-surface_highest mb-4">sentiment_satisfied</span>
          <h3 className="text-xl font-black text-on_surface">No Reviews Found</h3>
          <p className="text-sm text-on_surface_variant">Waiting for the community to share their thoughts.</p>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;

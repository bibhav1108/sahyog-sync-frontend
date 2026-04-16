import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

const ReviewPage = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating");
    
    setSubmitting(true);
    try {
      await API.post("/feedback/submit", {
        type: "REVIEW",
        rating: rating,
        content: content
      });
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-12 md:py-24 px-6 text-center font-outfit selection:bg-primary/30">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-2 bg-primaryGradient transition-all" />
            
            <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
                <span className="material-symbols-outlined text-[40px] md:text-[56px] leading-none">task_alt</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-black mb-4 tracking-tight text-on_surface uppercase">Response Logged</h1>
            <p className="text-sm md:text-lg text-on_surface_variant mb-8 md:mb-10 font-medium leading-relaxed opacity-80">
                Your intelligence record has been transmitted to the core team. We appreciate your contribution to platform integrity.
            </p>
            
            <button 
                onClick={() => setSubmitted(false)}
                className="w-full py-4 md:py-5 bg-on_surface text-white rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-on_surface/90 transition shadow-xl"
            >
                Submit New Report
            </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 md:space-y-12 pb-24 px-4 md:px-6 font-outfit relative">
      {/* 🔮 Glows */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <header className="text-center space-y-2 md:space-y-4">
          <div className="inline-block px-4 py-1 bg-primary/5 text-primary rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-primary/10">
              Community Intelligence
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-on_surface leading-tight md:leading-[0.9]">
            Share Your <br />
            <span className="text-transparent bg-clip-text bg-primaryGradient">Experience</span>
          </h1>
          <p className="text-sm md:text-lg text-on_surface_variant max-w-lg mx-auto font-medium opacity-60">
            Help us calibrate the Sahyog ecosystem for maximum impact and efficiency.
          </p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-glass p-6 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/50 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[150px] md:text-[200px]">verified_user</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-10 md:space-y-12 relative">
          {/* STAR RATING */}
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Global Metric</h4>
            <div className="flex gap-1 md:gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all duration-300 transform hover:scale-110 active:scale-90 focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <span 
                    className={`material-symbols-outlined text-[42px] md:text-[64px] transition-colors leading-none ${
                        (hover || rating) >= star ? "text-amber-400 fill-current" : "text-on_surface_variant/10"
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    grade
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TEXT AREA */}
          <div className="space-y-2 md:space-y-3">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 md:ml-4">Transmission Content</label>
            <textarea
              required
              rows={5}
              className="w-full bg-surface_high/50 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border border-white/50 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm md:text-lg font-medium"
              placeholder="What could we optimize? Share your ground insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="bg-primaryGradient/5 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-primary/10 flex items-start gap-4 md:gap-5">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-primaryGradient text-white rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <span className="material-symbols-outlined text-xl">shield_person</span>
               </div>
               <p className="text-[11px] md:text-sm text-on_surface_variant leading-relaxed font-medium">
                   <b>Secure Encryption:</b> Your report is prioritized for technical assessment. By submitting, you help strengthen the network.
               </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 md:py-5 bg-primaryGradient text-white font-black rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 md:gap-4 text-[11px] md:text-sm uppercase tracking-[0.2em]"
          >
            {submitting ? (
                 <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    Finalize Submission
                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">send</span>
                </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ReviewPage;

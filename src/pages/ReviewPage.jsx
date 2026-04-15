import { useState } from "react";
import API from "../services/api";

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
      <div className="max-w-xl mx-auto py-20 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[48px]">check_circle</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">Review Submitted!</h1>
        <p className="text-on_surface_variant mb-8 text-lg">Thank you for helping us improve SahyogSync. Your feedback has been sent to our administration team.</p>
        <button 
            onClick={() => setSubmitted(false)}
            className="px-8 py-3 bg-surface_high hover:bg-surface_highest rounded-2xl font-bold transition"
        >
            Write Another Review
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="text-center">
          <h1 className="text-4xl font-black mb-2 tracking-tight">Review SahyogSync</h1>
          <p className="text-on_surface_variant opacity-80 text-lg">Your feedback helps us allocate resources more effectively across the humanitarian network.</p>
      </div>

      <div className="bg-surface_high p-8 md:p-12 rounded-3xl border border-white/5 shadow-soft relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
        
        <form onSubmit={handleSubmit} className="space-y-10 relative">
          {/* STAR RATING */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-black uppercase tracking-widest opacity-40">Overall Experience</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all duration-200 transform hover:scale-125 focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <span 
                    className={`material-symbols-outlined text-[48px] ${
                        (hover || rating) >= star ? "text-primary fill-current" : "text-on_surface_variant/20"
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TEXT AREA */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest opacity-40 pl-1">Tell us your thoughts</label>
            <textarea
              required
              rows={6}
              className="w-full bg-surface_highest/50 rounded-2xl p-6 border border-white/5 outline-none focus:border-primary/50 transition-colors text-lg"
              placeholder="What do you love? What could be better? Share your experience with us..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-start gap-4">
               <span className="material-symbols-outlined text-primary mt-1">shield_person</span>
               <p className="text-sm text-on_surface_variant leading-relaxed">
                   <b>Confidential Submission:</b> This review will be forwarded directly to the SahyogSync Core Administration for platform quality assessment. Your identity remains protected.
               </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg lowercase tracking-wide"
          >
            {submitting ? "Transmitting..." : "Submit Platform Review"}
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewPage;

import { useState } from "react";
import API from "../services/api";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    category: "BUG",
    content: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/feedback/submit", {
        type: "ISSUE",
        category: formData.category,
        content: formData.content
      });
      setSubmitted(true);
    } catch (err) {
      alert("Failed to send request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const socialLinks = [
    { label: "Telegram Support", value: "@SahyogSyncSupport", icon: "send", color: "bg-[#0088cc]" },
    { label: "Instagram Hub", value: "@sahyogsync_ngo", icon: "camera", color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" },
    { label: "Official Email", value: "ops@sahyogsync.org", icon: "mail", color: "bg-primary" },
    { label: "Office Line", value: "+91 11 2345 6789", icon: "call", color: "bg-emerald-500" },
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-slide-up">
        <div className="w-24 h-24 bg-primaryGradient text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-12">
            <span className="material-symbols-outlined text-[48px]">support_agent</span>
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter">Issue Reported!</h1>
        <p className="text-on_surface_variant mb-10 text-xl max-w-md mx-auto">Your request has been prioritizedized and sent to the technical team. Ticket ID: #ISS-{Math.floor(Math.random() * 9000) + 1000}</p>
        <button 
            onClick={() => setSubmitted(false)}
            className="px-10 py-4 bg-primary text-white rounded-2xl font-bold transition shadow-lg shadow-primary/30"
        >
            Back to Support
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black mb-3 tracking-tighter">Support Center</h1>
            <p className="text-on_surface_variant text-xl opacity-70">Connect with us directly for partnership or technical inquiries.</p>
          </div>
          <div className="bg-surface_high px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-bold uppercase tracking-widest opacity-60">Avg. Response: 2 Hours</span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* SOCIAL CARDS */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-40 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">share</span>
              Instant Channels
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {socialLinks.map((link) => (
              <div key={link.label} className="group relative bg-surface_high p-6 rounded-3xl border border-white/5 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className={`absolute left-0 top-0 w-1.5 h-full ${link.color}`} />
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${link.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined">{link.icon}</span>
                   </div>
                   <div>
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{link.label}</p>
                        <p className="font-bold text-lg">{link.value}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ISSUE REQUEST FORM */}
        <div className="lg:col-span-3">
           <div className="bg-surface_high p-8 md:p-10 rounded-[32px] border border-white/5 shadow-soft relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="material-symbols-outlined text-[120px]">bug_report</span>
                </div>
                
                <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                    Direct Issue Request
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 pl-2">Issue Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["BUG", "FEATURE", "UI", "LOGISTICS"].map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({...formData, category: cat})}
                                    className={`py-3 rounded-xl text-[10px] font-black tracking-widest border transition-all ${
                                        formData.category === cat 
                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                                        : "bg-surface_highest/40 border-white/5 hover:bg-surface_highest"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 pl-2">Description of Event</label>
                        <textarea
                            required
                            rows={5}
                            className="w-full bg-surface_highest/40 rounded-2xl p-6 border border-white/5 outline-none focus:border-primary/50 transition-colors text-lg"
                            placeholder="Please explain the issue or your request in detail..."
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                    >
                        {submitting ? "Transmitting..." : "Report Issue to Admin"}
                        <span className="material-symbols-outlined">shield</span>
                    </button>
                </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

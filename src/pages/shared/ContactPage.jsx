import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import PublicNavbar from "../../components/PublicNavbar";

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
    { label: "Telegram Support", value: "SahyogSyncBot", icon: "send", color: "bg-[#0088cc]", link: "https://t.me/SahyogSyncBot#" },
    { label: "Instagram Hub", value: "-", icon: "photo_camera", color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" },
    { label: "Official Email", value: "-", icon: "mail", color: "bg-primary" },
    { label: "Direct Line", value: "-", icon: "call", color: "bg-emerald-500" },
  ];

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center font-outfit">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-xl border border-white/50 p-12 rounded-[3.5rem] shadow-2xl relative"
        >
            <div className="w-24 h-24 bg-primaryGradient text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl rotate-12">
                <span className="material-symbols-outlined text-[48px]">support_agent</span>
            </div>
            <h1 className="text-3xl font-black mb-4 tracking-tighter text-on_surface uppercase">Message Sent</h1>
            <p className="text-on_surface_variant mb-10 text-lg font-medium opacity-80 leading-relaxed">
                We have received your message. A member of our support team will review your request and get back to you soon.
            </p>
            <button 
                onClick={() => setSubmitted(false)}
                className="px-10 py-5 bg-primaryGradient text-white rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-xl shadow-primary/25"
            >
                Back to Contact Page
            </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <PublicNavbar />
      <main className="pt-40">
        <div className="max-w-6xl mx-auto space-y-12 pb-24 px-6 font-outfit relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-1.5 bg-red-500/5 text-red-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/10">
                    Status: Online
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-on_surface leading-[0.9]">
                    Contact <br />
                    <span className="text-transparent bg-clip-text bg-primaryGradient">Support</span>
                </h1>
                <p className="text-on_surface_variant text-xl font-medium opacity-60 max-w-lg">
                    Need help or have a question? Send us a message and we'll get back to you as soon as possible.
                </p>
              </div>
              <div className="bg-white/40 backdrop-blur-glass px-8 py-5 rounded-[2rem] border border-white/50 flex items-center gap-4 shadow-soft">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                   <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Average Response Time</span>
                       <span className="text-lg font-black text-on_surface">~ 120 Minutes</span>
                   </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* SOCIAL CARDS */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6 flex items-center gap-2 ml-4">
                  Other Ways to Reach Us
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {socialLinks.map((social) => {
                  const Card = (
                    <div className="group relative bg-white/60 backdrop-blur-glass p-6 rounded-[2.5rem] border border-white/50 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:bg-white h-full">
                      <div className={`absolute left-0 top-0 w-1.5 h-full ${social.color}`} />
                      <div className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${social.color} shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3`}>
                              <span className="material-symbols-outlined text-2xl">{social.icon}</span>
                         </div>
                         <div>
                              <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em] mb-1">{social.label === "Instagram Hub" ? "Instagram" : social.label}</p>
                              <p className="font-black text-lg text-on_surface">{social.value}</p>
                         </div>
                      </div>
                    </div>
                  );
                  return social.link && social.value !== "-" ? (
                    <a key={social.label} href={social.link} target="_blank" rel="noopener noreferrer">{Card}</a>
                  ) : (
                    <div key={social.label}>{Card}</div>
                  );
                })}
              </div>
            </div>

            {/* ISSUE REQUEST FORM */}
            <div className="lg:col-span-3">
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white/80 backdrop-blur-[20px] p-8 md:p-12 rounded-[3.5rem] border border-white/50 shadow-2xl relative overflow-hidden h-full"
               >
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-[180px]">support</span>
                    </div>
                    
                    <h2 className="text-2xl font-black mb-10 flex items-center gap-3 text-on_surface uppercase tracking-tight">
                        <span className="material-symbols-outlined text-primary text-3xl">mail</span>
                        Send a Message
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-8 relative">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">Category</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {["BUG", "FEATURE", "UI", "LOGISTICS"].map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setFormData({...formData, category: cat})}
                                        className={`py-4 rounded-2xl text-[10px] font-black tracking-widest border transition-all ${
                                            formData.category === cat 
                                            ? "bg-on_surface border-on_surface text-white shadow-xl scale-105" 
                                            : "bg-surface_high/50 border-white/50 text-on_surface_variant hover:bg-white"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">Message</label>
                            <textarea
                                required
                                rows={6}
                                className="w-full bg-surface_high/50 backdrop-blur-sm rounded-[2rem] p-8 border border-white/50 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium"
                                placeholder="How can we help you? Describe the issue or request here..."
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-6 bg-primaryGradient text-white font-black rounded-2xl shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-sm uppercase tracking-[0.2em]"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Send Message
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </>
                            )}
                        </button>
                    </form>
               </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;

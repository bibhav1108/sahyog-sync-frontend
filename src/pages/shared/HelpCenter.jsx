import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  // NGO CATEGORY
  { id: "ngo-reg", category: "NGO", q: "How does my NGO become verified?", a: "After registration, your account enters a 'Pending' state. A System Admin will review your foundation's credentials in the Administrative Hub. Once approved, you gain full access to the Marketplace and Inventory tools.", featured: true },
  { id: "ngo-alerts", category: "NGO", q: "What are Marketplace Alerts?", a: "Alerts are AI-processed summaries of inbound resource donations received via the Sahyog Telegram Bot. You can approve, reject, or adjust quantities before syncing them into your inventory.", featured: true },
  { id: "ngo-inv", category: "NGO", q: "Total vs Available vs Reserved stock?", a: "Total is your actual physical stock. Reserved represents items locked for an active Campaign. Available is what remains for immediate allocation (Total - Reserved = Available).", featured: true },
  { id: "ngo-camp", category: "NGO", q: "How do I mobilize a Campaign?", a: "Go to Campaign Control, define your mission objectives, select required volunteer skills, and reserve inventory. The system will then allow you to invite verified volunteers to join the mission." },
  { id: "ngo-tech", category: "NGO", q: "Where do I report a bug or feature request?", a: "Use the 'Technical Hub' under Support. Your report is converted into a ticket for System Admins to patch. You can track the status (Active, Resolved) in real-time." },
  { id: "ngo-vol", category: "NGO", q: "How do I verify a volunteer for field ops?", a: "NGO coordinators can validate a volunteer's identity and performance to increase their 'Trust Tier'. High-tier volunteers gain 'Field Verified' status for sensitive missions." },
  { id: "ngo-donors", category: "NGO", q: "Can I manage donor relationships?", a: "The Marketplace records donor identities from Telegram alerts. You can view donor history and impact as part of your resource management dashboard." },
  { id: "ngo-security", category: "NGO", q: "Is my inventory data private?", a: "Yes. All NGO inventory and operational data is siloed and only accessible by authorized personnel within your organization and the System Administration." },
  
  // VOLUNTEER CATEGORY
  { id: "vol-reg", category: "Volunteer", q: "Is email verification mandatory for volunteers?", a: "Yes. Verification is handled inline via OTP (One-Time Password) during registration to ensure all humanitarian operatives are reachable and authentic.", featured: true },
  { id: "vol-missions", category: "Volunteer", q: "How do I find missions to join?", a: "You can browse active NGOs in the 'NGO Browser' or wait for direct invitations to join 'Urgent Mobilization' campaigns based on your skill set.", featured: true },
  { id: "vol-impact", category: "Volunteer", q: "What is the Impact Score?", a: "Your Impact Score is calculated based on hours served, successful mission completions, and NGO feedback. Higher scores unlock more advanced mission opportunities." },
  { id: "vol-otp", category: "Volunteer", q: "What is the mission handover protocol?", a: "At the delivery location, you must request an OTP from the recipient. Entering this code in the portal officially marks the mission as COMPLETED and updates the inventory.", featured: true },
  { id: "vol-privacy", category: "Volunteer", q: "Who can see my personal data?", a: "Your identity is encrypted. Only NGO coordinators for missions you have accepted can view your contact details for operational safety." },
  { id: "vol-skills", category: "Volunteer", q: "Can I update my humanitarian capabilities?", a: "Yes, you can manage your skills in your profile. However, advanced certifications may require validation by an NGO coordinator before they appear on your official record." },
  { id: "vol-hours", category: "Volunteer", q: "How are my service hours calculated?", a: "Hours are tracked from the moment you accept a mission until the OTP handover is confirmed at the destination." },
  { id: "vol-decline", category: "Volunteer", q: "Can I decline a mission invitation?", a: "Yes. Declining an invitation does not negatively impact your Trust Tier, though consistent inactivity may lower your priority for future urgent mobilizations." },

  // GENERAL CATEGORY
  { id: "gen-security", category: "General", q: "How does the platform ensure aid reaches the right place?", a: "Our dual-verification system uses AI to track inbound items and secure OTP handover protocols at the destination to ensure zero-leakage distribution." },
  { id: "gen-reviews", category: "General", q: "How are platform reviews handled?", a: "Community feedback is prioritized for System Admins. Reviews help us calibrate the ecosystem and identify high-performing organizations or volunteers." },
  { id: "gen-map", category: "General", q: "Can I use the map for multiple locations?", a: "Yes. Use the Interactive Map to pinpoint donation arrivals or collection hubs. NGOs use these locations to optimize logistics for the delivery fleet." },
  { id: "gen-ai", category: "General", q: "How accurate is the platform's AI?", a: "Our AI extraction achieves 90%+ accuracy for resource types and quantities. However, NGO coordinators always review and 'Sync' alerts to ensure 100% data integrity." },
  { id: "gen-cost", category: "General", q: "What is the cost of using SahyogSync?", a: "SahyogSync is free for registered NGOs and individual volunteers as part of our humanitarian initiative. Large-scale government integrations follow separate protocol." }
];

const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const faqRefs = useRef({});

    // 🧠 SEARCH & DISPLAY LOGIC
    const searchStats = useMemo(() => {
        let matches = [];
        if (searchQuery && searchQuery.length >= 2) {
            const tokens = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 2);
            if (tokens.length > 0) {
                matches = FAQS.filter(faq => {
                    const content = (faq.q + faq.category + faq.a).toLowerCase();
                    return tokens.some(token => content.includes(token));
                }).sort((a, b) => {
                    const aMatches = tokens.filter(t => a.q.toLowerCase().includes(t)).length;
                    const bMatches = tokens.filter(t => b.q.toLowerCase().includes(t)).length;
                    return bMatches - aMatches;
                });
            } else {
                matches = FAQS.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()));
            }
        }

        // 🎯 THE STICKY RESULT LOGIC
        // Ensure the currently opened (expanded) FAQ is ALWAYS in the displayed list
        let displayed = [...matches];
        if (openFaq) {
            const activeFaq = FAQS.find(f => f.id === openFaq);
            if (activeFaq && !displayed.find(d => d.id === openFaq)) {
                displayed.unshift(activeFaq); // Put the selected one at the top
            }
        }

        // Pad with featured if not enough matches or no search
        if (displayed.length < 4) {
             const featured = FAQS.filter(f => f.featured && !displayed.find(d => d.id === f.id));
             displayed = [...displayed, ...featured.slice(0, 4 - displayed.length)];
        }

        return { filtered: matches.slice(0, 5), displayed };
    }, [searchQuery, openFaq]);


    const handleSuggestionClick = (faq) => {
        setSearchQuery("");
        setShowSuggestions(false);
        setOpenFaq(faq.id);
        
        setTimeout(() => {
            const element = faqRefs.current[faq.id];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-16 pb-24 px-4 md:px-0 font-outfit animate-fadeIn relative selection:bg-primary/20">
            {/* 🔍 SEARCH HEADER */}
            <div className="relative z-40 rounded-[30px] md:rounded-[40px] bg-primaryGradient p-8 md:p-20 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 rotate-12">
                    <span className="material-symbols-outlined text-[150px] md:text-[200px]">hub</span>
                </div>
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tighter uppercase"
                    >
                        Intelligence Hub
                    </motion.h1>
                    <p className="text-sm md:text-xl opacity-90 font-medium leading-relaxed">
                        Search the platform registry for tactical NGO workflows and volunteer protocols.
                    </p>
                    
                    {/* 🕵️ LIVE SEARCH BOX */}
                    <div className="mt-8 md:mt-12 relative max-w-xl mx-auto group">
                        <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center shadow-inner overflow-visible">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Search protocols (e.g. OTP, Metrics, Triage)"
                                className="w-full bg-transparent py-4 md:py-6 px-6 md:px-8 outline-none text-white placeholder:text-white/60 text-sm md:text-base font-medium"
                            />
                            <div className="pr-6 opacity-60">
                                <span className="material-symbols-outlined">search</span>
                            </div>

                            {/* 💡 SUGGESTIONS DROPDOWN */}
                            <AnimatePresence>
                                {showSuggestions && searchQuery.length > 1 && searchStats.filtered.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scaleY: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                        exit={{ opacity: 0, y: 10, scaleY: 0.9 }}
                                        className="absolute top-full left-0 w-full mt-3 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 origin-top text-on_surface border border-primary/5"
                                    >
                                        <div className="p-3 bg-primary/5 border-b border-primary/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60 px-2">Knowledge Base Results</p>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {searchStats.filtered.map((faq) => (
                                                <button
                                                    key={faq.id}
                                                    onClick={() => handleSuggestionClick(faq)}
                                                    className="w-full text-left p-4 hover:bg-primary/5 flex items-center gap-4 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-[18px]">read_more</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-on_surface_variant uppercase tracking-widest leading-none mb-1 opacity-40">{faq.category}</p>
                                                        <p className="font-bold text-sm text-on_surface group-hover:text-primary transition-colors">{faq.q}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📋 WORKFLOW SYNC */}
            <section className="space-y-8 px-2">
                <div className="text-center px-4">
                    <h2 className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.3em] text-primary mb-2">Protocol Architecture</h2>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase">System Efficiency Flow</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    <WorkflowStep number="1" title="Triage & Extract" desc="Resources tracked from ground source. AI extracts mission-critical data instantly." icon="emergency" />
                    <WorkflowStep number="2" title="Inventory Activation" desc="NGOs approve arrivals in the hub, syncing virtual data with physical stock." icon="box_add" />
                    <WorkflowStep number="3" title="Verification Protocol" desc="Campaigns conclude via OTP secure handovers, updating global trust metrics." icon="verified" />
                </div>
            </section>

            {/* 🛡️ ADMINISTRATIVE HUB OVERSIGHT */}
            <section className="bg-surface_high/30 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-12 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <h3 className="text-2xl md:text-3xl font-black mb-3 tracking-tighter uppercase leading-none">Global Governance</h3>
                        <p className="text-sm md:text-base text-on_surface_variant font-medium opacity-60">
                            Our superuser tools oversee NGO vetting, volunteer trust, and technical platform patches.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <AdminUnit title="Foundation Check" desc="Vetting NGOs for platform integrity." icon="account_balance" />
                    <WorkflowIcon title="Force Oversight" desc="Global volunteer management hub." icon="safety_check" />
                    <WorkflowIcon title="Community Pulse" desc="Sentiment and review analytics." icon="data_exploration" />
                    <WorkflowIcon title="Technical Console" desc="Priority bug resolution center." icon="terminal" />
                </div>
            </section>

            {/* 💎 FAQ ACCORDION SECTION */}
            <section id="faq-section" className="space-y-12 scroll-mt-20">
                <div className="text-center px-4">
                    <h3 className="text-3xl font-black uppercase tracking-tight">
                        {searchQuery.length > 1 ? "Tactical Results" : "Core Essentials"}
                    </h3>
                    <p className="text-on_surface_variant/60 font-medium tracking-wide">
                        {searchQuery.length > 1 ? `Found ${searchStats.displayed.length} relevant protocols` : "Frequently asked humanitarian queries."}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-4">
                    <AnimatePresence mode="popLayout">
                        {searchStats.displayed.map((faq) => (
                            <motion.div
                                key={faq.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FAQItem 
                                    faq={faq}
                                    isOpen={openFaq === faq.id}
                                    onToggle={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                    forwardRef={(el) => (faqRefs.current[faq.id] = el)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {searchQuery.length > 1 && searchStats.displayed.length === 0 && (
                        <div className="text-center py-20 bg-surface_high/30 rounded-[2rem] border border-dashed border-on_surface/10">
                            <span className="material-symbols-outlined text-4xl opacity-20 mb-4 text-primary">search_off</span>
                            <p className="font-bold text-on_surface_variant">No exact matches found in the registry.</p>
                            <p className="text-xs text-on_surface_variant/60">Try searching with broader keywords like 'NGO' or 'OTP'.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 📣 CONTACT CTA */}
            <div className="text-center py-20 bg-white/40 border border-white rounded-[3rem] shadow-soft relative overflow-hidden">
                <div className="relative z-10 space-y-10">
                    <div className="max-w-xl mx-auto space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-on_surface leading-none">Still require support?</h2>
                        <p className="text-sm md:text-lg text-on_surface_variant opacity-60 font-medium px-4">Contact our technical operatives for priority assistance.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
                        <button className="px-10 py-5 bg-primaryGradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition">Open Priority Ticket</button>
                        <button className="px-10 py-5 bg-white border border-on_surface/5 text-on_surface_variant rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs">System Status</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkflowStep = ({ number, title, desc, icon }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-white/50 text-center relative z-10 group hover:-translate-y-2 transition-all hover:shadow-xl shadow-soft">
        <div className="w-16 h-16 rounded-2xl bg-primaryGradient text-white flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:rotate-6 transition-transform">
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-on_surface text-white px-3 py-1.5 rounded-xl text-[9px] font-black tracking-[0.2em] uppercase">Phase {number}</div>
        <h4 className="text-lg font-black mb-3 text-on_surface uppercase">{title}</h4>
        <p className="text-xs text-on_surface_variant leading-relaxed opacity-70 font-medium">{desc}</p>
    </div>
);

const AdminUnit = ({ title, desc, icon }) => (
    <div className="bg-white p-6 rounded-3xl border border-primary/10 space-y-4 hover:shadow-lg transition-all group">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <h5 className="font-black text-xs text-on_surface uppercase leading-none tracking-tight">{title}</h5>
        <p className="text-[11px] text-on_surface_variant font-medium opacity-60 leading-relaxed">{desc}</p>
    </div>
);

const WorkflowIcon = ({ title, desc, icon }) => (
    <div className="bg-white/60 p-6 rounded-3xl border border-white/40 space-y-4 hover:shadow-lg transition-all">
        <div className="w-10 h-10 rounded-xl bg-azure/10 text-azure flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <h5 className="font-black text-[11px] text-on_surface uppercase leading-none tracking-tight">{title}</h5>
        <p className="text-[10px] text-on_surface_variant font-medium opacity-60 leading-relaxed">{desc}</p>
    </div>
);

const FAQItem = ({ faq, isOpen, onToggle, forwardRef }) => (
    <div ref={forwardRef} className={`bg-white rounded-[1.5rem] border transition-all duration-300 ${isOpen ? "border-primary/30 shadow-xl shadow-primary/5 -translate-y-1" : "border-on_surface/5 hover:bg-surface_high"}`}>
        <button onClick={onToggle} className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                    <span className="material-symbols-outlined text-[18px]">{faq.category === 'NGO' ? 'business' : faq.category === 'Volunteer' ? 'person' : 'settings'}</span>
                </div>
                <h5 className="font-bold text-sm md:text-base text-on_surface leading-tight">{faq.q}</h5>
            </div>
            <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-on_surface_variant/40"}`}>keyboard_arrow_down</span>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-8 pb-8 md:px-20 md:pb-12 text-sm md:text-base text-on_surface_variant leading-relaxed font-medium">
                        <div className="pt-4 border-t border-primary/5">{faq.a}</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default HelpCenter;

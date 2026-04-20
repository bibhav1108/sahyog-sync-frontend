import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  // NGO CATEGORY
  { id: "ngo-reg", category: "NGO", q: "How does my NGO become verified?", a: "After you register, our team will review your organization's details. Once approved, you'll have full access to manage inventory and start campaigns.", featured: true },
  { id: "ngo-alerts", category: "NGO", q: "What are Donation Alerts?", a: "Alerts are notifications about new donations received through the Sahyog Telegram Bot. You can check these donations and add them to your inventory.", featured: true },
  { id: "ngo-inv", category: "NGO", q: "What do Total, Available, and Reserved mean?", a: "Total is everything you have in stock. Reserved items are set aside for a campaign that is already running. Available is what you have left to use for new tasks.", featured: true },
  { id: "ngo-camp", category: "NGO", q: "How do I start a Campaign?", a: "Go to the Campaigns section, set your goals, choose the items you need from your inventory, and select the type of volunteers required. You can then invite volunteers to help.", featured: true },
  { id: "ngo-tech", category: "NGO", q: "How do I report a problem or request a feature?", a: "You can use the 'Contact Support' page. Our team will look into your request and you can track the status of your message in your dashboard." },
  { id: "ngo-vol", category: "NGO", q: "How do I verify a volunteer?", a: "You can review a volunteer's work and confirm their identity to help them build a better rating on the platform. This helps others know they are reliable.", featured: true },
  { id: "ngo-donors", category: "NGO", q: "Can I see who donated items?", a: "Yes, you can see donor information from the Telegram alerts. This helps you track who is supporting your organization.", featured: true },
  { id: "ngo-security", category: "NGO", q: "Is my inventory data private?", a: "Yes. Your inventory and campaign information can only be seen by people in your organization and the platform managers.", featured: true },
  
  // VOLUNTEER CATEGORY
  { id: "vol-reg", category: "Volunteer", q: "Do I need to verify my email?", a: "Yes. We send a simple code to your email during sign-up to make sure we can reach you when there's an emergency.", featured: true },
  { id: "vol-missions", category: "Volunteer", q: "How do I find campaigns to join?", a: "You can look through the list of active NGOs or wait for an invitation to join an emergency campaign that needs your specific skills.", featured: true },
  { id: "vol-impact", category: "Volunteer", q: "What is the Impact Score?", a: "Your score is based on the help you've provided, your completed tasks, and feedback from NGOs. A higher score shows you are an active and reliable volunteer." },
  { id: "vol-otp", category: "Volunteer", q: "How do I finish a task?", a: "When you deliver items, you'll need to get a simple code from the person receiving them. Enter this code in the portal to mark the task as complete.", featured: true },
  { id: "vol-privacy", category: "Volunteer", q: "Who can see my personal information?", a: "Your information is safe. Only the coordinators for the campaigns you join can see your contact details so they can coordinate with you.", featured: true },
  { id: "vol-skills", category: "Volunteer", q: "Can I update my skills?", a: "Yes, you can add or change your skills in your profile. Some specialized skills might need to be confirmed by an NGO you've worked with." },
  { id: "vol-hours", category: "Volunteer", q: "How are my volunteer hours tracked?", a: "We track your time from the moment you accept a task until you enter the delivery code at the final destination." },
  { id: "vol-decline", category: "Volunteer", q: "Can I say no to an invitation?", a: "Yes. You can decline any invitation. It won't hurt your rating, though being active helps you get more opportunities in the future." },

  // GENERAL CATEGORY
  { id: "gen-security", category: "General", q: "How do you make sure help gets to the right person?", a: "We use a double-check system: we track items when they arrive and use secure delivery codes to make sure everything reaches its destination safely." },
  { id: "gen-reviews", category: "General", q: "How are reviews handled?", a: "We take all feedback seriously. Reviews help us improve the platform and recognize top-performing volunteers and organizations." },
  { id: "gen-map", category: "General", q: "Can I use the map for different tasks?", a: "Yes. The map shows where donations are coming from and where supplies are stored. NGOs use this to plan the best way to deliver help." },
  { id: "gen-ai", category: "General", q: "Is the platform information accurate?", a: "Our system is very good at identifying donation details automatically, but NGO coordinators always double-check everything to be 100% sure the data is correct.", featured: true },
  { id: "gen-cost", category: "General", q: "How much does it cost to use Sahyog?", a: "Sahyog is completely free for all registered NGOs and volunteers. It’s our way of supporting humanitarian work." }
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
        let displayed = [...matches];
        if (openFaq) {
            const activeFaq = FAQS.find(f => f.id === openFaq);
            if (activeFaq && !displayed.find(d => d.id === openFaq)) {
                displayed.unshift(activeFaq); 
            }
        }

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
                    <span className="material-symbols-outlined text-[150px] md:text-[200px]">help</span>
                </div>
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tighter uppercase"
                    >
                        Help Center
                    </motion.h1>
                    <p className="text-sm md:text-xl opacity-90 font-medium leading-relaxed">
                        Find answers to your questions about how to use Sahyog as an NGO or volunteer.
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
                                placeholder="Search for help (e.g. NGO, volunteer, codes)"
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
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60 px-2">Help Articles</p>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {searchStats.filtered.map((faq) => (
                                                <button
                                                    key={faq.id}
                                                    onClick={() => handleSuggestionClick(faq)}
                                                    className="w-full text-left p-4 hover:bg-primary/5 flex items-center gap-4 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-[18px]">menu_book</span>
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

            {/* 📋 PROCESS SECTION */}
            <section className="space-y-8 px-2">
                <div className="text-center px-4">
                    <h2 className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.3em] text-primary mb-2">Our Process</h2>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase">How It Works</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    <WorkflowStep number="1" title="Receive & Process" desc="Help is tracked from the source and donation info is updated automatically." icon="emergency" />
                    <WorkflowStep number="2" title="Manage Inventory" desc="NGOs check and approve donations in the portal to update their stock." icon="box_add" />
                    <WorkflowStep number="3" title="Confirm Delivery" desc="Tasks are completed using secure codes to ensure help reaches the right place." icon="verified" />
                </div>
            </section>

            {/* 🛡️ PLATFORM MANAGEMENT */}
            <section className="bg-surface_high/30 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 md:p-12 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <h3 className="text-2xl md:text-3xl font-black mb-3 tracking-tighter uppercase leading-none">Our Standards</h3>
                        <p className="text-sm md:text-base text-on_surface_variant font-medium opacity-60">
                            Our team works behind the scenes to keep the platform safe, verified, and running smoothly.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <AdminUnit title="NGO Verification" desc="Checking organizations to ensure they are safe." icon="account_balance" />
                    <WorkflowIcon title="Volunteer Management" desc="Helping volunteers manage their profile and score." icon="safety_check" />
                    <WorkflowIcon title="Community Feedback" desc="Reviewing user suggestions and feedback." icon="data_exploration" />
                    <WorkflowIcon title="Technical Support" desc="Fixing any technical issues or bugs." icon="terminal" />
                </div>
            </section>

            {/* 💎 FAQ SECTION */}
            <section id="faq-section" className="space-y-12 scroll-mt-20">
                <div className="text-center px-4">
                    <h3 className="text-3xl font-black uppercase tracking-tight">
                        {searchQuery.length > 1 ? "Found Answers" : "Common Questions"}
                    </h3>
                    <p className="text-on_surface_variant/60 font-medium tracking-wide">
                        {searchQuery.length > 1 ? `Found ${searchStats.displayed.length} answers for you` : "Find help with the most common questions."}
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
                            <p className="font-bold text-on_surface_variant">No answers found for your search.</p>
                            <p className="text-xs text-on_surface_variant/60">Try searching with simpler words like 'NGO' or 'help'.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 📣 CONTACT CTA */}
            <div className="text-center py-20 bg-white/40 border border-white rounded-[3rem] shadow-soft relative overflow-hidden">
                <div className="relative z-10 space-y-10">
                    <div className="max-w-xl mx-auto space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-on_surface leading-none">Still need help?</h2>
                        <p className="text-sm md:text-lg text-on_surface_variant opacity-60 font-medium px-4">Send us a message and our team will get back to you soon.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
                        <button className="px-10 py-5 bg-primaryGradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition">Send a Message</button>
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

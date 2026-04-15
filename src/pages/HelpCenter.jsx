import React from "react";

const HelpCenter = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-16 pb-24 animate-fadeIn">
            {/* 🔍 HEADER */}
            <div className="relative overflow-hidden rounded-[40px] bg-primaryGradient p-12 md:p-20 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                    <span className="material-symbols-outlined text-[200px]">help_center</span>
                </div>
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">How can we help?</h1>
                    <p className="text-lg md:text-xl opacity-90 font-medium leading-relaxed">
                        Welcome to the SahyogSync Knowledge Base. Learn how to master the allocation operating system and scale your NGO's impact.
                    </p>
                    
                    <div className="mt-10 relative">
                        <input 
                            type="text" 
                            placeholder="Search for features, workflows, or terminology..."
                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-5 px-8 outline-none focus:bg-white focus:text-on_surface transition-all shadow-inner placeholder:text-white/60 focus:placeholder:text-on_surface_variant"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined opacity-50">search</span>
                    </div>
                </div>
            </div>

            {/* 🌐 CORE WORKFLOW */}
            <section className="space-y-8">
                <div className="text-center px-4">
                    <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary mb-2">The Architecture</h2>
                    <h3 className="text-3xl font-black tracking-tight">Understanding the SahyogSync Flow</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Background Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/5 hidden md:block -translate-y-1/2" />
                    
                    <WorkflowStep 
                        number="1"
                        title="Inbound Alert"
                        desc="A donor sends a message to the SahyogSync Telegram Bot. Our AI extracts items, quantity, and location in real-time."
                        icon="notifications_active"
                    />
                    <WorkflowStep 
                        number="2"
                        title="Operational Sync"
                        desc="Coordinators accept alerts in the Marketplace, move them to the Collection Hub, and finally sync them into the regular Inventory."
                        icon="sync_alt"
                    />
                    <WorkflowStep 
                        number="3"
                        title="Mission Completion"
                        desc="Items are reserved for Campaigns and dispatched via Verified Volunteers. OTP verification ensures the aid reaches its destination."
                        icon="verified"
                    />
                </div>
            </section>

            {/* 📦 MODULE DIRECTORY */}
            <section className="space-y-10">
                <h3 className="text-2xl font-black px-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">category</span>
                    Feature Directory
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FeatureCard 
                        title="Marketplace"
                        icon="storefront"
                        color="bg-blue-500"
                        content="The interface for managing inbound aid. This page shows 'Alerts' generated from Telegram messages. Here, you can verify AI summaries, approve quantities, and convert alerts into actionable 'Needs'."
                    />
                    <FeatureCard 
                        title="Collection Hub"
                        icon="move_to_inbox"
                        color="bg-amber-500"
                        content="A staging area for physical arrivals. When donated items physically arrive at your NGO, you use the Hub to validate them and officially 'Sync' them into your main inventory stock."
                    />
                    <FeatureCard 
                        title="Inventory"
                        icon="inventory_2"
                        color="bg-emerald-500"
                        content="The heart of your operations. Tracks three critical numbers: Total (everything you have), Reserved (items tagged for a mission), and Available (available for immediate use)."
                    />
                    <FeatureCard 
                        title="Campaign Control"
                        icon="rocket_launch"
                        color="bg-purple-500"
                        content="Planning and tracking humanitarian missions. Create campaigns, specify required skills, reserve inventory, and mobilize volunteer teams in a single view."
                    />
                    <FeatureCard 
                        title="Volunteer Management"
                        icon="groups"
                        color="bg-indigo-500"
                        content="Vetting and mobilising your workforce. Track Trust Tiers, verify IDs, and view performance metrics (hours served, completion rate) for every individual."
                    />
                    <FeatureCard 
                        title="Direct Support"
                        icon="support_agent"
                        color="bg-red-500"
                        content="Accessible via the 'Contact Us' menu. Use this to report technical bugs, UI glitches, or logistics errors directly to the System Administration."
                    />
                </div>
            </section>

            {/* ❓ FAQ */}
            <section className="bg-surface_high rounded-3xl p-8 md:p-12 border border-white/5 space-y-10">
                <div className="max-w-3xl">
                    <h3 className="text-2xl font-black mb-2 tracking-tight">Frequently Asked Questions</h3>
                    <p className="text-on_surface_variant">Quick solutions for common operational queries.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <FAQItem 
                        q="What is the difference between Reserved and Available quantity?"
                        a="Available quantity is current stock not yet pledged to any mission. Reserved quantity is stock locked for an approved campaign. Total = Available + Reserved."
                    />
                    <FAQItem 
                        q="How do volunteers get verified?"
                        a="Volunteers gain 'Trust Tiers' by completing missions and having their identity validated by NGO coordinators. The highest tier is Field Verified."
                    />
                    <FAQItem 
                        q="Why did my Marketplace Alert disappear?"
                        a="Alerts move to the 'Collection Hub' once accepted, or are archived if rejected. Check the Collection Hub to find your pending arrivals."
                    />
                    <FAQItem 
                        q="How does the OTP system work?"
                        a="When a volunteer reaches a destination, they request an OTP. This is sent to the donor/recipient's phone. Once entered, the mission is officially marked as COMPLETED."
                    />
                </div>
            </section>

            {/* 📣 CONTACT CTA */}
            <div className="text-center py-10">
                <p className="text-on_surface_variant opacity-60 mb-6 font-medium">Still have questions about the platform?</p>
                <div className="flex justify-center gap-4">
                    <button className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition">
                        Connect with Support
                    </button>
                    <button className="px-10 py-4 bg-surface_high hover:bg-surface_highest border border-white/10 rounded-2xl font-bold transition">
                        Chat with Community
                    </button>
                </div>
            </div>
        </div>
    );
};

const WorkflowStep = ({ number, title, desc, icon }) => (
    <div className="bg-surface_high p-8 rounded-3xl border border-white/5 text-center relative z-10 group hover:-translate-y-2 transition-transform duration-300">
        <div className="w-16 h-16 rounded-2xl bg-primaryGradient text-white flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]">
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface p-2 rounded-lg border border-white/10 text-[10px] font-black text-primary uppercase tracking-[0.2em] shadow-sm">
            Step {number}
        </div>
        <h4 className="text-xl font-black mb-3">{title}</h4>
        <p className="text-sm text-on_surface_variant leading-relaxed opacity-80">{desc}</p>
    </div>
);

const FeatureCard = ({ title, icon, color, content }) => (
    <div className="bg-surface_high p-8 rounded-3xl border border-white/5 group hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${color}`} />
        <div className="flex items-start gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${color} shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <h4 className="text-lg font-bold mb-3">{title}</h4>
                <p className="text-on_surface_variant text-sm leading-relaxed opacity-80">{content}</p>
            </div>
        </div>
    </div>
);

const FAQItem = ({ q, a }) => (
    <div className="space-y-2">
        <h5 className="font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {q}
        </h5>
        <p className="text-sm text-on_surface_variant opacity-70 leading-relaxed pl-3.5 border-l border-white/5">
            {a}
        </p>
    </div>
);

export default HelpCenter;

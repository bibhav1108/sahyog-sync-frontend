import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PublicNavbar from "../../components/PublicNavbar";
import Footer from "../../components/Footer";
import API from "../../services/api";

const LiveInsight = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get("/public/stats");
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const metrics = [
        { 
            label: "Registered NGOs", 
            value: stats?.total_partners || 0, 
            icon: "corporate_fare", 
            color: "text-primary",
            desc: "Groups working together" 
        },
        { 
            label: "Helpful Volunteers", 
            value: stats?.total_volunteers || 0, 
            icon: "volunteer_activism", 
            color: "text-emerald-500",
            desc: "People ready to help" 
        },
        { 
            label: "Finished Projects", 
            value: stats?.total_projects || 0, 
            icon: "task_alt", 
            color: "text-blue-500",
            desc: "Successfully finished work" 
        },
        { 
            label: "Help Shared", 
            value: stats?.total_items || 0, 
            icon: "inventory_2", 
            color: "text-orange-500",
            desc: "Items given to others" 
        },
    ];

    const StatCard = ({ metric, idx, loading }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            className="group relative bg-white border border-black/5 p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 mb-6 group-hover:scale-110 transition-transform duration-500 ${metric.color}`}>
                <span className="material-symbols-outlined text-3xl">{metric.icon}</span>
            </div>
            <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                    {loading ? (
                        <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-xl mb-2" />
                    ) : (
                        <span className="text-4xl font-black text-[#142424]">
                            {metric.value}
                        </span>
                    )}
                </div>
                <h3 className="text-sm font-black text-on_surface_variant uppercase tracking-widest">{metric.label}</h3>
                <p className="text-xs text-on_surface_variant opacity-60 font-medium">{metric.desc}</p>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] selection:bg-primary/10 font-outfit">
            <PublicNavbar />

            <main className="pt-32 pb-24">
                {/* 🌟 HERO SECTION */}
                <section className="relative px-6 pt-16 pb-20 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[100px]" />
                    </div>

                    <div className="max-w-5xl mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em]"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Live Community Impact
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-[#142424] leading-[1.1] tracking-tight"
                        >
                            Witness the Power of <br />
                            <span className="bg-primaryGradient bg-clip-text text-transparent italic">Collective Compassion</span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-on_surface_variant max-w-2xl mx-auto font-medium"
                        >
                            Every number below represents a life touched, a hunger satisfied, or a community strengthened. 
                            Transparency is our promise; impact is our purpose.
                        </motion.p>
                    </div>
                </section>

                {/* 📊 STATS GRID */}
                <section className="px-6 -mt-10">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {metrics.map((metric, idx) => (
                            <StatCard key={metric.label} metric={metric} idx={idx} loading={loading} />
                        ))}
                    </div>
                </section>

                {/* ✨ RECENT ACTIVITIES */}
                <section className="px-6 py-24">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-black text-[#142424]">Impact Feed</h2>
                            <p className="text-on_surface_variant font-medium">Ongoing and recently completed community efforts.</p>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                [1,2,3].map(i => <div key={i} className="h-28 bg-gray-50/50 animate-pulse rounded-[2.5rem] border border-black/5" />)
                            ) : stats?.recent_activity?.length > 0 ? (
                                stats.recent_activity.map((activity, idx) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="flex items-center gap-6 p-6 md:p-8 bg-white border border-black/5 rounded-[2.5rem] hover:border-primary/20 transition-colors group"
                                    >
                                        <div className="hidden md:flex w-16 h-16 rounded-full bg-primary/5 flex-shrink-0 items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined">{activity.status === "Realized" ? "auto_awesome" : "clock_loader_40"}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <h4 className="text-lg font-black text-[#142424] group-hover:text-primary transition-colors">
                                                    {activity.title}
                                                </h4>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${activity.status === "Realized" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-on_surface_variant mt-1 font-medium opacity-70">
                                                By <span className="text-on_surface font-bold">{activity.org_name}</span> • {activity.impact}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-on_surface_variant font-medium opacity-50 italic">
                                    New impact stories are unfolding right now. Check back soon!
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LiveInsight;

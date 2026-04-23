import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { formatExternalUrl } from "../../utils/urlUtils";

// Shared UI Components
import PublicNavbar from "../../components/PublicNavbar";
import Footer from "../../components/Footer";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const NGONetwork = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            const res = await API.get("/organizations/public");
            setOrganizations(res.data || []);
        } catch (err) {
            console.error("Failed to fetch NGO data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredOrgs = organizations.filter(org => 
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        (org.description && org.description.toLowerCase().includes(search.toLowerCase()))
    );

    const skeletonLayout = [
        { type: 'grid', cols: 3, item: { type: 'rect', height: 400, className: "rounded-[3rem]" } }
    ];

    return (
        <div className="min-h-screen bg-surface selection:bg-primary/10">
            <PublicNavbar />

            <main className="pt-24">
                {/* 🌟 HERO SECTION */}
                <section className="relative pt-16 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primaryGradient opacity-5 blur-[120px] -z-10" />
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        Community Directory
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-outfit font-black text-on_surface tracking-tight leading-[0.95]"
                    >
                        Our Growing <br/>
                        <span className="text-primary bg-clip-text text-transparent bg-primaryGradient italic">NGO Network</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-on_surface_variant max-w-2xl leading-relaxed font-medium"
                    >
                        Discover the verified non-profits and community groups working with Sahyog Sync to distribute resources and provide aid effectively.
                    </motion.p>
                </div>
            </section>

            {/* 🔍 SEARCH & FILTER */}
            <section className="sticky top-[100px] z-[50] px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 flex items-center gap-4 px-6">
                            <span className="material-symbols-outlined text-primary font-black">search</span>
                            <input 
                                type="text" 
                                placeholder="Search our community partners by name or specialty..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full py-4 bg-transparent outline-none text-sm font-bold text-on_surface placeholder-on_surface_variant/30"
                            />
                        </div>
                        <div className="px-8 py-4 bg-surface_high rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-on_surface_variant flex items-center gap-3">
                            <span className="material-symbols-outlined text-sm">public</span>
                            {organizations.length} Partners Verified
                        </div>
                    </div>
                </div>
            </section>

            {/* 📦 NGO GRID */}
            <section className="max-w-7xl mx-auto px-6 py-20 pb-40">
                {loading ? (
                    <SkeletonStructure layout={skeletonLayout} />
                ) : filteredOrgs.length === 0 ? (
                    <div className="text-center py-40 bg-surface_high/30 rounded-[3.5rem] border-2 border-dashed border-white/20">
                        <span className="material-symbols-outlined text-6xl opacity-10 mb-4">person_search</span>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">No matching partners found in this area</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredOrgs.map((org, i) => (
                                <motion.div
                                    key={org.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group bg-white/60 backdrop-blur-md rounded-[3rem] p-10 border border-white hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-primaryGradient group-hover:text-white transition-all duration-500 mb-8 shadow-inner shadow-primary/5">
                                            <span className="material-symbols-outlined text-4xl font-black italic">
                                                {org.name.includes("Medical") || org.name.includes("Health") ? "health_and_safety" :
                                                 org.name.includes("Food") || org.name.includes("Hunger") ? "restaurant" : "volunteer_activism"}
                                            </span>
                                        </div>
                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-outfit font-black text-on_surface tracking-tight truncate leading-none mb-1">{org.name}</h3>
                                                {org.status === "VERIFIED" && (
                                                    <span className="material-symbols-outlined text-primary text-lg fill-current">verified</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-on_surface_variant leading-relaxed font-medium line-clamp-3 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                                "{org.description || "A dedicated partner working to improve community welfare through strategic resource distribution and direct aid programs."}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3 pt-6 border-t border-on_surface/5">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-xs text-primary">mail</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-on_surface/60 truncate">{org.contact_email}</span>
                                            </div>
                                            {org.website_url && (
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-xs text-primary">public</span>
                                                    <a href={formatExternalUrl(org.website_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Official Site</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>
            </main>
            <Footer />
        </div>
    );
};

export default NGONetwork;

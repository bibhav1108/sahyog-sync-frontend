import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import DataRow from "../../../components/shared/DataRow";

const StaffControlPage = () => {
    const [org, setOrg] = useState(null);
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Create member state
    const [showAdd, setShowAdd] = useState(false);
    const [newMember, setNewMember] = useState({ full_name: "", email: "", password: "" });
    const [adding, setAdding] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const [orgRes, usersRes] = await Promise.all([
                    API.get("/organizations/me").catch(() => ({ data: null })),
                    API.get("/users/").catch(() => ({ data: [] }))
                ]);
                
                setOrg(orgRes.data);
                if (usersRes.data) {
                    setCoordinators(usersRes.data.filter(u => u.role === "NGO_COORDINATOR"));
                }
            } catch (err) {
                console.error("Staff load failed", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            await API.post("/ngo-admin/coordinators", newMember);
            addToast(`Personnel credential authorized for ${newMember.full_name}.`, "success");
            setShowAdd(false);
            setNewMember({ full_name: "", email: "", password: "" });
            
            // Refresh list
            const usersRes = await API.get("/users/");
            setCoordinators(usersRes.data.filter(u => u.role === "NGO_COORDINATOR"));
        } catch (err) {
            addToast(err.response?.data?.detail || "Credential authorization failed", "error");
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <SkeletonStructure layout={[{type: 'rect', height: 400, className: "rounded-[3rem]"}]} />;

    const isLocked = org?.status !== 'active';

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-on_surface tracking-tight">Manage Your Team</h1>
                    <p className="text-on_surface_variant max-w-lg font-medium leading-relaxed">
                        Add and manage coordinators who can manage campaigns and field work.
                    </p>
                </div>

                {!isLocked && (
                    <button 
                        onClick={() => setShowAdd(true)}
                        className="px-6 py-3.5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Add Coordinator
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {isLocked && (
                    <div className="p-12 rounded-[2.5rem] bg-amber-500/5 border border-dashed border-amber-500/20 text-center space-y-3">
                        <span className="material-symbols-outlined text-4xl text-amber-600 animate-pulse">lock</span>
                        <h3 className="text-lg font-bold text-on_surface">Verification Required</h3>
                        <p className="text-xs text-on_surface_variant max-w-sm mx-auto font-medium">
                            You can add coordinators once your organization has been verified by our admin team.
                        </p>
                    </div>
                )}

                {!isLocked && coordinators.length === 0 && (
                    <div className="py-24 text-center space-y-4 bg-white rounded-3xl border border-on_surface/5 shadow-inner">
                        <span className="material-symbols-outlined text-5xl text-on_surface_variant opacity-20">groups</span>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-on_surface">No coordinators found</p>
                            <p className="text-xs text-on_surface_variant font-medium">Click "Add Coordinator" to invite your first team member.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coordinators.map(c => (
                        <motion.div 
                            key={c.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-3xl bg-white border border-on_surface/5 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-on_surface/5 flex items-center justify-center text-on_surface/20 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-2xl">person</span>
                                </div>
                                <div className="px-2 py-1 bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg">Active Member</div>
                            </div>
                            <h4 className="text-base font-bold text-on_surface truncate">{c.full_name}</h4>
                            <p className="text-[11px] text-on_surface_variant font-medium opacity-60 truncate">{c.email}</p>
                            <div className="mt-6 pt-6 border-t border-on_surface/5 flex justify-between items-center">
                                <span className="text-[9px] font-black text-on_surface_variant/40 uppercase tracking-widest">Coordinator</span>
                                <button className="text-red-500/40 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ADD MEMBER MODAL */}
            <AnimatePresence>
                {showAdd && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAdd(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10 overflow-hidden"
                        >
                            <header className="mb-8 text-center">
                                <h2 className="text-2xl font-bold text-on_surface uppercase tracking-tight">Add Coordinator</h2>
                                <p className="text-on_surface_variant mt-1 text-xs font-medium">Create login credentials for your team member.</p>
                            </header>

                            <form onSubmit={handleAdd} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Full Name</label>
                                    <input 
                                        required
                                        className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl outline-none"
                                        value={newMember.full_name}
                                        onChange={e => setNewMember({...newMember, full_name: e.target.value})}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Email Address</label>
                                    <input 
                                        required
                                        type="email"
                                        className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl outline-none"
                                        value={newMember.email}
                                        onChange={e => setNewMember({...newMember, email: e.target.value})}
                                        placeholder="email@organization.org"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-4">Password</label>
                                    <input 
                                        required
                                        type="password"
                                        className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl outline-none"
                                        value={newMember.password}
                                        onChange={e => setNewMember({...newMember, password: e.target.value})}
                                        placeholder="Min 8 characters"
                                    />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAdd(false)}
                                        className="flex-1 py-4 bg-surface_high text-on_surface text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-on_surface/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        disabled={adding}
                                        type="submit"
                                        className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                                    >
                                        {adding ? "Adding..." : "Add Coordinator"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffControlPage;

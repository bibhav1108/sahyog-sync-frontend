import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";

const StaffControlPage = () => {
    const [org, setOrg] = useState(null);
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
            addToast(`${newMember.full_name} has been added to the team.`, "success");
            setShowAdd(false);
            setNewMember({ full_name: "", email: "", password: "" });
            
            const usersRes = await API.get("/users/");
            setCoordinators(usersRes.data.filter(u => u.role === "NGO_COORDINATOR"));
        } catch (err) {
            addToast(err.response?.data?.detail || "Failed to add member", "error");
        } finally {
            setAdding(false);
        }
    };

    if (loading) return (
        <div className="space-y-10">
            <SkeletonStructure layout={[{type: 'row', gap: 6, cols: [{type: 'stack', items: [{type: 'text', width: '40%'}, {type: 'text', width: '20%'}]}]}]} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => <SkeletonStructure key={i} layout={[{type: 'rect', height: 200, className: "rounded-[2.5rem]"}]} />)}
            </div>
        </div>
    );

    const isLocked = org?.status !== 'APPROVED';

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-20 font-outfit selection:bg-primary/20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
                <div className="space-y-2">
                    <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
                        Staff Management
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-on_surface tracking-tight">Team Management</h1>
                    <p className="text-sm md:text-base text-on_surface_variant max-w-md font-medium leading-relaxed opacity-60">
                        Manage your staff and coordinate daily portal operations.
                    </p>
                </div>

                {!isLocked && (
                    <button 
                        onClick={() => setShowAdd(true)}
                        className="px-8 py-4 bg-primaryGradient text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 active:scale-95 group"
                    >
                        <span className="material-symbols-outlined text-xl">person_add</span>
                        Add Coordinator
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {isLocked ? (
                    <div className="py-24 rounded-2xl bg-white border border-on_surface/5 shadow-soft text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mb-2">
                            <span className="material-symbols-outlined text-3xl">lock</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-on_surface tracking-tight">Access Locked</h3>
                            <p className="text-sm text-on_surface_variant max-w-xs mx-auto font-medium opacity-60 italic">
                                Verification is required before you can invite team members.
                            </p>
                        </div>
                    </div>
                ) : coordinators.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center justify-center space-y-6 bg-white rounded-2xl border border-on_surface/5 shadow-inner px-10">
                        <div className="w-20 h-20 bg-primary/5 rounded-xl flex items-center justify-center text-primary/20">
                            <span className="material-symbols-outlined text-5xl">groups</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-bold text-on_surface">Your team is empty</p>
                            <p className="text-sm text-on_surface_variant font-medium opacity-60 max-w-xs mx-auto">Invite your first coordinator to start working together.</p>
                        </div>
                        <button 
                            onClick={() => setShowAdd(true)}
                            className="bg-primary/10 text-primary px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            Add First Staff
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coordinators.map(c => (
                            <motion.div 
                                key={c.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 rounded-2xl bg-white border border-on_surface/5 shadow-soft hover:shadow-lg transition-all group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-surface_high flex items-center justify-center text-on_surface_variant group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                        <span className="material-symbols-outlined text-2xl">person</span>
                                    </div>
                                    <div className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-500/10">Active</div>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-on_surface truncate tracking-tight">{c.full_name}</h4>
                                    <p className="text-xs text-on_surface_variant font-medium opacity-60 truncate">{c.email}</p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-on_surface/5 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-on_surface_variant/40 uppercase tracking-wider mb-0.5">Role</span>
                                        <span className="text-sm font-bold text-primary uppercase tracking-wider">Coordinator</span>
                                    </div>
                                    <button className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-lg">person_remove</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ADD MEMBER MODAL (PORTAL) */}
            {createPortal(
                <AnimatePresence>
                    {showAdd && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAdd(false)}
                                className="absolute inset-0 bg-black/50 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 font-outfit max-h-[90vh] flex flex-col"
                            >
                                <div className="bg-primaryGradient p-8 text-white shrink-0 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl -mr-16 -mt-16" />
                                     <h3 className="text-2xl font-black tracking-tight relative z-10">Add Staff Member</h3>
                                     <p className="text-sm font-bold opacity-60 relative z-10">Expanding your team capabilities.</p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                    <form onSubmit={handleAdd} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60 ml-1">Full Name</label>
                                            <input 
                                                required
                                                className="w-full px-5 py-4 bg-surface_high text-sm font-bold text-on_surface border-2 border-transparent focus:border-primary transition-all rounded-2xl outline-none"
                                                value={newMember.full_name}
                                                onChange={e => setNewMember({...newMember, full_name: e.target.value})}
                                                placeholder="Enter full name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60 ml-1">Work Email</label>
                                            <input 
                                                required
                                                type="email"
                                                className="w-full px-5 py-4 bg-surface_high text-sm font-bold text-on_surface border-2 border-transparent focus:border-primary transition-all rounded-2xl outline-none"
                                                value={newMember.email}
                                                onChange={e => setNewMember({...newMember, email: e.target.value})}
                                                placeholder="email@organization.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60 ml-1">Temporary Password</label>
                                            <input 
                                                required
                                                type="password"
                                                className="w-full px-5 py-4 bg-surface_high text-sm font-bold text-on_surface border-2 border-transparent focus:border-primary transition-all rounded-2xl outline-none"
                                                value={newMember.password}
                                                onChange={e => setNewMember({...newMember, password: e.target.value})}
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <div className="pt-6">
                                            <button 
                                                disabled={adding}
                                                type="submit"
                                                className="w-full py-4 bg-primaryGradient text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {adding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Add Coordinator"}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <button 
                                    onClick={() => setShowAdd(false)}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-white hover:bg-black/20 transition-all z-10"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default StaffControlPage;

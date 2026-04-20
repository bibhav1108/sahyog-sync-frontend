import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../../../services/api";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";

const NGOAdminDashboard = () => {
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await API.get("/organizations/me");
                setOrg(res.data);
            } catch (err) {
                console.error("Failed to load org", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    if (loading) return <SkeletonStructure layout={[{type: 'rect', height: 200, className: "rounded-3xl"}]} />;

    if (!org) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-4xl">corporate_fare</span>
                </div>
                <h2 className="text-2xl font-bold text-on_surface uppercase tracking-tight">Setup Your NGO</h2>
                <p className="text-on_surface_variant max-w-sm font-medium">
                    You haven't setup your NGO profile yet. Complete the onboarding to start managing your team.
                </p>
                <button 
                    onClick={() => window.location.href='/ngo-admin/identity'}
                    className="px-8 py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    Complete NGO Profile
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* WELCOME BANNER */}
            <header className="relative p-8 md:p-12 rounded-3xl bg-white border border-on_surface/5 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primaryGradient opacity-[0.05] blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-black text-on_surface tracking-tight">
                            Welcome, <span className="text-primary italic">NGO Admin</span>.
                        </h1>
                        <p className="text-on_surface_variant max-w-lg font-medium leading-relaxed">
                            Manage your organization details and coordinate your team members from this central dashboard.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-on_surface_variant/40 uppercase tracking-widest">Organization Name</span>
                        <div className="text-lg font-bold text-on_surface tracking-tight">
                            {org.name}
                        </div>
                    </div>
                </div>
            </header>

            {/* STATUS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard 
                    label="NGO Status" 
                    value={org.status === 'active' ? 'Verified' : 'Pending Approval'} 
                    icon={org.status === 'active' ? 'verified_user' : 'schedule'} 
                    color={org.status === 'active' ? 'text-green-600' : 'text-amber-600'}
                />
                <StatusCard 
                    label="Organization Type" 
                    value="NGO" 
                    icon="corporate_fare" 
                    color="text-primary"
                />
                <StatusCard 
                    label="Portal Access" 
                    value="Administrator" 
                    icon="admin_panel_settings" 
                    color="text-blue-600"
                />
            </div>

            {/* ACTION DIRECTIVES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4 p-8 rounded-3xl bg-white border border-on_surface/5 shadow-sm">
                    <div className="w-12 h-12 bg-on_surface/5 text-on_surface rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">edit_note</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">NGO Profile</h3>
                    <p className="text-sm text-on_surface_variant leading-relaxed mb-6">
                        Update your organization's bio, contact information, and website details.
                    </p>
                    <button 
                        onClick={() => window.location.href='/ngo-admin/identity'}
                        className="w-full py-3.5 bg-on_surface/5 text-on_surface rounded-xl text-[11px] font-black uppercase tracking-widest mt-2 hover:bg-on_surface/10 transition-all active:scale-95"
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="space-y-4 p-8 rounded-3xl bg-primary/5 border border-primary/10 text-primary shadow-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">groups</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Team Management</h3>
                    <p className="text-primary/70 text-sm leading-relaxed font-medium">
                        Add and manage coordinators who will help run your organization's daily operations.
                    </p>
                    <button 
                         onClick={() => window.location.href='/ngo-admin/staff'}
                         className="w-full py-3.5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest mt-2 hover:shadow-lg transition-all active:scale-95"
                    >
                        Manage Team
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatusCard = ({ label, value, icon, color }) => (
    <div className="p-6 rounded-2xl bg-white border border-on_surface/5 shadow-sm space-y-2 group hover:shadow-md transition-all">
        <div className={`w-10 h-10 rounded-xl bg-on_surface/5 flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        <div>
            <p className="text-[10px] font-black text-on_surface_variant/40 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-lg font-bold tracking-tight ${color}`}>{value}</p>
        </div>
    </div>
);

export default NGOAdminDashboard;

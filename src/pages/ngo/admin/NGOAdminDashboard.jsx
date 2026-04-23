import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../../services/api";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import { motion } from "framer-motion";
import { resolveProfileImage, handleImageError } from "../../../utils/imageUtils";

const NGOAdminDashboard = () => {
    const navigate = useNavigate();
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await API.get("/organizations/me");
                setOrg(res.data);
            } catch (err) {
                if (err.response?.status !== 404) {
                    console.error("Failed to load org", err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    if (loading) return (
        <div className="space-y-10">
            <SkeletonStructure layout={[{type: 'rect', height: 280, className: "rounded-[3rem]"}]} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => <SkeletonStructure key={i} layout={[{type: 'rect', height: 120, className: "rounded-[2rem]"}]} />)}
            </div>
        </div>
    );

    if (!org) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-fadeIn">
                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined text-5xl">corporate_fare</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-on_surface uppercase tracking-tight">Setup Your NGO</h2>
                    <p className="text-on_surface_variant max-w-sm font-medium leading-relaxed">
                        You're almost there! Complete your organization profile to start managing your team and missions.
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/ngo-admin/identity')}
                    className="px-10 py-5 bg-primaryGradient text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
                >
                    Start Onboarding
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-20 font-outfit">
            {/* WELCOME BANNER */}
            <header className="relative p-10 md:p-12 rounded-[2rem] bg-white border border-on_surface/5 shadow-soft overflow-hidden group">
                <div className="absolute inset-0 bg-primaryGradient opacity-[0.01]" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
                            Admin Overview
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black text-on_surface tracking-tight leading-tight">
                            Welcome back, <br/>
                            <span className="text-primary italic">NGO Admin</span>
                        </h1>
                        <p className="text-sm md:text-base text-on_surface_variant max-w-lg font-medium leading-relaxed opacity-60">
                            You are managing <b className="text-on_surface">{org.name}</b>. Use this portal to update your profile and manage your staff.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                        <div className="w-24 h-24 bg-surface_high rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg p-1">
                             {org.logo_url ? (
                                 <img 
                                    src={resolveProfileImage(org.logo_url)} 
                                    alt="NGO Logo" 
                                    className="w-full h-full object-cover rounded-xl"
                                    onError={handleImageError}
                                 />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-primary/20 bg-white rounded-xl">
                                    <span className="material-symbols-outlined text-4xl">corporate_fare</span>
                                 </div>
                             )}
                        </div>
                        <div className="text-right pt-1 hidden md:block">
                            <p className="text-xs font-bold text-on_surface_variant/60 uppercase tracking-wider mb-1">Organization</p>
                            <p className="text-xl font-bold text-on_surface tracking-tight truncate max-w-[200px]">
                                {org.name}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* QUICK STATUS TICKERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard 
                    label="Verification" 
                    value={org.status === 'APPROVED' ? 'Verified' : 'In Review'} 
                    icon={org.status === 'APPROVED' ? 'verified' : 'history_toggle_off'} 
                    color={org.status === 'APPROVED' ? 'text-green-600' : 'text-amber-500'}
                    bgColor={org.status === 'APPROVED' ? 'bg-green-500/5' : 'bg-amber-500/5'}
                />
                <StatusCard 
                    label="My Role" 
                    value="Master Admin" 
                    icon="shield_person" 
                    color="text-primary"
                    bgColor="bg-primary/5"
                />
                <StatusCard 
                    label="Type" 
                    value={org.ngo_type || "NGO"} 
                    icon="account_balance" 
                    color="text-blue-500"
                    bgColor="bg-blue-500/5"
                />
            </div>

            {/* NAVIGATION ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <ActionTile 
                    icon="badge"
                    title="NGO Profile"
                    description="Update the details that volunteers and partners see when browsing your organization."
                    btnLabel="Update Profile"
                    onClick={() => navigate('/ngo-admin/identity')}
                />
                <ActionTile 
                    icon="group_add"
                    title="Staff Management"
                    description="Invite team members to help you manage daily portal operations."
                    btnLabel="Manage Staff"
                    variant="primary"
                    onClick={() => navigate('/ngo-admin/staff')}
                />
            </div>
        </div>
    );
};

const StatusCard = ({ label, value, icon, color, bgColor }) => (
    <div className="p-8 rounded-2xl bg-white border border-on_surface/5 shadow-soft space-y-4 transition-all">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-2xl font-bold">{icon}</span>
        </div>
        <div>
            <p className="text-xs font-bold text-on_surface_variant/60 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
        </div>
    </div>
);

const ActionTile = ({ icon, title, description, btnLabel, onClick, variant }) => (
    <div className={`p-8 md:p-10 rounded-[2rem] border shadow-soft flex flex-col justify-between transition-all ${
        variant === 'primary' 
            ? 'bg-primary/5 border-primary/10 text-on_surface' 
            : 'bg-white border-on_surface/5 text-on_surface'
    }`}>
        <div className="space-y-6">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                variant === 'primary' ? 'bg-primary text-white' : 'bg-on_surface/5 text-on_surface'
            }`}>
                <span className="material-symbols-outlined text-3xl font-bold">{icon}</span>
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
                <p className={`text-sm leading-relaxed font-medium opacity-60 ${variant === 'primary' ? 'text-on_surface' : 'text-on_surface_variant'}`}>
                    {description}
                </p>
            </div>
        </div>
        <button 
            onClick={onClick}
            className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-wider mt-10 transition-all active:scale-95 bg-primaryGradient text-white shadow-lg shadow-primary/20`}
        >
            {btnLabel}
        </button>
    </div>
);

export default NGOAdminDashboard;

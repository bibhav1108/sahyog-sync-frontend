import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";
import React from "react";
import SkeletonStructure from "./shared/SkeletonStructure";
import { resolveProfileImage, handleImageError } from "../utils/imageUtils";
import { useToast } from "../context/ToastContext";
import VerificationBadge from "./shared/VerificationBadge";

const NGO_ADMIN_NAV_ITEMS = [
  { to: "/ngo-admin/dashboard", label: "Overview", icon: "dashboard" },
  { to: "/ngo-admin/identity", label: "NGO Profile", icon: "corporate_fare" },
  { to: "/ngo-admin/staff", label: "Team Management", icon: "groups" },
  { to: "/ngo/dashboard", label: "Staff Dashboard", icon: "rocket_launch", exitPortal: true },
];

const NGOAdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const { addToast } = useToast();

  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, orgRes] = await Promise.all([
          API.get("/users/me"),
          API.get("/organizations/me").catch(() => ({ data: null }))
        ]);
        setUser(userRes.data);
        setOrg(orgRes.data);
      } catch (err) {
        console.error("Failed to load admin profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    const handleSync = () => loadData();
    window.addEventListener('user-profile-updated', handleSync);
    return () => window.removeEventListener('user-profile-updated', handleSync);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-profile-dropdown]")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on_surface antialiased overflow-x-hidden selection:bg-primary/10 font-outfit">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[990] bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[999] flex h-screen w-64 flex-col border-r border-white/5 bg-surface/95 px-5 pb-6 pt-8 shadow-soft backdrop-blur-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          <div 
             onClick={() => setSidebarOpen(false)} 
             className="flex flex-col items-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
          >
             <span className="text-xs font-bold text-primary tracking-wider uppercase mb-2 opacity-50">Admin Management</span>
             <img src={logo} className="w-40" alt="Sahyog Sync" />
          </div>
        </div>

        <nav className="flex-1 space-y-1 text-sm overflow-y-auto custom-scrollbar pr-1">
          {NGO_ADMIN_NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            const isApproved = org?.status === "APPROVED";
            const isDisabled = item.exitPortal && !isApproved;

            if (isDisabled) {
              return (
                <div key={item.to} className="space-y-4 mt-12 pb-4">
                  <div className="flex items-center gap-2 px-3">
                     <span className="h-px bg-white/5 flex-1" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/30">Operations</span>
                     <span className="h-px bg-white/5 flex-1" />
                  </div>
                  <div
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 opacity-30 cursor-not-allowed bg-white/5 text-on_surface_variant border border-white/5"
                    title="Your NGO must be approved before accessing the mission dashboard"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span className="font-medium">
                      {item.label}
                    </span>
                    <span className="material-symbols-outlined text-[14px] ml-auto opacity-30">lock</span>
                  </div>
                </div>
              );
            }

            return (
              <React.Fragment key={item.to}>
                {item.exitPortal && (
                   <div className="flex items-center gap-2 px-3 mt-12 mb-4">
                      <span className="h-px bg-white/5 flex-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/30">Operations</span>
                      <span className="h-px bg-white/5 flex-1" />
                   </div>
                )}
                <Link
                  to={active ? "#" : item.to}
                  onClick={() => {
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group ${
                    active
                      ? "scale-[1.02] bg-primary/15 text-primary shadow-soft"
                      : item.exitPortal 
                        ? "bg-primaryGradient text-white shadow-lg shadow-primary/30 border-none"
                        : "text-on_surface_variant hover:scale-[1.01] hover:bg-white/5 hover:text-on_surface"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] transition-colors ${active ? "text-primary" : "text-on_surface_variant group-hover:text-primary"}`}>
                    {item.icon}
                  </span>
                  <span className={`${active ? "font-semibold" : "font-medium"}`}>
                    {item.label}
                  </span>
                  {item.exitPortal && (
                      <span className="material-symbols-outlined text-sm ml-auto opacity-30 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
            <button
            onClick={logout}
            className="flex items-center justify-center gap-3 w-full rounded-xl bg-red-500/10 p-4 text-xs font-bold uppercase tracking-wider text-red-500 transition hover:bg-red-500/20 active:scale-95"
            >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Log out
            </button>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`fixed top-0 right-0 z-[980] flex h-16 items-center justify-between border-b border-white/5 bg-surface/80 px-4 md:px-6 shadow-soft backdrop-blur-md transition-all duration-300 ${
          sidebarOpen ? "md:left-64 left-0" : "left-0"
        }`}
      >
        <div className="flex items-center gap-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-on_surface_variant hover:bg-white/5 hover:text-on_surface transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          )}
          
          <div className="hidden lg:flex items-center gap-2 overflow-hidden truncate">
            <span className="text-on_surface_variant/60 text-xs uppercase tracking-wider font-bold shrink-0">Admin Portal</span>
            <span className="material-symbols-outlined text-xs text-on_surface_variant/40 shrink-0">chevron_right</span>
            <span className="text-sm font-bold text-on_surface uppercase tracking-wider truncate">
                {NGO_ADMIN_NAV_ITEMS.find(i => i.to === location.pathname)?.label || "Administration"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {!loading && org && (
                <div className={`hidden min-[500px]:flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 ${
                    org.status === 'APPROVED' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                    {org.status === 'APPROVED' ? 'Verified Partner' : 'Review In Progress'}
                </div>
            )}

            <div className="relative" data-profile-dropdown>
                {loading ? (
                    <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                ) : (
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 rounded-xl bg-surface_high p-1 pr-1.5 sm:pr-4 transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 border border-white/10"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/10 shadow-soft shrink-0">
                            <img 
                                src={resolveProfileImage(user?.profile_image_url)} 
                                alt="admin-pfp" 
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                            />
                        </div>
                        <div className="flex flex-col items-start leading-none hidden sm:flex">
                            <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                                <span className="truncate">{user?.full_name?.split(' ')[0] || "Admin"}</span>
                                <VerificationBadge trustTier={user?.trust_tier} />
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-on_surface_variant">expand_more</span>
                    </button>
                )}

                {profileOpen && user && (
                    <div className="absolute right-0 mt-3 w-64 rounded-xl border border-white/5 bg-surface_lowest p-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)] animate-[fadeIn_0.2s_ease] z-[1000] origin-top-right">
                        <div className="absolute right-6 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-white/5 bg-surface_lowest" />
                        
                        <div className="flex items-center gap-3 p-2">
                             <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10 shadow-soft">
                                <img src={resolveProfileImage(user.profile_image_url)} alt="pfp" className="w-full h-full object-cover" />
                             </div>
                             <div className="min-w-0">
                                <div className="flex items-center gap-2 font-semibold">
                                    <p className="truncate">{user.full_name}</p>
                                    <VerificationBadge trustTier={user.trust_tier} />
                                </div>
                                <p className="truncate text-xs text-on_surface_variant uppercase tracking-wider font-bold opacity-60">Admin</p>
                             </div>
                        </div>

                        <div className="mt-2 border-t border-white/5 pt-2 space-y-1">
                            <Link to="/ngo-admin/profile" onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-on_surface_variant hover:bg-white/5 hover:text-on_surface transition-colors">
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Log out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 min-h-screen ${
          sidebarOpen ? "md:ml-64 ml-0" : "ml-0"
        }`}
      >
        {org?.status === "pending" && (
          <div 
            className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
              <p className="text-sm font-medium text-primary">
                <b>Organization Verification Pending:</b> Some dashboard features are restricted until an administrator approves your profile.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-3 py-1.5 rounded-full hover:bg-primary_container transition shadow-sm"
            >
              Refresh
            </button>
          </div>
        )}
        <div className="p-3 sm:p-6 md:p-10 max-w-7xl mx-auto">
          {children && React.cloneElement(children, { sidebarOpen })}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NGOAdminLayout;

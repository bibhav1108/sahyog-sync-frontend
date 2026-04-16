import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";
import React from "react";
import SkeletonStructure from "./shared/SkeletonStructure";
import { resolveProfileImage } from "../utils/imageUtils";

const ADMIN_NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Overview", icon: "dashboard" },
  { to: "/admin/organizations", label: "Organizations", icon: "corporate_fare" },
  { to: "/admin/volunteers", label: "Volunteers", icon: "groups" },
  { to: "/admin/reviews", label: "Reviews", icon: "reviews" },
  { to: "/admin/issues", label: "System Issues", icon: "bug_report" },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load admin profile", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadProfile();

    const handleSync = () => loadProfile();
    window.addEventListener('user-profile-updated', handleSync);
    return () => window.removeEventListener('user-profile-updated', handleSync);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface text-on_surface antialiased overflow-x-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[990] bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[999] flex h-screen w-64 flex-col border-r border-white/5 bg-surface_lowest/95 px-5 pb-6 pt-5 shadow-soft backdrop-blur-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="flex flex-col cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
          >
             <span className="text-xs font-black text-primary tracking-[0.2em] uppercase mb-1">System Admin</span>
             <img src={logo} className="w-32" alt="Sahyog Sync" />
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 text-sm overflow-y-auto custom-scrollbar pr-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 group ${
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-on_surface_variant hover:bg-white/5 hover:text-on_surface"
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${active ? "text-white" : "text-on_surface_variant group-hover:text-primary"}`}>
                  {item.icon}
                </span>
                <span className={`tracking-wide ${active ? "font-bold" : "font-semibold"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
            <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl bg-red-500/10 p-3 text-sm font-bold text-red-500 transition hover:bg-red-500/20 hover:scale-[1.02]"
            >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Exit Portal
            </button>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`fixed top-0 right-0 z-[980] flex h-16 items-center justify-between border-b border-white/5 bg-surface/80 px-4 md:px-8 shadow-soft backdrop-blur-md transition-all duration-300 ${
          sidebarOpen ? "md:left-64 left-0" : "left-0"
        }`}
      >
        <div className="flex items-center gap-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-on_surface_variant hover:bg-white/5 hover:text-on_surface transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          )}
          
          <div className="flex flex-col">
            <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-on_surface_variant/60">
                <span>Portal Control</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-primary">Admin</span>
            </div>
            <h1 className="text-sm font-black text-on_surface uppercase tracking-tight">
                {ADMIN_NAV_ITEMS.find(i => i.to === location.pathname)?.label || "Administration"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="relative">
                {loadingUser ? (
                    <SkeletonStructure layout={[{type: 'rect', height: 40, width: 40, className: "rounded-xl"}]} />
                ) : (
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-3 group"
                    >
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-xs font-black text-on_surface">{user?.full_name || "Admin"}</span>
                            <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded mt-1">System Admin</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 ring-2 ring-primary/20 transition-transform group-hover:scale-105">
                            <img 
                                src={resolveProfileImage(user?.profile_image_url)} 
                                alt="admin-pfp" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </button>
                )}

                {profileOpen && user && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-surface_lowest p-2 shadow-2xl animate-[fadeIn_0.2s_ease] z-[100]">
                        <div className="absolute right-5 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-white/10 bg-surface_lowest" />
                        
                        <div className="p-3 border-b border-white/5 mb-2">
                             <p className="text-xs font-black text-primary uppercase tracking-widest mb-1 italic">Security Core</p>
                             <div className="font-bold text-sm truncate">{user.full_name}</div>
                             <div className="text-[10px] text-on_surface_variant truncate font-medium opacity-60">{user.email}</div>
                        </div>

                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Terminate Session
                        </button>
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
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

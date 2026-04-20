import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";
import React from "react";
import SkeletonStructure from "./shared/SkeletonStructure";
import { resolveProfileImage } from "../utils/imageUtils";
import { useToast } from "../context/ToastContext";

const NGO_ADMIN_NAV_ITEMS = [
  { to: "/ngo-admin/dashboard", label: "Overview", icon: "dashboard" },
  { to: "/ngo-admin/identity", label: "NGO Profile", icon: "corporate_fare" },
  { to: "/ngo-admin/staff", label: "Manage Team", icon: "groups" },
  { to: "/ngo/dashboard", label: "Go to Dashboard", icon: "rocket_launch", exitPortal: true },
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

  return (
    <div className="min-h-screen bg-surface text-on_surface antialiased overflow-x-hidden selection:bg-primary/10">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[990] bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[999] flex h-screen w-72 flex-col border-r border-on_surface/5 bg-white px-6 pb-6 pt-5 shadow-soft transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex flex-col px-1">
            <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-1">NGO Admin Portal</span>
            <img src={logo} className="w-36 pt-1" alt="Sahyog Sync" />
        </div>

        <nav className="flex-1 space-y-1.5 text-sm overflow-y-auto custom-scrollbar pr-1">
          {NGO_ADMIN_NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`flex items-center gap-4 rounded-2xl px-5 py-3.5 transition-all duration-200 group ${
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                    : item.exitPortal 
                      ? "bg-surface_high text-on_surface_variant hover:bg-white hover:text-on_surface mt-10 border border-on_surface/5"
                      : "text-on_surface_variant hover:bg-on_surface/5 hover:text-on_surface"
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${active ? "text-white" : "text-on_surface_variant group-hover:text-primary"}`}>
                  {item.icon}
                </span>
                <span className={`tracking-wide ${active ? "font-bold" : "font-semibold"}`}>
                  {item.label}
                </span>
                {item.exitPortal && (
                    <span className="material-symbols-outlined text-sm ml-auto opacity-30">arrow_forward</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-on_surface/5">
            <button
            onClick={logout}
            className="flex w-full items-center gap-4 rounded-xl bg-red-500/5 p-4 text-sm font-bold text-red-500 transition hover:bg-red-500/10 hover:scale-[1.01]"
            >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
            </button>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`fixed top-0 right-0 z-[980] flex h-16 items-center justify-between border-b border-on_surface/5 bg-white/80 px-6 md:px-8 shadow-soft backdrop-blur-md transition-all duration-300 ${
          sidebarOpen ? "md:left-72 left-0" : "left-0"
        }`}
      >
        <div className="flex items-center gap-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-on_surface_variant hover:bg-on_surface/5 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          )}
          
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-on_surface uppercase tracking-tight">
                {NGO_ADMIN_NAV_ITEMS.find(i => i.to === location.pathname)?.label || "NGO Administration"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {!loading && org && (
                <div className={`hidden sm:flex px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    org.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                }`}>
                    {org.status}
                </div>
            )}

            <div className="relative">
                {loading ? (
                    <div className="w-10 h-10 rounded-xl bg-on_surface/5 animate-pulse" />
                ) : (
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-3 group"
                    >
                        <div className="flex flex-col items-end leading-none hidden sm:flex">
                            <span className="text-xs font-bold text-on_surface">{user?.full_name || "Admin"}</span>
                            <span className="text-[9px] font-black text-on_surface_variant/40 uppercase tracking-widest mt-1">NGO Admin</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-on_surface/5 shadow-sm">
                            <img 
                                src={resolveProfileImage(user?.profile_image_url)} 
                                alt="admin-pfp" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </button>
                )}

                {profileOpen && user && (
                    <div className="absolute right-0 mt-4 w-64 rounded-2xl border border-on_surface/5 bg-white p-2 shadow-2xl animate-[fadeIn_0.2s_ease] z-[100]">
                        <div className="absolute right-6 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-on_surface/5 bg-white" />
                        
                        <div className="p-3 border-b border-on_surface/5 mb-2">
                             <div className="font-bold text-sm truncate text-on_surface">{user.full_name}</div>
                             <div className="text-[10px] text-on_surface_variant truncate font-medium">{user.email}</div>
                        </div>

                        <div className="space-y-1">
                            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-on_surface_variant hover:bg-on_surface/5 rounded-xl transition-all">
                                <span className="material-symbols-outlined text-lg">person</span>
                                Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/5 transition-all mt-1"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-20 min-h-screen ${
          sidebarOpen ? "md:left-72" : ""
        }`}
        style={{ paddingLeft: sidebarOpen ? (window.innerWidth >= 768 ? '18rem' : '0') : '0' }}
      >
        <div className="p-6 md:p-12 max-w-7xl">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NGOAdminLayout;

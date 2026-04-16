import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API, { BACKEND_BASE_URL } from "../../../services/api";
import logo from "../../../assets/logo.png";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import { resolveProfileImage } from "../../../utils/imageUtils";
import VerificationBadge from "../../../components/shared/VerificationBadge";

const VolunteerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load volunteer user profile", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadProfile();

    const handleSync = () => loadProfile();
    window.addEventListener('user-profile-updated', handleSync);
    return () => window.removeEventListener('user-profile-updated', handleSync);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const orgId = localStorage.getItem("org_id");
  const isUnassigned = !orgId || orgId === "null" || orgId === "undefined";

  const navItems = [
    { label: "Dashboard", path: "/volunteer/dashboard", icon: "dashboard" },
    { label: isUnassigned ? "Find NGO" : "My Organization", path: "/volunteer/find-ngo", icon: isUnassigned ? "search" : "corporate_fare" },
  ];

  return (
    <div className="min-h-screen bg-surface flex selection:bg-primary/10 overflow-x-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[990] bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔹 PREMIUM SIDEBAR */}
      <aside className={`fixed left-0 top-0 z-[999] w-72 bg-surface_lowest/80 backdrop-blur-glass border-r border-white/20 p-8 flex flex-col h-screen transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* LOGO AREA */}
          <div 
            className="flex items-center gap-4 mb-12 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
            onClick={() => setSidebarOpen(false)}
          >
            <img src={logo} alt="logo" className="h-16 w-16 object-contain drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="text-xl font-outfit font-bold text-primary leading-none">Sahyog Sync</span>
              <span className="text-[10px] text-on_surface_variant uppercase tracking-[0.2em] mt-1 font-black">Volunteer</span>
            </div>
          </div>

          <nav className="space-y-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group
                    ${isActive 
                        ? "bg-primaryGradient text-white shadow-lg shadow-primary/20" 
                        : "text-on_surface_variant hover:bg-surface_high hover:translate-x-1"
                    }
                  `}
                >
                  <span className={`material-symbols-outlined transition-colors ${isActive ? "text-white" : "text-primary/60 group-hover:text-primary"}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 🔴 LOGOUT SECTION */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full py-4 text-red-500 text-sm font-bold hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Exit Session
          </button>
        </div>
      </aside>

      {/* 🔹 MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarOpen ? "md:ml-72" : "ml-0"
      }`}>
        {/* HEADER BAR */}
        <header className="h-20 bg-surface_lowest/40 backdrop-blur-sm border-b border-white/20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-2 md:gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center rounded-xl p-2 bg-white shadow-sm border border-white hover:bg-surface_high transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-on_surface_variant/40 text-sm">Volunteer</span>
              <span className="material-symbols-outlined text-xs text-on_surface_variant/40">chevron_right</span>
              <span className="text-sm font-bold text-on_surface uppercase tracking-widest text-[11px]">
                  {navItems.find(i => i.path === location.pathname)?.label || "Volunteer Dashboard"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* PROFILE DROPDOWN */}
            <div className="relative">
                {loadingUser ? (
                    <SkeletonStructure layout={[{type: 'row', gap: 2, cols: [{type: 'rect', height: 32, width: 32, className: "rounded-full"}, {type: 'rect', height: 16, width: 80}]}]} />
                ) : (
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 rounded-xl bg-white p-1 pr-2 sm:pr-4 shadow-sm transition-all hover:scale-[1.01] hover:bg-surface_high border border-white"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/10 shadow-sm shrink-0">
                            <img 
                                src={resolveProfileImage(user?.profile_image_url)} 
                                alt="pfp" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col items-start leading-none min-w-0 max-w-[80px] sm:max-w-none">
                            <div className="flex items-center gap-1.5 font-bold text-on_surface text-xs sm:text-sm">
                                <span className="truncate">{user?.full_name?.split(' ')[0] || "Volunteer"}</span>
                                <VerificationBadge trustTier={user?.trust_tier} telegramActive={user?.telegram_active} />
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-on_surface_variant">
                            expand_more
                        </span>
                    </button>
                )}

                {profileOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-surface_lowest p-2 shadow-2xl animate-slide-up z-[100]">
                        <div className="flex items-center gap-3 p-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                                <img 
                                    src={resolveProfileImage(user?.profile_image_url)} 
                                    alt="pfp" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <p className="truncate">{user?.full_name || "Volunteer"}</p>
                                    <VerificationBadge trustTier={user?.trust_tier} telegramActive={user?.telegram_active} />
                                </div>
                                <p className="truncate text-xs text-on_surface_variant">{user?.email}</p>
                            </div>
                        </div>

                        <div className="mt-2 border-t border-white/10 pt-2">
                             <Link
                                to="/volunteer/dashboard"
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-on_surface_variant hover:bg-surface_high hover:text-primary transition-colors"
                                onClick={() => setProfileOpen(false)}
                            >
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                View My Profile
                            </Link>
                            <Link
                                to="/volunteer/reviews"
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-on_surface_variant hover:bg-surface_high hover:text-primary transition-colors mt-1"
                                onClick={() => setProfileOpen(false)}
                            >
                                <span className="material-symbols-outlined text-[20px]">star</span>
                                Review Us
                            </Link>
                            <Link
                                to="/volunteer/contact"
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-on_surface_variant hover:bg-surface_high hover:text-primary transition-colors mt-1"
                                onClick={() => setProfileOpen(false)}
                            >
                                <span className="material-symbols-outlined text-[20px]">support_agent</span>
                                Contact & Support
                            </Link>
                            <Link
                                to="/volunteer/help"
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-on_surface_variant hover:bg-surface_high hover:text-primary transition-colors mt-1"
                                onClick={() => setProfileOpen(false)}
                            >
                                <span className="material-symbols-outlined text-[20px]">help_center</span>
                                Knowledge Base
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-1"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </header>

        <div className="p-10 animate-fadeIn">
            {children}
        </div>
      </main>
    </div>
  );
};

export default VolunteerLayout;

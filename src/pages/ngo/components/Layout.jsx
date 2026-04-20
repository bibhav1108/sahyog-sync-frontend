import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API, { BACKEND_BASE_URL } from "../../../services/api";
import logo from "../../../assets/logo.png";
import pingSound from "../../../assets/ping.mp3";
import React from "react";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import { resolveProfileImage, handleImageError } from "../../../utils/imageUtils";
import VerificationBadge from "../../../components/shared/VerificationBadge";
import { useToast } from "../../../context/ToastContext";

const NAV_ITEMS = [
  { to: "/ngo/dashboard", label: "Overview", icon: "dashboard" },
  { to: "/marketplace", label: "Marketplace", icon: "notifications_active", restricted: true },
  { to: "/collection-hub", label: "Collection Hub", icon: "move_to_inbox", restricted: true },
  { to: "/campaigns", label: "Campaigns", icon: "rocket_launch", restricted: true },
  { to: "/volunteers", label: "Volunteers", icon: "groups", restricted: true },
  { to: "/inventory", label: "Inventory", icon: "inventory_2", restricted: true },
];

const getInitials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const { addToast } = useToast();

  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const prevIdsRef = useRef(new Set());
  const loadingRef = useRef({
    notifications: false,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [userRes, orgRes] = await Promise.all([
          API.get("/users/me"),
          API.get("/organizations/me").catch(() => ({ data: null }))
        ]);
        setUser(userRes.data);
        setOrg(orgRes?.data);

        // STRICT REDIRECT: NGO_ADMIN without org must onboard
        if (userRes.data.role === 'NGO_ADMIN' && !userRes.data.org_id) {
          if (location.pathname !== '/ngo-admin/identity') {
            navigate('/ngo-admin/identity', { replace: true });
          }
        }

      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setLoadingUser(false);
        setLoadingOrg(false);
      }
    };

    loadProfile();

    const handleSync = () => loadProfile();
    window.addEventListener('user-profile-updated', handleSync);
    return () => window.removeEventListener('user-profile-updated', handleSync);
  }, [location.pathname]); // Watch path changes

  const loadNotifications = async () => {
    if (loadingRef.current.notifications) return;
    loadingRef.current.notifications = true;

    try {
      const res = await API.get("/notifications");

      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      const prevIds = prevIdsRef.current;
      const newOnes = sorted.filter((a) => !a.is_read && !prevIds.has(a.id));

      if (newOnes.length > 0) {
        newOnes.forEach((a) => {
          addToast(a.message_body || a.message || "New activity recorded.", "info");
        });
      }

      prevIdsRef.current = new Set(sorted.map((a) => a.id));
      setNotifications(sorted);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      loadingRef.current.notifications = false;
      setLoadingNotifications(false);
    }
  };

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );

    try {
      await API.post(`/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark as read", err);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
      );
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await API.post(`/notifications/mark-all-read`);
    } catch (err) {
      console.error("Failed to mark all as read", err);
      loadNotifications();
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Increased to 10s to optimize performance
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-profile-dropdown]")) {
        setProfileOpen(false);
      }
      if (!e.target.closest("[data-notifications-dropdown]")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  // UI STATE HELPERS
  const storedRole = localStorage.getItem("role");
  const isAdmin = (user?.role || storedRole) === "NGO_ADMIN";

  return (
    <div className="min-h-screen bg-surface text-on_surface antialiased overflow-x-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[990] bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showNotifications && (
        <div
          className="fixed inset-0 z-[900] md:hidden bg-black/10 backdrop-blur-[1px]"
          onClick={() => setShowNotifications(false)}
        />
      )}


      <aside
        className={`fixed left-0 top-0 z-[999] flex h-screen w-64 flex-col border-r border-white/5 bg-surface/95 px-5 pb-6 pt-5 shadow-soft backdrop-blur-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-1">
          <img 
            src={logo} 
            className="w-36 pt-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95" 
            alt="Sahyog Sync" 
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        <nav className="flex-1 space-y-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            const isAdminItem = item.adminOnly;
            const isRestricted = item.restricted && (!org || org.status === "pending") && !isAdmin;
            
            // Hide admin-only items for non-admins
            if (isAdminItem && !isAdmin) return null;

            return (
              <Link
                key={item.label}
                to={isRestricted ? "#" : item.to}
                onClick={(e) => {
                  if (isRestricted) {
                    e.preventDefault();
                    addToast("Verification Required", "info");
                    return;
                  }
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? "scale-[1.02] bg-primary/15 text-primary shadow-soft"
                    : isRestricted 
                      ? "text-on_surface_variant/20 cursor-not-allowed" 
                      : "text-on_surface_variant hover:scale-[1.01] hover:bg-white/5 hover:text-on_surface"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isRestricted ? 'opacity-20' : ''}`}>
                  {item.icon}
                </span>
                <span className={`${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
                {isRestricted && (
                  <span className="material-symbols-outlined text-[14px] ml-auto opacity-30">lock</span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 rounded-xl bg-red-500/10 p-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </aside>

      <header
        className={`fixed top-0 right-0 z-[980] flex h-16 items-center justify-between border-b border-white/5 bg-surface/80 px-4 md:px-6 shadow-soft backdrop-blur-md transition-all duration-300 ${
          sidebarOpen ? "md:left-64 left-0" : "left-0"
        }`}
      >
        <div className="flex flex-1 items-center gap-2 md:gap-4 max-w-xs md:max-w-md">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-on_surface_variant hover:bg-white/5 hover:text-on_surface transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                menu
              </span>
            </button>
          )}


          <div className="hidden min-[400px]:flex items-center gap-2 overflow-hidden truncate">
            <span className="text-on_surface_variant/40 text-[9px] sm:text-sm uppercase tracking-widest font-black shrink-0">NGO Dashboard</span>
            <span className="material-symbols-outlined text-[10px] sm:text-xs text-on_surface_variant/40 shrink-0">chevron_right</span>
            
            {/* Hierarchical Parent Detection */}
            {(() => {
                let parentPrefix = null;
                if (["/alerts", "/needs", "/dispatches", "/marketplace-stats"].includes(location.pathname)) {
                    parentPrefix = { to: "/marketplace", label: "Marketplace" };
                } else if (["/activity-history"].includes(location.pathname)) {
                    parentPrefix = { to: "/ngo/dashboard", label: "Overview" };
                } else if (["/campaign-history"].includes(location.pathname)) {
                    parentPrefix = { to: "/campaigns", label: "Campaigns" };
                }

                if (parentPrefix) {
                    return (
                        <>
                            <Link to={parentPrefix.to} className="text-on_surface_variant hover:text-primary text-[9px] sm:text-sm transition-colors shrink-0 font-medium">{parentPrefix.label}</Link>
                            <span className="material-symbols-outlined text-[10px] sm:text-xs text-on_surface_variant/40 shrink-0">chevron_right</span>
                        </>
                    );
                }
                return null;
            })()}

            <span className="text-sm font-bold text-on_surface uppercase tracking-widest text-[11px] truncate">
                {NAV_ITEMS.find(i => i.to === location.pathname)?.label || 
                 (location.pathname === "/alerts" ? "Alerts" :
                  location.pathname === "/needs" ? "Needs" :
                  location.pathname === "/dispatches" ? "History" :
                  location.pathname === "/activity-history" ? "Activity History" :
                  location.pathname === "/campaign-history" ? "Campaign History" :
                  location.pathname.split("/").pop().replace(/-/g, " ")) || 
                 "Overview"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative" data-notifications-dropdown>
            <button
                onClick={() => {
                setShowNotifications((prev) => !prev);
                setProfileOpen(false);
                }}
                className={`relative rounded-xl p-2 transition-all duration-200 ${
                    showNotifications 
                        ? "bg-primary/10 text-primary" 
                        : "text-on_surface_variant hover:bg-white/5 hover:text-on_surface"
                }`}
            >
                <span className="material-symbols-outlined">
                notifications_active
                </span>
                {!loadingNotifications && unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
                )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
                <div className="fixed sm:absolute inset-x-5 sm:inset-x-auto sm:right-0 top-[72px] sm:top-full sm:mt-3 sm:w-96 max-h-[500px] flex flex-col rounded-3xl border border-white/10 bg-surface_lowest/95 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.5)] z-[1000] animate-fadeIn origin-top-right sm:origin-[calc(100%-16px)_0]">
                    {/* Caret (Arrow) */}
                    <div className="absolute right-5 sm:right-4 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-white/10 bg-surface_lowest shadow-[-5px_-5px_10px_rgba(0,0,0,0.1)]" />

                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
                        <h2 className="text-sm font-bold">Notifications</h2>
                        <div className="flex items-center gap-4">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition"
                                >
                                    Clear All
                                </button>
                            )}
                            <button onClick={() => setShowNotifications(false)} className="material-symbols-outlined text-[20px] opacity-40 hover:opacity-100 transition">close</button>
                        </div>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {loadingNotifications ? (
                            <SkeletonStructure layout={[{type: 'stack', gap: 3, items: Array(3).fill({type: 'rect', height: 80, className: "rounded-2xl"})}]} />
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-on_surface_variant">
                                <span className="material-symbols-outlined text-[40px] mb-2 opacity-50">
                                    notifications_off
                                </span>
                                <p className="text-sm font-medium">No new alerts</p>
                            </div>
                        ) : (
                            notifications.map((a) => (
                                <div
                                    key={a.id}
                                    onClick={() => {
                                        handleMarkRead(a.id, a.is_read);
                                        navigate("/marketplace");
                                        setShowNotifications(false);
                                    }}
                                    className={`cursor-pointer rounded-2xl p-4 shadow-sm border border-white/5 transition hover:scale-[1.01] ${
                                        a.is_read ? "bg-surface/50 opacity-60" : "bg-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-bold text-primary italic uppercase tracking-wider">
                                            {a.title || "Donation Alert"}
                                        </p>
                                        {!a.is_read && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <p className="text-sm text-on_surface leading-relaxed line-clamp-2">
                                        {a.message_body || a.message || "New activity recorded."}
                                    </p>
                                    <p className="mt-2 text-[10px] text-on_surface_variant font-medium opacity-50">
                                        {new Date(a.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
          </div>

          {/* Combined Profile & Settings Dropdown */}
          <div className="relative" data-profile-dropdown>
            {loadingUser ? (
              <SkeletonStructure layout={[{type: 'row', gap: 2, cols: [{type: 'rect', height: 32, width: 32, className: "rounded-full"}, {type: 'rect', height: 16, width: 80}]}]} />
            ) : (
              user && (
                <button
                  onClick={() => {
                    setProfileOpen((p) => !p);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-surface_high p-1 pr-1.5 sm:pr-4 transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/10 shadow-soft shrink-0">
                    <img 
                      src={resolveProfileImage(user.profile_image_url)} 
                      alt="pfp" 
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="flex flex-col items-start leading-none min-w-0 max-w-[80px] sm:max-w-none">
                    <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                      <span className="truncate">{user.full_name?.split(' ')[0] || "User"}</span>
                      <VerificationBadge trustTier={user.trust_tier} telegramActive={user.telegram_active} />
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-on_surface_variant">
                    expand_more
                  </span>
                </button>
              )
            )}

            {profileOpen && user && (
              <div className="absolute right-0 mt-3 w-64 rounded-xl border border-white/5 bg-surface_lowest p-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)] animate-[fadeIn_0.2s_ease]">
                <div className="absolute right-6 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-white/5 bg-surface_lowest" />

                {/* User Info Section */}
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10 shadow-soft">
                    <img 
                      src={resolveProfileImage(user.profile_image_url)} 
                      alt="pfp" 
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-semibold">
                      <p className="truncate">{user.full_name || "User"}</p>
                      <VerificationBadge trustTier={user.trust_tier} telegramActive={user.telegram_active} />
                    </div>
                    <p className="truncate text-xs text-on_surface_variant">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Settings & Options List */}
                <div className="mt-2 border-t border-white/5 pt-2 space-y-1">
                  {isAdmin && (
                    <Link
                       to="/ngo-admin/dashboard"
                       onClick={() => setProfileOpen(false)}
                       className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-black text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                       <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                       Exit to Admin Portal
                    </Link>
                  )}
                  {[
                    { label: "Profile", icon: "person", to: "/profile" },
                    { label: "Review Us", icon: "star", to: "/reviews" },
                    { label: "Contact Us", icon: "support_agent", to: "/contact" },
                    { label: "Help Center", icon: "help", to: "/help" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-on_surface_variant hover:bg-white/5 hover:text-on_surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Logout Section */}
                <div className="mt-2 border-t border-white/5 pt-2">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      logout
                    </span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main
        className={`transition-all duration-300 pt-16 ${
          sidebarOpen ? "md:ml-64 ml-0" : "ml-0"
        }`}
      >
        {org?.status === "pending" && (
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between">
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
        <div className="p-3 sm:p-6 min-w-0">
          {children && React.cloneElement(children, { sidebarOpen })}
        </div>
      </main>



      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;

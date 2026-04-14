import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API, { BACKEND_BASE_URL } from "../services/api";
import logo from "../assets/logo.png";
import pingSound from "../assets/ping.mp3";
import React from "react";
import Skeleton from "../components/Skeleton";
import { resolveProfileImage } from "../utils/imageUtils";
import VerificationBadge from "../components/VerificationBadge";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: "dashboard" },
  { to: "/marketplace", label: "Marketplace", icon: "notifications_active" },
  { to: "/campaigns", label: "Campaign Control", icon: "rocket_launch" },
  { to: "/volunteers", label: "Volunteers", icon: "groups" },
  { to: "/inventory", label: "Inventory", icon: "inventory_2" },
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
  const [panelWidth, setPanelWidth] = useState(340);
  const [isDragging, setIsDragging] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [user, setUser] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const prevIdsRef = useRef(new Set());
  const loadingRef = useRef({
    notifications: false,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userRes = await API.get("/users/me");
        setUser(userRes.data);
      } catch (err) {
        console.error("User profile load failed", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadProfile();
  }, []);
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
        try {
          const audio = new Audio(pingSound);
          audio.play().catch(() => {
            /* Playback blocked by browser until user interaction */
          });
        } catch {}

        setToasts((prev) => [
          ...newOnes.map((a) => ({
            ...a,
            toastId: Math.random(),
          })),
          ...prev,
        ]);
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
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.toastId !== toast.toastId));
      }, 5000),
    );

    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 260 && newWidth < 520) {
        setPanelWidth(newWidth);
      }
    };

    const stopDragging = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-profile-dropdown]")) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface text-on_surface antialiased overflow-x-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[990] bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Toasts */}
      <div
        className={`fixed top-20 z-[9999] space-y-3 transition-all duration-300 ${
          sidebarOpen ? "md:left-[17rem] left-4" : "left-4"
        }`}
      >
        {toasts.map((t) => (
          <div
            key={t.toastId}
            onClick={() => {
              handleMarkRead(t.id, t.is_read);
              navigate("/marketplace");
              setToasts((prev) => prev.filter((x) => x.toastId !== t.toastId));
            }}
            className="cursor-pointer rounded-xl border-l-4 border-primary bg-surface_lowest p-4 shadow-soft transition hover:scale-[1.02] w-80"
          >
            <p className="text-sm font-semibold text-primary">
              {t.title || "📦 New Alert"}
            </p>
            <p className="mt-1 text-xs text-on_surface_variant">
              {t.message_body || t.message || "You have a new notification."}
            </p>
          </div>
        ))}
      </div>

      <aside
        className={`fixed left-0 top-0 z-[999] flex h-screen w-64 flex-col border-r border-white/5 bg-surface/95 px-5 pb-6 pt-5 shadow-soft backdrop-blur-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-1">
          <img src={logo} className="w-36 pt-2" alt="Sahyog Sync" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center rounded-lg p-1.5 text-on_surface_variant hover:bg-white/5 hover:text-on_surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              menu_open
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? "scale-[1.02] bg-primary/15 text-primary shadow-soft"
                    : "text-on_surface_variant hover:scale-[1.01] hover:bg-white/5 hover:text-on_surface"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className={`${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
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
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden flex items-center justify-center rounded-lg p-2 text-on_surface_variant hover:bg-white/5 hover:text-on_surface transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                menu_open
              </span>
            </button>
          )}

          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="text-on_surface_variant/40 text-[10px] md:text-sm uppercase tracking-widest font-black shrink-0">Operations</span>
            <span className="material-symbols-outlined text-xs text-on_surface_variant/40 shrink-0">chevron_right</span>
            
            {location.pathname !== "/dashboard" && (
              <>
                <Link to="/dashboard" className="text-on_surface_variant hover:text-primary text-[10px] md:text-sm transition-colors shrink-0">Dashboard</Link>
                <span className="material-symbols-outlined text-xs text-on_surface_variant/40 shrink-0">chevron_right</span>
              </>
            )}

            <span className="text-sm font-bold text-on_surface uppercase tracking-widest text-[11px] truncate">
                {NAV_ITEMS.find(i => i.to === location.pathname)?.label || 
                 (location.pathname.includes("history") ? "History" : 
                  location.pathname.split("/").pop().replace(/-/g, " ")) || 
                 "Dashboard"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="sm:hidden rounded-xl p-2 text-on_surface_variant hover:bg-white/5">
            <span className="material-symbols-outlined text-[22px]">
              search
            </span>
          </button>

          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setProfileOpen(false);
            }}
            className="relative rounded-xl p-2 text-on_surface_variant transition hover:bg-white/5 hover:text-on_surface"
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

          {/* Combined Profile & Settings Dropdown */}
          <div className="relative" data-profile-dropdown>
            {loadingUser ? (
              <div className="flex items-center gap-2 rounded-xl bg-surface_high px-3 py-2 w-44">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (
              user && (
                <button
                  onClick={() => {
                    setProfileOpen((p) => !p);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-surface_high px-2 py-1.5 pr-4 transition-all duration-200 hover:scale-[1.01] hover:bg-white/5 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/10 shadow-soft">
                    <img 
                      src={resolveProfileImage(user.profile_image_url)} 
                      alt="pfp" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <span>{user.full_name || "User"}</span>
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
                  {[
                    { label: "Profile", icon: "person" },
                    { label: "Organisation", icon: "corporate_fare" },
                    { label: "Review Us", icon: "star" },
                    { label: "Contact Us", icon: "support_agent" },
                    { label: "Help Center", icon: "help" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-on_surface_variant hover:bg-white/5 hover:text-on_surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
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
        <div className="p-4 md:p-6 min-w-0">
          {children && React.cloneElement(children, { sidebarOpen })}
        </div>
      </main>

      {/* Notifications Sidebar Panel */}
      <div
        className="fixed right-0 top-16 z-[995] h-[calc(100vh-4rem)] overflow-hidden border-l border-white/10 bg-surface/95 backdrop-blur-xl shadow-soft transition-all duration-300 flex flex-col"
        style={{
          width: showNotifications ? panelWidth : 0,
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-sm font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-primary hover:opacity-80 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Panel Content */}
        <div className="relative flex-1 overflow-y-auto p-4 space-y-3">
          {loadingNotifications ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on_surface_variant">
              <span className="material-symbols-outlined text-[40px] mb-2 opacity-50">
                notifications_off
              </span>
              <p className="text-sm">No new alerts</p>
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
                className={`cursor-pointer rounded-xl p-3 shadow-soft border border-white/5 transition hover:scale-[1.02] ${
                  a.is_read ? "bg-surface/50 opacity-70" : "bg-surface_high"
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold">
                    {a.title || "📦 Alert"}
                  </p>
                  {!a.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary mt-1" />
                  )}
                </div>
                <p className="mt-1 text-xs text-on_surface_variant">
                  {a.message_body || a.message}
                </p>
                <p className="mt-2 text-[10px] text-on_surface_variant/70">
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Draggable handle to resize panel */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="absolute left-0 top-0 h-full w-[4px] cursor-ew-resize hover:bg-white/10 transition-colors"
        />
      </div>

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

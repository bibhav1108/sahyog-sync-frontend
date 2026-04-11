import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";
import pingSound from "../assets/ping.mp3";
import React from "react";
import Skeleton from "../components/Skeleton";

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const prevIdsRef = useRef(new Set());
  const loadingRef = useRef({
    notifications: false,
  });

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
      const res = await API.get("/marketplace/needs/alerts");

      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      const prevIds = prevIdsRef.current;
      const newOnes = sorted.filter((a) => !prevIds.has(a.id));

      if (newOnes.length > 0) {
        try {
          new Audio(pingSound).play();
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
      setNotifications(sorted.slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current.notifications = false;
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 5000);
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
      if (!e.target.closest("[data-settings-dropdown]")) {
        setSettingsOpen(false);
      }
      if (!e.target.closest("[data-org-dropdown]")) {
        // no org dropdown currently, but keeping structure safe
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

      <div
        className={`fixed top-20 z-[9999] space-y-3 transition-all duration-300 ${
          sidebarOpen ? "md:left-[17rem] left-4" : "left-4"
        }`}
      >
        {toasts.map((t) => (
          <div
            key={t.toastId}
            onClick={() => {
              navigate("/marketplace");
              setToasts((prev) => prev.filter((x) => x.toastId !== t.toastId));
            }}
            className="cursor-pointer rounded-xl border-l-4 border-primary bg-surface_lowest p-4 shadow-soft transition hover:scale-[1.02] w-80"
          >
            <p className="text-sm font-semibold text-primary">
              📦 New Donor Alert
            </p>
            <p className="mt-1 text-xs text-on_surface_variant">
              {t.message_body}
            </p>
            {t.donor_name && (
              <p className="mt-1 text-[11px] text-on_surface_variant/80">
                👤 {t.donor_name}
              </p>
            )}
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
            title="Close sidebar"
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
              title="Open sidebar"
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
              title="Close sidebar"
            >
              <span className="material-symbols-outlined text-[22px]">
                menu_open
              </span>
            </button>
          )}

          <div className="relative flex-1 hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-2 text-on_surface_variant">
              search
            </span>
            <input
              className="w-full rounded-xl bg-surface_high py-2 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
              placeholder="Search..."
            />
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

            {!loadingNotifications && notifications.length > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
                {notifications.length}
              </span>
            )}
          </button>

          <div className="relative" data-settings-dropdown>
            <button
              onClick={() => {
                setSettingsOpen((p) => !p);
                setShowNotifications(false);
                setProfileOpen(false);
              }}
              className="relative rounded-xl p-2 text-on_surface_variant transition hover:bg-white/5 hover:text-on_surface"
              title="Settings"
            >
              <span className="material-symbols-outlined text-[24px]">
                settings
              </span>
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-xl border border-white/5 bg-surface_lowest p-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)] animate-[fadeIn_0.2s_ease] z-[1000]">
                <div className="absolute right-4 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-white/5 bg-surface_lowest" />
                <div className="space-y-1">
                  {[
                    { label: "Profile", icon: "person" },
                    { label: "Organisation", icon: "corporate_fare" },
                    { label: "Review Us", icon: "star" },
                    { label: "Contact Us", icon: "support_agent" },
                    { label: "Help Center", icon: "help" },
                    { label: "More", icon: "more_horiz" },
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
              </div>
            )}
          </div>

          <div className="relative" data-profile-dropdown>
            {loadingUser ? (
              <div className="flex items-center gap-2 rounded-xl bg-surface_high px-3 py-2 w-44">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 ml-auto" />
              </div>
            ) : (
              user && (
                <button
                  onClick={() => {
                    setProfileOpen((p) => !p);
                    setShowNotifications(false);
                    setSettingsOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-surface_high px-3 py-2 transition-all duration-200 hover:scale-[1.01] hover:bg-white/5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-soft">
                    {getInitials(user.full_name)}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user.full_name || "User"}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-on_surface_variant">
                    expand_more
                  </span>
                </button>
              )
            )}

            {profileOpen && user && (
              <div className="absolute right-0 mt-3 w-64 rounded-xl border border-white/5 bg-surface_lowest p-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)] animate-[fadeIn_0.2s_ease]">
                <div className="absolute right-6 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-white/5 bg-surface_lowest" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-semibold text-white shadow-soft">
                    {getInitials(user.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {user.full_name || "User"}
                    </p>
                    <p className="truncate text-xs text-on_surface_variant">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="mt-3 border-t border-white/5 pt-3">
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-red-500 transition hover:opacity-80"
                  >
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

      <div
        className="fixed right-0 top-16 z-[995] h-[calc(100vh-4rem)] overflow-hidden border-l border-white/10 bg-white/10 backdrop-blur-xl shadow-soft transition-all duration-300"
        style={{
          width: showNotifications ? panelWidth : 0,
        }}
      >
        <div className="relative h-full overflow-y-auto p-4 space-y-3">
          {loadingNotifications ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-on_surface_variant">No alerts</p>
          ) : (
            notifications.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  navigate("/marketplace");
                  setShowNotifications(false);
                }}
                className="cursor-pointer rounded-xl bg-surface_high p-3 shadow-soft border border-white/5 transition hover:scale-[1.02]"
              >
                <p className="text-sm font-semibold">📦 Alert</p>
                <p className="mt-1 text-xs text-on_surface_variant">
                  {a.message_body}
                </p>
                <p className="mt-1 text-[10px] text-on_surface_variant/70">
                  {new Date(a.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div
          onMouseDown={() => setIsDragging(true)}
          className="absolute left-0 top-0 h-full w-[4px] cursor-ew-resize"
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

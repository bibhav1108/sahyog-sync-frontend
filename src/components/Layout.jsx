import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";
import pingSound from "../assets/ping.mp3";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: "dashboard" },
  { to: "/needs", label: "Active Needs", icon: "emergency" },
  { to: "/marketplace", label: "Marketplace", icon: "notifications_active" },
  { to: "/campaigns", label: "Mission Control", icon: "rocket_launch" },
  { to: "/volunteers", label: "Volunteers", icon: "groups" },
  { to: "/dispatches", label: "Dispatch History", icon: "history" },
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

  const [showNotifications, setShowNotifications] = useState(true);
  const [panelWidth, setPanelWidth] = useState(340);
  const [isDragging, setIsDragging] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);

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
      }

      try {
        const orgRes = await API.get("/organizations/me");
        setOrg(orgRes.data);
      } catch (err) {
        console.error("Org profile load failed", err);
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
      if (!e.target.closest("[data-org-dropdown]")) {
        // no org dropdown currently, but keeping structure safe
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-surface text-on_surface antialiased">
      {/* Toast stack */}
      <div className="fixed left-[17rem] top-20 z-[9999] space-y-3">
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

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/5 bg-surface/80 px-5 pb-6 pt-5 shadow-soft backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <img src={logo} className="w-28" alt="Sahyog Sync" />
          <span className="text-sm font-semibold text-primary">
            Sahyog Sync
          </span>
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

        {/* Org profile */}
        {org && (
          <div className="mt-auto flex items-center gap-3 rounded-xl bg-surface_high p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-semibold text-white shadow-soft">
              {getInitials(org.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{org.name}</p>
              <p className="truncate text-xs text-on_surface_variant">
                {org.contact_email}
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Top bar */}
      <header
        className="fixed top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-surface/80 px-6 shadow-soft backdrop-blur-md"
        style={{ left: "16rem", right: 0 }}
      >
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2 text-on_surface_variant">
            search
          </span>
          <input
            className="w-full rounded-xl bg-surface_high py-2 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            placeholder="Search..."
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
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

            {notifications.length > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {/* User profile dropdown */}
          {user && (
            <div className="relative" data-profile-dropdown>
              <button
                onClick={() => {
                  setProfileOpen((p) => !p);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-surface_high px-3 py-2 transition-all duration-200 hover:scale-[1.01] hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-soft">
                  {getInitials(user.full_name)}
                </div>
                <span className="text-sm font-medium">
                  {user.full_name || "User"}
                </span>
                <span className="material-symbols-outlined text-[18px] text-on_surface_variant">
                  expand_more
                </span>
              </button>

              {profileOpen && (
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
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{ marginLeft: "16rem", paddingTop: "4rem" }}>
        <div className="p-6">{children}</div>
      </main>

      {/* Notification panel */}
      <div
        className="fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] overflow-hidden border-l border-white/5 bg-surface_lowest shadow-soft transition-all duration-300"
        style={{
          width: showNotifications ? panelWidth : 0,
        }}
      >
        <div className="relative h-full overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-on_surface_variant">No alerts</p>
          ) : (
            notifications.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  navigate("/marketplace");
                  setShowNotifications(false);
                }}
                className="cursor-pointer rounded-xl bg-surface_high p-3 transition hover:scale-[1.02]"
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

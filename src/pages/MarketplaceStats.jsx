import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const MarketplaceStatsPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);

      const [itemsRes, statsRes] = await Promise.all([
        API.get("/marketplace/"),
        API.get("/marketplace/stats"),
      ]);

      setItems(itemsRes.data || []);
      setStats(statsRes.data);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- DERIVED STATS ----------------
  const totalQuantity = items.reduce((a, b) => a + b.quantity, 0);

  const latest = items.slice(0, 5);

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/marketplace")}
          className="px-3 py-2 text-sm bg-surface_high rounded-lg border border-white/10 hover:opacity-80"
        >
          ← Back
        </button>

        <div>
          <h1 className="text-3xl font-bold">Marketplace Analytics</h1>
          <p className="text-sm text-on_surface_variant">
            Insights and recovery performance from marketplace activity
          </p>
        </div>
      </div>

      {/* ================= KEY METRICS ================= */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Overview</h2>

        {statsLoading ? (
          <div className="grid sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-surface_high rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Records"
              value={stats?.total_items_recovered || 0}
            />

            <StatCard label="Total Quantity" value={totalQuantity} />

            <StatCard
              label="Unique Items"
              value={Object.keys(stats?.item_breakdown || {}).length}
              highlight
            />
          </div>
        )}
      </section>

      {/* ================= BREAKDOWN ================= */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Item Breakdown</h2>

        {statsLoading ? (
          <div className="h-32 bg-surface_high rounded-xl animate-pulse" />
        ) : (
          <div className="bg-surface_high p-5 rounded-xl flex flex-wrap gap-2">
            {Object.entries(stats?.item_breakdown || {}).map(
              ([name, count]) => (
                <div
                  key={name}
                  className="px-3 py-1 rounded-full bg-surface text-xs font-medium"
                >
                  {name} ({count})
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* ================= RECENT ACTIVITY ================= */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Recoveries</h2>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-surface_high rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="text-center text-on_surface_variant p-6">
            No recent activity
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {latest.map((item) => (
              <div
                key={item.id}
                className="bg-surface_high p-4 rounded-xl flex flex-col gap-2"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">{item.item_name}</h3>
                  <span className="text-xs bg-surface px-2 py-1 rounded">
                    {item.unit}
                  </span>
                </div>

                <div className="text-sm text-on_surface_variant">
                  {new Date(item.collected_at).toLocaleDateString()}
                </div>

                <div className="font-semibold">
                  {item.quantity} {item.unit}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= FUTURE SECTION PLACEHOLDER ================= */}
      <section className="space-y-4 opacity-60">
        <h2 className="text-lg font-semibold">More Insights (Coming Soon)</h2>

        <div className="bg-surface_high p-6 rounded-xl text-sm text-on_surface_variant">
          You can plug in:
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>📈 Time-based trends (daily / weekly recovery)</li>
            <li>📊 Charts (bar / pie)</li>
            <li>🏆 Top performing item categories</li>
            <li>📅 Filters by date range</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

// ---------------- COMPONENT ----------------
const StatCard = ({ label, value, highlight }) => (
  <div
    className={`p-5 rounded-xl ${
      highlight ? "bg-primary text-white" : "bg-surface_high"
    }`}
  >
    <p className="text-xs">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default MarketplaceStatsPage;

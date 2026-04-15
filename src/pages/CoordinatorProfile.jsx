import { useEffect, useState } from "react";
import API from "../services/api";
import Skeleton from "../components/Skeleton";
import { resolveProfileImage } from "../utils/imageUtils";

const CoordinatorProfile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total_campaigns: 0, total_inventory: 0, total_volunteers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
            API.get("/users/me"),
            API.get("/users/me/stats")
        ]);
        setUser(userRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to load profile or stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-64 bg-surface_high rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-surface_high rounded-2xl" />
            <div className="h-32 bg-surface_high rounded-2xl" />
            <div className="h-32 bg-surface_high rounded-2xl" />
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-surface_high border border-white/5 shadow-soft group">
        <div className="absolute inset-0 bg-primaryGradient opacity-10" />
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img 
                src={resolveProfileImage(user?.profile_image_url)} 
                alt="profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
              Management Portal
            </div>
            <h1 className="text-3xl font-bold mb-1">{user?.full_name}</h1>
            <p className="text-on_surface_variant opacity-80">{user?.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-surface rounded-xl border border-white/10">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                    NGO Coordinator
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-surface rounded-xl border border-white/10">
                    <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                    Joined {new Date(user?.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ProfileStatCard 
            label="Campaigns Active" 
            value={stats.total_campaigns} 
            icon="rocket_launch"
            color="bg-blue-500"
        />
        <ProfileStatCard 
            label="Verified Volunteers" 
            value={stats.total_volunteers} 
            icon="person_check"
            color="bg-emerald-500"
        />
        <ProfileStatCard 
            label="Logistics Items" 
            value={stats.total_inventory} 
            icon="inventory_2"
            color="bg-purple-500"
        />
      </div>

      {/* DETAILS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface_high p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                General Profile
            </h3>
            <div className="space-y-6">
                <DetailItem label="Full Name" value={user?.full_name} />
                <DetailItem label="Account Email" value={user?.email} />
                <DetailItem label="Assigned NGO" value={user?.org_id ? "Verified NGO" : "No NGO Assigned"} />
            </div>
            
            <button className="w-full mt-8 py-3 rounded-xl bg-surface hover:bg-surface_highest border border-white/10 font-bold transition">
                Edit Identification Details
            </button>
        </div>

        <div className="bg-surface_high p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                Security Prefences
            </h3>
            <div className="space-y-6">
                <DetailItem label="Password" value="••••••••••••" />
                <DetailItem label="Two-Factor Auth" value="Disabled" />
                <DetailItem label="Session Lock" value="Automatic" />
            </div>

            <button className="w-full mt-8 py-3 rounded-xl bg-primary text-white font-bold transition shadow-lg shadow-primary/20">
                Manage Privacy Controls
            </button>
        </div>
      </div>
    </div>
  );
};

const ProfileStatCard = ({ label, value, icon, color }) => (
    <div className="bg-surface_high p-6 rounded-2xl border border-white/5 flex items-center gap-4 group hover:scale-[1.02] transition">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-lg`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</p>
            <p className="text-2xl font-bold leading-none mt-1">{value}</p>
        </div>
    </div>
);

const DetailItem = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">{label}</p>
        <p className="font-semibold text-on_surface_variant">{value}</p>
    </div>
)

export default CoordinatorProfile;

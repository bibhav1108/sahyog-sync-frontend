import { useEffect, useState } from "react";
import API from "../services/api";

const VolunteerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await API.get("/volunteers/profile/me");
      const data = res.data;

      setProfile(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        skills: data.skills?.join(", ") || "",
        zone: data.zone || "",
      });
    } catch (err) {
      setMsg("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        skills: form.skills.split(",").map((s) => s.trim()),
        zone: form.zone,
      };

      const res = await API.patch("/volunteers/profile/me", payload);
      setProfile(res.data);
      setEditing(false);

      setMsg("Profile updated 🚀");

      if (form.email !== profile.email) {
        setMsg("Verification email sent 📩");
      }
    } catch (err) {
      setMsg(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* 🔹 HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          {/* PROFILE IMAGE */}
          <img
            src={profile.profile_image_url || "https://via.placeholder.com/80"}
            alt="profile"
            className="w-16 h-16 rounded-full object-cover border"
          />

          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm text-on_surface_variant">
              {profile.zone || "No zone set"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* 🔹 STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Trust Score" value={profile.trust_score} />
        <Stat label="Tier" value={profile.trust_tier} />
        <Stat label="Completions" value={profile.completions} />
        <Stat label="Hours" value={profile.hours_served} highlight />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          <Card title="Security & Trust">
            <Status
              label="Email"
              status={profile.is_email_verified}
              extra={
                !profile.is_email_verified && (
                  <span className="text-xs text-orange-400">
                    Verify required
                  </span>
                )
              }
            />

            <Status label="ID" status={profile.id_verified} />

            <Status label="Telegram" status={profile.is_active} />
          </Card>

          <Card title="Contact">
            <p className="text-sm">📧 {profile.email}</p>
            <p className="text-sm">📱 {profile.phone_number}</p>
          </Card>

          <Card title="Skills">
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs rounded-full bg-surface_high"
                >
                  {s}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2">
          {!editing ? (
            <Card title="Profile Info">
              <Info label="Name" value={profile.name} />
              <Info label="Email" value={profile.email} />
              <Info label="Zone" value={profile.zone} />
              <Info label="Skills" value={profile.skills?.join(", ")} />
            </Card>
          ) : (
            <Card title="Edit Profile">
              <div className="space-y-4">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />

                <Input
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />

                <Input
                  label="Skills"
                  value={form.skills}
                  onChange={(v) => setForm({ ...form, skills: v })}
                />

                <Input
                  label="Zone"
                  value={form.zone}
                  onChange={(v) => setForm({ ...form, zone: v })}
                />

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-primary text-white rounded-lg"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {msg && <p className="text-center text-sm">{msg}</p>}
    </div>
  );
};

export default VolunteerProfile;

/* 🔹 COMPONENTS */

const Card = ({ title, children }) => (
  <div className="bg-surface_lowest p-5 rounded-xl border space-y-4">
    <div className="font-semibold">{title}</div>
    {children}
  </div>
);

const Input = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-on_surface_variant">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg bg-surface_high"
    />
  </div>
);

const Info = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-on_surface_variant">{label}</span>
    <span>{value || "-"}</span>
  </div>
);

const Stat = ({ label, value, highlight }) => (
  <div
    className={`p-4 rounded-xl text-center border ${
      highlight ? "bg-primary text-white" : "bg-surface_lowest"
    }`}
  >
    <div className="text-xl font-bold">{value}</div>
    <div className="text-xs opacity-70">{label}</div>
  </div>
);

const Status = ({ label, status, extra }) => (
  <div className="flex justify-between text-sm items-center">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          status
            ? "bg-green-500/20 text-green-400"
            : "bg-gray-500/20 text-gray-400"
        }`}
      >
        {status ? "Verified" : "Not Verified"}
      </span>
      {extra}
    </div>
  </div>
);

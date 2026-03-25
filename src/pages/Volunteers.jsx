import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const Volunteers = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [skills, setSkills] = useState("");

  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState("");

  // 🔥 Load from backend
  const loadVolunteers = async () => {
    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVolunteers();

    const interval = setInterval(loadVolunteers, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Register volunteer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !phone) {
      setError("Name and phone are required");
      return;
    }

    try {
      await API.post("/volunteers", {
        name,
        phone_number: phone,
        zone,
        skills: skills ? skills.split(",") : [],
      });

      setName("");
      setPhone("");
      setZone("");
      setSkills("");

      loadVolunteers(); // refresh instantly
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to add volunteer");
      }
    }
  };

  // 🔥 Update trust tier
  const updateTrust = async (id, tier) => {
    try {
      await API.patch(`/volunteers/${id}/trust`, {
        trust_tier: tier,
      });

      loadVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Volunteers</h2>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 max-w-md">
        <h3 className="font-semibold mb-3">Register Volunteer</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Phone (+91...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Zone (optional)"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          />

          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Add Volunteer
          </button>
        </form>
      </div>

      {/* List */}
      {volunteers.length === 0 ? (
        <p className="text-gray-500">No volunteers yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteers.map((v) => (
            <div
              key={v.id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold">{v.name}</h3>
              <p className="text-gray-500">{v.phone_number}</p>
              <p className="text-gray-400 text-sm">Zone: {v.zone || "-"}</p>

              {/* Stats */}
              <div className="text-xs mt-2 text-gray-500">
                ✔ Completed: {v.completions} <br />❌ No-shows: {v.no_shows}
              </div>

              {/* Trust badge */}
              <span className="text-xs mt-2 inline-block px-2 py-1 rounded bg-gray-200">
                {v.trust_tier}
              </span>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <button
                  className="flex-1 bg-green-500 text-white p-1 rounded"
                  onClick={() => updateTrust(v.id, "FIELD_VERIFIED")}
                >
                  Verify
                </button>

                <button
                  className="flex-1 bg-yellow-500 text-white p-1 rounded"
                  onClick={() => updateTrust(v.id, "ID_VERIFIED")}
                >
                  ID Check
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Volunteers;

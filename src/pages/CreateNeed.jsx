import { useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CreateNeed = () => {
  const navigate = useNavigate();

  const [type, setType] = useState("FOOD");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [urgency, setUrgency] = useState("MEDIUM");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!type || !description || !quantity || !pickupAddress) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/needs", {
        type, // MUST be: FOOD, WATER, etc.
        description,
        quantity,
        pickup_address: pickupAddress,
        urgency, // MUST be: LOW, MEDIUM, HIGH
        pickup_deadline: deadline || null,
      });

      alert("Need created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to create need");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center">
        <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-6">Create Need</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TYPE */}
            <select
              className="w-full p-2 border rounded"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="FOOD">Food</option>
              <option value="WATER">Water</option>
              <option value="KIT">Kit</option>
              <option value="BLANKET">Blanket</option>
              <option value="MEDICAL">Medical</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="OTHER">Other</option>
            </select>

            {/* DESCRIPTION */}
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Describe the need"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* QUANTITY */}
            <input
              className="w-full p-2 border rounded"
              placeholder="e.g. 50 packets"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            {/* ADDRESS */}
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Pickup address"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />

            {/* URGENCY */}
            <select
              className="w-full p-2 border rounded"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            {/* DEADLINE */}
            <input
              type="datetime-local"
              className="w-full p-2 border rounded"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              {loading ? "Creating..." : "Create Need"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateNeed;

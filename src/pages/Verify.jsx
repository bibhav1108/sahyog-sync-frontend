import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";

const Verify = () => {
  const [dispatchId, setDispatchId] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!dispatchId || otp.length !== 6) {
      setError("Enter valid dispatch ID and 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/dispatches/verify-otp", {
        dispatch_id: Number(dispatchId),
        otp_code: otp,
      });

      alert(res.data.message || "Verified successfully!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Verify Pickup OTP</h2>

        <form onSubmit={handleVerify} className="space-y-4">
          {/* Dispatch ID */}
          <input
            type="number"
            placeholder="Dispatch ID"
            value={dispatchId}
            onChange={(e) => setDispatchId(e.target.value)}
            className="w-full p-2 border rounded"
          />

          {/* OTP */}
          <input
            className="w-full p-2 border rounded text-center text-lg tracking-widest"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Button */}
          <button
            disabled={loading}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Verify;

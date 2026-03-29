import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgEmail, setOrgEmail] = useState("");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !orgName ||
      !orgPhone ||
      !orgEmail ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/organizations/register", {
        org_name: orgName,
        org_phone: orgPhone,
        org_email: orgEmail,
        admin_name: adminName,
        admin_email: adminEmail,
        admin_password: adminPassword,
      });

      alert(res.data.message || "Registered successfully!");
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-indigo-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Bridging Surplus <br /> to Social Impact
          </h1>
          <p className="mt-6 text-lg text-indigo-200 max-w-md">
            Join a smart logistics network built for NGOs and community
            responders.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
            {/* <p className="text-2xl font-bold">4.2k+</p>
            <p className="text-sm text-indigo-200">Active Partners</p> */}
          </div>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
            {/* <p className="text-2xl font-bold">120 Tons</p>
            <p className="text-sm text-indigo-200">Goods Redistributed</p> */}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-indigo-700">Create Account</h2>
          <p className="text-gray-500 text-sm mt-2 mb-8">
            Start making a difference
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* ORG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder=" "
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="peer w-full p-4 rounded-xl bg-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <label
                  className="absolute left-4 top-4 text-gray-500 text-sm transition-all 
                  peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1
                  peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                >
                  NGO Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder=" "
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  className="peer w-full p-4 rounded-xl bg-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <label
                  className="absolute left-4 top-4 text-gray-500 text-sm transition-all 
                  peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1
                  peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                >
                  Phone
                </label>
              </div>
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder=" "
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="peer w-full p-4 rounded-xl bg-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <label
                className="absolute left-4 top-4 text-gray-500 text-sm transition-all 
                peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1
                peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
              >
                Organization Email
              </label>
            </div>

            {/* ADMIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder=" "
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="peer w-full p-4 rounded-xl bg-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <label
                  className="absolute left-4 top-4 text-gray-500 text-sm transition-all 
                  peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1
                  peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                >
                  Your Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder=" "
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="peer w-full p-4 rounded-xl bg-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <label
                  className="absolute left-4 top-4 text-gray-500 text-sm transition-all 
                  peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1
                  peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                >
                  Your Email
                </label>
              </div>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder=" "
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="peer w-full p-4 rounded-xl bg-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <label
                className="absolute left-4 top-4 text-gray-500 text-sm transition-all 
                peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1
                peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
              >
                Password
              </label>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.98] transition"
            >
              {loading ? "Registering..." : "Register Organization"}
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-600 font-medium cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

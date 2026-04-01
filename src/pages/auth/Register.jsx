import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import logo from "../../assets/logo.png";

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
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ================= LEFT PANEL ================= */}
      <div className="hidden lg:flex w-1/2 px-12 py-16 flex-col justify-between relative overflow-hidden">
        {/* subtle background */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />

        <div className="relative z-10 space-y-10">
          <div className="flex items-center gap-3">
            <img src={logo} className="h-10" />
            <span className="text-xl font-outfit font-bold text-primary">
              Sahyog Sync
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-outfit font-extrabold leading-tight">
              Start Coordinating <br /> Resources Better
            </h1>

            <p className="text-on_surface_variant max-w-md">
              Create your organization account and begin managing resources,
              volunteers, and operations from one place.
            </p>
          </div>
        </div>

        {/* decorative cards */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div className="bg-surface/60 backdrop-blur-glass p-6 rounded-xl shadow-soft" />
          <div className="bg-surface/60 backdrop-blur-glass p-6 rounded-xl shadow-soft" />
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl bg-surface_lowest p-10 rounded-xl shadow-soft">
          <h2 className="text-3xl font-outfit font-extrabold text-primary">
            Create Account
          </h2>

          <p className="text-on_surface_variant text-sm mt-2 mb-8">
            Register your organization to get started
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* ORG */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="NGO Name" value={orgName} setValue={setOrgName} />
              <Input label="Phone" value={orgPhone} setValue={setOrgPhone} />
            </div>

            <Input
              label="Organization Email"
              value={orgEmail}
              setValue={setOrgEmail}
              type="email"
            />

            {/* ADMIN */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Your Name"
                value={adminName}
                setValue={setAdminName}
              />
              <Input
                label="Your Email"
                value={adminEmail}
                setValue={setAdminEmail}
                type="email"
              />
            </div>

            <Input
              label="Password"
              value={adminPassword}
              setValue={setAdminPassword}
              type="password"
            />

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primaryGradient text-white font-bold rounded-lg shadow-soft hover:opacity-90 transition"
            >
              {loading ? "Registering..." : "Register Organization"}
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-primary font-medium cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

/* 🔥 VALID INPUT COMPONENT (no overlap, transparent bg) */
const Input = ({ label, value, setValue, type = "text" }) => {
  const isActive = value && value.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          peer w-full px-4 pt-6 pb-2 rounded-lg
          bg-surface_high text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/40
        "
      />

      <label
        className={`
          absolute left-3 transition-all duration-200
          pointer-events-none text-on_surface_variant

          ${
            isActive
              ? "top-1 text-xs"
              : "top-1/2 -translate-y-1/2 text-sm"
          }

          peer-focus:top-1 peer-focus:translate-y-0
          peer-focus:text-xs
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default Register;

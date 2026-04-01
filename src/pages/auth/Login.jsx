import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import logo from "../../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const res = await API.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = res.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("org_id", data.org_id);
      localStorage.setItem("org_name", data.org_name);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* CARD */}
        <div className="bg-surface_lowest p-10 rounded-xl shadow-soft">
          {/* HEADER */}
          <div className="text-center mb-8 space-y-0">
            <img src={logo} className="w-40 h-40 mx-auto" />

            <p className="text-sm text-on_surface_variant">
              Sign in to continue
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email Address"
              value={email}
              setValue={setEmail}
              type="email"
            />

            <Input
              label="Password"
              value={password}
              setValue={setPassword}
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-sm text-center mt-6">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-primary font-medium cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </div>

        {/* bottom links */}
        <div className="mt-6 text-center text-xs text-on_surface_variant">
          <span className="cursor-pointer hover:text-primary">Privacy</span>
          {" • "}
          <span className="cursor-pointer hover:text-primary">Terms</span>
        </div>
      </div>
    </div>
  );
};

/* ✅ FIXED INPUT COMPONENT (no overlap after blur) */
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

export default Login;

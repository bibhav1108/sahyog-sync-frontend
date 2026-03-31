import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const PublicNavbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO + NAME */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Sahyog Sync Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-outfit font-semibold text-primary tracking-tight">
            Sahyog Sync
          </span>
        </Link>

        {/* BUTTONS */}
        <div className="flex items-center gap-3">
          {/* LOGIN */}
          <Link
            to="/login"
            className="
              px-4 py-2 rounded-lg
              text-on_surface_variant
              bg-surface_high
              hover:bg-white/5
              transition
            "
          >
            Login
          </Link>

          {/* SIGN UP */}
          <Link
            to="/register"
            className="
              px-5 py-2 rounded-lg
              bg-primaryGradient
              text-white font-medium
              shadow-soft
              hover:opacity-90
              transition
            "
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;

import { Link } from "react-router-dom";

const PublicNavbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO + NAME */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/sahyog_setu.png"
            alt="Sahyog Setu Logo"
            className="h-9 w-auto object-contain"
          />
          <span className="text-lg font-bold text-indigo-700 tracking-tight">
            Sahyog Setu
          </span>
        </Link>

        {/* BUTTONS */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;

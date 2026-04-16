import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Live Insights", path: "/#features" },
    { name: "NGO Network", path: "/#network" },
    { name: "About Us", path: "/#about" },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        scrolled 
          ? "py-3 bg-white/90 backdrop-blur-xl border-b border-primary/10 shadow-lg" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-2">
        {/* LOGO + NAME */}
        <Link to="/" className="flex items-center gap-3 sm:gap-4 group shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all duration-500" />
            <img
              src={logo}
              alt="Sahyog Sync Logo"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-3xl font-outfit font-black text-on_surface tracking-tight group-hover:text-primary transition-colors duration-300">
              Sahyog <span className="text-primary group-hover:text-on_surface transition-colors">Sync</span>
            </span>
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] text-on_surface_variant/40 leading-none mt-1"></span>
          </div>
        </Link>

        {/* ACTIONS & NAV */}
        <div className="flex items-center gap-3 sm:gap-8">
          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-on_surface/5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant/70 hover:text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-on_surface hover:text-primary transition-colors px-2 sm:px-4 py-2"
            >
              Log In
            </Link>

            <Link
              to="/register"
              className="
                px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl
                bg-primaryGradient
                text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]
                shadow-lg shadow-primary/10
                hover:shadow-xl hover:shadow-primary/20
                hover:-translate-y-0.5 transition-all duration-300
              "
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;

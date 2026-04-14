import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface text-on_surface font-inter overflow-hidden">
      <PublicNavbar />

      <main>
        {/* ================= HERO ================= */}
        <section className="relative min-h-[90vh] flex items-center px-6 md:px-16 py-24">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full -z-10" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-azure/10 blur-[100px] rounded-full -z-10" />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div
                variants={fadeIn}
                className="inline-block px-4 py-2 rounded-full bg-azure/10 text-primary font-bold text-xs uppercase tracking-wider backdrop-blur-sm shadow-soft"
              >
                AI-Powered Logistics Platform
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-5xl md:text-7xl font-outfit font-extrabold leading-[1.1] tracking-tight text-on_surface"
              >
                Empower Your NGO with{" "}
                <span className="text-primary bg-clip-text text-transparent bg-primaryGradient">
                  Smarter Coordination.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-xl text-on_surface_variant max-w-lg leading-relaxed"
              >
                Seamlessly connect surplus resources with real-world needs
                through our unified, intelligent platform designed exclusively
                for NGOs and volunteer networks.
              </motion.p>

              <motion.div
                variants={fadeIn}
                className="flex gap-4 flex-wrap pt-4"
              >
                <Link
                  to="/register?type=ngo"
                  className="bg-primary hover:bg-primary_container text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-soft hover:shadow-lg hover:-translate-y-1"
                >
                  Join as NGO
                </Link>

                <Link
                  to="/register?type=volunteer"
                  className="bg-surface_highest text-primary hover:bg-white px-8 py-4 rounded-xl font-bold transition-all duration-300 border border-primary/20 shadow-soft hover:shadow-lg hover:-translate-y-1"
                >
                  Join as Volunteer
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/40 backdrop-blur-glass p-3 rounded-2xl shadow-soft border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                  alt="NGO Coordination"
                  className="rounded-xl w-full h-[500px] object-cover shadow-inner"
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-glass p-5 rounded-xl shadow-soft border border-surface_highest flex items-center gap-4"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-xs font-bold text-on_surface_variant uppercase tracking-wider">
                      Live Status
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      Real-time matching active
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================= PROBLEM ================= */}
        <section className="py-32 px-6 md:px-16 bg-surface_lowest relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 gap-6"
            >
              {[
                {
                  title: "Logistics Fatigue",
                  desc: "Manual routing exhausts valuable volunteer hours.",
                },
                {
                  title: "Data Silos",
                  desc: "Disconnected tools cause critical information gaps.",
                },
                {
                  title: "Supply Misses",
                  desc: "Surplus often fails to reach areas of high demand.",
                },
                {
                  title: "Skill Mismatch",
                  desc: "Volunteers not placed where they are most effective.",
                },
              ].map((item, i) => (
                <motion.div
                  variants={fadeIn}
                  key={i}
                  className="bg-surface p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary/5 hover:border-primary/20 group"
                >
                  <div className="w-10 h-10 rounded-full bg-azure/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                    <span className="text-primary group-hover:text-white font-bold text-sm">
                      0{i + 1}
                    </span>
                  </div>
                  <h4 className="font-outfit font-bold mb-2 text-on_surface group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-on_surface_variant leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <h2 className="text-4xl lg:text-5xl font-outfit font-extrabold leading-tight">
                Focus on{" "}
                <span className="text-transparent bg-clip-text bg-primaryGradient">
                  impact
                </span>
                ,<br />
                not manual process.
              </h2>

              <p className="text-lg text-on_surface_variant leading-relaxed">
                Disconnected systems slow down humanitarian workflows. Our
                unified architecture simplifies logistics and amplifies your
                response speed, allowing teams to collaborate effortlessly.
              </p>

              <div className="p-6 bg-surface_high/50 backdrop-blur-sm rounded-xl border-l-4 border-azure shadow-soft">
                <p className="text-sm font-semibold text-primary italic">
                  "Designed to remove friction from resource distribution so you
                  can focus on saving lives."
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="py-32 px-6 md:px-16 bg-surface relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20 space-y-4"
            >
              <h2 className="text-4xl md:text-5xl font-outfit font-extrabold">
                Core Capabilities
              </h2>
              <p className="text-lg text-on_surface_variant max-w-2xl mx-auto">
                Purpose-built tools designed to support efficient coordination,
                transparent tracking, and intelligent resource management.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-12 gap-6"
            >
              {/* Feature 1 */}
              <motion.div
                variants={fadeIn}
                className="md:col-span-8 bg-white/60 backdrop-blur-glass p-10 rounded-3xl shadow-soft hover:shadow-lg transition-all duration-300 border border-white hover:border-primary/20 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-azure/5 rounded-full blur-3xl group-hover:bg-azure/10 transition-colors" />
                <h3 className="text-3xl font-outfit font-bold mb-4 text-on_surface">
                  Intelligent Resource Matching
                </h3>
                <p className="text-lg text-on_surface_variant max-w-md relative z-10">
                  Connect available resources with nearby demand efficiently
                  using smart distance sorting and inventory availability
                  checks.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                variants={fadeIn}
                className="md:col-span-4 bg-primaryGradient text-white p-10 rounded-3xl shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                <div className="h-full flex flex-col justify-between relative z-10">
                  <div>
                    <h3 className="text-2xl font-outfit font-bold mb-3">
                      Volunteer Coordination
                    </h3>
                    <p className="text-sm opacity-90 leading-relaxed text-blue-50">
                      Assign tasks instantly based on location, availability,
                      and specific skill sets.
                    </p>
                  </div>
                  <div className="mt-8 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    &rarr;
                  </div>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                variants={fadeIn}
                className="md:col-span-4 bg-white/60 backdrop-blur-glass p-8 rounded-3xl shadow-soft hover:shadow-lg transition-all duration-300 border border-white hover:border-primary/20"
              >
                <h3 className="text-xl font-outfit font-bold mb-2">
                  Transparency Tools
                </h3>
                <p className="text-sm text-on_surface_variant">
                  Full audit trails for goods received and dispatched.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                variants={fadeIn}
                className="md:col-span-8 bg-surface_high p-8 rounded-3xl shadow-soft hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary/10 overflow-hidden relative"
              >
                <div className="absolute right-0 bottom-0 opacity-10">
                  <svg
                    width="200"
                    height="200"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15.5962L7.29289 11.8891L5.87868 13.3033L11 18.4246L18.4246 11L17.0104 9.58579L11 15.5962Z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-outfit font-bold mb-3">
                  Rapid Response Support
                </h3>
                <p className="text-on_surface_variant">
                  Generate immediate alert systems and dispatch directives
                  during critical mission protocols to ensure maximum efficiency
                  when time is of the essence.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ================= DARK ================= */}
        <section className="py-32 px-6 md:px-16 bg-[#1A2F2F] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8 z-10"
            >
              <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 text-primary_container text-xs font-bold uppercase tracking-wider">
                Network Effect
              </div>

              <h2 className="text-4xl md:text-5xl font-outfit font-extrabold leading-tight text-white">
                Building Better <br />
                Coordination Systems
              </h2>

              <p className="text-lg text-blue-100/70 max-w-md leading-relaxed">
                Connect decentralized organizations, passionate volunteers, and
                critical resources through one unified network architecture.
              </p>

              <ul className="space-y-4 pt-4">
                {[
                  "Verified Partner Organizations",
                  "Secure Data Privacy",
                  "24/7 Availability",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary_container text-sm">
                      ✓
                    </div>
                    <span className="text-blue-50 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F2F] via-transparent to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80"
                alt="Logistics Coordination"
                className="w-full h-[500px] object-cover scale-105 hover:scale-100 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-32 px-6 text-center bg-surface relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8 relative z-10"
          >
            <h2 className="text-5xl md:text-6xl font-outfit font-extrabold text-on_surface">
              Ready to accelerate your impact?
            </h2>

            <p className="text-xl text-on_surface_variant">
              Join the platform and start coordinating resources more
              effectively today.
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
              <Link
                to="/register?type=ngo"
                className="group relative bg-primary text-white px-10 py-5 rounded-2xl font-bold transition-all hover:shadow-[0_0_30px_rgba(40,165,165,0.4)]"
              >
                Join as NGO &rarr;
              </Link>
              
              <Link
                to="/register?type=volunteer"
                className="bg-white text-primary border-2 border-primary/10 px-10 py-5 rounded-2xl font-bold transition-all hover:border-primary/40 hover:shadow-soft"
              >
                Join as Volunteer &rarr;
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-20 px-6 bg-[#142424] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
          {/* Social Icons */}
          <div className="flex gap-6 flex-wrap justify-center">
            {[
              {
                id: "fb",
                icon: (
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                ),
              },
              {
                id: "ig",
                icon: (
                  <>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </>
                ),
              },
              {
                id: "tw",
                icon: (
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                ),
              },
              {
                id: "gp",
                icon: (
                  <path d="M12.99 6H21.5v3.62h-4.39c.35.88.58 1.83.58 2.38 0 2.87-2.33 5.2-5.2 5.2a5.18 5.18 0 0 1-5.12-4.14 5.2 5.2 0 0 1 4.05-6.04c.33-.08.68-.12 1.03-.12.37 0 .73.04 1.08.12l.14.04zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                ),
              },
              {
                id: "yt",
                icon: (
                  <>
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </>
                ),
              },
            ].map(({ id, icon }) => (
              <a
                key={id}
                href="#"
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                aria-label={id}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-[#142424] transition-transform duration-300 group-hover:rotate-6"
                >
                  {icon}
                </svg>
              </a>
            ))}
          </div>

          {/* Navigation Links */}
          <nav className="flex gap-10 flex-wrap justify-center uppercase tracking-widest text-sm font-bold">
            {["Home", "About", "Contact Us", "Our Team"].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-primary transition-colors duration-300 relative group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <div className="pt-8 border-t border-white/5 w-full text-blue-100/40 text-sm font-medium">
            © {new Date().getFullYear()} Sahyog Sync — Platform for resource
            coordination
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

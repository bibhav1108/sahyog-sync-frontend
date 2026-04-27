import { Link } from "react-router-dom";
import PublicNavbar from "../../components/PublicNavbar";
import Footer from "../../components/Footer";
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

        <div className="w-full bg-primary text-white mt-20 md:mt-24">
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-12 flex items-center justify-between gap-4">
      
          <p className="text-sm font-medium truncate">
            💙 Support verified causes through our Telegram donation bot
          </p>
      
          <a
            href="https://t.me/SahyogSyncBot#"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap hover:scale-105 transition-all duration-300"
          >
            Donate Now
          </a>
      
        </div>
      </div>


      
      <main>
        
        {/* ================= HERO ================= */}
        <section className="relative min-h-[90vh] flex items-center px-6 md:px-16 pt-32 pb-12 md:pt-40 md:pb-16">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full -z-10" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-azure/10 blur-[100px] rounded-full -z-10" />

          
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >

              <motion.h1
                variants={fadeIn}
                className="text-4xl sm:text-5xl md:text-7xl font-outfit font-extrabold leading-[1.1] tracking-tight text-on_surface"
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
                  className="rounded-xl w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover shadow-inner"
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
        <section className="py-10 md:py-16 px-6 md:px-16 bg-surface_lowest relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
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
                  className="bg-surface p-5 sm:p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary/5 hover:border-primary/20 group"
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
        <section className="py-10 md:py-16 px-6 md:px-16 bg-surface relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 space-y-4"
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
                className="md:col-span-8 bg-white/60 backdrop-blur-glass p-6 sm:p-10 rounded-3xl shadow-soft hover:shadow-lg transition-all duration-300 border border-white hover:border-primary/20 relative overflow-hidden group"
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
                className="md:col-span-4 bg-primaryGradient text-white p-6 sm:p-10 rounded-3xl shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
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
        <section className="py-10 md:py-16 px-6 md:px-16 bg-[#1A2F2F] text-white overflow-hidden relative">
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
                className="w-full h-[300px] md:h-[500px] object-cover scale-105 hover:scale-100 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-10 md:py-16 px-6 text-center bg-surface relative overflow-hidden">
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

      <Footer />
    </div>
  );
};

export default Landing;

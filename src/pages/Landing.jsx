import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900 selection:bg-indigo-200 selection:text-indigo-950">
      <PublicNavbar />

      <main className="pt-24">
        {/* HERO */}
        <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600/5 blur-[120px] rounded-full" />
          <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-600 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                </span>
                Food Rescue Network
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Bridge Surplus Food to{" "}
                <span className="text-indigo-700 italic">Those in Need</span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 max-w-xl leading-relaxed">
                Sahyog Setu connects surplus food with NGOs and volunteers in
                real time, so food reaches the right place faster and with less
                waste.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-indigo-700/20 flex items-center gap-2 hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    rocket_launch
                  </span>
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-200 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    target
                  </span>
                  View Demo
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/60 backdrop-blur">
                <img
                  alt="Volunteers handling rescued food"
                  src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1400&q=80"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="bg-slate-100 py-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight">
                The Food Waste Problem
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-full" />
              <p className="text-lg text-slate-600 leading-relaxed">
                Edible food gets wasted every day while people still need
                support. The gap is usually coordination: donors, NGOs, and
                volunteers are not connected in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60">
                <span className="material-symbols-outlined text-4xl text-rose-500 mb-4">
                  leak_remove
                </span>
                <h3 className="font-bold text-lg mb-2">Disconnected Data</h3>
                <p className="text-sm text-slate-600">
                  Siloed information slows down food redistribution.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 mt-8">
                <span className="material-symbols-outlined text-4xl text-indigo-600 mb-4">
                  timer_off
                </span>
                <h3 className="font-bold text-lg mb-2">Delayed Action</h3>
                <p className="text-sm text-slate-600">
                  Manual coordination wastes valuable response time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTION / BENTO GRID */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                The Intelligence Bridge
              </h2>
              <p className="text-slate-600">
                Sahyog Setu turns fragmented requests into coordinated action
                with a clean, real-time workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-indigo-700 text-white p-10 rounded-2xl relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold">
                      Predictive Matchmaking
                    </h3>
                    <p className="text-indigo-100 max-w-md">
                      The system highlights likely surplus, identifies matching
                      need areas, and helps route resources automatically.
                    </p>
                  </div>

                  <div className="pt-8">
                    <Link
                      to="/register"
                      className="bg-white text-indigo-700 px-6 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 group-hover:gap-4 transition-all"
                    >
                      Learn More{" "}
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              </div>

              <div className="bg-slate-100 p-10 rounded-2xl flex flex-col justify-center text-center space-y-4 border border-slate-200/60">
                <span className="material-symbols-outlined text-5xl text-indigo-700 mx-auto">
                  hub
                </span>
                <h3 className="text-xl font-bold">Unified Network</h3>
                <p className="text-sm text-slate-600">
                  One place for donors, volunteers, and NGOs to coordinate.
                </p>
              </div>

              <div className="bg-slate-100 p-10 rounded-2xl border border-slate-200/60">
                <span className="material-symbols-outlined text-4xl text-emerald-600 mb-6">
                  verified
                </span>
                <h3 className="text-xl font-bold mb-3">Verification Engine</h3>
                <p className="text-sm text-slate-600">
                  OTP-based verification helps confirm successful delivery.
                </p>
              </div>

              <div className="md:col-span-2 relative rounded-2xl overflow-hidden min-h-[300px]">
                <img
                  alt="Delivery and logistics tracking"
                  className="absolute inset-0 w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1581093458791-9d8e3c1d1c1f?auto=format&fit=crop&w=1400&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent p-10 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Real-Time Visualization
                  </h3>
                  <p className="text-white/75 text-sm max-w-sm">
                    Watch food movement, pickup status, and completion updates
                    in one dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="bg-white py-24 px-6 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex-1 text-center space-y-4 group">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto border border-slate-200/60 group-hover:bg-indigo-100 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-indigo-700">
                    inbox
                  </span>
                </div>
                <h4 className="font-bold text-lg">Need Signal Generated</h4>
                <p className="text-sm text-slate-600 px-4">
                  A surplus request is created from a donor, NGO, or volunteer.
                </p>
              </div>

              <div className="hidden md:block">
                <span className="material-symbols-outlined text-slate-400">
                  trending_flat
                </span>
              </div>

              <div className="flex-1 text-center space-y-4 group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-700 to-indigo-500 flex items-center justify-center mx-auto shadow-xl shadow-indigo-700/20 scale-110">
                  <span className="material-symbols-outlined text-4xl text-white">
                    psychology
                  </span>
                </div>
                <h4 className="font-bold text-lg">AI Matching Engine</h4>
                <p className="text-sm text-slate-600 px-4">
                  The system identifies the best volunteer and nearest route.
                </p>
              </div>

              <div className="hidden md:block">
                <span className="material-symbols-outlined text-slate-400">
                  trending_flat
                </span>
              </div>

              <div className="flex-1 text-center space-y-4 group">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto border border-slate-200/60 group-hover:bg-indigo-100 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-indigo-700">
                    auto_mode
                  </span>
                </div>
                <h4 className="font-bold text-lg">Smart Dispatch</h4>
                <p className="text-sm text-slate-600 px-4">
                  Volunteers receive the task and carry out pickup and delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-24 px-6 bg-slate-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="material-symbols-outlined text-indigo-700 text-3xl mb-6">
                dynamic_feed
              </span>
              <h3 className="text-xl font-bold mb-4">Real-Time Matching</h3>
              <p className="text-slate-600 leading-relaxed">
                Requests and volunteers are matched as soon as new data arrives.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="material-symbols-outlined text-indigo-700 text-3xl mb-6">
                location_on
              </span>
              <h3 className="text-xl font-bold mb-4">
                Location-Based Allocation
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Nearby volunteers are prioritized to reduce travel time.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="material-symbols-outlined text-indigo-700 text-3xl mb-6">
                insights
              </span>
              <h3 className="text-xl font-bold mb-4">Decision Support</h3>
              <p className="text-slate-600 leading-relaxed">
                The dashboard helps organizers choose the fastest route forward.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="material-symbols-outlined text-indigo-700 text-3xl mb-6">
                analytics
              </span>
              <h3 className="text-xl font-bold mb-4">Impact Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                View completed requests, delivery status, and overall impact.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="material-symbols-outlined text-indigo-700 text-3xl mb-6">
                security
              </span>
              <h3 className="text-xl font-bold mb-4">Secure &amp; Scalable</h3>
              <p className="text-slate-600 leading-relaxed">
                Verification and role-based access keep the workflow safe.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-indigo-700 to-indigo-600 text-white rounded-2xl flex flex-col justify-center items-center text-center shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Ready to Scale?</h3>
              <p className="text-indigo-100 text-sm mb-6">
                Join the people already helping food reach where it is needed.
              </p>
              <Link
                to="/register"
                className="bg-white text-indigo-700 px-6 py-2 rounded-xl font-bold text-sm"
              >
                Join Today
              </Link>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Operational Excellence
            </h2>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden mb-6 h-64">
                  <img
                    alt="Food donation and sorting"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80"
                  />
                </div>
                <h4 className="text-xl font-bold mb-2">
                  Food Waste Redistribution
                </h4>
                <p className="text-slate-600 text-sm">
                  Redirecting surplus food to shelters and NGOs before it goes
                  to waste.
                </p>
              </div>

              <div className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden mb-6 h-64">
                  <img
                    alt="Relief supplies and emergency response"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                  />
                </div>
                <h4 className="text-xl font-bold mb-2">
                  Disaster Relief Coordination
                </h4>
                <p className="text-slate-600 text-sm">
                  Faster dispatch for urgent support when response time matters
                  most.
                </p>
              </div>

              <div className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden mb-6 h-64">
                  <img
                    alt="City logistics and tracking"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1200&q=80"
                  />
                </div>
                <h4 className="text-xl font-bold mb-2">
                  Urban Resource Optimization
                </h4>
                <p className="text-slate-600 text-sm">
                  Managing shared resources across the city with less waste and
                  better coordination.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT STATS */}
        <section className="bg-indigo-950 py-24 px-6 text-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-6xl font-bold tracking-tighter text-emerald-300">
                0%
              </div>
              <div className="text-indigo-200 font-medium uppercase tracking-widest text-xs">
                Reduction in Waste
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-6xl font-bold tracking-tighter text-emerald-300">
                0m
              </div>
              <div className="text-indigo-200 font-medium uppercase tracking-widest text-xs">
                Avg Response Time
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-6xl font-bold tracking-tighter text-emerald-300">
                0
              </div>
              <div className="text-indigo-200 font-medium uppercase tracking-widest text-xs">
                Resources Allocated
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-700 to-indigo-600 rounded-[2.5rem] p-12 lg:p-20 text-center space-y-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-[10rem]">
                auto_awesome
              </span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight leading-tight relative z-10">
              Be part of a smarter, faster, and more connected impact system.
            </h2>

            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link
                to="/register"
                className="bg-white text-indigo-700 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition-all flex items-center gap-3 shadow-xl"
              >
                <span className="material-symbols-outlined">
                  volunteer_activism
                </span>
                Join Us
              </Link>

              <Link
                to="/login"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all flex items-center gap-3"
              >
                <span className="material-symbols-outlined">
                  report_gmailerrorred
                </span>
                Report Surplus
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-12 max-w-7xl mx-auto">
          <div className="space-y-4 mb-8 md:mb-0">
            <div className="flex items-center gap-3">
              <img
                src="/sahyog_setu.png"
                alt="Sahyog Setu Logo"
                className="h-6 w-auto object-contain"
              />
              <span className="text-lg font-bold text-indigo-900">
                Sahyog Setu
              </span>
            </div>
            <p className="text-xs text-slate-500">
              © 2026 Sahyog Setu. Food rescue and volunteer coordination.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs text-slate-500">
            <Link
              className="hover:text-indigo-700 transition-colors"
              to="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="hover:text-indigo-700 transition-colors"
              to="/terms"
            >
              Terms of Service
            </Link>
            <Link
              className="hover:text-indigo-700 transition-colors"
              to="/contact"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

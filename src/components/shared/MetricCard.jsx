import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ label, value, icon, highlight = false, delay = "0ms", className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: parseFloat(delay) / 1000 }}
    className={`p-4 sm:p-6 rounded-[2rem] flex flex-col items-center justify-center text-center border-2 border-white shadow-soft hover:scale-[1.03] transition-all cursor-default group ${
      highlight ? "bg-primaryGradient text-white shadow-lg shadow-primary/25 border-none" : "bg-surface_lowest"
    } ${className}`}
  >
    <div className={`w-10 h-10 rounded-2xl mb-4 flex items-center justify-center transition-all ${
        highlight ? "bg-white/20" : "bg-primary/5 group-hover:bg-primary group-hover:text-white"
    }`}>
        <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="text-3xl font-outfit font-black mb-1">{value}</div>
    <div className={`text-[10px] uppercase font-black tracking-[0.2em] ${highlight ? "opacity-70" : "text-on_surface_variant"}`}>
        {label}
    </div>
  </motion.div>
);

export default MetricCard;

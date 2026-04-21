import React from 'react';

const ActionInput = ({ label, value, onChange, placeholder, type = "text", maxLength, className = "", bgClassName = "bg-surface_high" }) => (
  <div className={`flex flex-col gap-2 group ${className}`}>
    {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant ml-1 group-focus-within:text-primary transition-colors">
            {label}
        </label>
    )}
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      className={`px-5 py-3 rounded-2xl ${bgClassName} border-2 border-transparent focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium`}
    />
  </div>
);

export default ActionInput;

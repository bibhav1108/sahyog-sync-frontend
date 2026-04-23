import React from 'react';

const ActionInput = ({ label, value, onChange, placeholder, type = "text", maxLength, className = "", bgClassName = "bg-surface_high", icon, error }) => (
  <div className={`flex flex-col gap-1.5 group ${className}`}>
    {label && (
        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${
          error ? 'text-red-500' : 'text-on_surface_variant group-focus-within:text-primary'
        }`}>
            {label}
        </label>
    )}
    <div className="relative">
      {icon && (
        <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${
          error ? 'text-red-400' : 'text-on_surface_variant/40 group-focus-within:text-primary'
        }`}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-12 pr-5' : 'px-5'} py-2.5 rounded-2xl ${bgClassName} border-2 transition-all text-sm font-medium focus:outline-none focus:ring-4 ${
          error 
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/5 bg-red-50/50' 
            : 'border-transparent focus:border-primary/20 focus:ring-primary/5'
        }`}
      />
    </div>
    {error && (
      <span className="text-[10px] font-bold text-red-500 ml-1 mt-0.5 animate-fadeIn">
        {error}
      </span>
    )}
  </div>
);

export default ActionInput;

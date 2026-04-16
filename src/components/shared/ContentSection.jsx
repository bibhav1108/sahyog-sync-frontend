import React from 'react';

const ContentSection = ({ title, icon, children, delay = "0ms", className = "" }) => (
  <div 
    className={`bg-surface_lowest p-5 sm:p-8 rounded-[2rem] border border-white shadow-soft space-y-6 animate-fadeIn ${className}`}
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center gap-3">
        {icon && (
            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl font-bold">{icon}</span>
            </div>
        )}
        <h3 className="font-outfit font-black text-on_surface tracking-tight uppercase text-xs">{title}</h3>
    </div>
    {children}
  </div>
);

export default ContentSection;

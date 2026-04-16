import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    const iconMap = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning'
    };

    const colorMap = {
        success: 'border-green-500/20 bg-green-500/10 text-green-600',
        error: 'border-red-500/20 bg-red-500/10 text-red-600',
        info: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600'
    };

    return (
        <div className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className={`pointer-events-auto px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md ${colorMap[toast.type] || colorMap.success}`}
                    >
                        <span className="material-symbols-outlined">{iconMap[toast.type] || iconMap.success}</span>
                        <div className="flex-1">
                            <p className="text-sm font-bold tracking-tight leading-tight">{toast.message}</p>
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;

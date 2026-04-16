import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🛰️ GLOBAL MODAL COMPONENT
 * Uses React Portals to break out of layout stacking contexts.
 * Guarantees centering on screen and coverage over global navbar/sidebar.
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  maxWidth = "max-w-2xl", 
  className = "",
  showClose = true
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
          {/* 🌑 BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* 📦 MODAL CONTENT */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-surface_high rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] ${className}`}
          >
            {/* Header (Optional) */}
            {(title || showClose) && (
              <div className="flex items-center justify-between p-5 sm:p-8 pb-4 shrink-0">
                {title ? (
                  <div>
                    <h2 className="font-outfit font-black text-xl sm:text-2xl text-on_surface tracking-tight leading-none">{title}</h2>
                  </div>
                ) : <div />}

                {showClose && (
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-on_surface_variant transition-all hover:scale-110 active:scale-90"
                  >
                    <span className="material-symbols-outlined text-sm font-black">close</span>
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 pt-4 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;

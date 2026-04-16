import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import pingSound from "../assets/ping.mp3";

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const audioRef = useRef(new Audio(pingSound));
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    // Modern browsers require a user interaction to "unlock" audio playback
    useEffect(() => {
        const unlock = () => {
            const audio = audioRef.current;
            if (audio && !audioUnlocked) {
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    setAudioUnlocked(true);
                    console.log("Audio system unlocked");
                }).catch(() => {});
            }
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };

        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
    }, [audioUnlocked]);

    const playPing = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.warn("Playback failed (possibly blocked by browser):", error);
        });
    }, []);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        
        setToasts((prev) => {
            // Cap at 5 toasts, remove oldest if necessary
            const newToasts = [...prev, { id, message, type, duration }];
            if (newToasts.length > 5) {
                return newToasts.slice(newToasts.length - 5);
            }
            return newToasts;
        });

        playPing();

        // Auto remove
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [playPing]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
};

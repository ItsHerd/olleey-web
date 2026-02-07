"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, AlertCircle, X, Rocket } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

import { motion, AnimatePresence } from "framer-motion";

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        // Add new toast to the START of the array so they stack from top down nicely
        setToasts((prev) => [{ id, message, type }, ...prev]);

        // Auto dismiss
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm items-end pr-4">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`
                                pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3 rounded-full shadow-2xl border backdrop-blur-xl
                                ${t.type === "success"
                                    ? "bg-zinc-950/80 text-white border-green-500/20 shadow-green-500/5 ring-1 ring-green-500/10"
                                    : t.type === "error"
                                        ? "bg-zinc-950/80 text-white border-red-500/20 shadow-red-500/5 ring-1 ring-red-500/10"
                                        : "bg-zinc-950/80 text-white border-white/10 shadow-white/5 ring-1 ring-white/5"
                                }
                            `}
                        >
                            <div className={`
                                flex items-center justify-center w-6 h-6 rounded-full 
                                ${t.type === "success" ? "bg-green-500/10 text-green-400" :
                                    t.type === "error" ? "bg-red-500/10 text-red-400" :
                                        "bg-blue-500/10 text-blue-400"}
                            `}>
                                {t.type === "success" && <Rocket className="w-3.5 h-3.5" />}
                                {t.type === "error" && <AlertCircle className="w-3.5 h-3.5" />}
                                {t.type === "info" && <CheckCircle className="w-3.5 h-3.5" />}
                            </div>

                            <p className="text-xs font-medium font-mono leading-tight tracking-wide">{t.message}</p>

                            <button
                                onClick={() => removeToast(t.id)}
                                className="ml-2 hover:bg-white/10 p-1.5 rounded-full text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

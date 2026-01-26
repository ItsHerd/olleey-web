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

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

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
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-right-full
              ${t.type === "success"
                                ? "bg-black/90 text-white border-green-500/30 shadow-green-500/10"
                                : t.type === "error"
                                    ? "bg-black/90 text-white border-red-500/30 shadow-red-500/10"
                                    : "bg-black/90 text-white border-white/10"
                            }
            `}
                    >
                        {t.type === "success" && <Rocket className="w-5 h-5 text-green-400" />}
                        {t.type === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
                        {t.type === "info" && <CheckCircle className="w-5 h-5 text-blue-400" />}

                        <p className="text-sm font-medium">{t.message}</p>

                        <button
                            onClick={() => removeToast(t.id)}
                            className="ml-2 hover:bg-white/20 p-1 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
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

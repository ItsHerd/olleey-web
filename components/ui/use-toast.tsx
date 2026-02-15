"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const TOAST_DURATION_MS = 4500;
const MAX_TOASTS = 4;

const toastStyles: Record<
  ToastType,
  {
    label: string;
    container: string;
    iconWrap: string;
    progress: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  success: {
    label: "Success",
    container: "border-emerald-500/30 ring-1 ring-emerald-500/20",
    iconWrap: "bg-emerald-500/15 text-emerald-500",
    progress: "bg-emerald-500/90",
    Icon: CheckCircle2,
  },
  error: {
    label: "Error",
    container: "border-red-500/30 ring-1 ring-red-500/20",
    iconWrap: "bg-red-500/15 text-red-500",
    progress: "bg-red-500/90",
    Icon: AlertTriangle,
  },
  info: {
    label: "Notice",
    container: "border-blue-500/30 ring-1 ring-blue-500/20",
    iconWrap: "bg-blue-500/15 text-blue-500",
    progress: "bg-blue-500/90",
    Icon: Info,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 11);
      setToasts((prev) => [{ id, message, type }, ...prev].slice(0, MAX_TOASTS));
      window.setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION_MS);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-[110] flex w-[min(420px,calc(100vw-1.5rem))] flex-col gap-2 sm:right-4 sm:top-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const styles = toastStyles[t.type];
            const Icon = styles.Icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`pointer-events-auto relative overflow-hidden rounded-xl border bg-background/95 text-foreground shadow-2xl backdrop-blur-md ${styles.container}`}
              >
                <div className="flex items-start gap-3 px-3 py-3.5">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{styles.label}</p>
                    <p className="mt-0.5 break-words text-sm font-medium leading-snug">{t.message}</p>
                  </div>

                  <button
                    onClick={() => removeToast(t.id)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="h-1 w-full bg-muted/60">
                  <motion.div
                    className={`h-full ${styles.progress}`}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: TOAST_DURATION_MS / 1000, ease: "linear" }}
                  />
                </div>
              </motion.div>
            );
          })}
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

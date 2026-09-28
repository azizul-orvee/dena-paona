"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (t: Omit<Toast, "id" | "tone"> & { tone?: ToastTone }) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const TONES: Record<
  ToastTone,
  { icon: React.ElementType; ring: string; glow: string }
> = {
  success: {
    icon: CheckCircle2,
    ring: "text-paona-400",
    glow: "shadow-[0_18px_50px_-20px_rgb(22_201_139/0.7)]",
  },
  error: {
    icon: TriangleAlert,
    ring: "text-dena-400",
    glow: "shadow-[0_18px_50px_-20px_rgb(242_69_106/0.7)]",
  },
  info: {
    icon: Info,
    ring: "text-brand-300",
    glow: "shadow-[0_18px_50px_-20px_rgb(124_92_255/0.7)]",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const nextId = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    ({ title, description, tone = "success" }) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:top-0 sm:items-end sm:p-6 sm:pt-[4.75rem]"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { icon: Icon, ring, glow } = TONES[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.94, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(4px)" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className={cn(
                  "glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3.5",
                  glow,
                )}
              >
                <Icon className={cn("mt-0.5 h-[18px] w-[18px] shrink-0", ring)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg">{t.title}</p>
                  {t.description ? (
                    <p className="mt-0.5 text-[0.8125rem] leading-snug text-fg-muted">
                      {t.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="-mr-1 rounded-lg p-1 text-fg-subtle transition-colors hover:bg-white/5 hover:text-fg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

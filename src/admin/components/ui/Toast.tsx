import React, { useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counter = useRef(0);

    const toast = useCallback((message: string, type: ToastType = "success") => {
        const id = ++counter.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
        success: { bg: "#f0faf4", border: "#4caf7d", icon: "✓" },
        error: { bg: "#fff0f0", border: "#e05555", icon: "✕" },
        info: { bg: "var(--parchment)", border: "var(--gold)", icon: "i" },
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div
                style={{
                    position: "fixed",
                    bottom: 28,
                    right: 28,
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    pointerEvents: "none",
                }}
            >
                {toasts.map((t) => {
                    const c = colors[t.type];
                    return (
                        <div
                            key={t.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                background: c.bg,
                                border: `1px solid ${c.border}`,
                                borderLeft: `4px solid ${c.border}`,
                                borderRadius: "var(--radius-sm)",
                                padding: "13px 20px",
                                boxShadow: "var(--shadow-lg)",
                                fontFamily: "var(--font-body)",
                                fontSize: "0.90rem",
                                color: "var(--text-main)",
                                minWidth: 280,
                                maxWidth: 400,
                                animation: "toastIn 0.3s ease",
                                pointerEvents: "auto",
                            }}
                        >
                            <span
                                style={{
                                    width: 22, height: 22,
                                    borderRadius: "50%",
                                    background: c.border,
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                {c.icon}
                            </span>
                            {t.message}
                        </div>
                    );
                })}
            </div>
            <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
        </ToastContext.Provider>
    );
};

export function useToast(): ToastContextValue {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
    return ctx;
}

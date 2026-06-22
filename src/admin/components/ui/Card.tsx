import React from "react";

interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    noPad?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, action, noPad }) => (
    <div
        style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
            marginBottom: 24,
        }}
    >
        {(title || action) && (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 24px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--parchment)",
                    gap: 12,
                }}
            >
                <div>
                    {title && (
                        <h3
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1.05rem",
                                fontWeight: 700,
                                color: "var(--text-main)",
                                margin: 0,
                            }}
                        >
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p
                            style={{
                                fontSize: "0.80rem",
                                color: "var(--text-muted)",
                                margin: "4px 0 0",
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
        )}
        <div style={{ padding: noPad ? 0 : "24px" }}>{children}</div>
    </div>
);

// ── Stat card for dashboard ────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = "var(--gold)" }) => (
    <div
        style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            boxShadow: "var(--shadow)",
        }}
    >
        <div
            style={{
                width: 48, height: 48,
                borderRadius: "var(--radius-sm)",
                background: `${color}18`,
                border: `1px solid ${color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                flexShrink: 0,
            }}
        >
            {icon}
        </div>
        <div>
            <div
                style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontSize: "0.80rem",
                    color: "var(--text-muted)",
                    marginTop: 6,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                }}
            >
                {label}
            </div>
        </div>
    </div>
);

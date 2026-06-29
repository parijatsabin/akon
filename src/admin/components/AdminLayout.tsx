import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
    LayoutDashboard, Settings, ShoppingBag, MessageSquare,
    Menu, ExternalLink, LogOut,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
    { label: "Collection", href: "/admin/collection", icon: <ShoppingBag size={18} /> },
    { label: "Testimonials", href: "/admin/testimonials", icon: <MessageSquare size={18} /> },
];

const SIDEBAR_W = 220;

interface Props { children: React.ReactNode; }

const AdminLayout: React.FC<Props> = ({ children }) => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login", { replace: true });
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--parchment)", fontFamily: "var(--font-body)" }}>

            {/* ── Sidebar ── */}
            <aside style={{
                width: SIDEBAR_W,
                minHeight: "100vh",
                background: "var(--charcoal)",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: 0, left: 0, bottom: 0,
                zIndex: 200,
                flexShrink: 0,
            }}>
                {/* Logo */}
                <div style={{
                    padding: "24px 20px 20px",
                    borderBottom: "1px solid rgba(162,127,63,0.20)",
                }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.20em", color: "var(--gold-light)", lineHeight: 1 }}>
                        ANOK
                    </div>
                    <div style={{ fontSize: "0.60rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)", marginTop: 4 }}>
                        Content Studio
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "16px 0" }}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.href === "/admin"}
                            style={({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "12px 20px",
                                fontSize: "0.86rem",
                                fontWeight: 600,
                                color: isActive ? "#fff" : "rgba(255,255,255,0.50)",
                                background: isActive ? "rgba(162,127,63,0.18)" : "transparent",
                                borderLeft: isActive ? "3px solid var(--gold)" : "3px solid transparent",
                                textDecoration: "none",
                                transition: "all 0.18s",
                                whiteSpace: "nowrap",
                            })}
                            onMouseEnter={(e) => {
                                if (e.currentTarget.getAttribute("aria-current") !== "page") {
                                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (e.currentTarget.getAttribute("aria-current") !== "page") {
                                    e.currentTarget.style.color = "rgba(255,255,255,0.50)";
                                    e.currentTarget.style.background = "transparent";
                                }
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div style={{ borderTop: "1px solid rgba(162,127,63,0.18)", padding: "10px 0" }}>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", fontSize: "0.82rem", fontWeight: 500, color: "rgba(255,255,255,0.40)", textDecoration: "none", transition: "color 0.18s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.80)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.40)")}
                    >
                        <ExternalLink size={15} />
                        View Site
                    </a>
                    <button
                        onClick={handleLogout}
                        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 20px", fontSize: "0.82rem", fontWeight: 500, background: "none", border: "none", color: "rgba(255,255,255,0.40)", cursor: "pointer", transition: "color 0.18s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#e05555")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.40)")}
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div style={{ marginLeft: SIDEBAR_W, flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>

                {/* Topbar */}
                <header style={{
                    height: 56,
                    background: "#fff",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 32px",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    flexShrink: 0,
                }}>
                    {/* Mobile toggle */}
                    <button
                        className="admin-mob-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ display: "none", alignItems: "center", justifyContent: "center", width: 34, height: 34, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--parchment)", cursor: "pointer", color: "var(--text-main)" }}
                    >
                        <Menu size={16} />
                    </button>

                    <span style={{ fontSize: "0.80rem", color: "var(--text-faint)" }}>
                        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.80rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            {username?.charAt(0).toUpperCase() ?? "A"}
                        </div>
                        <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-main)" }}>
                            {username}
                        </span>
                    </div>
                </header>

                {/* Page content — full width */}
                <main style={{ flex: 1, padding: "36px 40px", width: "100%" }}>
                    {children}
                </main>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .admin-mob-btn { display: flex !important; }
        }
      `}</style>
        </div>
    );
};

export default AdminLayout;

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
    LayoutDashboard, Settings, Image, BarChart2, Info,
    ShoppingBag, MessageSquare, Anchor, Mail, PanelBottom,
    Menu, X, ExternalLink, LogOut, ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={17} /> },
    { label: "Global Settings", href: "/admin/settings", icon: <Settings size={17} /> },
    { label: "Hero", href: "/admin/hero", icon: <Image size={17} /> },
    { label: "Stats Bar", href: "/admin/stats", icon: <BarChart2 size={17} /> },
    { label: "About", href: "/admin/about", icon: <Info size={17} /> },
    { label: "Collection", href: "/admin/collection", icon: <ShoppingBag size={17} /> },
    { label: "Testimonials", href: "/admin/testimonials", icon: <MessageSquare size={17} /> },
    { label: "Commitment", href: "/admin/commitment", icon: <Anchor size={17} /> },
    { label: "Newsletter", href: "/admin/newsletter", icon: <Mail size={17} /> },
    { label: "Navigation", href: "/admin/navigation", icon: <Menu size={17} /> },
    { label: "Footer", href: "/admin/footer", icon: <PanelBottom size={17} /> },
];

const SIDEBAR_W = 248;

interface Props {
    children: React.ReactNode;
}

const AdminLayout: React.FC<Props> = ({ children }) => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/admin/login", { replace: true });
    };

    const sidebarW = collapsed ? 64 : SIDEBAR_W;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--font-body)" }}>

            {/* Sidebar */}
            <aside
                className="admin-sidebar"
                style={{
                    width: sidebarW,
                    minHeight: "100vh",
                    background: "var(--charcoal)",
                    borderRight: "1px solid rgba(162,127,63,0.18)",
                    display: "flex",
                    flexDirection: "column",
                    position: "fixed",
                    top: 0, left: 0, bottom: 0,
                    zIndex: 200,
                    transition: "width 0.28s ease",
                    overflow: "hidden",
                }}
            >
                {/* Brand header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "space-between",
                        padding: collapsed ? "22px 0" : "22px 20px",
                        borderBottom: "1px solid rgba(162,127,63,0.18)",
                        minHeight: 68,
                    }}
                >
                    {!collapsed && (
                        <div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.18em", color: "var(--gold-light)" }}>
                                ANOK
                            </div>
                            <div style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginTop: 1 }}>
                                Content Studio
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        style={{
                            width: 32, height: 32,
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            color: "rgba(255,255,255,0.55)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            flexShrink: 0,
                        }}
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? <ChevronRight size={14} /> : <X size={14} />}
                    </button>
                </div>

                {/* Nav links */}
                <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto", overflowX: "hidden" }}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.href === "/admin"}
                            title={collapsed ? item.label : undefined}
                            style={({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                gap: 11,
                                padding: collapsed ? "11px 0" : "11px 20px",
                                justifyContent: collapsed ? "center" : "flex-start",
                                fontSize: "0.83rem",
                                fontWeight: 600,
                                letterSpacing: "0.03em",
                                color: isActive ? "var(--gold-light)" : "rgba(255,255,255,0.55)",
                                background: isActive ? "rgba(162,127,63,0.14)" : "transparent",
                                borderLeft: isActive ? "3px solid var(--gold)" : "3px solid transparent",
                                transition: "all 0.18s",
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                            })}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                if (el.getAttribute("aria-current") !== "page") {
                                    el.style.background = "rgba(255,255,255,0.05)";
                                    el.style.color = "rgba(255,255,255,0.85)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                if (el.getAttribute("aria-current") !== "page") {
                                    el.style.background = "transparent";
                                    el.style.color = "rgba(255,255,255,0.55)";
                                }
                            }}
                        >
                            <span style={{ flexShrink: 0 }}>{item.icon}</span>
                            {!collapsed && item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom actions */}
                <div style={{ borderTop: "1px solid rgba(162,127,63,0.18)", padding: "12px 0" }}>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={collapsed ? "View Site" : undefined}
                        style={{
                            display: "flex", alignItems: "center", gap: 11,
                            padding: collapsed ? "11px 0" : "11px 20px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            fontSize: "0.82rem", fontWeight: 600,
                            color: "rgba(255,255,255,0.45)",
                            textDecoration: "none", transition: "color 0.18s",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                    >
                        <ExternalLink size={16} />
                        {!collapsed && "View Site"}
                    </a>
                    <button
                        onClick={handleLogout}
                        title={collapsed ? "Logout" : undefined}
                        style={{
                            display: "flex", alignItems: "center", gap: 11,
                            width: "100%",
                            padding: collapsed ? "11px 0" : "11px 20px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            fontSize: "0.82rem", fontWeight: 600,
                            background: "none", border: "none",
                            color: "rgba(255,255,255,0.45)",
                            cursor: "pointer", transition: "color 0.18s",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#e05555")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                    >
                        <LogOut size={16} />
                        {!collapsed && "Logout"}
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div style={{ marginLeft: sidebarW, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.28s ease", minWidth: 0 }}>

                {/* Top bar */}
                <header
                    style={{
                        height: 60, background: "#fff",
                        borderBottom: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0 28px",
                        position: "sticky", top: 0, zIndex: 100,
                    }}
                >
                    <button
                        className="admin-mobile-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{
                            display: "none", alignItems: "center", justifyContent: "center",
                            width: 36, height: 36,
                            border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                            background: "var(--parchment)", cursor: "pointer", color: "var(--text-main)",
                        }}
                    >
                        <Menu size={18} />
                    </button>

                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: "0.82rem",
                            letterSpacing: "0.04em", textTransform: "uppercase",
                        }}>
                            {username?.charAt(0).toUpperCase() ?? "A"}
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                            {username}
                        </span>
                    </div>
                </header>

                {/* Page */}
                <main style={{ flex: 1, padding: "32px 28px", maxWidth: 1100, width: "100%" }}>
                    {children}
                </main>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(${mobileOpen ? "0" : `-${sidebarW}px`}); }
          .admin-mobile-btn { display: flex !important; }
        }
      `}</style>
        </div>
    );
};

export default AdminLayout;

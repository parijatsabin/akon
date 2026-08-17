import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Menu, ExternalLink, LogOut } from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin" },
    { label: "Settings", href: "/admin/settings" },
    { label: "Signature Product", href: "/admin/featured" },
    { label: "Testimonials", href: "/admin/testimonials" },
    { label: "Pages", href: "/admin/pages" },
    { label: "SEO", href: "/admin/seo" },
    { label: "Inbox", href: "/admin/inbox" },
];

interface Props { children: React.ReactNode; }

const AdminLayout: React.FC<Props> = ({ children }) => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    // logout() is async now — it revokes the Supabase session server-side.
    // Awaiting it means we never navigate away with the session still live.
    const handleLogout = async () => {
        await logout();
        navigate("/admin/login", { replace: true });
    };

    return (
        <div className="adm adm-shell">
            <aside className={`adm-sidebar on-noir${mobileOpen ? " is-open" : ""}`}>
                <div className="adm-brand">
                    <div className="adm-brand-name">ANOK</div>
                    <div className="adm-brand-sub">Content Studio</div>
                </div>

                <nav className="adm-nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.href === "/admin"}
                            className={({ isActive }) => `adm-nav-link${isActive ? " is-active" : ""}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="adm-sidebar-foot">
                    <a href="/" target="_blank" rel="noopener noreferrer" className="adm-foot-btn">
                        <ExternalLink size={14} />
                        View site
                    </a>
                    <button onClick={handleLogout} className="adm-foot-btn adm-foot-btn-danger">
                        <LogOut size={14} />
                        Log out
                    </button>
                </div>
            </aside>

            {mobileOpen && (
                <button className="adm-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
            )}

            <div className="adm-main">
                <header className="adm-topbar">
                    <button
                        className="adm-mob-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    >
                        <Menu size={16} />
                    </button>
                    <span className="adm-user">{username}</span>
                </header>

                <main className="adm-content">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;

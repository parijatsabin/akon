import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useContactAlerts } from "../lib/ContactAlerts";
import { Menu, ExternalLink, LogOut } from "lucide-react";

/**
 * Grouped to mirror the data rather than the order things were built:
 * Company is the business, Homepage/Product/Pages are what visitors read,
 * SEO is how it is found, Inbox is what comes back.
 */
const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin" },
    { label: "Company", href: "/admin/company" },
    { label: "Homepage", href: "/admin/homepage" },
    { label: "Product", href: "/admin/product" },
    { label: "Pages", href: "/admin/pages" },
    { label: "SEO", href: "/admin/seo" },
    { label: "Inbox", href: "/admin/inbox" },
];

interface Props { children: React.ReactNode; }

const AdminLayout: React.FC<Props> = ({ children }) => {
    const { username, logout } = useAuth();
    const { unread } = useContactAlerts();
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
                            {item.href === "/admin/inbox" && unread > 0 && (
                                <span className="adm-nav-count" aria-label={`${unread} unread`}>{unread}</span>
                            )}
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

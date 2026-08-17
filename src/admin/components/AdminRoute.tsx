/**
 * AdminRoute — protects all /admin/* pages.
 *
 * Two things changed when auth became real:
 *
 * 1. It waits for `loading`. Restoring a Supabase session is asynchronous, so
 *    redirecting on the first render would bounce an authenticated user to the
 *    login page every time they refreshed an admin page.
 *
 * 2. It is no longer the security boundary. Previously this check was all that
 *    stood between a visitor and the CMS, and it ran in the browser, so it
 *    stood for nothing. Now RLS in the database rejects unauthorised reads and
 *    writes regardless of what the UI renders. This guard is here so people
 *    see a login form instead of a broken page.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface Props {
    children: React.ReactNode;
    /** Restricts the route to superadmins; used by user management. */
    requireSuperadmin?: boolean;
}

const AdminRoute: React.FC<Props> = ({ children, requireSuperadmin = false }) => {
    const { isAuthenticated, loading, isSuperadmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="site-status" role="status" aria-live="polite">
                <div className="site-status-spinner" aria-hidden="true" />
                <span className="site-status-text">Checking your session…</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Replace so the login page doesn't show up in history on back-press
        return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }

    if (requireSuperadmin && !isSuperadmin) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;

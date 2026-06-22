/**
 * AdminRoute — protects all /admin/* pages.
 *
 * On every render it validates the sessionStorage token.
 * If invalid or expired → immediate redirect to /admin/login.
 * No way to bypass by typing the URL directly.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface Props {
    children: React.ReactNode;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Replace so the login page doesn't show up in history on back-press
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return <>{children}</>;
};

export default AdminRoute;

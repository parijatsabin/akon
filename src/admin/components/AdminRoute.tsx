/**
 * AdminRoute — protects all /admin/* pages.
 * Validates session and enforces user_type === 'admin'.
 * Customers who somehow land on /admin are redirected to /.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface Props {
    children: React.ReactNode;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
    const { isAuthenticated, userType } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    // Logged-in customer trying to access admin — send them home
    if (userType === "customer") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;

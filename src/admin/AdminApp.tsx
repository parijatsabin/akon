import React from "react";
import "./admin.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import { ContactAlertsProvider } from "./lib/ContactAlerts";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CompanyPage from "./pages/CompanyPage";
import HomepagePage from "./pages/HomepagePage";
import FeaturedProductPage from "./pages/FeaturedProductPage";
import PagesPage from "./pages/PagesPage";
import SeoPage from "./pages/SeoPage";
import InboxPage from "./pages/InboxPage";
import UsersPage from "./pages/UsersPage";
import AccountPage from "./pages/AccountPage";

const AdminApp: React.FC = () => (
    <AuthProvider>
        <ToastProvider>
            <Routes>
                {/* Public — no layout */}
                <Route path="login" element={<LoginPage />} />

                {/* Protected — all share AdminLayout */}
                <Route
                    path="*"
                    element={
                        <AdminRoute>
                            <ContactAlertsProvider>
                            <AdminLayout>
                                <Routes>
                                    <Route index element={<DashboardPage />} />
                                    <Route path="company" element={<CompanyPage />} />
                                    <Route path="homepage" element={<HomepagePage />} />
                                    <Route path="product" element={<FeaturedProductPage />} />
                                    <Route path="pages" element={<PagesPage />} />
                                    <Route path="seo" element={<SeoPage />} />
                                    <Route path="inbox" element={<InboxPage />} />
                                    <Route path="account" element={<AccountPage />} />
                                    {/* The nav item is hidden for admins and RLS rejects the
                                        writes; this guard is the middle of the three layers. */}
                                    <Route
                                        path="users"
                                        element={
                                            <AdminRoute requireSuperadmin>
                                                <UsersPage />
                                            </AdminRoute>
                                        }
                                    />
                                    {/* Legacy routes — the nav was regrouped, the URLs still resolve */}
                                    <Route path="settings" element={<Navigate to="/admin/homepage" replace />} />
                                    <Route path="featured" element={<Navigate to="/admin/product" replace />} />
                                    <Route path="testimonials" element={<Navigate to="/admin/homepage" replace />} />
                                    <Route path="hero" element={<Navigate to="/admin/homepage" replace />} />
                                    <Route path="about" element={<Navigate to="/admin/homepage" replace />} />
                                    <Route path="commitment" element={<Navigate to="/admin/homepage" replace />} />
                                    <Route path="newsletter" element={<Navigate to="/admin/homepage" replace />} />
                                    <Route path="footer" element={<Navigate to="/admin/homepage" replace />} />
                                    <Route path="brand" element={<Navigate to="/admin/company" replace />} />
                                    <Route path="*" element={<Navigate to="/admin" replace />} />
                                </Routes>
                            </AdminLayout>
                            </ContactAlertsProvider>
                        </AdminRoute>
                    }
                />
            </Routes>
        </ToastProvider>
    </AuthProvider>
);

export default AdminApp;

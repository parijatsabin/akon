import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GlobalSettingsPage from "./pages/GlobalSettingsPage";
import CollectionPage from "./pages/CollectionPage";
import TestimonialsPage from "./pages/TestimonialsPage";

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
                            <AdminLayout>
                                <Routes>
                                    <Route index element={<DashboardPage />} />
                                    <Route path="settings" element={<GlobalSettingsPage />} />
                                    <Route path="collection" element={<CollectionPage />} />
                                    <Route path="testimonials" element={<TestimonialsPage />} />
                                    {/* Legacy route redirects — in case any bookmark exists */}
                                    <Route path="hero" element={<Navigate to="/admin/settings" replace />} />
                                    <Route path="stats" element={<Navigate to="/admin/settings" replace />} />
                                    <Route path="about" element={<Navigate to="/admin/settings" replace />} />
                                    <Route path="commitment" element={<Navigate to="/admin/settings" replace />} />
                                    <Route path="newsletter" element={<Navigate to="/admin/settings" replace />} />
                                    <Route path="navigation" element={<Navigate to="/admin/settings" replace />} />
                                    <Route path="footer" element={<Navigate to="/admin/settings" replace />} />
                                    <Route path="*" element={<Navigate to="/admin" replace />} />
                                </Routes>
                            </AdminLayout>
                        </AdminRoute>
                    }
                />
            </Routes>
        </ToastProvider>
    </AuthProvider>
);

export default AdminApp;

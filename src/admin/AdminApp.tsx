/**
 * AdminApp — all /admin/* routes live here.
 * Imported lazily from the main App so the admin bundle never loads
 * on the public site.
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GlobalSettingsPage from "./pages/GlobalSettingsPage";
import HeroPage from "./pages/HeroPage";
import StatsPage from "./pages/StatsPage";
import AboutPage from "./pages/AboutPage";
import CollectionPage from "./pages/CollectionPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import CommitmentPage from "./pages/CommitmentPage";
import NewsletterPage from "./pages/NewsletterPage";
import NavigationPage from "./pages/NavigationPage";
import FooterPage from "./pages/FooterPage";

const AdminApp: React.FC = () => (
    <AuthProvider>
        <ToastProvider>
            <Routes>
                {/* Public login — no layout wrapper */}
                <Route path="login" element={<LoginPage />} />

                {/* All protected routes share the AdminLayout */}
                <Route
                    path="*"
                    element={
                        <AdminRoute>
                            <AdminLayout>
                                <Routes>
                                    <Route index element={<DashboardPage />} />
                                    <Route path="settings" element={<GlobalSettingsPage />} />
                                    <Route path="hero" element={<HeroPage />} />
                                    <Route path="stats" element={<StatsPage />} />
                                    <Route path="about" element={<AboutPage />} />
                                    <Route path="collection" element={<CollectionPage />} />
                                    <Route path="testimonials" element={<TestimonialsPage />} />
                                    <Route path="commitment" element={<CommitmentPage />} />
                                    <Route path="newsletter" element={<NewsletterPage />} />
                                    <Route path="navigation" element={<NavigationPage />} />
                                    <Route path="footer" element={<FooterPage />} />
                                    {/* Catch-all → dashboard */}
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

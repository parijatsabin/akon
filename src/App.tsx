import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SiteDataProvider } from "./data/SiteDataProvider";
import AdminApp from "./admin/AdminApp";
import PublicSite from "./PublicSite";
import AboutPage from "./pages/AboutPage";
import FragrancePage from "./pages/FragrancePage";
import ContactPage from "./pages/ContactPage";
import PolicyPage from "./pages/PolicyPage";
import FaqPage from "./pages/FaqPage";

const App: React.FC = () => (
  <BrowserRouter>
    {/*
      SiteDataProvider wraps every route so all components can call useSiteData().
      Routes are flat and absolute — no nested <Routes> inside a catch-all.
      This prevents the "filter/category switching breaks navigation" bug.
    */}
    <SiteDataProvider>
      <Routes>
        {/* ── Admin ── */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* ── Public multi-page routes ── */}
        <Route path="/fragrance" element={<FragrancePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PolicyPage section="privacy" />} />
        <Route path="/terms" element={<PolicyPage section="terms" />} />

        {/* ── Homepage (SPA sections) ── */}
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </SiteDataProvider>
  </BrowserRouter>
);

export default App;

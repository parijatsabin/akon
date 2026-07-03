import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCmsData } from "./admin/cms/useCmsData";
import { SiteDataContext } from "./PublicSite";
import AdminApp from "./admin/AdminApp";
import PublicSite from "./PublicSite";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

/**
 * Wraps all public routes with live CMS data so every component
 * can call useSiteData() — updates instantly on admin save.
 */
const PublicDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = useCmsData();
  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>;
};

const App: React.FC = () => (
  <BrowserRouter>
    {/*
          All public pages share one PublicDataProvider at the top.
          Routes are flat and absolute — no nested <Routes> inside a catch-all.
          This prevents the "filter/category switching breaks navigation" bug.
        */}
    <PublicDataProvider>
      <Routes>
        {/* ── Admin ── */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* ── Public multi-page routes ── */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* ── Homepage (SPA sections) ── */}
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </PublicDataProvider>
  </BrowserRouter>
);

export default App;

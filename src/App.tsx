import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import PublicSite from "./PublicSite";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Admin panel — mounted at /admin/* */}
      <Route path="/admin/*" element={<AdminApp />} />
      {/* Public website — everything else */}
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  </BrowserRouter>
);

export default App;

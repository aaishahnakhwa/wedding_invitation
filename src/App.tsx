import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Invitation } from "./pages/Invitation";

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invite" element={<Invitation />} />
        <Route path="/invite/:id" element={<Invitation />} />
        {/* Fallback to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

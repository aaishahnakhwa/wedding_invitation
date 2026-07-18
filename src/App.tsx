import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Invitation } from "./pages/Invitation";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invite" element={<Invitation />} />
        <Route path="/invite/:id" element={<Invitation />} />
        {/* Fallback to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { seedData } from "./lib/api";
import Layout from "./components/Layout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import DashboardPage from "./pages/DashboardPage";
import CharityDirectoryPage from "./pages/CharityDirectoryPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  useEffect(() => {
    // Seed data on first load
    seedData().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/charities" element={<CharityDirectoryPage />} />
            <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccessPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

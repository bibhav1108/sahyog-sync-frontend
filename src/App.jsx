import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Volunteers from "./pages/Volunteers";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import Inventory from "./pages/Inventory";
import Layout from "./components/Layout"; // ORG layout
import ActiveNeeds from "./pages/ActiveNeeds";
import DispatchHistory from "./pages/DispatchHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import Campaigns from "./pages/Campaigns";
import MissionResponse from "./pages/MissionResponse";
import CampaignHistory from "./pages/CampaignHistory";
import MarketplaceAlerts from "./pages/MarketplaceAlerts";
import MarketplaceStatsPage from "./pages/MarketplaceStats";
import VolunteerProfile from "./pages/VolunteerProfile";
import VerifyEmail from "./pages/VolunteerEmailVerification";
// 👉 (you should create this later)
import VolunteerLayout from "./components/VolunteerLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/missions/:campaign_id" element={<MissionResponse />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* ================= ORG ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <Volunteers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <Marketplace />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace-stats"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <MarketplaceStatsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <MarketplaceAlerts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/needs"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <ActiveNeeds />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispatches"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <DispatchHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <Campaigns />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaign-history"
          element={
            <ProtectedRoute allowedRole="NGO_COORDINATOR">
              <Layout>
                <CampaignHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================= VOLUNTEER ROUTES ================= */}

        <Route
          path="/volunteer/profile"
          element={
            <ProtectedRoute allowedRole="VOLUNTEER">
              <VolunteerLayout>
                <VolunteerProfile />
              </VolunteerLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

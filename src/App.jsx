import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AuthPortal from "./pages/auth/AuthPortal";
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
import NGOBrowser from "./pages/NGOBrowser";
import VolunteerLayout from "./components/VolunteerLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrganizations from "./pages/AdminOrganizations";
import AdminLayout from "./components/AdminLayout";
import ActivityHistory from "./pages/ActivityHistory";
import MarketplaceInventory from "./pages/MarketplaceInventory";
import CoordinatorProfile from "./pages/CoordinatorProfile";
import OrganizationProfile from "./pages/OrganizationProfile";
import ReviewPage from "./pages/ReviewPage";
import ContactPage from "./pages/ContactPage";
import HelpCenter from "./pages/HelpCenter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPortal />} />
        <Route path="/register" element={<AuthPortal />} />
        <Route path="/auth" element={<AuthPortal />} />
        <Route path="/missions/:campaign_id" element={<MissionResponse />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        <Route path="/register-volunteer" element={<AuthPortal />} />
        {/* ================= ORG ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <Volunteers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <Marketplace />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace-stats"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <MarketplaceStatsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <MarketplaceAlerts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/needs"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <ActiveNeeds />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispatches"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <DispatchHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <Campaigns />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaign-history"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <CampaignHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection-hub"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <MarketplaceInventory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-history"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <ActivityHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <CoordinatorProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <OrganizationProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <ReviewPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <ContactPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute allowedRoles={["NGO_COORDINATOR"]}>
              <Layout>
                <HelpCenter />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================= VOLUNTEER ROUTES ================= */}

        <Route
          path="/volunteer/profile"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <VolunteerLayout>
                <VolunteerProfile />
              </VolunteerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/find-ngo"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <VolunteerLayout>
                <NGOBrowser />
              </VolunteerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/reviews"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <VolunteerLayout>
                <ReviewPage />
              </VolunteerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/contact"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <VolunteerLayout>
                <ContactPage />
              </VolunteerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/help"
          element={
            <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
              <VolunteerLayout>
                <HelpCenter />
              </VolunteerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/organizations"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
              <AdminLayout>
                <AdminOrganizations />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

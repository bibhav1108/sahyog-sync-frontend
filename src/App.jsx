import { BrowserRouter, Routes, Route } from "react-router-dom";

import NGODashboard from "./pages/ngo/NGODashboard";
import AuthPortal from "./pages/public/AuthPortal";
import Volunteers from "./pages/ngo/Volunteers";
import Landing from "./pages/public/Landing";
import Marketplace from "./pages/ngo/Marketplace";
import Inventory from "./pages/ngo/Inventory";
import Layout from "./pages/ngo/components/Layout";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import ActiveNeeds from "./pages/ngo/ActiveNeeds";
import DispatchHistory from "./pages/ngo/archive/DispatchHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import Campaigns from "./pages/ngo/Campaigns";
import MissionResponse from "./pages/public/MissionResponse";
import CampaignHistory from "./pages/ngo/archive/CampaignHistory";
import MarketplaceAlerts from "./pages/ngo/MarketplaceAlerts";
import MarketplaceStatsPage from "./pages/ngo/archive/MarketplaceStats";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";

import NGOBrowser from "./pages/volunteer/NGOBrowser";
import VolunteerLayout from "./pages/volunteer/components/VolunteerLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminIssues from "./pages/admin/AdminIssues";
import AdminVolunteers from "./pages/admin/AdminVolunteers";
import AdminLayout from "./components/AdminLayout";
import ActivityHistory from "./pages/ngo/archive/ActivityHistory";
import MarketplaceInventory from "./pages/ngo/MarketplaceInventory";
import CoordinatorProfile from "./pages/ngo/CoordinatorProfile";
import OrganizationProfile from "./pages/ngo/OrganizationProfile";
import ReviewPage from "./pages/shared/ReviewPage";
import ContactPage from "./pages/shared/ContactPage";
import HelpCenter from "./pages/shared/HelpCenter";
import PickLocation from "./pages/public/PickLocation";

// NGO Admin Portal
import NGOAdminLayout from "./components/NGOAdminLayout";
import NGOAdminDashboard from "./pages/ngo/admin/NGOAdminDashboard";
import OrgIdentityPage from "./pages/ngo/admin/OrgIdentityPage";
import StaffControlPage from "./pages/ngo/admin/StaffControlPage";

function App() {
  return (
    <ToastProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          {/* 🌐 Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthPortal />} />
          <Route path="/register" element={<AuthPortal />} />
          <Route path="/auth" element={<AuthPortal />} />
          <Route path="/missions/:campaign_id" element={<MissionResponse />} />
          <Route path="/alert-location/:alert_id" element={<PickLocation />} />
          <Route path="/register-volunteer" element={<AuthPortal />} />
          

          {/* ================= ORG ROUTES ================= */}
          <Route
            path="/ngo/dashboard"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <NGODashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteers"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <Volunteers />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <Marketplace />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace-stats"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <MarketplaceStatsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <MarketplaceAlerts />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/needs"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <ActiveNeeds />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dispatches"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <DispatchHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/campaigns"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <Campaigns />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/campaign-history"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <CampaignHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection-hub"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <MarketplaceInventory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-history"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <ActivityHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <CoordinatorProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <ReviewPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <ContactPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute allowedRoles={["NGO_COORDINATOR", "NGO_ADMIN"]}>
                <Layout>
                  <HelpCenter />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* ================= NGO ADMIN PORTAL ================= */}
          <Route
            path="/ngo-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["NGO_ADMIN"]}>
                <NGOAdminLayout>
                  <NGOAdminDashboard />
                </NGOAdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo-admin/identity"
            element={
              <ProtectedRoute allowedRoles={["NGO_ADMIN"]}>
                <NGOAdminLayout>
                  <OrgIdentityPage />
                </NGOAdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo-admin/staff"
            element={
              <ProtectedRoute allowedRoles={["NGO_ADMIN"]}>
                <NGOAdminLayout>
                  <StaffControlPage />
                </NGOAdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ================= VOLUNTEER ROUTES ================= */}
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
                <VolunteerLayout>
                  <VolunteerDashboard />
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

          {/* ================= ADMIN ROUTES ================= */}
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
          <Route
            path="/admin/volunteers"
            element={
              <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
                <AdminLayout>
                  <AdminVolunteers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
                <AdminLayout>
                  <AdminReviews />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issues"
            element={
              <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
                <AdminLayout>
                  <AdminIssues />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Volunteers from "./pages/Volunteers";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import Inventory from "./pages/Inventory";
import Layout from "./components/Layout";
import ActiveNeeds from "./pages/ActiveNeeds";
import DispatchHistory from "./pages/DispatchHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import Campaigns from "./pages/Campaigns";
import MissionResponse from "./pages/MissionResponse";
import CampaignHistory from "./pages/CampaignHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/missions/:campaign_id" element={<MissionResponse />} />

        {/* 🔐 Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <Layout>
                <Volunteers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Layout>
                <Marketplace />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/needs"
          element={
            <ProtectedRoute>
              <Layout>
                <ActiveNeeds />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispatches"
          element={
            <ProtectedRoute>
              <Layout>
                <DispatchHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Layout>
                <Campaigns />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign-history"
          element={
            <ProtectedRoute>
              <Layout>
                <CampaignHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

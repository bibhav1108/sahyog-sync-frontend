import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateNeed from "./pages/CreateNeed";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Volunteers from "./pages/Volunteers";
import Landing from "./pages/Landing";
import Surplus from "./pages/surplus";
import Inventory from "./pages/Inventory";
import Layout from "./components/Layout";
import ActiveNeeds from "./pages/ActiveNeeds";
import DispatchHistory from "./pages/DispatchHistory";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/create"
          element={
            <Layout>
              <CreateNeed />
            </Layout>
          }
        />

        <Route
          path="/volunteers"
          element={
            <Layout>
              <Volunteers />
            </Layout>
          }
        />

        <Route
          path="/surplus"
          element={
            <Layout>
              <Surplus />
            </Layout>
          }
        />
        <Route
          path="/inventory"
          element={
            <Layout>
              <Inventory />
            </Layout>
          }
        />
        <Route
          path="/needs"
          element={
            <Layout>
              <ActiveNeeds />
            </Layout>
          }
        />
        <Route
          path="/dispatches"
          element={
            <Layout>
              <DispatchHistory />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

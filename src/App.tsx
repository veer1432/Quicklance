import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Experts from "./pages/Experts";
import PostIssue from "./pages/PostIssue";
import HowItWorks from "./pages/HowItWorks";
import ExpertProfile from "./pages/ExpertProfile";
import BecomeQuicklancer from "./pages/BecomeQuicklancer";
import Login from "./pages/Login";
import { FirebaseProvider, useFirebase } from "./contexts/FirebaseContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfileEditor from "./pages/dashboard/ProfileEditor";
import Wallet from "./pages/dashboard/Wallet";
import Calendar from "./pages/dashboard/Calendar";
import PhonePromptModal from "./components/PhonePromptModal";
import SessionManager from "./components/SessionManager";
import ResolutionCenter from "./components/ResolutionCenter";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import QuicklancerManagement from "./pages/admin/QuicklancerManagement";
import ClientManagement from "./pages/admin/ClientManagement";
import MISReports from "./pages/admin/MISReports";
import DisputeManagement from "./pages/admin/DisputeManagement";

import { ErrorBoundary } from "./components/ErrorBoundary";

function AppContent() {
  const { loading } = useFirebase();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300">
        <PhonePromptModal />
        <SessionManager />
        <ResolutionCenter />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/quicklancers" element={<AdminLayout><QuicklancerManagement /></AdminLayout>} />
          <Route path="/admin/clients" element={<AdminLayout><ClientManagement /></AdminLayout>} />
          <Route path="/admin/approvals" element={<AdminLayout><QuicklancerManagement /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><MISReports /></AdminLayout>} />
          <Route path="/admin/disputes" element={<AdminLayout><DisputeManagement /></AdminLayout>} />
          <Route path="/admin/complaints" element={<AdminLayout><div className="text-4xl font-black">Complaints (Coming Soon)</div></AdminLayout>} />

          {/* Dashboard Routes (No Navbar/Footer) */}
          <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
          <Route path="/dashboard/profile" element={<DashboardLayout><ProfileEditor /></DashboardLayout>} />
          <Route path="/dashboard/wallet" element={<DashboardLayout><Wallet /></DashboardLayout>} />
          <Route path="/dashboard/calendar" element={<DashboardLayout><Calendar /></DashboardLayout>} />
          <Route path="/dashboard/requests" element={<DashboardLayout><div className="text-4xl font-black">Requests (Coming Soon)</div></DashboardLayout>} />
          <Route path="/dashboard/analytics" element={<DashboardLayout><div className="text-4xl font-black">Analytics & MIS (Coming Soon)</div></DashboardLayout>} />

          <Route path="/become-quicklancer" element={<BecomeQuicklancer />} />
          <Route path="/login" element={<Login />} />

          {/* Main App Routes */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/experts" element={<Experts />} />
                    <Route path="/expert/:id" element={<ExpertProfile />} />
                    <Route path="/post-issue" element={<PostIssue />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/category/:category" element={<Experts />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}


export default function App() {
  return (
    <ThemeProvider>
      <FirebaseProvider>
        <CurrencyProvider>
          <Router>
            <AppContent />
          </Router>
        </CurrencyProvider>
      </FirebaseProvider>
    </ThemeProvider>
  );
}






import React, { Suspense, lazy, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import LandingPage from "./LandingPage";
// Page JS is lazy-loaded below, but page CSS leaks across pages, so every
// stylesheet is still loaded up front in the same order as before the split.
// A new page's CSS can simply be imported by that page.
import "./components/BrochureFlipBook.css";
import "./pages/ReadMoreInfo.css";
import "./countryPage.css";
import "./LoginPage.css";
import "./RegisterPage.css";
import "./ForgotPassword.css";
import "./ResetPassword.css";
import "./components/Sidebar.css";
import "./css/dashboard.css";
import "./css/documentChecklist.css";
import "./pages/Sessions.css";
import "./pages/Profile.css";
import "./pages/Messages.css";
import "./styles/admin.css";
import "./pages/admin/AdminDashboard.css";
import "./pages/admin/Analytics.css";
import "./components/admin/SuccessStoryForm.css";
import "./pages/admin/SuccessStories.css";
import "./pages/admin/Blog.css";
import "./pages/admin/Career.css";
import "./components/ProgressTracker.css";
import "./pages/admin/TrackerUpdate.css";
import "./pages/admin/AdminSession.css";
import "./pages/admin/StudentsInfo.css";
import "./pages/admin/Documents.css";
import "./styles/Blog.css";
import "./styles/blogdetails.css";
import "./pages/Payment.css";
import "./pages/EnglishProficiency.css";
import "./pages/AppLaunch.css";
import "./pages/SuccessStoryDetail.css";
import "./pages/SearchResults.css";
const ReadMoreInfo = lazy(() => import("./pages/ReadMoreInfo"));
const AustraliaPage = lazy(() => import("./AustraliaPage"));
const UKPage = lazy(() => import("./UKPage"));
const IrelandPage = lazy(() => import("./IrelandPage"));

const Login = lazy(() => import("./LoginPage"));
const Register = lazy(() => import("./RegisterPage"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const ResetPassword = lazy(() => import("./ResetPassword"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const DocumentChecklist = lazy(() => import("./pages/DocumentChecklist"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));

const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const SuccessStories = lazy(() => import("./pages/admin/SuccessStories"));
const Blog = lazy(() => import("./pages/admin/Blog"));
const AdminCareer = lazy(() => import("./pages/admin/Career"));
const TrackerUpdate = lazy(() => import("./pages/admin/TrackerUpdate"));
const AdminSession = lazy(() => import("./pages/admin/AdminSession"));
const StudentsInfo = lazy(() => import("./pages/admin/StudentsInfo"));
const AdminDocuments = lazy(() => import("./pages/admin/Documents"));
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "./pages/Provider/AuthContext";
const PublicBlog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Career = lazy(() => import("./pages/Career"));
const Payment = lazy(() => import("./pages/Payment"));
const EnglishProficiency = lazy(() => import("./pages/EnglishProficiency"));
const AppLaunch = lazy(() => import("./pages/AppLaunch"));
const ProgressTrackerPage = lazy(() => import("./pages/ProgressTrackerPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFail = lazy(() => import("./pages/PaymentFail"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const SuccessStoryDetail = lazy(() => import("./pages/SuccessStoryDetail"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const JobDetail = lazy(() => import("./pages/JobDetail"));

import "./App.css";

// Start each new page at the top. Hash links scroll themselves, and back/forward
// navigation (POP) keeps the browser's own scroll restoration.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (hash || navigationType === "POP") return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
}

function AppRoutes() {
  const { user, isAdmin, loading } = useContext(AuthContext);

  return (
    <Suspense fallback={null}>
    <Routes>
      <Route path="/read-more-info" element={<ReadMoreInfo />} />
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/australia" element={<AustraliaPage />} />
      <Route path="/uk" element={<UKPage />} />
      <Route path="/ireland" element={<IrelandPage />} />
      <Route path="/blog" element={<PublicBlog />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/success-story/:id" element={<SuccessStoryDetail />} />
      <Route path="/career" element={<Career />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/fail" element={<PaymentFail />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      <Route path="/search-results" element={<SearchResults />} />
      {/* Login/Register - Redirect if already logged in */}
      <Route 
        path="/login" 
        element={
          !loading && user ? (
            <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          !loading && user ? (
            <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
          ) : (
            <Register />
          )
        } 
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* User Dashboard - Protected */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {!loading && isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <DashboardLayout />
            )}
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="progress-tracker" element={<ProgressTrackerPage />} />
        <Route path="documentchecklist" element={<DocumentChecklist />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="career" element={<Navigate to="/career" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="messages" element={<Messages />} />
        <Route path="payment" element={<Payment />} />
        <Route path="english-proficiency" element={<EnglishProficiency />} />
        <Route path="app" element={<AppLaunch />} />
      </Route>

      {/* Admin Dashboard - Protected, Admin Only */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="success-stories" element={<SuccessStories />} />
        <Route path="blog" element={<Blog />} />
        <Route path="career" element={<AdminCareer />} />
        <Route path="tracker-update" element={<TrackerUpdate />} />
        <Route path="sessions" element={<AdminSession />} />
        <Route path="students-info" element={<StudentsInfo />} />
        <Route path="documents" element={<AdminDocuments />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  );
}

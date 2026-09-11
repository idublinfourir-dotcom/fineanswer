import React, { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import ReadMoreInfo from "./pages/ReadMoreInfo";
import AustraliaPage from "./AustraliaPage";
import UKPage from "./UKPage";
import IrelandPage from "./IrelandPage";

import Login from "./LoginPage";
import Register from "./RegisterPage";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import DocumentChecklist from "./pages/DocumentChecklist";
import Sessions from "./pages/Sessions";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Analytics from "./pages/admin/Analytics";
import SuccessStories from "./pages/admin/SuccessStories";
import Blog from "./pages/admin/Blog";
import AdminCareer from "./pages/admin/Career";
import TrackerUpdate from "./pages/admin/TrackerUpdate";
import AdminSession from "./pages/admin/AdminSession";
import StudentsInfo from "./pages/admin/StudentsInfo";
import AdminDocuments from "./pages/admin/Documents";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "./pages/Provider/ContextProvider";
import PublicBlog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Career from "./pages/Career";
import Payment from "./pages/Payment";
import EnglishProficiency from "./pages/EnglishProficiency";
import AppLaunch from "./pages/AppLaunch";
import ProgressTrackerPage from "./pages/ProgressTrackerPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import PaymentCancel from "./pages/PaymentCancel";
import SuccessStoryDetail from "./pages/SuccessStoryDetail";
import SearchResults from "./pages/SearchResults";
import JobDetail from "./pages/JobDetail";

import "./App.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function AppRoutes() {
  const { user, isAdmin, loading } = useContext(AuthContext);

  useEffect(() => {
    gsap.utils.toArray(".reveal").forEach((elem) => {
      gsap.from(elem, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
        },
      });
    });
  }, []);

  return (
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
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

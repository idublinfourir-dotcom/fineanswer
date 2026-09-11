import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { API_BASE_URL } from "./config/api";
import "./LoginPage.css";
import { AuthContext } from "./pages/Provider/ContextProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { googleSignIn, getCurrentUser, applyBackendAuth } =
    useContext(AuthContext);

  // Slideshow images
  const images = [
    "https://images.unsplash.com/photo-1623632306901-e509641e7191?auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1603573355706-3f15d98cf100?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1329",
    "https://images.unsplash.com/photo-1604808621558-b09365436e51?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);

  // Image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Update form state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  // Handle form submission (Email/Password Login)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      const { token, isAdmin: adminStatus, data } = result;
      
      // Store only token in localStorage - user data comes from backend
      localStorage.setItem("token", token);
      const isAdminFromResponse =
        typeof adminStatus === "boolean"
          ? adminStatus
          : typeof data?.isAdmin === "boolean"
            ? data.isAdmin
            : false;

      // Instantly hydrate auth context (no extra network delay)
      applyBackendAuth?.(data || null, isAdminFromResponse);

      setMessage({ type: "success", text: "✅ Login successful!" });

      // Redirect based on admin status
      if (isAdminFromResponse) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }

      // Refresh from backend in background (keeps context in sync)
      Promise.resolve(getCurrentUser?.()).catch(() => {});
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: error.message || "Login failed. Please check your credentials.",
      });
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setMessage(null);
      
      // Step 1: Authenticate with Google via Firebase
      const result = await googleSignIn();

      // Step 2: Send to backend /api/auth/google endpoint
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.user.email,
          googleId: result.user.uid,
          name: result.user.displayName || result.user.email.split("@")[0],
          picture: result.user.photoURL,
        }),
      });

      // Defensive: only parse JSON when server returns JSON.
      const contentType = response.headers.get("content-type") || "";
      let apiResult = null;
      if (contentType.includes("application/json")) {
        apiResult = await response.json();
      } else {
        const text = await response.text();
        console.error("/api/auth/google returned non-JSON response:", text);
        throw new Error(`Server returned non-JSON response (status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(apiResult?.message || "Google login failed");
      }

      const { token, isAdmin: adminStatus, data } = apiResult;

      // Store only token in localStorage - user data comes from backend
      localStorage.setItem("token", token);
      const isAdminFromResponse =
        typeof adminStatus === "boolean"
          ? adminStatus
          : typeof data?.isAdmin === "boolean"
            ? data.isAdmin
            : false;

      // Instantly hydrate auth context (no extra network delay)
      applyBackendAuth?.(data || null, isAdminFromResponse);

      setMessage({ type: "success", text: "✅ Google login successful!" });

      // Redirect based on admin status
      if (isAdminFromResponse) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }

      // Refresh from backend in background (keeps context in sync)
      Promise.resolve(getCurrentUser?.()).catch(() => {});
    } catch (error) {
      console.error("Google login error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "Google login failed. Please try again.";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login popup was closed. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({
        type: "error",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Side */}
        <div
          className="login-left"
          style={{
            background: `url(${images[currentImage]}) center/cover no-repeat`,
          }}
        >
          <div className="overlay">
            <h1>Welcome to FineAnswer – Your Gateway to Studying Abroad!</h1>
            <p>
              Explore top universities, scholarships, and programs worldwide.
              Begin your journey with expert guidance and personalized support.
            </p>
          </div>
        </div>  

        {/* Right Side */}
        <div className="login-right">
          <div className="login-card animate-slide-up">
            <h2>User Login</h2>
            <p className="login-subtext">Access your personalized study dashboard</p>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <button type="submit" className="login-btn">
                LOGIN
              </button>

              {/* Message */}
              {message && (
                <p className={`message ${message.type === "success" ? "success-msg" : "error-msg"}`}>
                  {message.text}
                </p>
              )}
            </form>

            <div className="login-divider">or</div>

            <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
              <FcGoogle className="google-icon" />
              Sign in with Google
            </button>

             <p className="signup-text">
    Don’t have an account?{" "}
    <span
      className="signup-link"
      onClick={() => navigate("/register")}
      style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
    >
      Join now
    </span>
  </p>
          </div>
        </div>
      </div>
    </div>
  );
}

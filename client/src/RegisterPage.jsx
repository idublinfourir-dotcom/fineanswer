import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config/api";
import { AuthContext } from "./pages/Provider/ContextProvider";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { getCurrentUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState(null);

  // Update form state on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || result.error || "Registration failed";
        setMessage({ type: "error", text: errorMessage });
        return;
      }

      // Registration successful: store token, refresh auth state, then redirect to dashboard
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      // Refresh auth context so ProtectedRoute sees the user and doesn't redirect to login
      await getCurrentUser();

      const isAdmin = result.isAdmin === true || result.data?.isAdmin === true;
      setFormData({ name: "", email: "", phone: "", password: "" });

      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        type: "error",
        text: error.message || "Registration failed. Please try again.",
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        {/* Left Section (Form) */}
        <div className="register-left">
          <div className="register-form">
            <h2>Create an Account</h2>
            <p className="subtext">Let’s get started with your 30-day free trial.</p>
            
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
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
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
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

              <button type="submit" className="register-btn">
                Create Account
              </button>

              <p className="login-link">
                Already have an account? <Link to="/login">Log in</Link>
              </p>

              {/* Success / Error message */}
              {message && (
                <p className={`message ${message.type === "success" ? "success-msg" : "error-msg"}`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right Section (Image + Quote) */}
        <div className="register-right">
          <div className="testimonial">
            <div className="testimonial-bg"></div>
            <div className="testimonial-content">
              <p>
                “Studying abroad can be overwhelming—but you don't have to do it alone. We provide step-by-step guidance, from choosing the right country to securing admission, so your journey is stress-free and successful”
              </p>
              <h4>Arif Bhuiyan</h4>
              <span>Founder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

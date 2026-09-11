import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config/api";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setMessage({
        type: result.googleAccount ? "info" : "success",
        text: result.message || "Check your email for the OTP.",
      });
      if (result.redirectTo && !result.googleAccount) {
        setTimeout(() => navigate(result.redirectTo), 1500);
      }
      setEmail("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to send reset email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p className="subtext">
          Enter your email address and we&apos;ll send you an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>

          {message && (
            <p className={`message ${message.type === "success" ? "success-msg" : message.type === "info" ? "info-msg" : "error-msg"}`}>
              {message.text}
            </p>
          )}
        </form>

        <Link to="/login" className="back-link">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

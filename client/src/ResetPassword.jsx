import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "./config/api";
import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      setMessage({ type: "error", text: "Invalid link. Please request a new OTP from the forgot password page." });
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    if (!otp || otp.length !== 6) {
      setMessage({ type: "error", text: "Please enter the 6-digit OTP from your email." });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setSuccess(true);
      setMessage({ type: "success", text: result.message });

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to reset password.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-card">
          <h2>Invalid Link</h2>
          <p className="error-msg">Please request a new OTP from the forgot password page.</p>
          <Link to="/forgot-password" className="back-link">
            Request New OTP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p className="subtext">Enter the OTP sent to <strong>{email}</strong> and your new password.</p>

        {success ? (
          <div className="success-state">
            <p className="success-msg">{message?.text}</p>
            <p>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {message && (
              <p className={`message ${message.type === "success" ? "success-msg" : "error-msg"}`}>
                {message.text}
              </p>
            )}
          </form>
        )}

        <Link to="/login" className="back-link">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

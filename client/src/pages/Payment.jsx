import React, { useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "./Provider/ContextProvider";
import "./Payment.css";

export default function Payment() {
  const PAYMENT_OPTIONS = [
    {
      id: "english",
      label: "English Proficiency Fee",
      description: "Pay for English proficiency tests or related assessments.",
      amount: 20000,
    },
    {
      id: "medical",
      label: "Medical Insurance Fee",
      description: "Secure your medical insurance coverage for study abroad.",
      amount: 25000,
    },
    {
      id: "logistics",
      label: "Logistics Fee",
      description: "Covers logistics, courier, and document handling costs.",
      amount: 42000,
    },
    {
      id: "courses",
      label: "Course Fee",
      description: "Pay for course-related fees and training programs.",
      amount: 12000,
    },
    {
      id: "other",
      label: "Other",
      description: "Pay a custom amount for any other service or fee.",
      amount: 0,
    },
  ];

  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(PAYMENT_OPTIONS[0]);
  const [otherAmount, setOtherAmount] = useState("");

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const computedAmount =
        selectedOption.id === "other"
          ? Number.parseInt(otherAmount, 10)
          : selectedOption.amount;

      if (!Number.isFinite(computedAmount) || computedAmount <= 0) {
        setError("Please enter a valid amount.");
        setLoading(false);
        return;
      }

      const payload = {
        amount: computedAmount,
        currency: "BDT",
        purpose: selectedOption.label,
      };
      if (user) {
        payload.cus_name = user.name || user.displayName || user.email?.split("@")[0] || "Customer";
        payload.cus_email = user.email || "customer@example.com";
        payload.cus_phone = user.phone || user.phoneNumber || "01711111111";
        if (user._id) payload.userId = user._id;
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API_BASE_URL}/create-payment`, payload, { headers });
      if (res?.data?.success && res?.data?.GatewayPageURL) {
        window.location.href = res.data.GatewayPageURL;
      } else {
        setError(res?.data?.message || "Payment init failed");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Payment request failed."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="payment-page">
      <main className="payment-content">
        <section className="payment-card">
          <h1 className="payment-title">Secure Payment</h1>
          <p className="payment-subtitle">
            We will integrate SSLCommerz here to securely process your
            application fees and service payments.
          </p>
          <div className="payment-placeholder-box">
            <p>Select what you want to pay for:</p>

            <div className="payment-options">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`payment-option${
                    selectedOption.id === option.id ? " selected" : ""
                  }`}
                  onClick={() => setSelectedOption(option)}
                  disabled={loading}
                >
                  <div className="payment-option-header">
                    <span className="payment-option-title">{option.label}</span>
                  </div>
                  <p className="payment-option-description">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {selectedOption.id === "other" && (
              <div className="payment-other-input-wrap">
                <label className="payment-other-label" htmlFor="payment-other-amount">
                  Enter amount (BDT)
                </label>
                <input
                  id="payment-other-amount"
                  className="payment-other-input"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  placeholder="e.g. 5000"
                  value={otherAmount}
                  onChange={(e) => setOtherAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <p className="payment-selected-summary">
              You are about to pay for <strong>{selectedOption.label}</strong> via SSLCommerz.
            </p>
            {error && <p className="payment-error">{error}</p>}
            <button
              onClick={handleCreatePayment}
              className="payment-btn"
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
            <p className="payment-hint">
              <Link to="/">Back to Home</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

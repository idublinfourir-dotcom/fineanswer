import React from "react";
import { Link } from "react-router-dom";
import Navbar3 from "../components/navbar3";
import "./Payment.css";

export default function PaymentSuccess() {
  return (
    <div className="payment-page">
      <Navbar3 />
      <main className="payment-content">
        <section className="payment-card payment-result-card success">
          <h1 className="payment-title">Payment Successful</h1>
          <p className="payment-subtitle">
            Your payment hkkas been completed successfully. Thank you for choosing
            FineAnswer!
          </p>
          <Link to="/" className="payment-btn">
            Back to Home
          </Link>
        </section>
      </main>
    </div>
  );
}

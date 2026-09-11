import React from "react";
import { Link } from "react-router-dom";
import Navbar3 from "../components/navbar3";
import "./Payment.css";

export default function PaymentFail() {
  return (
    <div className="payment-page">
      <Navbar3 />
      <main className="payment-content">
        <section className="payment-card payment-result-card fail">
          <h1 className="payment-title">Payment Failed</h1>
          <p className="payment-subtitle">
            Your payment could not be completed. Please try again or contact
            support if the issue persists.
          </p>
          <Link to="/dashboard/payment" className="payment-btn">
            Try Again
          </Link>
        </section>
      </main>
    </div>
  );
}

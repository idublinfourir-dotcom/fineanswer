import React from "react";
import { Link } from "react-router-dom";
import Navbar3 from "../components/navbar3";
import "./Payment.css";

export default function PaymentCancel() {
  return (
    <div className="payment-page">
      <Navbar3 />
      <main className="payment-content">
        <section className="payment-card payment-result-card cancel">
          <h1 className="payment-title">Payment Cancelled</h1>
          <p className="payment-subtitle">
            You have cancelled the payment. No charges were made.
          </p>
          <Link to="/dashboard/payment" className="payment-btn">
            Try Again
          </Link>
        </section>
      </main>
    </div>
  );
}

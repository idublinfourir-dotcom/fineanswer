import React from "react";
import { useNavigate } from "react-router-dom";
import BrochureFlipBook from "../components/BrochureFlipBook";
import "./ReadMoreInfo.css";
import fineImg from "../assets/fine.jpg";

export default function ReadMoreInfo() {
  const navigate = useNavigate();

  return (
    <div className="read-more-container">
      {/* ── Hero Header ── */}
      <header className="read-more-header">
        <div className="read-more-header-inner">
          <button className="back-link" onClick={() => navigate(-1)}>
            <span>←</span> Back
          </button>
          <span className="breadcrumb-path">Home &gt; About Us</span>
        </div>
        <div className="read-more-hero-text">
          <span className="read-more-eyebrow">
            <span className="read-more-eyebrow-dot" />
            Bangladesh&apos;s Trusted Consultancy
          </span>
          <h1 className="read-more-title">About FineAnswer</h1>
          <p className="read-more-subtitle">
            Guiding students to world-class universities with expert visa
            strategies, end-to-end support, and a proven track record.
          </p>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">100%</div>
          <div className="stat-label">Visa Success Rate for Female Applicants</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Students Successfully Placed Abroad</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">A-Z</div>
          <div className="stat-label">Complete End-to-End Service</div>
        </div>
      </div>

      {/* ── Brochure ── */}
      <section className="read-more-brochure-section">
        <h2 className="read-more-brochure-caption">Our Brochure</h2>
        <BrochureFlipBook />
      </section>

      {/* ── Section 1: Visa Success ── */}
      <div className="info-section-wrapper">
        <section className="info-section">
          <div className="info-content">
            <span className="section-label">Visa Success</span>
            <h2>Experience the highest visa success rate in Bangladesh.</h2>
            <p>
              Navigating international borders requires precision and expert
              strategy. We specialise in turning complex applications into
              success stories, boasting a 100% success rate for female
              applicants and specific universities.
            </p>
            <ul className="feature-list">
              <li>Mock visa interviews for Sept 2026 &amp; Jan 2027 intakes</li>
              <li>Unmatched success for TUD, SETU, ATU, TUS, and UCC</li>
              <li>Specialised support for difficult visa situations</li>
            </ul>
            <button className="btn-modern" onClick={() => navigate("/#success-stories")}>
              View Our Success Stories →
            </button>
          </div>
          <div className="info-image">
            <img src={fineImg} alt="Students at FineAnswer" />
          </div>
        </section>
      </div>

      {/* ── Section 2: Mission ── */}
      <div className="info-section-wrapper alt">
        <section className="info-section reverse">
          <div className="info-content">
            <span className="section-label">Our Mission</span>
            <h2>Comprehensive support tailored for working professionals.</h2>
            <p>
              From university selection to pre-departure briefings, we offer a
              complete A–Z service. Our unique analytical representation ensures
              your application stands out to immigration officers.
            </p>
            <ul className="feature-list">
              <li>Zero consultancy fee for document assessment</li>
              <li>In-person and remote service for busy professionals</li>
              <li>Guaranteed accommodation service for all intakes</li>
            </ul>
            <button className="btn-modern" onClick={() => navigate("/#contact")}>
              Join Our Coaching →
            </button>
          </div>
          <div className="info-image">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800"
              alt="Consultation session"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

import { FaLanguage } from "react-icons/fa";
import "./EnglishProficiency.css";

export default function EnglishProficiency() {
  return (
    <div className="ep-page">
      <div className="ep-card">

        {/* ── Hero ── */}
        <div className="ep-hero">
          <div className="ep-icon-wrap">
            <FaLanguage />
          </div>
          <div className="ep-label">
            <span className="ep-label-dot" />
            English Proficiency
          </div>
          <h1 className="ep-title">
            The Best <span>IELTS</span> Platform
          </h1>
          <p className="ep-subtitle">
            Expert-led preparation designed to help you achieve your target band score.
          </p>
        </div>

        {/* ── Body ── */}
        <div className="ep-body">
          <div className="ep-status-badge">
            <span className="ep-status-icon">🚀</span>
            Going to be Functional Soon
          </div>

          <h2 className="ep-caption">Your IELTS success journey starts here.</h2>
          <p className="ep-desc">
            We are building Bangladesh&apos;s most comprehensive IELTS preparation platform —
            with live coaching, AI-powered mock tests, expert feedback, and personalised study plans.
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="ep-footer">
          Launching soon by <strong>FineAnswer</strong> — Stay tuned for updates.
        </div>

      </div>
    </div>
  );
}

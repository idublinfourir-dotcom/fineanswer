import { FaMobileAlt } from "react-icons/fa";
import "./AppLaunch.css";

export default function AppLaunch() {
  return (
    <div className="al-page">
      <div className="al-card">

        {/* ── Hero ── */}
        <div className="al-hero">
          <div className="al-icon-wrap">
            <FaMobileAlt />
          </div>
          <div className="al-label">
            <span className="al-label-dot" />
            APP
          </div>
          <h1 className="al-title">
            FineAnswer <span>Mobile App</span>
          </h1>
          <p className="al-subtitle">
            Everything you need to study abroad — right in your pocket.
          </p>
        </div>

        {/* ── Body ── */}
        <div className="al-body">
          <div className="al-status-badge">
            We&apos;re Launching an App Soon
          </div>

          <h2 className="al-caption">Your study abroad journey, on the go.</h2>
          <p className="al-desc">
            We are building the FineAnswer mobile app — practice IELTS, track your
            application progress, manage documents, book sessions, and connect with
            expert coaches, all from your phone.
          </p>

          {/* Feature cards */}


          {/* Platform badges */}
          <div className="al-platforms">
            <span className="al-platform-badge">📱 iOS</span>
            <span className="al-platform-badge">🤖 Android</span>
            <span className="al-platform-badge">🌐 Web</span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="al-footer">
          Launching soon by <strong>FineAnswer</strong> — Stay tuned for updates.
        </div>

      </div>
    </div>
  );
}

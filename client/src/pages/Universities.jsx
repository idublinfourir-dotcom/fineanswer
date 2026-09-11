import "./Universities.css";

export default function Universities() {
  return (
    <div className="universities-page">
      <h2>My Universities</h2>

      <div className="university-card">
        <img src="/stanford.jpg" alt="Stanford" />
        <div className="card-content">
          <h3>Stanford University</h3>
          <p>MS Computer Science</p>

          <div className="meta">
            <span>🇺🇸 USA</span>
            <span>📅 Dec 15, 2025</span>
          </div>
        </div>

        <div className="card-status">
          <span className="badge submitted">Submitted</span>
          <span className="badge urgent">2 days left</span>
        </div>
      </div>

      <div className="university-card">
        <img src="/mit.jpg" alt="MIT" />
        <div className="card-content">
          <h3>MIT</h3>
          <p>MS Data Science</p>
        </div>

        <div className="card-status">
          <span className="badge success">Offer Received</span>
        </div>
      </div>
    </div>
  );
}

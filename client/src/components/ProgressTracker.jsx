import { useState, useEffect } from "react";
import "./ProgressTracker.css";
import { getMyProgressTracker } from "../services/progressTrackerApi";
import {
  getInitialTimeline,
  normalizeTimeline,
  PROGRESS_STEPS,
} from "../utils/progressTrackerSteps";

export default function ProgressTracker() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTracker = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const data = await getMyProgressTracker(token);
      const raw = data.timeline || data.progressTracker || [];
      setTimeline(normalizeTimeline(raw));
    } catch (error) {
      console.error("Error fetching progress tracker:", error);
      setTimeline(getInitialTimeline());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTracker();
  }, []);

  // Refetch when user returns to the tab so they see latest admin updates
  useEffect(() => {
    const onFocus = () => fetchTracker();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const allComplete = timeline.length > 0 && timeline[9]?.completed;

  // Filter to only show steps that admin has confirmed (completed)
  const completedSteps = timeline.filter((item) => item.completed === true);

  if (loading && timeline.length === 0) {
    return (
      <div className="visa-wrapper">
        <h3 className="visa-header">Study Abroad Progress tracker</h3>
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading progress tracker...
        </div>
      </div>
    );
  }

  if (completedSteps.length === 0) {
    return (
      <div className="visa-wrapper">
        <h3 className="visa-header">Study Abroad Progress tracker</h3>
        <p className="progress-tracker-hint">
          No steps completed yet. Your latest progress will appear here when admin updates your tracker.
        </p>
      </div>
    );
  }

  return (
    <div className="visa-wrapper">
      <h3 className="visa-header">Study Abroad Progress tracker</h3>
      {allComplete && (
        <div className="progress-complete-banner">
          ✓ Progress Complete
        </div>
      )}

      <div className="timeline">
        {completedSteps.map((item, index) => {
          const isLastStep = item.step === 10;
          return (
            <div
              key={item.step}
              className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
            >
              <div
                className={`content completed ${isLastStep ? "final" : ""}`}
              >
                <span className="date">
                  {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                </span>
                <h4>{item.title}</h4>
                <span className="completed-badge">✓ Completed</span>
              </div>
              <span className="dot success" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

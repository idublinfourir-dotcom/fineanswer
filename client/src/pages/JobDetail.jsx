import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "./Provider/ContextProvider";
import "./admin/Career.css";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [formData, setFormData] = useState({ documents: "", notes: "" });

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
      } else {
        setError(data.message || "Job not found");
      }
    } catch (err) {
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Open until filled";
    const d = new Date(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setApplyError("Please log in to apply.");
        setApplying(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/jobs/${id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documents: formData.documents.trim(),
          notes: formData.notes.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplySuccess(true);
        setFormData({ documents: "", notes: "" });
      } else {
        setApplyError(data.message || "Application failed.");
      }
    } catch (_err) {
      setApplyError("Something went wrong. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="career-loading job-detail-loading">
          <div className="spinner" />
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-error-wrap">
          <p className="career-error">{error || "Job not found"}</p>
          <Link to="/career" className="job-detail-back-link">
            <FaArrowLeft /> Back to Career
          </Link>
        </div>
      </div>
    );
  }

  const isPastDeadline = job.deadline && new Date(job.deadline) < new Date();

  return (
    <div className="job-detail-page">
      <nav className="job-detail-nav">
        <button
          type="button"
          onClick={() => navigate("/career")}
          className="job-detail-back-btn"
        >
          <FaArrowLeft /> Back to Career
        </button>
      </nav>

      <article className="job-detail-article">
        <header className="job-detail-header">
          <h1 className="job-detail-title">{job.title}</h1>
          <div className="job-detail-meta">
            {job.company && (
              <span className="job-detail-meta-item">
                <FaBriefcase /> {job.company}
              </span>
            )}
            {job.location && (
              <span className="job-detail-meta-item">
                <FaMapMarkerAlt /> {job.location}
              </span>
            )}
            <span className="job-detail-meta-item">
              {job.employmentType || "Full-time"}
            </span>
          </div>
          <p className="job-detail-deadline">
            <FaCalendarAlt /> Deadline: {formatDate(job.deadline)}
          </p>
        </header>

        {job.description && (
          <section className="job-detail-section">
            <h2>Description</h2>
            <div className="job-detail-text">{job.description}</div>
          </section>
        )}

        {job.requirements && (
          <section className="job-detail-section">
            <h2>Requirements</h2>
            <div className="job-detail-text">{job.requirements}</div>
          </section>
        )}

        {job.applicationUrl && (
          <p className="job-detail-external">
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="career-apply-link"
            >
              Apply on external link
            </a>
          </p>
        )}

        {/* Apply form - only if not past deadline */}
        {!isPastDeadline && (
          <section className="job-detail-apply-section">
            <h2>Apply for this position</h2>
            {applySuccess ? (
              <div className="job-detail-success">
                <p>Your application has been submitted successfully.</p>
              </div>
            ) : user ? (
              <form onSubmit={handleApplySubmit} className="job-detail-form">
                <div className="career-form-group">
                  <label htmlFor="documents">Documents / CV link (optional)</label>
                  <input
                    id="documents"
                    type="text"
                    placeholder="e.g. Google Drive or Dropbox link to your CV"
                    value={formData.documents}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, documents: e.target.value }))
                    }
                  />
                </div>
                <div className="career-form-group">
                  <label htmlFor="notes">Cover note (optional)</label>
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder="Brief note for the recruiter..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
                {applyError && (
                  <p className="career-error job-detail-form-error">{applyError}</p>
                )}
                <button
                  type="submit"
                  className="career-submit-btn job-detail-submit"
                  disabled={applying}
                >
                  {applying ? "Submitting..." : "Submit application"}
                </button>
              </form>
            ) : (
              <p className="job-detail-login-prompt">
                Please{" "}
                <Link to="/login">log in</Link> to apply for this job.
              </p>
            )}
          </section>
        )}

        {isPastDeadline && (
          <p className="job-detail-closed">Applications for this job are closed.</p>
        )}
      </article>
    </div>
  );
}

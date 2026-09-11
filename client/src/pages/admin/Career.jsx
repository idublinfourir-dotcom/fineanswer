import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import { IRELAND_JOB_LINKS } from "../../constants/irelandJobLinks";
import "./Career.css";
export default function AdminCareer() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [showApplicantsFor, setShowApplicantsFor] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    employmentType: "Full-time",
    description: "",
    requirements: "",
    applicationUrl: "",
    deadline: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/jobs`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
        setError(null);
      } else {
        setError("Failed to load jobs");
      }
    } catch (_err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        employmentType: job.employmentType || "Full-time",
        description: job.description || "",
        requirements: job.requirements || "",
        applicationUrl: job.applicationUrl || "",
        deadline: job.deadline ? job.deadline.substring(0, 10) : "",
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: "",
        company: "",
        location: "",
        employmentType: "Full-time",
        description: "",
        requirements: "",
        applicationUrl: "",
        deadline: "",
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingJob
        ? `${API_BASE_URL}/jobs/${editingJob._id}`
        : `${API_BASE_URL}/jobs`;
      const method = editingJob ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        await fetchJobs();
        setShowForm(false);
        setEditingJob(null);
      } else {
        alert(data.message || "Failed to save job");
      }
    } catch (_err) {
      alert("An error occurred while saving the job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        await fetchJobs();
      } else {
        alert(data.message || "Failed to delete job");
      }
    } catch (_err) {
      alert("An error occurred while deleting the job");
    }
  };

  const formatDate = (value) => {
    if (!value) return "Open until filled";
    const d = new Date(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const loadApplicants = async (job) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/jobs/${job._id}/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setApplicants(data.data);
        setShowApplicantsFor(job);
      } else {
        alert(data.message || "Failed to load applicants");
      }
    } catch (_err) {
      alert("An error occurred while loading applicants");
    }
  };

  const closeApplicantsModal = () => {
    setShowApplicantsFor(null);
    setApplicants([]);
  };

  return (
    <div className="admin-career-page">
      <h1 className="admin-career-page-title">Career Opportunities</h1>

      {/* Section 1: Career in FineAnswer */}
      <section className="career-section career-section-fineanswer">
        <div className="admin-career-header">
          <h2>Career in FineAnswer</h2>
          <button className="career-add-btn" onClick={() => handleOpenForm()}>
            <FaPlus /> Add Job
          </button>
        </div>
        <p className="career-section-desc">
          Post and manage job openings for joining the FineAnswer team. These
          appear on the user Career page where candidates can view details and
          apply.
        </p>

        {loading && (
          <div className="career-loading">
            <FaSpinner className="spinner" />
            <p>Loading jobs...</p>
          </div>
        )}

        {error && !loading && <div className="career-error">{error}</div>}

        {!loading && !error && jobs.length === 0 && (
          <div className="career-empty">
            <p>No job posts yet. Click "Add Job" to create one.</p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="career-job-grid">
            {jobs.map((job) => (
              <div key={job._id} className="career-job-card">
                <h3>{job.title}</h3>
                <p className="career-job-meta">
                  {job.company} • {job.location} •{" "}
                  {job.employmentType || "Full-time"}
                </p>
                <p className="career-job-deadline">
                  Deadline: {formatDate(job.deadline)}
                </p>
                <p className="career-job-desc">{job.description}</p>
                {job.applicationUrl && (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="career-apply-link"
                  >
                    View / Apply
                  </a>
                )}
                <div className="career-card-actions">
                  <button
                    className="career-edit-btn"
                    onClick={() => loadApplicants(job)}
                  >
                    View Applicants
                  </button>
                  <button
                    className="career-edit-btn"
                    onClick={() => handleOpenForm(job)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="career-delete-btn"
                    onClick={() => handleDelete(job._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Explore Other jobs in Ireland */}
      <section className="career-section career-section-ireland">
        <h2 className="career-section-heading">
          Explore Other jobs in Ireland
        </h2>
        <div className="ireland-links-grid">
          {IRELAND_JOB_LINKS.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ireland-link-card"
            >
              <div className="ireland-link-logo-wrap">
                <img src={item.logo} alt="" className="ireland-link-logo" />
              </div>
              <div className="ireland-link-content">
                <span className="ireland-link-label">{item.label}</span>
                {item.description && (
                  <span className="ireland-link-desc">{item.description}</span>
                )}
              </div>
              <FaExternalLinkAlt className="ireland-link-icon" />
            </a>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="career-modal-overlay">
          <div className="career-modal">
            <div className="career-modal-header">
              <h3>{editingJob ? "Edit Job" : "Add Job"}</h3>
              <button className="career-close-btn" onClick={handleCloseForm}>
                ×
              </button>
            </div>

            <form className="career-form" onSubmit={handleSubmit}>
              <div className="career-form-row">
                <div className="career-form-group">
                  <label htmlFor="title">Job Title *</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="career-form-group">
                  <label htmlFor="company">Company *</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="career-form-row">
                <div className="career-form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="career-form-group">
                  <label htmlFor="employmentType">Employment Type</label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="career-form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="career-form-group">
                <label htmlFor="requirements">Requirements</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows="3"
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </div>

              <div className="career-form-row">
                <div className="career-form-group">
                  <label htmlFor="applicationUrl">Application URL</label>
                  <input
                    id="applicationUrl"
                    name="applicationUrl"
                    type="url"
                    value={formData.applicationUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="career-form-group">
                  <label htmlFor="deadline">Deadline</label>
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="career-form-actions">
                <button
                  type="button"
                  className="career-cancel-btn"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="career-submit-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingJob
                      ? "Update Job"
                      : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicantsFor && (
        <div className="career-modal-overlay">
          <div className="career-modal">
            <div className="career-modal-header">
              <h3>Applicants for {showApplicantsFor.title}</h3>
              <button
                className="career-close-btn"
                onClick={closeApplicantsModal}
              >
                ×
              </button>
            </div>
            {applicants.length === 0 && (
              <div className="career-empty">
                <p>No applications yet for this job.</p>
              </div>
            )}
            {applicants.length > 0 && (
              <div className="career-applicants-list">
                {applicants.map((a) => (
                  <div key={a._id} className="career-applicant-card">
                    <p>
                      <strong>
                        {a.user?.name || "Unknown Candidate"} (
                        {a.user?.email || "No email"})
                      </strong>
                    </p>
                    <p className="career-job-meta">
                      Applied on{" "}
                      {new Date(a.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {a.documents && (
                      <p className="career-job-req">
                        <strong>Documents / Links:</strong> {a.documents}
                      </p>
                    )}
                    {a.notes && (
                      <p className="career-job-desc">
                        <strong>Notes:</strong> {a.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

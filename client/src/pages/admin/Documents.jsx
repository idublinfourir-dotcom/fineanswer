import { useEffect, useState } from "react";
import { FaFileAlt, FaEye, FaSpinner, FaDownload, FaTrash } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import "./Documents.css";

const DOC_FIELDS = [
  { key: "passportCopy", label: "Passport Copy" },
  { key: "cv", label: "CV" },
  { key: "sop", label: "SOP" },
  { key: "englishProficiency", label: "English Proficiency" },
  { key: "sscCertificate", label: "SSC Certificate" },
  { key: "hscCertificate", label: "HSC Certificate" },
  { key: "bachelorsCertificate", label: "Bachelor's Certificate" },
  { key: "mastersCertificate", label: "Master's Certificate" },
  { key: "sscTranscript", label: "SSC Transcript" },
  { key: "hscTranscript", label: "HSC Transcript" },
  { key: "bachelorsTranscript", label: "Bachelor's Transcript" },
  { key: "mastersTranscript", label: "Master's Transcript" },
  { key: "workExperience", label: "Work Experience" },
  { key: "lors", label: "LORs" },
];

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState("pending");
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDoc) {
      setFeedbackStatus(selectedDoc.validationStatus || "pending");
      setFeedbackText(selectedDoc.feedback || "");
    }
  }, [selectedDoc]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
        setError(null);
      } else {
        setError("Failed to load documents");
      }
    } catch (_err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (doc) => {
    setSelectedDoc(doc);
  };

  const handleDelete = async (doc) => {
    const userName = doc.user?.name || "Unknown User";
    const confirmed = window.confirm(
      `Are you sure you want to delete all documents for "${userName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    const userId = doc.userId?.toString?.() ?? String(doc.userId || "");
    if (!userId) {
      alert("Cannot delete: Invalid user ID");
      return;
    }

    setDeletingId(doc._id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/documents/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
        if (selectedDoc?._id === doc._id) setSelectedDoc(null);
      } else {
        alert(data.message || "Failed to delete documents");
      }
    } catch (_err) {
      alert("An error occurred while deleting. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const closeModal = () => {
    setSelectedDoc(null);
  };

  const openPdf = async (url, action) => {
    if (!url) return;
    const proxyUrl = `${API_BASE_URL}/documents/proxy?url=${encodeURIComponent(url)}&download=${action === "download" ? "1" : "0"}`;
    setLoadingPdf(url);

    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("Proxy failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (action === "download") {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "document.pdf";
        a.click();
      } else {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (_err) {
      // Fallback: open Cloudinary URL directly
      if (action === "download") {
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.pdf";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLoadingPdf(null);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedDoc?.userId) return;
    setSubmittingFeedback(true);
    try {
      const token = localStorage.getItem("token");
      const userId =
        selectedDoc.userId?.toString?.() ?? String(selectedDoc.userId || "");
      const res = await fetch(`${API_BASE_URL}/admin/documents/feedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          status: feedbackStatus,
          feedback: feedbackText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedDoc((prev) => ({ ...prev, ...data.data }));
        const idx = documents.findIndex((d) => d._id === selectedDoc._id);
        if (idx >= 0) {
          const updated = [...documents];
          updated[idx] = { ...updated[idx], ...data.data };
          setDocuments(updated);
        }
        alert("Feedback submitted successfully!");
      } else {
        alert(data.message || "Failed to submit feedback");
      }
    } catch (_err) {
      alert("An error occurred. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-documents-page">
        <div className="documents-loading">
          <FaSpinner className="spinner" />
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-documents-page">
      <div className="admin-documents-header">
        <h2>User Documents</h2>
      </div>

      {error && <div className="documents-error">{error}</div>}

      {!loading && !error && documents.length === 0 && (
        <div className="documents-empty">
          <p>No documents uploaded by users yet.</p>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="documents-grid">
          {documents.map((doc) => (
            <div key={doc._id} className="document-card">
              <div className="document-card-header">
                <FaFileAlt />
                <div>
                  <h3>{doc.user?.name || "Unknown User"}</h3>
                  <p>{doc.user?.email || "No email"}</p>
                </div>
              </div>
              <p className="document-meta">
                Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
              </p>
              {doc.validationStatus && (
                <p className={`document-status document-status-${doc.validationStatus}`}>
                  Status: {doc.validationStatus}
                </p>
              )}
              <div className="document-card-actions">
                <button
                  className="documents-view-btn"
                  onClick={() => handleViewDetails(doc)}
                >
                  <FaEye /> View Documents
                </button>
                <button
                  className="documents-delete-btn"
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc._id}
                  title="Delete user documents"
                >
                  {deletingId === doc._id ? (
                    <FaSpinner className="spinner" />
                  ) : (
                    <>
                      <FaTrash /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <div className="documents-modal-overlay">
          <div className="documents-modal">
            <div className="documents-modal-header">
              <h3>Documents for {selectedDoc.user?.name || "Unknown User"}</h3>
              <button className="documents-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="documents-list">
              {DOC_FIELDS.map((field) => (
                <div key={field.key} className="document-item">
                  <span className="document-label">{field.label}:</span>
                  <div className="document-actions">
                    {selectedDoc[field.key] ? (
                      <>
                        <button
                          type="button"
                          className="doc-btn doc-btn-view"
                          onClick={() => openPdf(selectedDoc[field.key], "view")}
                          disabled={loadingPdf === selectedDoc[field.key]}
                        >
                          {loadingPdf === selectedDoc[field.key] ? (
                            <FaSpinner className="spinner" />
                          ) : (
                            <>
                              <FaEye /> View
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="doc-btn doc-btn-download"
                          onClick={() => openPdf(selectedDoc[field.key], "download")}
                          disabled={loadingPdf === selectedDoc[field.key]}
                        >
                          <FaDownload /> Download
                        </button>
                      </>
                    ) : (
                      <span className="document-missing">Not uploaded</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="documents-feedback-section">
              <h4>Document Validation</h4>
              <div className="feedback-form">
                <div className="feedback-row">
                  <label htmlFor="feedback-status">Status</label>
                  <select
                    id="feedback-status"
                    value={feedbackStatus}
                    onChange={(e) => setFeedbackStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">All is okay</option>
                    <option value="rejected">Wrong file / Rejected</option>
                  </select>
                </div>
                <div className="feedback-row">
                  <label htmlFor="feedback-text">Feedback</label>
                  <textarea
                    id="feedback-text"
                    rows="3"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="e.g., All documents are valid. Or: Please resubmit SOP - wrong file uploaded."
                  />
                </div>
                <button
                  type="button"
                  className="documents-submit-feedback"
                  onClick={handleSubmitFeedback}
                  disabled={submittingFeedback}
                >
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

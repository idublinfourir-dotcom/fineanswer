import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaCloudUploadAlt,
  FaFileAlt,
  FaSpinner,
  FaEye,
} from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import { uploadDocumentToCloudinary } from "../utils/cloudinary";
import "../css/documentChecklist.css";

const documentFields = [
  {
    key: "passportCopy",
    label: "Latest Passport bio data page copy",
    required: true,
  },
  { key: "cv", label: "CV (updated/latest)", required: true },
  {
    key: "sop",
    label: "SOP (university and relevant subject oriented)",
    required: true,
  },
  {
    key: "englishProficiency",
    label: "English proficiency test result copy",
    required: true,
  },
  { key: "sscCertificate", label: "SSC Certificate", required: true },
  { key: "hscCertificate", label: "HSC Certificate", required: true },
  {
    key: "bachelorsCertificate",
    label: "Bachelor's Certificate",
    required: true,
  },
  {
    key: "mastersCertificate",
    label: "Master's Certificate (if applicable)",
    required: false,
  },
  { key: "sscTranscript", label: "SSC Transcript", required: true },
  { key: "hscTranscript", label: "HSC Transcript", required: true },
  {
    key: "bachelorsTranscript",
    label: "Bachelor's Transcript",
    required: true,
  },
  {
    key: "mastersTranscript",
    label: "Master's Transcript (if applicable)",
    required: false,
  },
  {
    key: "workExperience",
    label: "Work experience certificates",
    required: true,
  },
  { key: "lors", label: "LOR's (Letters of Recommendation)", required: true },
];

export default function DocumentChecklist() {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [loadingPdf, setLoadingPdf] = useState(null);
  const [error, setError] = useState(null);

  const openPdf = async (url, action, key) => {
    if (!url) return;
    const proxyUrl = `${API_BASE_URL}/documents/proxy?url=${encodeURIComponent(url)}&download=${action === "download" ? "1" : "0"}`;
    setLoadingPdf(key);
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDocuments(data.data);
      }
      setError(null);
    } catch (_err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return;

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      alert("Please upload PDF files only");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading((prev) => ({ ...prev, [key]: true }));

    try {
      // Upload to Cloudinary
      const url = await uploadDocumentToCloudinary(file);

      // Save/update in backend
      const token = localStorage.getItem("token");
      const method = documents._id ? "PUT" : "POST";
      const res = await fetch(`${API_BASE_URL}/documents`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: url }),
      });

      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
        alert("Document uploaded successfully!");
      } else {
        alert(data.message || "Failed to save document");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to upload document");
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getDocStatus = (key) => {
    if (uploading[key]) return "progress";
    if (documents[key]) return "done";
    return "pending";
  };

  const StatusIcon = ({ status }) => {
    if (status === "done") return <FaCheckCircle className="icon done" />;
    if (status === "progress") return <FaClock className="icon progress" />;
    return <FaExclamationCircle className="icon pending" />;
  };

  if (loading) {
    return (
      <div className="doc-wrapper">
        <div className="doc-loading">
          <FaSpinner className="spinner" />
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-container">
      {/* LEFT SIDE: MAIN WRAPPER CARD */}
      <div className="main-bg-card">
        <div className="doc-header">
          <FaFileAlt className="header-icon" />
          <h3>Standardized Tests & Documents</h3>
        </div>

        <div className="doc-card-list">
          {documentFields.map((field) => {
            const status = getDocStatus(field.key);
            const hasFile = !!documents[field.key];

            return (
              <div className="doc-card" key={field.key}>
                <div className="card-top-row">
                  <div className="card-left-content">
                    <div className="card-status-icon">
                      {status === "done" ? (
                        <FaCheckCircle className="icon-tick" />
                      ) : (
                        <FaExclamationCircle className="icon-pending-ash" />
                      )}
                    </div>

                    <div className="card-text-details">
                      <div className="card-title-row">
                        <h4>{field.label}</h4>
                        {field.required && (
                          <span className="badge-required">REQUIRED</span>
                        )}
                        {status === "done" ? (
                          <span className="badge-completed">Completed</span>
                        ) : (
                          <span className="badge-pending-text">Pending</span>
                        )}
                      </div>
                      <p className="card-subtitle">
                        Standardized document/test score for your application
                      </p>
                    </div>
                  </div>

                  <div className="card-actions">
                    {hasFile ? (
                      <div className="action-button-group">
                        <button
                          className="btn-icon view" // Must be "view", not "view-btn"
                          onClick={() =>
                            openPdf(documents[field.key], "view", field.key)
                          }
                          title="View Document"
                        >
                          <FaEye />
                        </button>
                        <label className="btn-icon upload-alt">
                          <FaCloudUploadAlt />
                          <input
                            type="file"
                            hidden
                            accept="application/pdf"
                            onChange={(e) =>
                              handleFileUpload(field.key, e.target.files[0])
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="primary-upload-btn">
                        <FaCloudUploadAlt /> <span>Upload</span>
                        <input
                          type="file"
                          hidden
                          accept="application/pdf"
                          onChange={(e) =>
                            handleFileUpload(field.key, e.target.files[0])
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Dynamic Alert Banner: Yellow for Pending, Green for Uploaded */}
                <div
                  className={`card-alert-banner ${hasFile ? "banner-completed" : "banner-pending"}`}
                >
                  <FaExclamationCircle className="alert-mini-icon" />
                  <span>
                    {hasFile
                      ? `Uploaded on ${documents.updatedAt || new Date().toLocaleDateString()}`
                      : field.key === "englishProficiency"
                        ? "Test scheduled for Jan 25, 2026"
                        : "Please upload the latest PDF version."}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: SIDEBAR GUIDELINES */}
      <aside className="doc-sidebar">
        <div className="guidelines-card">
          <div className="guidelines-header">
            <FaFileAlt className="book-icon" />
            <h4>Document Guidelines & Tips</h4>
          </div>

          <div className="guideline-list">
            <div className="guideline-item">
              <FaCheckCircle className="g-icon green" />
              <div>
                <p className="g-title">File Format</p>
                <p className="g-desc">
                  Upload documents in PDF format (max 5MB per file)
                </p>
              </div>
            </div>

            <div className="guideline-item">
              <FaExclamationCircle className="g-icon orange" />
              <div>
                <p className="g-title">Document Quality</p>
                <p className="g-desc">
                  Ensure all documents are clear, legible, and properly scanned
                </p>
              </div>
            </div>

            <div className="guideline-item">
              <FaFileAlt className="g-icon blue" />
              <div>
                <p className="g-title">Verification</p>
                <p className="g-desc">
                  All academic documents must be attested by authorized
                  officials
                </p>
              </div>
            </div>

            <div className="guideline-item">
              <FaClock className="g-icon purple" />
              <div>
                <p className="g-title">Processing Time</p>
                <p className="g-desc">
                  Document verification may take 2-3 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

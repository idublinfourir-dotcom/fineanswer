import React, { useEffect, useState } from "react";
import { FaCalendar, FaEnvelope, FaEye, FaGraduationCap, FaPhone, FaTimes, FaUser } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import "./StudentsInfo.css";

function StudentCard({ student, onViewDetails }) {
  const [imgError, setImgError] = useState(false);
  const profileImageUrl = student?.picture || student?.photoURL;
  const showImage = profileImageUrl && !imgError;

  const getInitials = () => {
    if (student?.name) {
      return student.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (student?.email) {
      return student.email[0].toUpperCase();
    }
    return "?";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="student-info-card">
      <div className="student-card-header">
        <div className="student-card-avatar">
          {showImage ? (
            <img
              src={profileImageUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{getInitials()}</span>
          )}
        </div>
        <div className="student-card-info">
          <h4>{student.name || "No name"}</h4>
          <p className="student-email">{student.email}</p>
          <span className="student-joined">Joined {formatDate(student.createdAt)}</span>
        </div>
      </div>
      <div className="student-card-body">
        {student.phone && (
          <p>
            <FaPhone size={12} /> {student.phone}
          </p>
        )}
        {student.country && (
          <p>{student.city ? `${student.city}, ${student.country}` : student.country}</p>
        )}
      </div>
      <button className="view-details-btn" onClick={() => onViewDetails(student)}>
        <FaEye /> View Details
      </button>
    </div>
  );
}

function StudentDetailModal({ student, onClose }) {
  const [imgError, setImgError] = useState(false);
  const profileImageUrl = student?.picture || student?.photoURL;
  const showImage = profileImageUrl && !imgError;

  if (!student) return null;

  const getInitials = () => {
    if (student?.name) {
      return student.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return student?.email?.[0]?.toUpperCase() || "?";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const lt = student.languageTest || {};

  return (
    <div className="student-detail-overlay" onClick={onClose}>
      <div className="student-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Student Details</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {/* Profile summary */}
          <div className="detail-section detail-profile-summary">
            <div className="detail-avatar">
              {showImage ? (
                <img
                  src={profileImageUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>
            <div>
              <h4>{student.name || "No name"}</h4>
              <p>{student.email}</p>
              <p className="text-muted">Joined {formatDate(student.createdAt)}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="detail-section">
            <h5><FaUser /> Personal Information</h5>
            <div className="detail-grid">
              <div>
                <label>Full Name</label>
                <p>{student.name || "—"}</p>
              </div>
              <div>
                <label>Date of Birth</label>
                <p>{student.dateOfBirth || "—"}</p>
              </div>
              <div>
                <label><FaEnvelope /> Email</label>
                <p>{student.email || "—"}</p>
              </div>
              <div>
                <label><FaPhone /> Phone</label>
                <p>{student.phone || "—"}</p>
              </div>
              <div>
                <label>Country</label>
                <p>{student.country || "—"}</p>
              </div>
              <div>
                <label>City</label>
                <p>{student.city || "—"}</p>
              </div>
              <div className="full-width">
                <label>Address</label>
                <p>{student.address || "—"}</p>
              </div>
              <div>
                <label>Postal Code</label>
                <p>{student.postalCode || "—"}</p>
              </div>
            </div>
          </div>

          {/* Educational Background */}
          <div className="detail-section">
            <h5><FaGraduationCap /> Educational Background</h5>
            <div className="detail-grid">
              <div className="full-width">
                <label>Highest Education</label>
                <p>{student.highestEducation || "—"}</p>
              </div>
              <div className="full-width">
                <label>University</label>
                <p>{student.university || "—"}</p>
              </div>
              <div>
                <label>Graduation Year</label>
                <p>{student.graduationYear || "—"}</p>
              </div>
              <div>
                <label>GPA / CGPA</label>
                <p>{student.gpa || "—"}</p>
              </div>
              <div className="full-width">
                <label>Work Experience</label>
                <p>{student.workExperience || "—"}</p>
              </div>
              <div>
                <label>Years of Experience</label>
                <p>{student.yearsOfExperience || "—"}</p>
              </div>
            </div>
          </div>

          {/* Language Proficiency */}
          {(lt.testType || lt.overallScore) && (
            <div className="detail-section">
              <h5>Language Proficiency Test</h5>
              <div className="detail-grid">
                <div>
                  <label>Test Type</label>
                  <p>{lt.testType || "—"}</p>
                </div>
                <div>
                  <label>Overall Score</label>
                  <p>{lt.overallScore || "—"}</p>
                </div>
                <div><label>Reading</label><p>{lt.reading || "—"}</p></div>
                <div><label>Writing</label><p>{lt.writing || "—"}</p></div>
                <div><label>Listening</label><p>{lt.listening || "—"}</p></div>
                <div><label>Speaking</label><p>{lt.speaking || "—"}</p></div>
              </div>
            </div>
          )}

          {/* Progress Tracker */}
          {student.progressTracker?.length > 0 && (
            <div className="detail-section">
              <h5><FaCalendar /> Progress Tracker</h5>
              <ul className="progress-list">
                {student.progressTracker.map((item, i) => (
                  <li key={i}>
                    <strong>{item.title || `Step ${i + 1}`}</strong>
                    {item.description && <span> — {item.description}</span>}
                    {item.status && (
                      <span className={`status-badge ${item.status}`}>{item.status}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentsInfo() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view students.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch students");
        }

        const allUsers = data.users || [];
        const studentList = allUsers.filter((u) => !u.isAdmin);
        setStudents(studentList);
      } catch (err) {
        setError(err.message || "Failed to load students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").includes(q)
    );
  });

  return (
    <div className="students-info-page">
      <div className="students-info-header">
        <h2>Students Info</h2>
        <p>View all students who have registered on the platform</p>
        <div className="students-search">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="students-loading">Loading students...</div>
      )}

      {error && (
        <div className="students-error">{error}</div>
      )}

      {!loading && !error && filteredStudents.length === 0 && (
        <div className="students-empty">
          {search ? "No students match your search." : "No students have registered yet."}
        </div>
      )}

      {!loading && !error && filteredStudents.length > 0 && (
        <div className="students-grid">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              onViewDetails={setSelectedStudent}
            />
          ))}
        </div>
      )}

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

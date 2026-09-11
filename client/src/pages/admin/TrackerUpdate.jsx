import { useEffect, useState } from "react";
import { FaCheck, FaSave, FaSpinner } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import "../../components/ProgressTracker.css";
import {
  getInitialTimeline,
  normalizeTimeline,
  PROGRESS_STEPS,
} from "../../utils/progressTrackerSteps";
import { getUserProgressTracker, updateUserProgressTracker } from "../../services/progressTrackerApi";
import "./TrackerUpdate.css";

export default function TrackerUpdate() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false); // timeline loading
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setUsers([]);
          setUsersLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error("Failed to fetch users for tracker:", response.status);
          setUsers([]);
          return;
        }

        const data = await response.json();
        const regularUsers = (data.users || data || []).filter(
          (user) => !user.isAdmin,
        );
        setUsers(regularUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setTimeline(getInitialTimeline());
      return;
    }

    const fetchTracker = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        const data = await getUserProgressTracker(selectedUserId, token);
        const raw = data.timeline || data.progressTracker || [];
        setTimeline(normalizeTimeline(raw));
      } catch (err) {
        setError(err.message || "Failed to load progress tracker");
        setTimeline(getInitialTimeline());
      } finally {
        setLoading(false);
      }
    };

    fetchTracker();
  }, [selectedUserId]);

  const handleDateChange = (index, date) => {
    const newTimeline = [...timeline];
    newTimeline[index] = {
      ...newTimeline[index],
      date: date || null,
      completed: !!date,
    };
    setTimeline(newTimeline);
  };

  const handleSave = async () => {
    if (!selectedUserId) {
      setError("Please select a student first");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      await updateUserProgressTracker(selectedUserId, timeline, token);
      setSuccess("Progress tracker updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update progress tracker");
    } finally {
      setSaving(false);
    }
  };

  const handleDone = async () => {
    if (!selectedUserId) {
      setError("Please select a student first");
      return;
    }

    const newTimeline = [...timeline];
    const today = new Date().toISOString().split("T")[0];
    newTimeline[9] = {
      ...newTimeline[9],
      date: today,
      completed: true,
    };
    setTimeline(newTimeline);

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      await updateUserProgressTracker(selectedUserId, newTimeline, token);
      setSuccess("Progress marked as complete!");
    } catch (err) {
      setError(err.message || "Failed to update progress tracker");
    } finally {
      setSaving(false);
    }
  };

  const selectedUser = users.find(
    (u) => u._id === selectedUserId || u.id === selectedUserId,
  );

  const filteredUsers = users.filter((user) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (user.name || "").toLowerCase().includes(q) ||
      (user.email || "").toLowerCase().includes(q) ||
      (user.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="tracker-update-page">
      <div className="page-header">
        <div>
          <h2>Tracker Update</h2>
          <p>Update progress tracker for students</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="user-selection-card">
        <div className="user-selection-header">
          <div>
            <label htmlFor="user-search">Select Student:</label>
            <p className="user-selection-subtitle">
              Search and click on a student to update their tracker.
            </p>
          </div>
          <div className="user-search-wrapper">
            <input
              id="user-search"
              type="text"
              className="user-search-input"
              placeholder="Search by name, email or phone..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="user-list">
          {usersLoading ? (
            <div className="user-list-status">Loading students...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="user-list-status">
              No students found for this search.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const id = user._id || user.id;
              const isSelected = id === selectedUserId;
              return (
                <button
                  key={id}
                  type="button"
                  className={`user-list-item ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedUserId(id)}
                >
                  <div className="user-list-main">
                    <span className="user-list-name">
                      {user.name || "Unnamed User"}
                    </span>
                    {user.email && (
                      <span className="user-list-email">{user.email}</span>
                    )}
                  </div>
                  <div className="user-list-meta">
                    {user.country && (
                      <span className="user-list-tag">{user.country}</span>
                    )}
                    {user.authProvider && (
                      <span className="user-list-tag subtle">
                        {user.authProvider}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selectedUser && (
          <div className="selected-user-info">
            <p>
              <strong>Selected:</strong> {selectedUser.name || selectedUser.email}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading progress tracker...</p>
        </div>
      ) : (
        selectedUserId && (
          <div className="tracker-editor">
            <div className="editor-actions">
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="spinner" /> Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            </div>

            <div className="visa-wrapper">
              <h3 className="visa-header">Study Abroad Progress tracker</h3>

              <div className="timeline tracker-steps-list">
                {PROGRESS_STEPS.map((def, index) => {
                  const item = timeline[index] || {
                    step: def.step,
                    title: def.title,
                    date: null,
                    completed: false,
                  };
                  const isLast = index === 9;

                  return (
                    <div
                      key={item.step}
                      className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
                    >
                      <div
                        className={`content ${item.completed ? "completed" : ""} ${isLast ? "final" : ""}`}
                      >
                        <span className="step-number">{item.step}</span>
                        <h4>{item.title}</h4>

                        {isLast ? (
                          <button
                            type="button"
                            className="btn-done"
                            onClick={handleDone}
                            disabled={saving || item.completed}
                          >
                            {item.completed ? (
                              <>✓ Completed {item.date && `(${item.date})`}</>
                            ) : (
                              <>
                                <FaCheck /> Done
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="step-date-row">
                            <label>Date completed:</label>
                            <input
                              type="date"
                              value={item.date || ""}
                              onChange={(e) =>
                                handleDateChange(index, e.target.value)
                              }
                            />
                            {item.completed && (
                              <span className="step-completed-badge">✓</span>
                            )}
                          </div>
                        )}
                      </div>
                      <span
                        className={`dot ${item.completed ? "success" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

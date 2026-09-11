import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Provider/ContextProvider";
import { API_BASE_URL } from "../../config/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, isAdmin } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [blogsCount, setBlogsCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);

  // If somehow a non-admin gets here, show warning
  if (!isAdmin) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ color: "#dc2626" }}>Access Denied</h2>
        <p>You don't have admin privileges. Redirecting...</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view the admin dashboard.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, docsRes, blogsRes, storiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users`, { headers }),
          fetch(`${API_BASE_URL}/admin/documents`, { headers }),
          fetch(`${API_BASE_URL}/blogs`), // public GET
          fetch(`${API_BASE_URL}/success-stories`), // public GET
        ]);

        if (!usersRes.ok) {
          const data = await usersRes.json().catch(() => ({}));
          throw new Error(data.message || "Failed to fetch students");
        }

        const usersData = await usersRes.json();
        const allUsers = usersData.users || [];
        const studentList = allUsers.filter((u) => !u.isAdmin);
        setStudents(studentList);

        if (docsRes.ok) {
          const docsData = await docsRes.json().catch(() => ({}));
          setDocuments(docsData.data || []);
        } else {
          setDocuments([]);
        }

        if (blogsRes.ok) {
          const blogsData = await blogsRes.json().catch(() => ({}));
          const arr = blogsData.data || blogsData.blogs || blogsData || [];
          setBlogsCount(Array.isArray(arr) ? arr.length : 0);
        }

        if (storiesRes.ok) {
          const storiesData = await storiesRes.json().catch(() => ({}));
          const arr =
            storiesData.data || storiesData.successStories || storiesData || [];
          setStoriesCount(Array.isArray(arr) ? arr.length : 0);
        }
      } catch (e) {
        setError(e?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const overview = useMemo(() => {
    const totalStudents = students.length;
    const docsSubmitted = documents.length;
    const activeTrackers = students.filter(
      (s) => Array.isArray(s.progressTracker) && s.progressTracker.length > 0,
    ).length;

    const submissionRate =
      totalStudents > 0 ? Math.round((docsSubmitted / totalStudents) * 100) : 0;

    const recentStudents = [...students]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);

    return {
      totalStudents,
      docsSubmitted,
      activeTrackers,
      submissionRate,
      recentStudents,
    };
  }, [students, documents]);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <h2 className="admin-dashboard__title">Admin Dashboard</h2>
          <p className="admin-dashboard__subtitle">
            Welcome, {user?.name || "Admin"}! Manage your platform here.
          </p>
          <p className="admin-dashboard__badge">✓ Admin Access Confirmed</p>
        </div>

        <div className="admin-dashboard__actions">
          <Link className="admin-dashboard__link" to="/admin/tracker-update">
            Update Tracker
          </Link>
          <Link className="admin-dashboard__link" to="/admin/students-info">
            Students
          </Link>
          <Link className="admin-dashboard__link" to="/admin/documents">
            Documents
          </Link>
        </div>
      </div>

      {error && <div className="admin-dashboard__error">{error}</div>}

      <div className="admin-dashboard__grid">
        <div className="admin-dashboard__card">
          <div className="admin-dashboard__cardLabel">Total Students</div>
          <div className="admin-dashboard__cardValue">
            {loading ? "—" : overview.totalStudents}
          </div>
          <div className="admin-dashboard__cardHint">
            Registered users (non-admin)
          </div>
        </div>

        <div className="admin-dashboard__card">
          <div className="admin-dashboard__cardLabel">Documents Submitted</div>
          <div className="admin-dashboard__cardValue">
            {loading ? "—" : overview.docsSubmitted}
          </div>
          <div className="admin-dashboard__cardHint">
            Students who uploaded documents
          </div>
        </div>

        <div className="admin-dashboard__card">
          <div className="admin-dashboard__cardLabel">Active Trackers</div>
          <div className="admin-dashboard__cardValue">
            {loading ? "—" : overview.activeTrackers}
          </div>
          <div className="admin-dashboard__cardHint">
            Students with tracker updates
          </div>
        </div>

        <div className="admin-dashboard__card">
          <div className="admin-dashboard__cardLabel">Submission Rate</div>
          <div className="admin-dashboard__cardValue">
            {loading ? "—" : `${overview.submissionRate}%`}
          </div>
          <div className="admin-dashboard__cardHint">
            Documents / Total students
          </div>
        </div>

        <div className="admin-dashboard__card">
          <div className="admin-dashboard__cardLabel">Success Stories</div>
          <div className="admin-dashboard__cardValue">
            {loading ? "—" : storiesCount}
          </div>
          <div className="admin-dashboard__cardHint">
            Published stories (public)
          </div>
        </div>

        <div className="admin-dashboard__card">
          <div className="admin-dashboard__cardLabel">Blog Posts</div>
          <div className="admin-dashboard__cardValue">
            {loading ? "—" : blogsCount}
          </div>
          <div className="admin-dashboard__cardHint">
            Total posts (public)
          </div>
        </div>
      </div>

      <div className="admin-dashboard__panels">
        <div className="admin-dashboard__panel">
          <div className="admin-dashboard__panelHeader">
            <h3>Recent Students</h3>
            <Link to="/admin/students-info">View all</Link>
          </div>

          {loading ? (
            <div className="admin-dashboard__panelBody">Loading…</div>
          ) : overview.recentStudents.length === 0 ? (
            <div className="admin-dashboard__panelBody">
              No students found yet.
            </div>
          ) : (
            <div className="admin-dashboard__list">
              {overview.recentStudents.map((s) => (
                <div key={s._id} className="admin-dashboard__listItem">
                  <div className="admin-dashboard__avatar">
                    {(s.name || s.email || "?")
                      .trim()
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                  <div className="admin-dashboard__listMain">
                    <div className="admin-dashboard__listTitle">
                      {s.name || "Unnamed"}
                    </div>
                    <div className="admin-dashboard__listSub">
                      {s.email || "—"}
                    </div>
                  </div>
                  <div className="admin-dashboard__listMeta">
                    {s.country ? <span>{s.country}</span> : <span>—</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-dashboard__panel">
          <div className="admin-dashboard__panelHeader">
            <h3>Quick Actions</h3>
          </div>
          <div className="admin-dashboard__quick">
            <Link to="/admin/tracker-update" className="admin-dashboard__quickBtn">
              Update Student Tracker
            </Link>
            <Link to="/admin/documents" className="admin-dashboard__quickBtn">
              Review Documents
            </Link>
            <Link to="/admin/success-stories" className="admin-dashboard__quickBtn">
              Manage Success Stories
            </Link>
            <Link to="/admin/blog" className="admin-dashboard__quickBtn">
              Manage Blog Posts
            </Link>
            <Link to="/admin/analytics" className="admin-dashboard__quickBtn">
              Open Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

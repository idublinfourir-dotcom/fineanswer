import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { API_BASE_URL } from "../../config/api";
import "./Analytics.css";

const COLORS = ["#38bdf8", "#0284c7", "#0369a1", "#0ea5e9", "#7dd3fc", "#bae6fd"];

export default function Analytics() {
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view analytics.");
          setLoading(false);
          return;
        }

        // Fetch users
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersResponse.json();
        if (!usersResponse.ok) {
          throw new Error(usersData.message || "Failed to fetch users");
        }

        const allUsers = usersData.users || [];
        const studentList = allUsers.filter((u) => !u.isAdmin);
        setStudents(studentList);

        // Fetch documents
        try {
          const docsResponse = await fetch(`${API_BASE_URL}/admin/documents`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const docsData = await docsResponse.json();
          if (docsResponse.ok) {
            setDocuments(docsData.data || []);
          }
        } catch (err) {
          console.warn("Could not fetch documents:", err);
        }
      } catch (err) {
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const totalStudents = students.length;
    const studentsWithDocuments = documents.length;
    const studentsWithProgress = students.filter(
      (s) => s.progressTracker && s.progressTracker.length > 0
    ).length;

    // Students by country
    const countryCount = {};
    students.forEach((s) => {
      const country = s.country || "Not Specified";
      countryCount[country] = (countryCount[country] || 0) + 1;
    });
    const countryData = Object.entries(countryCount).map(([name, value]) => ({
      name,
      value,
    }));

    // Students by authentication method
    const authCount = {};
    students.forEach((s) => {
      const auth = s.authProvider || "email";
      authCount[auth] = (authCount[auth] || 0) + 1;
    });
    const authData = Object.entries(authCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Students registered over time (last 6 months)
    const monthlyData = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    students.forEach((s) => {
      const createdDate = s.createdAt ? new Date(s.createdAt) : new Date();
      if (createdDate >= sixMonthsAgo) {
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    // Generate last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", { month: "short" });
      months.push({
        month: monthName,
        students: monthlyData[monthKey] || 0,
      });
    }

    // Progress tracker completion
    const progressData = [
      { name: "No Progress", value: totalStudents - studentsWithProgress },
      { name: "In Progress", value: studentsWithProgress },
    ];

    // Document submission status
    const docStatusData = [
      { name: "Documents Submitted", value: studentsWithDocuments },
      { name: "No Documents", value: totalStudents - studentsWithDocuments },
    ];

    return {
      totalStudents,
      studentsWithDocuments,
      studentsWithProgress,
      countryData,
      authData,
      monthlyData: months,
      progressData,
      docStatusData,
    };
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="analytics-error">Error: {error}</div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Overview of students and application statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats.studentsWithDocuments}</h3>
            <p>Documents Submitted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.studentsWithProgress}</h3>
            <p>Active Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>
              {stats.totalStudents > 0
                ? Math.round((stats.studentsWithDocuments / stats.totalStudents) * 100)
                : 0}
              %
            </h3>
            <p>Submission Rate</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Students Over Time */}
        <div className="chart-card">
          <h3>Students Registered Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#38bdf8"
                strokeWidth={2}
                name="New Students"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Students by Country */}
        <div className="chart-card">
          <h3>Students by Country</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.countryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.countryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Document Submission Status */}
        <div className="chart-card">
          <h3>Document Submission Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.docStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Authentication Method */}
        <div className="chart-card">
          <h3>Students by Authentication Method</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.authData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.authData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Tracker Status */}
        <div className="chart-card">
          <h3>Application Progress Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0369a1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

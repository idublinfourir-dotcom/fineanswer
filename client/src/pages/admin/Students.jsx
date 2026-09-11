const students = [
  {
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 234 567 8900",
    apps: 4,
    status: "Active",
    date: "Jan 15, 2025",
    initials: "SJ",
  },
  {
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+1 234 567 8902",
    apps: 2,
    status: "Inactive",
    date: "Dec 28, 2024",
    initials: "ER",
  },
];

export default function Students() {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Students Management</h3>
        <button className="primary-btn">+ Add Student</button>
      </div>

      <div className="filters">
        <input placeholder="Search students..." />
        <select><option>All Status</option></select>
        <select><option>Sort by Date</option></select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>STUDENT</th>
            <th>CONTACT</th>
            <th>APPLICATIONS</th>
            <th>STATUS</th>
            <th>JOIN DATE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i}>
              <td>
                <div className="student">
                  <div className="avatar-circle">{s.initials}</div>
                  <div>
                    <strong>{s.name}</strong>
                    <small>{s.email}</small>
                  </div>
                </div>
              </td>
              <td>{s.phone}</td>
              <td>{s.apps} Applications</td>
              <td>
                <span className={`status ${s.status.toLowerCase()}`}>
                  {s.status}
                </span>
              </td>
              <td>{s.date}</td>
              <td className="actions">👁️ ✏️ 🗑️</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Sidebar as ProSidebar } from "react-pro-sidebar";
import {
  FaTachometerAlt,
  FaChartBar,
  FaStar,
  FaBlog,
  FaBriefcase,
  FaTasks,
  FaVideo,
  FaUsers,
  FaFileAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { AuthContext } from "../../pages/Provider/ContextProvider";
import logo from "../../assets/logo.png";
import "../Sidebar.css";

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
  onToggleSidebar,
}) {
  const { logOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  return (
    <ProSidebar
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobileOpen" : ""}`}
      collapsed={collapsed}
      transitionDuration={320}
      width="260px"
      collapsedWidth="84px"
    >
      <div className="sidebar-shell">
        {/* Logo - image only, links to home */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-main">
            <a href="/" className="admin-logo-link" aria-label="Go to homepage">
              <img src={logo} alt="FineAnswer" className="admin-logo-image" />
            </a>
          </div>
          {onToggleSidebar && (
            <button
              type="button"
              className="admin-sidebar-toggle"
              onClick={onToggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          )}
        </div>

        {/* Navigation - same layout as user sidebar */}
        <nav className="sidebar-nav" onClick={() => onCloseMobile?.()}>
          <NavLink to="/admin/dashboard" end title="Dashboard">
            <FaTachometerAlt /> <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/analytics" title="Analytics">
            <FaChartBar /> <span>Analytics</span>
          </NavLink>

          <NavLink to="/admin/success-stories" title="Success Stories">
            <FaStar /> <span>Success Stories</span>
          </NavLink>

          <NavLink to="/admin/blog" title="Blog">
            <FaBlog /> <span>Blog</span>
          </NavLink>

          <NavLink to="/admin/career" title="Career">
            <FaBriefcase /> <span>Career</span>
          </NavLink>

          <NavLink to="/admin/tracker-update" title="Tracker Update">
            <FaTasks /> <span>Tracker Update</span>
          </NavLink>

          <NavLink to="/admin/sessions" title="Sessions">
            <FaVideo /> <span>Sessions</span>
          </NavLink>

          <NavLink to="/admin/students-info" title="Students Info">
            <FaUsers /> <span>Students Info</span>
          </NavLink>

          <NavLink to="/admin/documents" title="Documents">
            <FaFileAlt /> <span>Documents</span>
          </NavLink>
        </nav>

        {/* Logout - shares same styling as user sidebar */}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </ProSidebar>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Sidebar as ProSidebar } from "react-pro-sidebar";
import {
  FaHome,
  FaTasks,
  FaFolderOpen,
  FaVideo,
  FaEnvelope,
  FaCreditCard,
  FaLanguage,
  FaMobileAlt,
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { AuthContext } from "../pages/Provider/ContextProvider";
import logo from "../assets/logo.png";
import "./Sidebar.css";


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
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${
        mobileOpen ? "sidebar--mobileOpen" : ""
      }`}
      collapsed={collapsed}
      transitionDuration={320}
      width="260px"
      collapsedWidth="84px"
    >
      <div className="sidebar-shell">
        {/* Logo – image only, links to home */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-main">
            <a
              href="/"
              className="dashboard-logo-link"
              aria-label="Go to homepage"
            >
              <img
                src={logo}
                alt="FineAnswer"
                className="dashboard-logo-image"
              />
            </a>
          </div>
          {onToggleSidebar && (
            <button
              type="button"
              className="dashboard-sidebar-toggle"
              onClick={onToggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" onClick={() => onCloseMobile?.()}>
          <NavLink to="/dashboard" end title="Dashboard">
            <FaHome /> <span>Dashboard</span>
          </NavLink>

          <NavLink to="/dashboard/progress-tracker" title="Progress Tracker">
            <FaTasks /> <span>Progress Tracker</span>
          </NavLink>

          <NavLink to="/dashboard/documentchecklist" title="Documents">
            <FaFolderOpen /> <span>Documents</span>
          </NavLink>

          <NavLink to="/dashboard/sessions" title="Sessions">
            <FaVideo /> <span>Sessions</span>
          </NavLink>

          <NavLink to="/dashboard/messages" title="Messages">
            <FaEnvelope /> <span>Messages</span>
          </NavLink>

          <NavLink to="/dashboard/payment" title="Payment">
            <FaCreditCard /> <span>Payment</span>
          </NavLink>

          <NavLink to="/dashboard/english-proficiency" title="English Proficiency">
            <FaLanguage /> <span>English Proficiency</span>
          </NavLink>

          <NavLink to="/dashboard/app" title="App">
            <FaMobileAlt /> <span>App</span>
          </NavLink>

          <NavLink to="/dashboard/profile" title="Profile">
            <FaUser /> <span>Profile</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </ProSidebar>
  );
}

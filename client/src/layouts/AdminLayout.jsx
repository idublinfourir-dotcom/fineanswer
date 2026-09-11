import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import "../css/dashboard.css";
import "../styles/admin.css";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Close the mobile sidebar when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992) setSidebarOpenMobile(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleCollapsed = () => setSidebarCollapsed((v) => !v);
  const toggleMobile = () => setSidebarOpenMobile((v) => !v);
  const closeMobile = () => setSidebarOpenMobile(false);

  return (
    <div
      className={`admin-layout ${
        sidebarCollapsed ? "is-sidebar-collapsed" : ""
      } ${sidebarOpenMobile ? "is-sidebar-open-mobile" : ""}`}
    >
      {sidebarOpenMobile && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          onClick={closeMobile}
          aria-label="Close sidebar"
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={sidebarOpenMobile}
        onCloseMobile={closeMobile}
        onToggleSidebar={toggleCollapsed}
      />
      <div className="admin-main">
        <Topbar
          sidebarOpenMobile={sidebarOpenMobile}
          onToggleMobileSidebar={toggleMobile}
        />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

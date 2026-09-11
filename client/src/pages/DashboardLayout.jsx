import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/dashboard.css";

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

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
      className={`dashboard-layout ${
        sidebarCollapsed ? "is-sidebar-collapsed" : ""
      } ${sidebarOpenMobile ? "is-sidebar-open-mobile" : ""}`}
    >
      {sidebarOpenMobile && (
        <button
          type="button"
          className="dashboard-sidebar-backdrop"
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

      <div className="dashboard-main">
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleCollapsed}
          onToggleMobileSidebar={toggleMobile}
        />
        <Outlet />
      </div>
    </div>
  );
}

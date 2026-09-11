import { useContext } from "react";
import { FaBars, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AuthContext } from "../pages/Provider/ContextProvider";

export default function Topbar({
  sidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileSidebar,
}) {
  const { user } = useContext(AuthContext);

  const initials = (() => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  })();

  return (
    <div className="topbar">
      <div className="dashboard-topbar-titleRow">
        <button
          type="button"
          className="dashboard-topbar-burger"
          onClick={onToggleMobileSidebar}
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
        <input placeholder="Search universities, programs, documents..." />
      </div>

      <div className="topbar-right">
        <span className="notification">🔔</span>
        <div className="user">
          <span className="avatar">{initials}</span>
          <span>{user?.name || user?.email?.split("@")?.[0] || "User"}</span>
        </div>
      </div>
    </div>
  );
}

import { useContext } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { AuthContext } from "../../pages/Provider/ContextProvider";

export default function Topbar({
  sidebarOpenMobile = false,
  onToggleMobileSidebar,
}) {
  const { user } = useContext(AuthContext);

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0]) 
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "AU";
  };

  return (
    <header className="topbar">
      <div>
        <div className="admin-topbar-titleRow">
          <button
            type="button"
            className={`admin-topbar-burger ${sidebarOpenMobile ? "is-active" : ""}`}
            onClick={onToggleMobileSidebar}
            aria-label={sidebarOpenMobile ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpenMobile ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <div className="topbar-right">
        <div className="admin-user">
          <div className="admin-user__avatar">{getUserInitials()}</div>
          <div className="admin-user__info">
            <span className="admin-user__name">
              {user?.name || "Admin User"}
            </span>
            <span className="admin-user__role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

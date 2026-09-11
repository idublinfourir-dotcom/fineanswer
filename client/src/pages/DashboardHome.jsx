import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentChecklist from "./DocumentChecklist";
import { AuthContext } from "./Provider/ContextProvider";

export default function DashboardHome() {
  const { user, isAdmin, getCurrentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Always fetch fresh user data from backend (no localStorage)
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUserData(currentUser);
      } else {
        // No user found, redirect to login
        navigate("/login");
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Get user name (handle different possible field names)
  // Use user from context or userData state
  const userName =
    user?.name ||
    userData?.name ||
    user?.displayName ||
    userData?.displayName ||
    user?.email?.split("@")[0] ||
    userData?.email?.split("@")[0] ||
    "User";

  return (
    <div className="dashboard-home">
      <div className="dashboard-home__header">
        <h2 className="welcome-text">Welcome back, {userName}</h2>
        <p className="sub-text">
          Track your study abroad journey and manage your applications
        </p>
      </div>

      {(userData || user) && (
        <section className="user-details-card">
          <h3 className="user-details-card__title">Your Profile</h3>
          <div className="user-details-grid">
            {(userData?.email || user?.email) && (
              <div className="user-details-item">
                <strong className="user-details-label">Email</strong>
                <p className="user-details-value">{userData?.email || user?.email}</p>
              </div>
            )}
            {(userData?.phone || user?.phone) && (
              <div className="user-details-item">
                <strong className="user-details-label">Phone</strong>
                <p className="user-details-value">{userData?.phone || user?.phone}</p>
              </div>
            )}
            {(userData?.picture || user?.picture) && (
              <div className="user-details-item">
                <strong className="user-details-label">Profile Picture</strong>
                <div className="user-details-image-wrap">
                  <img
                    src={userData?.picture || user?.picture}
                    alt="Profile"
                    className="user-details-image"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="dashboard-grid">
        <DocumentChecklist />
      </section>
    </div>
  );
}

import React, { useState, useContext, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../pages/Provider/ContextProvider";
import "../css/navbar3.css";
import logo from "../images/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user, isAdmin, loading } = useContext(AuthContext);

  const profileImageUrl = user?.picture || user?.photoURL;
  const showImage = profileImageUrl && !imgError;
  const showProfileArea = user || loading;

  useEffect(() => {
    setImgError(false);
  }, [user?.picture, user?.photoURL]);

  const getInitials = () => {
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
    return "?";
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
  };

  return (
    <header
      className="minimal-navbar"
    >
      <div className="nav-inner">
        <div
          className="nav-logo"
          onClick={() => {
            navigate("/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src={logo} alt="Logo" />
        </div>

        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <NavLink
            to="/"
            onClick={() => {
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Home
          </NavLink>
          <a href="/#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="/#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="/#countries" onClick={() => setMenuOpen(false)}>Countries</a>
          <a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <NavLink to="/career" onClick={() => setMenuOpen(false)}>Career</NavLink>
          <NavLink to="/blog" onClick={() => setMenuOpen(false)}>Blog</NavLink>
          
          {showProfileArea ? (
            <button
              className="nav-profile-btn"
              onClick={handleProfileClick}
              title={user ? `Go to ${isAdmin ? "Admin" : "User"} Dashboard` : "Loading..."}
              disabled={loading}
            >
              {loading ? (
                <span className="nav-profile-loading"></span>
              ) : showImage ? (
                <img
                  src={profileImageUrl}
                  alt={user.name || "Profile"}
                  className="nav-profile-img"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="nav-profile-initials">{getInitials()}</span>
              )}
            </button>
          ) : (
            <button
              className="nav-btn"
              onClick={() => {
                setMenuOpen(false);
                navigate("/register");
              }}
            >
              Join Now
            </button>
          )}
        </nav>

        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}
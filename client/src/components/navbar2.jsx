import React from "react";
import { useNavigate } from "react-router-dom";
import "./navbar2.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div
        className="logo"
        onClick={() => {
          navigate("/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        FineAnswer
      </div>
      <nav>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Home
        </a>
        <a href="#">About</a>
        <a href="#">Services</a>
        <a href="#">Countries</a>
        <a href="#">Events</a>
        <a href="#">Contact</a>
      </nav>
      <button className="consult-btn" onClick={() => navigate("/register")}>
        Join Now
      </button>
    </header>
  );
}

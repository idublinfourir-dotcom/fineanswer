import React from "react";
import { Link } from "react-router-dom";
import "./ireland.css";
import irelandBg from "./images/ireland.jpg";
import Navbar from "./components/navbar2";

export default function IrelandPage() {
  return (
    <div className="ireland-page">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${irelandBg})` }}
      >
        <div className="overlay">
          <Link to="/" className="hero-back-link">
            ← Return to Home
          </Link>
          <div className="hero-content">
            <h1>Study in Ireland</h1>
            <p>
              Discover globally ranked universities, strong career opportunities,
              and a welcoming environment for international students.
            </p>
            <a href="#keypoints" className="hero-btn">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* KEY POINTS SECTION */}
      <section className="keypoints" id="keypoints">
        <h2>Key Points</h2>
        <div className="points-grid">
          <div className="point"><strong>IELTS:</strong> 6.0 – 6.5</div>
          <div className="point"><strong>Intakes:</strong> Jan, Sept</div>
          <div className="point"><strong>Tuition Fees:</strong> 14-17 Lac</div>
          <div className="point"><strong>MOI:</strong> Accepted (Some Universities)</div>
          <div className="point"><strong>Language:</strong> English</div>
        </div>
        <button className="apply-btn">Apply for Next Intake</button>
      </section>

      {/* STUDY IN IRELAND DETAILS */}
      <section className="study-details">
        <h2>Study in Ireland</h2>
        <p>
          Ireland is home to some of the world’s top universities and is a global
          hub for technology, pharmaceuticals, finance, and research. The country
          offers high-quality education with excellent post-study career prospects.
        </p>

        <h3>Reasons to Study in Ireland</h3>
        <ul>
          <li>Globally recognized universities with strong academic reputation.</li>
          <li>Home to top multinational companies like Google, Apple, Meta, and Pfizer.</li>
          <li>Strong focus on research, innovation, and industry collaboration.</li>
          <li>Post-study work opportunities for international graduates.</li>
          <li>Safe, friendly, and English-speaking country.</li>
          <li>Shorter degree durations compared to many other countries.</li>
        </ul>

        <h3>Ability to Work</h3>
        <p>
          International students in Ireland are allowed to work
          <b> 20 hours per week</b> during term time and
          <b> 40 hours per week</b> during holidays.
        </p>

        <h3>Post-Study Work Rights</h3>
        <p>
          Ireland offers a post-study stay-back option of up to
          <b> 2 years</b> for master’s graduates under the Third Level Graduate Scheme,
          allowing students to gain valuable international work experience.
        </p>
      </section>
    </div>
  );
}

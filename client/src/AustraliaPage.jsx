import React from "react";
import { Link } from "react-router-dom";
import "./australia.css";
import australiaBg from "./images/aus.jpg";
import Navbar from "./components/navbar2"; // import your navbar component

export default function AustraliaPage() {
  return (
    <div className="australia-page">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${australiaBg})` }}
      >
        <div className="overlay">
          <Link to="/" className="hero-back-link">
            ← Return to Home
          </Link>
          <div className="hero-content">
            <h1>Study in Australia</h1>
            <p>
              Explore world-class education, vibrant culture, and endless
              opportunities for your academic and career growth.
            </p>
            <a href="#keypoints" className="hero-btn">
              Learn More
            </a>
          </div>
        </div>
      </section>

    {/* KEY POINTS SECTION */}
      <section className="keypoints">
        <h2>Key Points</h2>
        <div className="points-grid">
          <div className="point"><strong>IELTS:</strong> 6.0 - 6.5</div>
          <div className="point"><strong>Intakes:</strong> Jan, Sept</div>
          <div className="point"><strong>Tuition Fees:</strong> 22-25 Lac</div>
          <div className="point"><strong>MOI:</strong> Accepted</div>
          <div className="point"><strong>Language:</strong> English</div>
        </div>
        <button className="apply-btn">Apply for Next Intake</button>
      </section>

      {/* STUDY IN AUSTRALIA DETAILS */}
      <section className="study-details">
        <h2>Study in Australia</h2>
        <p>
          There are over 1,200 institutions and over 22,000 courses on offer for International students considering
          Australia as a destination. Importantly, Australian education institutions have an international reputation
          for excellence in many disciplines.
        </p>
        <h3>Reasons to Study in Australia</h3>
        <ul>
          <li>Institutions deliver practical and career-orientated training.</li>
          <li>Australia has a reputation as an innovative and research-intensive culture.</li>
          <li>Academic staff are recruited globally and are industry experts.</li>
          <li>Australian teachers are experienced in supervising international students.</li>
          <li>Active student exchange programs with USA, UK, Canada, Europe, and Asia.</li>
          <li>Australia adopts new technologies at a fast rate and has one of the highest Internet access rates.</li>
          <li>Facilities for teaching and research are world-class with modern technology.</li>
        </ul>

        <h3>Ability to Work</h3>
        <p>
          During their studies, international students in Australia can work to supplement their income.
          Students can work <b>40 hours per fortnight</b> during sessions and unlimited hours during breaks.
          Dependants may also work under certain conditions.
        </p>

        <h3>Post-Study Work Rights</h3>
        <p>
          The Post-Study Work stream of the Temporary Graduate visa (subclass 485) offers graduates a visa
          of 2–4 years depending on their qualification. Applicants must meet the Australian study requirement
          and have completed at least two academic years of study in no less than 16 months.
        </p>
      </section>
    </div>
  );
}

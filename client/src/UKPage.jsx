import React from "react";
import { Link } from "react-router-dom";
import "./UKPage.css"; // You can copy australia.css into uk.css if identical
import ukBg from "./images/uk.jpg"; // Make sure the image exists in src/images
import Navbar from "./components/navbar2"; // your navbar component

export default function UKPage() {
  return (
    <div className="uk-page">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${ukBg})` }}
      >
        <div className="overlay">
          <Link to="/" className="hero-back-link">
            ← Return to Home
          </Link>
          <div className="hero-content">
            <h1>Study in UK</h1>
            <p>
              The United Kingdom boasts prestigious universities and a rich history,
              making it a popular destination for international students.
            </p>
            <a href="#keypoints" className="hero-btn">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="keypoints" id="keypoints">
        <h2>Key Points</h2>
        <div className="points-grid">
          <div className="point"><strong>IELTS:</strong> 6.0 - 6.5</div>
          <div className="point"><strong>Intakes:</strong> Jan, Sept</div>
          <div className="point"><strong>Tuition Fees:</strong> 28-35 Lac</div>
          <div className="point"><strong>MOI:</strong> Not Accepted</div>
          <div className="point"><strong>Language:</strong> English</div>
        </div>
        <button className="apply-btn">Apply for Next Intake</button>
      </section>

      {/* Study in UK Details */}
      <section className="study-details">
        <h2>Study in UK</h2>
        <p>
          The UK is one of the world’s most popular destinations for higher education, 
          with more than 500,000 international students enrolling each year.
        </p>

        <h3>Why Study in UK?</h3>
        <ul>
          <li>One of the world’s leading destinations for international students, second only to the USA.</li>
          <li>UK universities are globally recognised and perform well in world rankings.</li>
          <li>Degrees and qualifications recognised by employers and academics worldwide.</li>
          <li>Develop skills, knowledge, and critical thinking to drive your career.</li>
          <li>High-quality postgraduate study opportunities, with some universities offering visa sponsorship.</li>
          <li>Shorter course durations reduce tuition and accommodation costs.</li>
          <li>Opportunities to work while studying – check UKVI and UKCISA guidance.</li>
          <li>Multicultural society with diverse cultures, languages, and faiths.</li>
          <li>Wide variety of cuisine, strong transport links, famous festivals, and sporting events.</li>
          <li>Different application deadlines for courses and universities – check key dates.</li>
          <li>Tuition fees vary; financial help and scholarships may be available.</li>
          <li>Living costs depend on the city – London is more expensive than smaller cities.</li>
        </ul>
      </section>
    </div>
  );
}

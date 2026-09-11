import React from "react";
import "./CountrySlider.css";
import ukImg from "../images/uk.jpg";
import irelandImg from "../images/ireland.jpg";
import ausImg from "../images/aus.jpg";

import { useNavigate } from "react-router-dom";

const CountrySlider = () => {
  const navigate = useNavigate();
  
const countries = [
    {
      name: "Ireland",
      desc: "Comprehensive counseling for Irish universities and study visa processing.",
      img: irelandImg,
      link: "/ireland",
    },
    {
      name: "United Kingdom",
      desc: "Expert guidance for UK universities, applications, and student visa support.",
      img: ukImg,
      link: "/uk",
    },
    {
      name: "Australia",
      desc: "End-to-end support for studying in Australia including admissions and visas.",
      img: ausImg,
      link: "/australia",
    },
  ];
  return (
    <section className="countries-section">
      <h2>Countries We Are Operating In</h2>

      <div className="countries-grid">
        {countries.map((c, i) => (
          <div className="country-card" key={i}>
            <img src={c.img} alt={c.name} />
            <div className="card-content">
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
            <button onClick={() => navigate(c.link)}>
                Read More <span>+</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CountrySlider;

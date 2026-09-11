import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CEOQuote from "./components/CEOQuote";
import ContactSection from "./components/ContactSection";
import CountrySlider from "./components/CountrySlider";
import PartnerBank from "./components/PartnerBank";
import PartnerLogos from "./components/PartnerLogos";
import Services from "./components/Services";
import SuccessStories from "./components/SuccessStories";
import Navbar3 from "./components/navbar3";
import useFadeIn from "./hooks/useFadeIn";
import { AuthContext } from "./pages/Provider/ContextProvider";

import "./LandingPage.css";
import uni1 from "./assets/DCU.jpg";
import uni4 from "./assets/Trinity1.jpg";
import uni2 from "./assets/UL.jpg";
import uni3 from "./assets/setu.jpg";
export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);
  const [servicesRef, servicesVisible] = useFadeIn();
  const [partnerLogosRef, partnerLogosVisible] = useFadeIn();
  const [storiesRef, storiesVisible] = useFadeIn();
  const [countryRef, countryVisible] = useFadeIn();
  const [ceoRef, ceoVisible] = useFadeIn();
  const [contactRef, contactVisible] = useFadeIn();
  const images = [uni1, uni2, uni3, uni4];
  const [currentImage, setCurrentImage] = useState(0);

  // Stats animation states
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [students, setStudents] = useState(0);
  const [countries, setCountries] = useState(0);
  const [partners, setPartners] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupShownBefore, setPopupShownBefore] = useState(false);

  // Search state
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIntake, setSelectedIntake] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchRef = useRef(null);

  // Country is fixed to Ireland
  const COUNTRY = "Ireland";
  const LEVELS = [
    { label: "Postgraduate", value: "Master's (Postgraduate)" },
    { label: "Undergraduate", value: "Bachelor's (Undergraduate)" },
    { label: "Postgraduate Diploma", value: "Postgraduate Diploma" },
    { label: "Higher Diploma", value: "Higher Diploma" },
  ];
  const CATEGORIES = [
    { label: "Business, Management & Law",  value: "Business, Management & Law" },
    { label: "Computing, IT & Engineering", value: "Computing, IT & Engineering" },
    { label: "Life Sciences & Health",      value: "Life Sciences & Health" },
    { label: "Social Sciences",             value: "Social Sciences" },
    { label: "Education & Media",           value: "Education & Media" },
    { label: "Others",                      value: "Others" },
  ];
  const INTAKES = [
    { label: "September", value: "September" },
    { label: "January / February", value: "January/February" },
    { label: "April", value: "April" },
  ];

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLevel)    params.set("level",    selectedLevel);
    params.set("country", COUNTRY);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedIntake)   params.set("intake",   selectedIntake);
    navigate(`/search-results?${params.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to section when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove '#' prefix
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    };

    // Handle initial hash on page load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Count-up animation: update only when value changes to reduce re-renders
  useEffect(() => {
    if (!statsVisible) return;

    const duration = 1500;
    const start = Date.now();
    const target = { students: 100, countries: 4, partners: 16, satisfaction: 100 };
    let lastStudents = -1, lastCountries = -1, lastPartners = -1, lastSatisfaction = -1;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress); // easeOutQuad
      const s = Math.floor(target.students * easeProgress);
      const c = Math.floor(target.countries * easeProgress);
      const p = Math.floor(target.partners * easeProgress);
      const sat = Math.floor(target.satisfaction * easeProgress);
      if (s !== lastStudents) { lastStudents = s; setStudents(s); }
      if (c !== lastCountries) { lastCountries = c; setCountries(c); }
      if (p !== lastPartners) { lastPartners = p; setPartners(p); }
      if (sat !== lastSatisfaction) { lastSatisfaction = sat; setSatisfaction(sat); }
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [statsVisible]);

  // Detect stats section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Show popup after 10 seconds only when user is not logged in and popup hasn't been shown before
  useEffect(() => {
    if (loading || user) return;

    // Check if popup has been shown before
    const hasShownPopup = localStorage.getItem("popupShown");
    setPopupShownBefore(!!hasShownPopup);

    if (hasShownPopup) return;

    const timer = setTimeout(() => {
      setShowPopup(true);
      localStorage.setItem("popupShown", "true");
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading, user]);

  // Hide popup when user logs in
  useEffect(() => {
    if (user) setShowPopup(false);
  }, [user]);

  return (
    <div className="LandingPage">
      <Navbar3 />

      {/* HERO SECTION */}
      <section className="hero-section-new">
        <div className="hero-background">
          {images.map((img, index) => (
            <div
              key={index}
              className={`hero-bg-slide ${index === currentImage ? "active" : ""}`}
              style={{ backgroundImage: `url(${img})` }}
            ></div>
          ))}
        </div>

        {/* Dark + Purple Gradient Overlay */}
        <div className="hero-overlay"></div>

        {/* Main Content */}
        <div className="hero-content-wrapper">
          <h1 className="hero-title">
            Guiding you to <span>World-Class Education</span>
          </h1>

          <p className="hero-subtitle">
            Find your dream university with FineAnswer. From choosing a country
            to landing on campus — we guide you every step of the way.
          </p>

          {/* Search Bar Glass Box */}
          <div className="hero-search-wrapper-new" ref={searchRef}>
            <div className="hero-search-box-new">
              {/* Country – fixed to Ireland */}
              <div className="search-item-wrap">
                <div className="search-item-new">
                  <span className="search-label">Country</span>
                  <span className="search-value">{COUNTRY}</span>
                </div>
              </div>

              <div className="divider"></div>

              {/* Level – dropdown */}
              <div
                className={`search-item-wrap ${activeDropdown === "level" ? "dropdown-open" : ""}`}
              >
                <button
                  type="button"
                  className="search-item-new"
                  onClick={() => toggleDropdown("level")}
                >
                  <span className="search-label">Level</span>
                  <span className={`search-value${!selectedLevel ? " search-value--placeholder" : ""}`}>
                    {LEVELS.find((l) => l.value === selectedLevel)?.label ||
                      "Select Level"}
                    <span className="search-chevron">▼</span>
                  </span>
                </button>
                {activeDropdown === "level" && (
                  <div className="search-dropdown">
                    {LEVELS.map((l, idx) => (
                      <button
                        key={l.value}
                        type="button"
                        className="search-dropdown-item"
                        ref={el => {
                          if (activeDropdown === "level" && idx === 0 && el) el.focus();
                        }}
                        onClick={e => {
                          setSelectedLevel(l.value);
                          setActiveDropdown(null);
                          e.currentTarget.focus();
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="divider"></div>

              {/* Category – dropdown */}
              <div
                className={`search-item-wrap search-item-wrap--category ${activeDropdown === "category" ? "dropdown-open" : ""}`}
              >
                <button
                  type="button"
                  className="search-item-new"
                  onClick={() => toggleDropdown("category")}
                >
                  <span className="search-label">Category</span>
                  <span className={`search-value${!selectedCategory ? " search-value--placeholder" : ""}`}>
                    {CATEGORIES.find((c) => c.value === selectedCategory)?.label ||
                      "All Categories"}
                    <span className="search-chevron">▼</span>
                  </span>
                </button>
                {activeDropdown === "category" && (
                  <div className="search-dropdown">
                    {CATEGORIES.map((c, idx) => (
                      <button
                        key={c.value}
                        type="button"
                        className="search-dropdown-item"
                        ref={el => {
                          if (activeDropdown === "category" && idx === 0 && el) el.focus();
                        }}
                        onClick={e => {
                          setSelectedCategory(c.value);
                          setActiveDropdown(null);
                          e.currentTarget.focus();
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="divider"></div>

              {/* Intake – dropdown */}
              <div
                className={`search-item-wrap ${activeDropdown === "intake" ? "dropdown-open" : ""}`}
              >
                <button
                  type="button"
                  className="search-item-new"
                  onClick={() => toggleDropdown("intake")}
                >
                  <span className="search-label">Intake</span>
                  <span className={`search-value${!selectedIntake ? " search-value--placeholder" : ""}`}>
                    {INTAKES.find((i) => i.value === selectedIntake)?.label ||
                      "Select Intake"}
                    <span className="search-chevron">▼</span>
                  </span>
                </button>
                {activeDropdown === "intake" && (
                  <div className="search-dropdown">
                    {INTAKES.map((i, idx) => (
                      <button
                        key={i.value}
                        type="button"
                        className="search-dropdown-item"
                        ref={el => {
                          if (activeDropdown === "intake" && idx === 0 && el) el.focus();
                        }}
                        onClick={e => {
                          setSelectedIntake(i.value);
                          setActiveDropdown(null);
                          e.currentTarget.focus();
                        }}
                      >
                        {i.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="search-btn-new" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
          {/* CTA BUTTONS */}
          <div className="hero-cta-buttons">
            <button
              className="cta-apply"
              onClick={() =>
                window.open(
                  "https://docs.google.com/spreadsheets/d/1e_YOl7EykAO4OV_qn_ZoHzZ_lb9Oynu-yJznU1m2Hfs/edit?usp=sharing",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              Check Visa Decision
            </button>

            <button
              className="cta-consult"
              onClick={() => {
                const contactSection = document.getElementById("contact");
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Book Consultation
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT + STATS SECTION (Like Example Image) */}
      <section id="about" className="about-stats-section" ref={statsRef}>
        <div className="about-left">
          <h2>ABOUT US</h2>
          <p>
            We help students unlock global academic opportunities through
            seamless guidance, expert mentoring, and complete end-to-end
            support. Headquartered in Ireland, we guide students from choosing
            the right country and institution to confidently stepping onto
            campus — supporting them at every stage of their journey.
          </p>

          <div className="about-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate("/read-more-info")}
            >
              Learn More
            </button>
            <a
              href="https://www.youtube.com/@FineAnswerStudyAbroad/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Watch Video ▶
            </a>
          </div>
        </div>

        <div className="about-right">
          <div className="stat-box">
            <h3>{students}+</h3>
            <p>Happy Students</p>
          </div>

          <div className="stat-box">
            <h3>{countries}+</h3>
            <p>Countries Served</p>
          </div>

          <div className="stat-box">
            <h3>{partners}+</h3>
            <p>Partner Institutions</p>
          </div>

          <div className="stat-box">
            <h3>{satisfaction}%</h3>
            <p>Student Satisfaction</p>
          </div>
        </div>
      </section>

      <div
        id="services"
        ref={servicesRef}
        className={`fade-section ${servicesVisible ? "show" : ""}`}
      >
        <Services />
      </div>

      <div
        ref={partnerLogosRef}
        className={`fade-section ${partnerLogosVisible ? "show" : ""}`}
      >
        <PartnerLogos />
      </div>

      <div
        ref={storiesRef}
        className={`fade-section ${storiesVisible ? "show" : ""}`}
      >
        <SuccessStories />
      </div>

      <div
        id="countries"
        ref={countryRef}
        className={`fade-section ${countryVisible ? "show" : ""}`}
      >
        <CountrySlider />
      </div>

      <div className={`fade-section ${partnerLogosVisible ? "show" : ""}`}>
        <PartnerBank />
      </div>

      <div ref={ceoRef} className={`fade-section ${ceoVisible ? "show" : ""}`}>
        <CEOQuote />
      </div>

      <div
        id="contact"
        ref={contactRef}
        className={`fade-section ${contactVisible ? "show" : ""}`}
      >
        <ContactSection />
      </div>

      {/* FOOTER */}
      <footer>
        <p>© 2025 FineAnswer Study Abroad Consultancy. All rights reserved.</p>
      </footer>

      {showPopup && !loading && !user && (
        <div className="popup-overlay">
          <div className="modern-popup">
            <button
              className="popup-close"
              onClick={() => {
                setShowPopup(false);
                localStorage.setItem("popupShown", "true");
              }}
            >
              ×
            </button>
            <h2>Unlock More Opportunities!</h2>
            <p>
              Login or Register now to access personalized guidance,
              scholarships, and priority support from our expert team.
            </p>
            <div className="modern-popup-buttons">
              <button onClick={() => navigate("/login")} className="modern-btn">
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="modern-btn modern-btn-alt"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

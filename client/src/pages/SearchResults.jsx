import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchPrograms } from "../services/programApi";
import Navbar3 from "../components/navbar3";
import "./SearchResults.css";

const LEVELS = [
  { label: "Postgraduate",        value: "Master's (Postgraduate)" },
  { label: "Undergraduate",        value: "Bachelor's (Undergraduate)" },
  { label: "Postgraduate Diploma", value: "Postgraduate Diploma" },
  { label: "Higher Diploma",       value: "Higher Diploma" },
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
  { label: "September",          value: "September" },
  { label: "January / February", value: "January/February" },
  { label: "April",              value: "April" },
];

const COUNTRY = "Ireland";

// Color map for level badges
const LEVEL_COLORS = {
  "Master's (Postgraduate)":    { bg: "#ede9fe", text: "#6d28d9" },
  "Bachelor's (Undergraduate)": { bg: "#dbeafe", text: "#1d4ed8" },
  "Postgraduate Diploma":       { bg: "#fce7f3", text: "#be185d" },
  "Higher Diploma":             { bg: "#d1fae5", text: "#065f46" },
};

function getLevelLabel(value) {
  return LEVELS.find((l) => l.value === value)?.label || value;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL
  const [selectedLevel, setSelectedLevel] = useState(
    searchParams.get("level") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedIntake, setSelectedIntake] = useState(
    searchParams.get("intake") || ""
  );

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Run search whenever URL query params change
  useEffect(() => {
    const level    = searchParams.get("level")    || "";
    const country  = searchParams.get("country")  || "";
    const category = searchParams.get("category") || "";
    const intake   = searchParams.get("intake")   || "";

    // Sync local state with URL
    setSelectedLevel(level);
    setSelectedCategory(category);
    setSelectedIntake(intake);

    if (!level && !country && !category && !intake) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    searchPrograms({ level, country, category, intake })
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLevel)    params.set("level",    selectedLevel);
    params.set("country", COUNTRY);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedIntake)   params.set("intake",   selectedIntake);
    setSearchParams(params);
  };

  const activeFilters = [
    { key: "Country", value: COUNTRY },
    selectedLevel && { key: "Level", value: getLevelLabel(selectedLevel) },
    selectedCategory && {
      key: "Category",
      value: CATEGORIES.find((c) => c.value === selectedCategory)?.label || selectedCategory,
    },
    selectedIntake && {
      key: "Intake",
      value: INTAKES.find((i) => i.value === selectedIntake)?.label || selectedIntake,
    },
  ].filter(Boolean);

  return (
    <div className="sr-page">
      <Navbar3 />

      {/* ── SEARCH HERO ── */}
      <div className="sr-hero">
        <div className="sr-hero-inner">
          <h1 className="sr-hero-title">Find Your Program</h1>
          <p className="sr-hero-sub">Browse partner university programs in Ireland</p>

          <div className="sr-search-bar">
            {/* Country – fixed */}
            <div className="sr-field sr-field--country">
              <label className="sr-field-label">Country</label>
              <span className="sr-field-fixed">{COUNTRY}</span>
            </div>

            <div className="sr-divider" />

            {/* Level */}
            <div className="sr-field">
              <label className="sr-field-label">Level</label>
              <select
                className="sr-field-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">Select Level</option>
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className="sr-divider" />

            {/* Category */}
            <div className="sr-field sr-field--category">
              <label className="sr-field-label">Category</label>
              <select
                className="sr-field-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="sr-divider" />

            {/* Intake */}
            <div className="sr-field">
              <label className="sr-field-label">Intake</label>
              <select
                className="sr-field-select"
                value={selectedIntake}
                onChange={(e) => setSelectedIntake(e.target.value)}
              >
                <option value="">Select Intake</option>
                {INTAKES.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>

            <button className="sr-search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── RESULTS AREA ── */}
      <div className="sr-body">

        {/* Active filter pills */}
        {searched && activeFilters.length > 0 && (
          <div className="sr-filter-row">
            <span className="sr-filter-heading">Active filters:</span>
            {activeFilters.map((f) => (
              <span key={f.key} className="sr-filter-pill">
                <span className="sr-filter-pill-key">{f.key}</span>
                {f.value}
              </span>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="sr-loading">
            <div className="sr-spinner" />
            <p>Searching programs…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="sr-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && searched && results.length === 0 && (
          <div className="sr-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3>No programs found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <>
            <div className="sr-results-header">
              <h2 className="sr-results-title">
                {results.length} Program{results.length !== 1 ? "s" : ""} Found
              </h2>
            </div>

            <div className="sr-grid">
              {results.map((prog, idx) => {
                const levelColors = LEVEL_COLORS[prog.level] || { bg: "#f3f4f6", text: "#374151" };
                return (
                  <div className="sr-card" key={idx}>
                    {/* Card top accent */}
                    <div className="sr-card-accent" />

                    <div className="sr-card-body">
                      {/* Level badge */}
                      {prog.level && (
                        <span
                          className="sr-level-badge"
                          style={{ background: levelColors.bg, color: levelColors.text }}
                        >
                          {getLevelLabel(prog.level)}
                        </span>
                      )}

                      {/* Program title */}
                      <h3 className="sr-card-program">{prog.programName}</h3>

                      {/* University */}
                      <div className="sr-card-university">
                        <svg className="sr-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5 8.166V13a1 1 0 00.553.895l4 2a1 1 0 00.894 0l4-2A1 1 0 0015 13V8.166l2.394-1.026A1 1 0 0018 6.22l-7-3-7 3 7 3 5.947-2.55L10 9.26 4.053 6.67 10 4.118l5.947 2.554L10 9.26z"/>
                        </svg>
                        <span>{prog.university || "—"}</span>
                      </div>

                      {/* Divider */}
                      <div className="sr-card-divider" />

                      {/* Meta grid */}
                      <div className="sr-meta-grid">
                        {prog.campus && (
                          <div className="sr-meta-cell">
                            <div className="sr-meta-label">📍 Campus</div>
                            <div className="sr-meta-value">{prog.campus}</div>
                          </div>
                        )}
                        {prog.duration && (
                          <div className="sr-meta-cell">
                            <div className="sr-meta-label">⏱ Duration</div>
                            <div className="sr-meta-value">{prog.duration}</div>
                          </div>
                        )}
                        {prog.tuitionFees && (
                          <div className="sr-meta-cell sr-meta-cell--full">
                            <div className="sr-meta-label">💰 Tuition Fees</div>
                            <div className="sr-meta-value sr-meta-value--fee">{prog.tuitionFees}</div>
                          </div>
                        )}
                        {prog.availableIntakes && (
                          <div className="sr-meta-cell sr-meta-cell--full">
                            <div className="sr-meta-label">📅 Available Intakes</div>
                            <div className="sr-meta-value">{prog.availableIntakes}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    {prog.referenceLink ? (
                      <a
                        href={prog.referenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sr-card-btn"
                      >
                        View Program
                        <svg viewBox="0 0 20 20" fill="currentColor" className="sr-btn-icon">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </a>
                    ) : (
                      <div className="sr-card-btn sr-card-btn--disabled">No link available</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Prompt before search */}
        {!loading && !searched && (
          <div className="sr-prompt">
            <div className="sr-prompt-icon">🎓</div>
            <h3>Select your filters above</h3>
            <p>We'll show you all matching programs across our partner universities.</p>
          </div>
        )}
      </div>
    </div>
  );
}

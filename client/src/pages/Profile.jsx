import { useContext, useEffect, useState } from "react";
import { FaCamera, FaGraduationCap, FaSave, FaUser } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import "./Profile.css";
import { AuthContext } from "./Provider/ContextProvider";

export default function Profile() {
  const { user, getCurrentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
    highestEducation: "",
    university: "",
    graduationYear: "",
    gpa: "",
    workExperience: "",
    yearsOfExperience: "",
    languageTestType: "IELTS",
    languageOverallScore: "",
    languageReading: "",
    languageWriting: "",
    languageListening: "",
    languageSpeaking: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        phone: user.phone || "",
        country: user.country || "",
        city: user.city || "",
        address: user.address || "",
        postalCode: user.postalCode || "",
        highestEducation: user.highestEducation || "",
        university: user.university || "",
        graduationYear: user.graduationYear || "",
        gpa: user.gpa || "",
        workExperience: user.workExperience || "",
        yearsOfExperience: user.yearsOfExperience || "",
        languageTestType: user.languageTest?.testType || "IELTS",
        languageOverallScore: user.languageTest?.overallScore || "",
        languageReading: user.languageTest?.reading || "",
        languageWriting: user.languageTest?.writing || "",
        languageListening: user.languageTest?.listening || "",
        languageSpeaking: user.languageTest?.speaking || "",
      });
    }
    setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Please log in to save your profile." });
        setSaving(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          dateOfBirth: formData.dateOfBirth || undefined,
          phone: formData.phone || undefined,
          country: formData.country || undefined,
          city: formData.city || undefined,
          address: formData.address || undefined,
          postalCode: formData.postalCode || undefined,
          highestEducation: formData.highestEducation || undefined,
          university: formData.university || undefined,
          graduationYear: formData.graduationYear || undefined,
          gpa: formData.gpa || undefined,
          workExperience: formData.workExperience || undefined,
          yearsOfExperience: formData.yearsOfExperience || undefined,
          languageTest: {
            testType: formData.languageTestType,
            overallScore: formData.languageOverallScore || undefined,
            reading: formData.languageReading || undefined,
            writing: formData.languageWriting || undefined,
            listening: formData.languageListening || undefined,
            speaking: formData.languageSpeaking || undefined,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save profile");
      }

      setMessage({ type: "success", text: "Profile saved successfully!" });
      await getCurrentUser();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-left">
          <div className="avatar">
            {user.picture ? (
              <img src={user.picture} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <>
                {getInitials()}
                <span className="camera">
                  <FaCamera />
                </span>
              </>
            )}
          </div>

          <div>
            <h3>{user.name || "User"}</h3>
            <p>{user.email}</p>

            <div className="stats">
              <span>0 Applications</span>
              <span>0 Offers</span>
            </div>
          </div>
        </div>

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <p className={`profile-message ${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </p>
      )}

      {/* Content */}
      <form className="profile-grid" onSubmit={handleSave}>
        {/* Personal Info */}
        <div className="profile-card">
          <h4>
            <FaUser /> Personal Information
          </h4>

          <div className="form-grid">
            <div>
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Email Address</label>
              <input value={user.email} disabled className="readonly" />
            </div>

            <div>
              <label>Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label>Country</label>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>

            <div>
              <label>City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>

            <div className="full">
              <label>Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
              />
            </div>

            <div>
              <label>Postal Code</label>
              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
              />
            </div>
          </div>
        </div>

        {/* Education + Language */}
        <div className="profile-card">
          <h4>
            <FaGraduationCap /> Educational Background
          </h4>

          <div className="form-grid">
            <div className="full">
              <label>Highest Education</label>
              <input
                name="highestEducation"
                value={formData.highestEducation}
                onChange={handleChange}
                placeholder="e.g. Bachelor of Science in Computer Science"
              />
            </div>

            <div className="full">
              <label>University</label>
              <input
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="University name"
              />
            </div>

            <div>
              <label>Graduation Year</label>
              <input
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="e.g. 2020"
              />
            </div>

            <div>
              <label>GPA / CGPA</label>
              <input
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                placeholder="e.g. 3.8"
              />
            </div>

            <div className="full">
              <label>Work Experience</label>
              <input
                name="workExperience"
                value={formData.workExperience}
                onChange={handleChange}
                placeholder="e.g. Software Engineer at Tech Corp"
              />
            </div>

            <div>
              <label>Years of Experience</label>
              <input
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                placeholder="e.g. 2 years"
              />
            </div>
          </div>

          {/* Language Test */}
          <div className="language-section">
            <h5>Language Proficiency Test</h5>

            <div className="form-grid">
              <div>
                <label>Test Type</label>
                <select
                  name="languageTestType"
                  value={formData.languageTestType}
                  onChange={handleChange}
                >
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="Duolingo">Duolingo</option>
                </select>
              </div>

              <div>
                <label>Overall Score</label>
                <input
                  name="languageOverallScore"
                  value={formData.languageOverallScore}
                  onChange={handleChange}
                  placeholder="7.5"
                />
              </div>

              <div>
                <label>Reading</label>
                <input
                  name="languageReading"
                  value={formData.languageReading}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Writing</label>
                <input
                  name="languageWriting"
                  value={formData.languageWriting}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Listening</label>
                <input
                  name="languageListening"
                  value={formData.languageListening}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Speaking</label>
                <input
                  name="languageSpeaking"
                  value={formData.languageSpeaking}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

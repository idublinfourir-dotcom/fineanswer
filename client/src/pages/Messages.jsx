import { useState, useEffect, useContext } from "react";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "./Provider/ContextProvider";
import "./Messages.css";

// Basic email format validation (valid structure so we can reply)
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed) && trimmed.length <= 254;
};

export default function Messages() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    lastEducation: "",
    preferredCountry: "",
    appointmentDate: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Pre-fill name, email, phone from logged-in user
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      ...(user.email && { email: user.email }),
      ...((user.name || user.displayName) && {
        name: user.name || user.displayName,
      }),
      ...(user.phone && { phone: user.phone }),
      ...(user.phoneNumber && !user.phone && { phone: user.phoneNumber }),
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (!form.message.trim()) {
      setError("Message is required.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/send-message`, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        lastEducation: form.lastEducation.trim() || undefined,
        preferredCountry: form.preferredCountry || undefined,
        appointmentDate: form.appointmentDate || undefined,
        message: form.message.trim(),
      });
      if (res?.data?.success) {
        setSuccess(res.data.message || "Your message has been sent successfully.");
        setForm({
          name: user?.name || user?.displayName || "",
          email: user?.email || "",
          phone: user?.phone || user?.phoneNumber || "",
          lastEducation: "",
          preferredCountry: "",
          appointmentDate: "",
          message: "",
        });
      } else {
        setError(res?.data?.message || "Failed to send message.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-card">
        <h3 className="messages-title">
          <FaEnvelope /> Send a Message
        </h3>

        <form onSubmit={handleSubmit} className="form-grid-wrap">
          <div className="form-grid">
            <div>
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label>Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
            <div>
              <label>Last Education</label>
              <input
                name="lastEducation"
                value={form.lastEducation}
                onChange={handleChange}
                placeholder="Bachelor / HSC / Diploma"
              />
            </div>

            <div>
              <label>Preferred Country</label>
              <select
                name="preferredCountry"
                value={form.preferredCountry}
                onChange={handleChange}
              >
                <option value="">Select country</option>
                <option value="Australia">Australia</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="USA">USA</option>
                <option value="Ireland">Ireland</option>
              </select>
            </div>
            <div className="full">
              <label>Appointment Date</label>
              <input
                type="date"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={handleChange}
              />
            </div>

            <div className="full">
              <label>Your Message</label>
              <textarea
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                required
              />
            </div>
          </div>

          {success && (
            <p className="messages-success" role="alert">
              {success}
            </p>
          )}
          {error && (
            <p className="messages-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="send-btn" disabled={loading}>
            <FaPaperPlane /> {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

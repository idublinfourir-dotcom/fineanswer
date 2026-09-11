import "./contact.css";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaPhone,
} from "react-icons/fa";

const FORMSUBMIT_URL = "https://formsubmit.co/fineanswer2025@gmail.com";

export default function ContactSection() {
  const thankYouUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname || "/"}${window.location.hash || "#contact"}?submitted=1`
      : "";

  return (
    <section className="contact-wrapper" id="contact">
      <div className="contact-container">
        {/* LEFT PANEL */}
        <div className="contact-left">
          <p className="contact-tag">Contact Us</p>

          <h2 className="contact-title">Get In Touch</h2>

          <p className="contact-desc">
            Reach us anytime for guidance on universities, visas, applications,
            scholarships, and more. Our advisors respond within 24 hours.
          </p>

          <div className="contact-info">
            <p>📍 House 76/A, Road 11, Banani, Dhaka 1213, Bangladesh</p>

            <div className="contact-phone-row contact-whatsapp-row">
              <a
                href="https://wa.me/353899519986"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-whatsapp-link"
                aria-label="Ireland & Abroad Hotline on WhatsApp"
              >
                <span className="contact-whatsapp-icon">
                  <FaWhatsapp />
                </span>
                <span className="contact-whatsapp-text">
                  <strong>Ireland & Abroad Hotline</strong>
                  +353 (89) 951 9986
                </span>
              </a>
            </div>

            <p className="contact-phone-row">
              <FaPhone className="contact-phone-icon" />
              +880 1725-980472, +880 1725-971833
            </p>
            <p>📧 studyabroad@fineanswer.net</p>
          </div>

          <div className="social-icons">
            <a
              href="https://www.facebook.com/FineanswerStudyAbroad"
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.linkedin.com/company/fineanswerstudyabroad/?originalSubdomain=bd"
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://www.instagram.com/fineanswer_study_abroad/"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@FineAnswerStudyAbroad/videos"
              target="_blank"
              rel="noreferrer"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* RIGHT FORM CARD - FormSubmit.co sends to fineanswer2025@gmail.com */}
        <div className="contact-card">
          <h3 className="form-title">Send your query</h3>

          <form
            className="contact-form"
            action={FORMSUBMIT_URL}
            method="POST"
          >
            <input type="hidden" name="_subject" value="FineAnswer: Free Consultation Request" />
            <input type="hidden" name="_replyto" value="email" />
            <input type="hidden" name="_captcha" value="false" />
            {thankYouUrl && (
              <input type="hidden" name="_next" value={thankYouUrl} />
            )}

            <div className="form-group">
              <label htmlFor="contact-name">Full Name</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Your Full Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-phone">Phone Number</label>
              <input
                id="contact-phone"
                type="tel"
                name="phone"
                placeholder="+880 1XXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-date">Appointment Date</label>
              <input
                id="contact-date"
                type="date"
                name="appointmentDate"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Your Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows="4"
                placeholder="Write your questions or requirements"
                required
              />
            </div>

            <button type="submit" className="send-btn">
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import "./Services.css";

import { 
  FaFileAlt, 
  FaGlobe, 
  FaHandsHelping, 
  FaPassport, 
  FaPlaneDeparture, 
  FaUniversity, 
  FaHeartbeat,
  FaSuitcaseRolling
} from "react-icons/fa";


const Services = () => {
  const handleSendEnquiry = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cards = [
  {
  icon: <FaGlobe />,
  title: "Free Expert Counseling",
  text: "Get expert guidance to choose the right country, university, and course aligned with your academic profile and career goals. Enjoy free counseling with no file opening charge, ensuring a smooth and stress-free start to your study abroad journey.",
  color: "#6C63FF",
},
 {
  icon: <FaUniversity />,
  title: "University & Course Selection",
  text: "Personalized support in selecting the best universities and programs that match your academic background, career goals, and budget across Ireland, the UK, Australia, and other top study destinations.",
  color: "#4CC9F0",
},
  {
  icon: <FaFileAlt />,
  title: "Application & Documentation",
  text: "End-to-end support with university applications and document preparation, including SOPs, LORs, transcripts, and all required academic paperwork to ensure a strong and complete submission.",
  color: "#FF6B6B",
},
  {
  icon: <FaPassport />,
  title: "Visa Processing & Interview Preparation",
  text: "Accurate visa processing support including document review, application submission guidance, visa interview preparation and mock interview sessions to help applicants feel confident and maximize approval success.",
  color: "#FFD93D",
},
  {
    icon: <FaPlaneDeparture />,
    title: "Visa Logistics & Document Handling",
    text: "Secure logistics support for transferring visa documents from Bangladesh to India, where the Ireland Embassy processes applications.",
    color: "#FF9F1C",
  },
  {
    icon: <FaHandsHelping />,
    title: "International Mentorship & Student Guidance",
    text: "Access to international experts and experienced student mentors for scholarship guidance, English proficiency preparation, and academic success strategies.",
    color: "#7209B7",
  },
  {
  icon: <FaHeartbeat />,
  title: "Medical Insurance Assistance",
  text: "Get expert support in selecting and purchasing the right international medical insurance plan required for your student visa and university enrollment, ensuring you stay protected and fully compliant while studying abroad.",
  color: "#2EC4B6",
},
{
  icon: <FaSuitcaseRolling />,
  title: "Pre-Departure & Post-Arrival Support",
  text: "Comprehensive support including pre-departure briefings, accommodation guidance, airport pickup assistance, local registration help, and initial settlement support after arrival.",
  color: "#3A86FF",
},
];



  return (
    <section className="services-section">
      <div className="services-left">
        <h2>Our services</h2>
        <p>
          Find another value to dependent in the workplace with our team of experts.
          Exceptional skills & performance.
        </p>
        <button onClick={handleSendEnquiry}>Send your enquiry</button>
      </div>

      <div className="services-grid">
        {cards.map((card, index) => (
          <div
            className="service-card service-card-animate"
            key={index}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className="icon"
              style={{
                backgroundColor: card.color + "20",
                color: card.color,
              }}
            >
              {card.icon}
            </div>
            <h4>{card.title}</h4>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;

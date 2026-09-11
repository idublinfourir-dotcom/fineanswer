import React from "react";
import "./PartnerBank.css";

// Import your logos
import cityBank from "../assets/city-bank-logo.webp";
import nrbcBank from "../assets/nrbc.webp";
import premierBank from "../assets/pp.webp";
import tcl from "../assets/british.png";
import bylc from "../assets/bylc.png";
import studyGlobal from "../assets/studyp.png";

const PartnerBank = () => {
  const partners = [
    { name: "City Bank", logo: cityBank },
    { name: "NRBC Bank", logo: nrbcBank },

    { name: "TCL", logo: tcl },
    { name: "Premier Bank", logo: premierBank },
    { name: "BYLC", logo: bylc },
    { name: "Study Global", logo: studyGlobal },
  ];

  return (
    <section className="partner-bank-section">
      <div className="partner-bank-container">
        {/* Left Side: Content */}
        <div className="partner-content">
          <h4 className="partner-badge">STRATEGIC ALLIANCE</h4>
          <h2 className="partner-title">
            Our Strategic <span>Partners</span>
          </h2>
          <p className="partner-description">
            We collaborate with world-class financial institutions and global 
            educational aggregators to provide our students with a seamless, 
            end-to-end study abroad experience.
          </p>
          <div className="partner-stats">
            <div className="p-stat"><strong>10+</strong> Global Partners</div>
            <div className="p-stat"><strong>100%</strong> Verified Support</div>
          </div>
        </div>

        {/* Right Side: Organized Grid of Bubbles */}
        {/* Right Side Floating Logos */}
<div className="partner-visual">
  <div className="bubbles-wrapper">
    {partners.map((item, index) => (
      <div key={index} className={`bank-bubble p${index + 1}`}>
        <img src={item.logo} alt={item.name} />
      </div>
    ))}
  </div>
</div>

      </div>
    </section>
  );
};

export default PartnerBank;
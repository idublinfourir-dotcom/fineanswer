import React from "react";
import "./CEOQuote.css";
import ceoImage from "../images/arif.jpg";

export default function CEOQuote() {
  return (
    <section className="ceo-quote-wrapper">
      <div className="ceo-card">
        {/* Profile image */}
        <div className="ceo-image-box">
          <img src={ceoImage} alt="Arif Bhuiyan" />
        </div>

        {/* Quote text */}
        <div className="quote-icon-left">&ldquo;</div>

        <div className="ceo-quote-text">
          <p>
            FineAnswer is a one-stop global education service provider,
            dedicated to deliver the most accurate, meaningful, and trustworthy
            information to students worldwide.
          </p>
          <p>
            Since our inception, we have established ourselves as the number 1
            study abroad platform for Ireland from Bangladesh, and have
            successfully expanded our services to other countries as well.
          </p>
          <p>
            Backed by an experienced and passionate team, we offer comprehensive
            support beyond just admission and visa processing. From the initial
            consultation to post-arrival assistance, we are committed to guiding
            students through every step of their international education
            journey.
          </p>
          <p>
            We are proud to hold the highest visa success rate from Bangladesh,
            and many of our students have gone on to secure professional
            employment and launch successful international careers in Ireland and
            beyond.
          </p>
          <p>
            If you are interested in studying abroad, please speak to our team
            and you will feel the difference in sha Allah.
          </p>
        </div>

        <div className="quote-icon-right">&rdquo;</div>

        {/* Name + designation */}
        <h3 className="ceo-name">Arif Bhuiyan (FCA, ACA, MBA, MSc)</h3>
        <p className="ceo-desg">
          Finance Manager - US Big Tech Multinational; Ex-Apple, Meta, Bank of
          Ireland, Citi, Deloitte; Former Part-Time Faculty - Trinity College
          Dublin. Founder, FineAnswer
        </p>
      </div>
    </section>
  );
}



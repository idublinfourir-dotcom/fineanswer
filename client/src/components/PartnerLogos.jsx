import React from "react";
import Marquee from "react-fast-marquee";
import "./PartnerLogos.css";

import ul from "../assets/Limerick.png";
import dbs from "../assets/DBS.png";
import gc from "../assets/griff.jpg";
import dkit from "../assets/dkit.png";
import galway from "../assets/galway.png";
import ucc from "../assets/ucc.png";
import setu from "../assets/setu logo.png";
import tus from "../assets/TUS.jpg";
import atu from "../assets/atulogo.jpg";
import dcuLogo from "../assets/dcu logo.png";
import tud from "../assets/TUD.png";
import ucd from "../assets/ucd.jpg";

import three from "../assets/uk/bangor.png";
import four from "../assets/uk/aston.jpg";
import five from "../assets/uk/green.png";
import six from "../assets/uk/portsm.jpg";
import seven from "../assets/uk/NTU.png";
import eight from "../assets/uk/conven.png";

import nine from "../assets/aus/monash.png";
import ten from "../assets/aus/unsw.png";
import eleven from "../assets/aus/ade.png";
import twelve from "../assets/aus/mac.png";
import thirteen from "../assets/aus/tas.png";
import fourteen from "../assets/aus/Curtin.png";




const LogoRow = ({ logos, direction, speed = 40 }) => (
  <div className="partner-logo-row">
    <Marquee
      direction={direction}
      speed={speed}
      pauseOnHover
      gradient={false}
      autoFill
      className="partner-marquee"
    >
      {/* Render 3 copies so the loop has no visible gap when content restarts */}
      {[1, 2, 3].flatMap((copy) =>
        logos.map((logo, index) => (
          <div className="logo-card" key={`${copy}-${index}`}>
            <img src={logo.url} alt={logo.name} />
          </div>
        ))
      )}
    </Marquee>
  </div>
);

const PartnerLogos = () => {
  const row1 = [
    { name: "UL", url: ul },
    { name: "DBS", url: dbs },
    { name: "Griffith College", url: gc },
    { name: "DKIT", url: dkit },
    { name: "Galway", url: galway },
    { name: "UCC", url: ucc },
  ];

  const row2 = [
    { name: "SETU", url: setu },
    { name: "TUS", url: tus },
    { name: "ATU", url: atu },
    { name: "DCU", url: dcuLogo },
    { name: "TUD", url: tud },
    { name: "UCD", url: ucd },
  ];

  const row3 = [
    { name: "three", url: three },
    { name: "four", url: four },
    { name: "five", url: five },
    { name: "six", url: six },
    { name: "seven", url: seven },
    { name: "eight", url: eight },
  ];

  const row4 = [
    { name: "nine", url: nine },
    { name: "ten", url: ten },
    { name: "eleven", url: eleven },
    { name: "twelve", url: twelve },
    { name: "thirteen", url: thirteen },
    { name: "fourteen", url: fourteen },
  ];

  return (
    <section className="partners-section">
      <div className="partners-caption">
        <h2 className="animated-caption">Some of Our Partner Universities</h2>
      </div>

      <div className="logos-container">
        {/* Row 1: right to left */}
        <LogoRow logos={row1} direction="left" speed={50} />

        {/* Row 2: left to right */}
        <LogoRow logos={row2} direction="right" speed={50} />

        {/* Row 3: left to right */}
        <LogoRow logos={row3} direction="left" speed={50} />
        <LogoRow logos={row4} direction="right" speed={50} />
      </div>
    </section>
  );
};

export default PartnerLogos;

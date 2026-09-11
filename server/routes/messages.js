const express = require("express");
const nodemailer = require("nodemailer");
const { asyncHandler } = require("../middleware/auth");

const router = express.Router();

const MESSAGE_TO_EMAIL =
  process.env.MESSAGE_TO_EMAIL || "fineanswer2025@gmail.com";

const isValidEmailFormat = (email) => {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && trimmed.length <= 254
  );
};

// POST /api/send-message - Dashboard "Send a Message" form → email to FineAnswer
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      phone,
      lastEducation,
      preferredCountry,
      appointmentDate,
      message,
    } = req.body;

    if (!name || !(name + "").trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email || !(email + "").trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    const emailNormalized = (email + "").trim().toLowerCase();
    if (!isValidEmailFormat(emailNormalized)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }
    if (!message || !(message + "").trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    const emailUser = (process.env.SMTP_USER || "").trim();
    const emailPass = (process.env.SMTP_PASS || "").replace(/\s/g, "");
    if (!emailUser || !emailPass) {
      return res
        .status(503)
        .json({ success: false, message: "Email service not configured" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      requireTLS: true,
      auth: { user: emailUser, pass: emailPass },
    });

    const text = [
      `Name: ${name}`,
      `Email (reply to): ${emailNormalized}`,
      phone ? `Phone: ${phone}` : null,
      lastEducation ? `Last Education: ${lastEducation}` : null,
      preferredCountry ? `Preferred Country: ${preferredCountry}` : null,
      appointmentDate ? `Appointment Date: ${appointmentDate}` : null,
      "",
      "Message:",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <h2>New message from FineAnswer dashboard</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email (reply to):</strong> <a href="mailto:${emailNormalized}">${emailNormalized}</a></p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      ${lastEducation ? `<p><strong>Last Education:</strong> ${lastEducation}</p>` : ""}
      ${preferredCountry ? `<p><strong>Preferred Country:</strong> ${preferredCountry}</p>` : ""}
      ${appointmentDate ? `<p><strong>Appointment Date:</strong> ${appointmentDate}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${(message || "").replace(/\n/g, "<br>")}</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `FineAnswer <${emailUser}>`,
      to: MESSAGE_TO_EMAIL,
      replyTo: emailNormalized,
      subject: `FineAnswer: Message from ${name} (${emailNormalized})`,
      text,
      html,
    });

    res
      .status(200)
      .json({ success: true, message: "Your message has been sent successfully." });
  }),
);

module.exports = router;

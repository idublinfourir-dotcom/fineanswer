const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const {
  asyncHandler,
  authenticateToken,
  JWT_SECRET,
} = require("../middleware/auth");

const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fineanswer.com";
const isAdminUser = (email) =>
  email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

const generateToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });

// Firebase ID tokens are RS256 JWTs signed by Google with rotating public keys.
// The project ID is public (it ships in the client bundle).
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "fineanswer-e4c30";
const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
let firebaseCerts = { keys: {}, expiresAt: 0 };

const verifyFirebaseIdToken = async (idToken) => {
  if (Date.now() > firebaseCerts.expiresAt) {
    const res = await fetch(FIREBASE_CERTS_URL);
    if (!res.ok) throw new Error(`Firebase certs fetch failed: ${res.status}`);
    const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control"))?.[1] || 3600);
    firebaseCerts = { keys: await res.json(), expiresAt: Date.now() + maxAge * 1000 };
  }
  const kid = jwt.decode(idToken, { complete: true })?.header?.kid;
  const cert = firebaseCerts.keys[kid];
  if (!cert) throw new Error("Unknown Firebase signing key");
  return jwt.verify(idToken, cert, {
    algorithms: ["RS256"],
    audience: FIREBASE_PROJECT_ID,
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
  });
};

// Helper: send OTP email
const sendOTPemail = async (email, otp) => {
  const emailUser = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    ""
  ).trim();
  const emailPass = (
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    ""
  ).replace(/\s/g, "");
  if (!emailUser || !emailPass) {
    throw new Error(
      "Email credentials not configured. Add SMTP_USER and SMTP_PASS to .env",
    );
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: emailUser, pass: emailPass },
  });
  return transporter.sendMail({
    from: process.env.SMTP_FROM || `FineAnswer <${emailUser}>`,
    to: email,
    subject: "FineAnswer - Your OTP for password reset",
    text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
    html: `
      <h1 style="color: #2c3e50;">Hello</h1>
      <h2>Your OTP for password reset: <strong>${otp}</strong></h2>
      <p>Please use this OTP to reset your password.</p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Team FineAnswer</p>
    `,
  });
};

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await collections.users.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.authProvider !== "email") {
      return res.status(400).json({
        success: false,
        message: "This email is registered with Google. Please use Google login.",
      });
    }

    if (!user.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const adminStatus = isAdminUser(user.email);
    if (user.isAdmin !== adminStatus) {
      await collections.users.updateOne(
        { _id: user._id },
        { $set: { isAdmin: adminStatus, updatedAt: new Date() } },
      );
      user.isAdmin = adminStatus;
    }

    const token = generateToken(user._id.toString());
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userWithoutPassword,
      isAdmin: user.isAdmin || false,
    });
  }),
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const successResponse = {
      success: true,
      message:
        "If an account exists with this email, you will receive an OTP shortly.",
      redirectTo: `/reset-password?email=${encodeURIComponent(email)}`,
    };

    const user = await collections.users.findOne({ email });
    if (!user) return res.status(200).json(successResponse);

    if (user.authProvider !== "email" || !user.password) {
      return res.status(200).json({
        success: true,
        googleAccount: true,
        message:
          "This account uses Google Sign-In. To change your password, go to your Google Account settings (myaccount.google.com).",
      });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await collections.users.updateOne(
      { _id: user._id },
      { $set: { resetOtp: otp, resetOtpExpiry, resetOtpAttempts: 0, updatedAt: new Date() } },
    );

    try {
      await sendOTPemail(email, otp);
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "Failed to send email. Please try again or contact support.",
      });
    }

    res.status(200).json(successResponse);
  }),
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Every attempt counts (atomically), so a 6-digit OTP can't be brute-forced.
    const user = await collections.users.findOneAndUpdate(
      {
        email,
        resetOtpExpiry: { $gt: new Date() },
        resetOtpAttempts: { $not: { $gte: 5 } },
      },
      { $inc: { resetOtpAttempts: 1 } },
    );

    if (!user || user.resetOtp !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await collections.users.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword, updatedAt: new Date() },
        $unset: { resetOtp: "", resetOtpExpiry: "", resetOtpAttempts: "" },
      },
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  }),
);

// POST /api/auth/google
router.post(
  "/google",
  asyncHandler(async (req, res) => {
    if (!collections.users) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected. Please check server configuration.",
      });
    }

    const { idToken, name, picture } = req.body;

    if (typeof idToken !== "string" || !idToken) {
      return res.status(400).json({
        success: false,
        message: "Please refresh the page and sign in with Google again.",
      });
    }

    // Identity comes only from the Google-signed token, never from the request body.
    let claims;
    try {
      claims = await verifyFirebaseIdToken(idToken);
    } catch (err) {
      console.warn("[Auth] Google token rejected:", err.message);
      return res
        .status(401)
        .json({ success: false, message: "Google sign-in could not be verified. Please try again." });
    }
    if (
      claims.firebase?.sign_in_provider !== "google.com" ||
      !claims.sub ||
      !claims.email ||
      claims.email_verified !== true
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Google sign-in could not be verified. Please try again." });
    }
    const { email, sub: googleId } = claims;

    let user = await collections.users.findOne({ googleId });

    if (user && picture) {
      await collections.users.updateOne(
        { _id: user._id },
        { $set: { picture, updatedAt: new Date() } },
      );
      user = await collections.users.findOne({ _id: user._id });
    }

    if (!user) {
      user = await collections.users.findOne({ email });

      if (user) {
        const adminStatus = isAdminUser(email);
        await collections.users.updateOne(
          { _id: user._id },
          {
            $set: {
              googleId,
              authProvider: "google",
              picture: picture || user.picture,
              isAdmin: adminStatus,
              updatedAt: new Date(),
            },
          },
        );
        user = await collections.users.findOne({ _id: user._id });
      } else {
        const adminStatus = isAdminUser(email);
        const newUser = {
          name: name || email.split("@")[0],
          email,
          googleId,
          authProvider: "google",
          picture: picture || null,
          isAdmin: adminStatus,
          progressTracker: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await collections.users.insertOne(newUser);
        user = await collections.users.findOne({ _id: result.insertedId });
      }
    }

    const adminStatus = isAdminUser(user.email);
    if (user.isAdmin !== adminStatus) {
      await collections.users.updateOne(
        { _id: user._id },
        { $set: { isAdmin: adminStatus, updatedAt: new Date() } },
      );
      user.isAdmin = adminStatus;
    }

    const token = generateToken(user._id.toString());
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userWithoutPassword,
      isAdmin: user.isAdmin || false,
    });
  }),
);

// GET /api/auth/me
router.get("/me", authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.status(200).json({
    success: true,
    data: userWithoutPassword,
    isAdmin: userWithoutPassword.isAdmin || false,
  });
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const {
  asyncHandler,
  authenticateToken,
  requireAdmin,
  JWT_SECRET,
} = require("../middleware/auth");

const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fineanswer.com";
const isAdminUser = (email) =>
  email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

// POST /api/users - Register a new user
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      phone,
      password,
      authProvider = "email",
      googleId,
      picture,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required fields",
      });
    }

    if (authProvider !== "google" && authProvider !== "email") {
      return res.status(400).json({
        success: false,
        message: "authProvider must be either 'email' or 'google'",
      });
    }

    if (authProvider === "email") {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required for email authentication",
        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
    }

    if (authProvider === "google" && googleId) {
      const existingGoogleUser = await collections.users.findOne({ googleId });
      if (existingGoogleUser) {
        return res.status(400).json({
          success: false,
          message: "User with this Google account already exists",
        });
      }
    }

    const existingUser = await collections.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const adminStatus = isAdminUser(email);
    const newUser = {
      name,
      email,
      authProvider,
      isAdmin: adminStatus,
      progressTracker: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (authProvider === "google") {
      if (phone) newUser.phone = phone;
      if (googleId) newUser.googleId = googleId;
      if (picture) newUser.picture = picture;
    } else {
      if (phone) newUser.phone = phone;
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
    }

    const result = await collections.users.insertOne(newUser);
    const user = await collections.users.findOne({ _id: result.insertedId });
    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      isAdmin: user.isAdmin || false,
      data: userWithoutPassword,
    });
  }),
);

// GET /api/users - Get all users (ADMIN ONLY)
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const users = await collections.users.find({}).toArray();
    const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
    res.status(200).json({
      success: true,
      users: usersWithoutPassword,
    });
  }),
);

// GET /api/users/me/progress-tracker - Get own tracker (any authenticated user)
// IMPORTANT: must be defined BEFORE /api/users/:id and /api/users/:userId/progress-tracker
router.get(
  "/me/progress-tracker",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await collections.users.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ timeline: user.progressTracker || [] });
  }),
);

// GET /api/users/:userId/progress-tracker - Get a user's tracker (ADMIN ONLY)
router.get(
  "/:userId/progress-tracker",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await collections.users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ timeline: user.progressTracker || [] });
  }),
);

// PUT /api/users/:userId/progress-tracker - Update a user's tracker (ADMIN ONLY)
router.put(
  "/:userId/progress-tracker",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { timeline } = req.body;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    if (!Array.isArray(timeline)) {
      return res.status(400).json({ message: "Timeline must be an array" });
    }
    const result = await collections.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { progressTracker: timeline, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "Progress tracker updated successfully",
      user: { _id: result._id, progressTracker: result.progressTracker },
    });
  }),
);

// PUT /api/users/me/profile - Update current user's profile
router.put(
  "/me/profile",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
      name,
      dateOfBirth,
      phone,
      country,
      city,
      address,
      postalCode,
      highestEducation,
      university,
      graduationYear,
      gpa,
      workExperience,
      yearsOfExperience,
      languageTest,
      picture,
    } = req.body;

    const updateFields = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
    if (phone !== undefined) updateFields.phone = phone;
    if (country !== undefined) updateFields.country = country;
    if (city !== undefined) updateFields.city = city;
    if (address !== undefined) updateFields.address = address;
    if (postalCode !== undefined) updateFields.postalCode = postalCode;
    if (highestEducation !== undefined)
      updateFields.highestEducation = highestEducation;
    if (university !== undefined) updateFields.university = university;
    if (graduationYear !== undefined)
      updateFields.graduationYear = graduationYear;
    if (gpa !== undefined) updateFields.gpa = gpa;
    if (workExperience !== undefined)
      updateFields.workExperience = workExperience;
    if (yearsOfExperience !== undefined)
      updateFields.yearsOfExperience = yearsOfExperience;
    if (languageTest !== undefined && typeof languageTest === "object")
      updateFields.languageTest = languageTest;
    if (picture !== undefined) updateFields.picture = picture;

    const result = await collections.users.findOneAndUpdate(
      { _id: userId },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = result;
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userWithoutPassword,
    });
  }),
);

// GET /api/users/google/:googleId - Get a user by Google ID
router.get(
  "/google/:googleId",
  asyncHandler(async (req, res) => {
    const user = await collections.users.findOne({
      googleId: req.params.googleId,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, data: userWithoutPassword });
  }),
);

// GET /api/users/email/:email - Get a user by email
router.get(
  "/email/:email",
  asyncHandler(async (req, res) => {
    const user = await collections.users.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, data: userWithoutPassword });
  }),
);

// GET /api/users/:id - Get a single user by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID format" });
    }
    const user = await collections.users.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, data: userWithoutPassword });
  }),
);

module.exports = router;

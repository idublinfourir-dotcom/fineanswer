// Admin-only routes mounted at /api/admin
const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const {
  asyncHandler,
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/documents - Get all user documents with user info
router.get(
  "/documents",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const allDocs = await collections.documents
      .aggregate([
        {
          $lookup: {
            from: "usersCollection",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            userId: 1,
            passportCopy: 1,
            cv: 1,
            sop: 1,
            englishProficiency: 1,
            sscCertificate: 1,
            hscCertificate: 1,
            bachelorsCertificate: 1,
            mastersCertificate: 1,
            sscTranscript: 1,
            hscTranscript: 1,
            bachelorsTranscript: 1,
            mastersTranscript: 1,
            workExperience: 1,
            lors: 1,
            validationStatus: 1,
            feedback: 1,
            createdAt: 1,
            updatedAt: 1,
            "user._id": 1,
            "user.name": 1,
            "user.email": 1,
          },
        },
      ])
      .toArray();

    res.status(200).json({ success: true, data: allDocs });
  }),
);

// PUT /api/admin/documents/feedback - Set validation status and feedback for a user
router.put(
  "/documents/feedback",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId, status, feedback } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    if (!ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, approved, or rejected",
      });
    }

    const updated = await collections.documents.findOneAndUpdate(
      { userId: new ObjectId(userId) },
      {
        $set: {
          validationStatus: status,
          feedback: feedback?.trim() || "",
          feedbackUpdatedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "No documents found for this user" });
    }

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      data: updated,
    });
  }),
);

// DELETE /api/admin/documents/:userId - Delete a user's documents
router.delete(
  "/documents/:userId",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const deleted = await collections.documents.findOneAndDelete({
      userId: new ObjectId(userId),
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "No documents found for this user" });
    }
    res
      .status(200)
      .json({ success: true, message: "User documents deleted successfully" });
  }),
);

module.exports = router;

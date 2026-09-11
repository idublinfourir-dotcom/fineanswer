const express = require("express");
const axios = require("axios");
const { collections } = require("../config/db");
const { asyncHandler, authenticateToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/documents/proxy - Proxy Cloudinary PDFs (must be before /api/documents)
router.get(
  "/proxy",
  asyncHandler(async (req, res) => {
    const { url, download } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, message: "URL is required" });
    }
    if (!url.startsWith("https://res.cloudinary.com/")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid document URL" });
    }
    try {
      const axiosRes = await axios.get(url, {
        responseType: "arraybuffer",
        maxRedirects: 5,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/pdf,*/*",
        },
      });
      const buffer = Buffer.from(axiosRes.data);
      res.set("Content-Type", "application/pdf");
      res.set(
        "Content-Disposition",
        download === "1" ? "attachment; filename=document.pdf" : "inline",
      );
      res.send(buffer);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message: `Failed to fetch document: ${error.message}`,
      });
    }
  }),
);

// GET /api/documents - Get current user's documents (Protected)
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const docs = await collections.documents.findOne({ userId: req.user._id });
    res.status(200).json({ success: true, data: docs || null });
  }),
);

// POST /api/documents - Upload user documents (Protected)
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
      passportCopy,
      cv,
      sop,
      englishProficiency,
      sscCertificate,
      hscCertificate,
      bachelorsCertificate,
      mastersCertificate,
      sscTranscript,
      hscTranscript,
      bachelorsTranscript,
      mastersTranscript,
      workExperience,
      lors,
    } = req.body;

    const existing = await collections.documents.findOne({ userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Documents already uploaded. Use PUT to update.",
      });
    }

    const newDoc = {
      userId,
      passportCopy: passportCopy || "",
      cv: cv || "",
      sop: sop || "",
      englishProficiency: englishProficiency || "",
      sscCertificate: sscCertificate || "",
      hscCertificate: hscCertificate || "",
      bachelorsCertificate: bachelorsCertificate || "",
      mastersCertificate: mastersCertificate || "",
      sscTranscript: sscTranscript || "",
      hscTranscript: hscTranscript || "",
      bachelorsTranscript: bachelorsTranscript || "",
      mastersTranscript: mastersTranscript || "",
      workExperience: workExperience || "",
      lors: lors || "",
      validationStatus: "pending",
      feedback: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collections.documents.insertOne(newDoc);
    res.status(201).json({
      success: true,
      message: "Documents uploaded successfully",
      data: newDoc,
    });
  }),
);

// PUT /api/documents - Update user documents (Protected)
router.put(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
      passportCopy,
      cv,
      sop,
      englishProficiency,
      sscCertificate,
      hscCertificate,
      bachelorsCertificate,
      mastersCertificate,
      sscTranscript,
      hscTranscript,
      bachelorsTranscript,
      mastersTranscript,
      workExperience,
      lors,
    } = req.body;

    const updateFields = { updatedAt: new Date() };
    if (passportCopy !== undefined) updateFields.passportCopy = passportCopy;
    if (cv !== undefined) updateFields.cv = cv;
    if (sop !== undefined) updateFields.sop = sop;
    if (englishProficiency !== undefined)
      updateFields.englishProficiency = englishProficiency;
    if (sscCertificate !== undefined)
      updateFields.sscCertificate = sscCertificate;
    if (hscCertificate !== undefined)
      updateFields.hscCertificate = hscCertificate;
    if (bachelorsCertificate !== undefined)
      updateFields.bachelorsCertificate = bachelorsCertificate;
    if (mastersCertificate !== undefined)
      updateFields.mastersCertificate = mastersCertificate;
    if (sscTranscript !== undefined) updateFields.sscTranscript = sscTranscript;
    if (hscTranscript !== undefined) updateFields.hscTranscript = hscTranscript;
    if (bachelorsTranscript !== undefined)
      updateFields.bachelorsTranscript = bachelorsTranscript;
    if (mastersTranscript !== undefined)
      updateFields.mastersTranscript = mastersTranscript;
    if (workExperience !== undefined)
      updateFields.workExperience = workExperience;
    if (lors !== undefined) updateFields.lors = lors;

    const updated = await collections.documents.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { returnDocument: "after", upsert: true },
    );

    res.status(200).json({
      success: true,
      message: "Documents updated successfully",
      data: updated,
    });
  }),
);

// DELETE /api/documents - Delete user documents (Protected)
router.delete(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const deleted = await collections.documents.findOneAndDelete({
      userId: req.user._id,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "No documents found to delete" });
    }
    res
      .status(200)
      .json({ success: true, message: "Documents deleted successfully" });
  }),
);

module.exports = router;

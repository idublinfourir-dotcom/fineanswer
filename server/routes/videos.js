const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const {
  asyncHandler,
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// Extracts YouTube video ID from various URL formats
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (match) return match[1];
  match = url.match(/youtube\.com\/embed\/([^&?/]+)/);
  if (match) return match[1];
  match = url.match(/youtu\.be\/([^&?/]+)/);
  if (match) return match[1];
  return null;
};

// GET /api/videos - Get all videos (Public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const videos = await collections.session
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ success: true, data: videos });
  }),
);

// GET /api/videos/:id - Get a single video (Public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video ID format" });
    }
    const video = await collections.session.findOne({ _id: new ObjectId(id) });
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    res.status(200).json({ success: true, data: video });
  }),
);

// POST /api/videos - Create a video (ADMIN ONLY)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, youtubeUrl, description } = req.body;
    if (!title || !youtubeUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and YouTube URL are required",
      });
    }
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid YouTube URL. Please provide a valid YouTube video link.",
      });
    }
    const newVideo = {
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      youtubeVideoId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      description: description?.trim() || "",
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collections.session.insertOne(newVideo);
    const savedVideo = await collections.session.findOne({
      _id: result.insertedId,
    });
    res.status(201).json({
      success: true,
      message: "Video added successfully",
      data: savedVideo,
    });
  }),
);

// PUT /api/videos/:id - Update a video (ADMIN ONLY)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video ID format" });
    }
    const { title, youtubeUrl, description } = req.body;
    const updateFields = { updatedAt: new Date() };
    if (title) updateFields.title = title.trim();
    if (description !== undefined)
      updateFields.description = description?.trim() || "";
    if (youtubeUrl) {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid YouTube URL" });
      }
      updateFields.youtubeUrl = youtubeUrl.trim();
      updateFields.youtubeVideoId = videoId;
      updateFields.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    const updatedVideo = await collections.session.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" },
    );
    if (!updatedVideo) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: updatedVideo,
    });
  }),
);

// DELETE /api/videos/:id - Delete a video (ADMIN ONLY)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video ID format" });
    }
    const deletedVideo = await collections.session.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletedVideo) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Video deleted successfully" });
  }),
);

module.exports = router;

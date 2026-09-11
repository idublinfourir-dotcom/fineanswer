const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const {
  asyncHandler,
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// GET /api/events - Get all external session events (Public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const events = await collections.events
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ success: true, data: events });
  }),
);

// POST /api/events - Create a new event (ADMIN ONLY)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, eventUrl, description } = req.body;
    if (!title || !eventUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and event URL are required",
      });
    }
    const newEvent = {
      title: title.trim(),
      eventUrl: eventUrl.trim(),
      description: description?.trim() || "",
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collections.events.insertOne(newEvent);
    const savedEvent = await collections.events.findOne({
      _id: result.insertedId,
    });
    res.status(201).json({
      success: true,
      message: "Event added successfully",
      data: savedEvent,
    });
  }),
);

// PUT /api/events/:id - Update an event (ADMIN ONLY)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID format" });
    }
    const { title, eventUrl, description } = req.body;
    const updateFields = { updatedAt: new Date() };
    if (title) updateFields.title = title.trim();
    if (description !== undefined)
      updateFields.description = description?.trim() || "";
    if (eventUrl) updateFields.eventUrl = eventUrl.trim();
    const updatedEvent = await collections.events.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" },
    );
    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  }),
);

// DELETE /api/events/:id - Delete an event (ADMIN ONLY)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID format" });
    }
    const deletedEvent = await collections.events.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  }),
);

module.exports = router;

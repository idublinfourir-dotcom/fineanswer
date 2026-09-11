const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const {
  asyncHandler,
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// GET /api/success-stories - Get all success stories (Public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const stories = await collections.successStory
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(stories);
  }),
);

// POST /api/success-stories - Create a success story (ADMIN ONLY)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, university, country, program, story, image } = req.body;
    if (!name || !university || !country || !program || !story || !image) {
      return res.status(400).json({
        message:
          "Name, university, country, program, story, and image are required",
      });
    }
    try {
      new URL(image);
    } catch {
      return res.status(400).json({ message: "Invalid image URL format" });
    }
    const newStory = {
      name: name.trim(),
      university: university.trim(),
      country: country.trim(),
      program: program.trim(),
      story: story.trim(),
      image: image.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collections.successStory.insertOne(newStory);
    const savedStory = await collections.successStory.findOne({
      _id: result.insertedId,
    });
    res
      .status(201)
      .json({ message: "Success story created successfully", story: savedStory });
  }),
);

// PUT /api/success-stories/:id - Update a success story (ADMIN ONLY)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid success story ID format" });
    }
    const { name, university, country, program, story, image } = req.body;
    const updateFields = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name.trim();
    if (university !== undefined) updateFields.university = university.trim();
    if (country !== undefined) updateFields.country = country.trim();
    if (program !== undefined) updateFields.program = program.trim();
    if (story !== undefined) updateFields.story = story.trim();
    if (image !== undefined) {
      try {
        new URL(image);
        updateFields.image = image.trim();
      } catch {
        return res.status(400).json({ message: "Invalid image URL format" });
      }
    }
    const updatedStory = await collections.successStory.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" },
    );
    if (!updatedStory) {
      return res.status(404).json({ message: "Success story not found" });
    }
    res
      .status(200)
      .json({ message: "Success story updated successfully", story: updatedStory });
  }),
);

// DELETE /api/success-stories/:id - Delete a success story (ADMIN ONLY)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid success story ID format" });
    }
    const deletedStory = await collections.successStory.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletedStory) {
      return res.status(404).json({ message: "Success story not found" });
    }
    res.status(200).json({ message: "Success story deleted successfully" });
  }),
);

module.exports = router;

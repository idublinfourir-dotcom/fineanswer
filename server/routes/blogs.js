const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const {
  asyncHandler,
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// GET /api/blogs - Get all blog posts (Public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const blogs = await collections.blog
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ success: true, data: blogs });
  }),
);

// GET /api/blogs/:id - Get a single blog post (Public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID format" });
    }
    const blog = await collections.blog.findOne({ _id: new ObjectId(id) });
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog post not found" });
    }
    res.status(200).json({ success: true, data: blog });
  }),
);

// POST /api/blogs - Create a blog post (ADMIN ONLY)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, content, image, author } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required" });
    }
    const newBlog = {
      title: title.trim(),
      content: content.trim(),
      image: image || null,
      author: author || req.user.name || "Admin",
      authorId: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collections.blog.insertOne(newBlog);
    const savedBlog = await collections.blog.findOne({
      _id: result.insertedId,
    });
    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: savedBlog,
    });
  }),
);

// PUT /api/blogs/:id - Update a blog post (ADMIN ONLY)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID format" });
    }
    const { title, content, image, author } = req.body;
    const updateFields = { updatedAt: new Date() };
    if (title) updateFields.title = title.trim();
    if (content) updateFields.content = content.trim();
    if (image !== undefined) updateFields.image = image;
    if (author) updateFields.author = author.trim();
    const updatedBlog = await collections.blog.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" },
    );
    if (!updatedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog post not found" });
    }
    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedBlog,
    });
  }),
);

// DELETE /api/blogs/:id - Delete a blog post (ADMIN ONLY)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID format" });
    }
    const deletedBlog = await collections.blog.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog post not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Blog post deleted successfully" });
  }),
);

module.exports = router;

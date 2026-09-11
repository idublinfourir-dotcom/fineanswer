const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");
const {
  asyncHandler,
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// GET /api/jobs - Public list of job posts
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const jobs = await collections.career
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ success: true, data: jobs });
  }),
);

// GET /api/jobs/:id - Single job (Public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid job ID format" });
    }
    const job = await collections.career.findOne({ _id: new ObjectId(id) });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, data: job });
  }),
);

// POST /api/jobs - Create a job post (ADMIN ONLY)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      title,
      company,
      location,
      employmentType,
      description,
      requirements,
      applicationUrl,
      deadline,
    } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, company, location, and description are required",
      });
    }

    const newJob = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      employmentType: employmentType?.trim() || "Full-time",
      description: description.trim(),
      requirements: requirements?.trim() || "",
      applicationUrl: applicationUrl?.trim() || "",
      deadline: deadline ? new Date(deadline) : null,
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collections.career.insertOne(newJob);
    const savedJob = await collections.career.findOne({
      _id: result.insertedId,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: savedJob,
    });
  }),
);

// PUT /api/jobs/:id - Update a job post (ADMIN ONLY)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid job ID format" });
    }

    const {
      title,
      company,
      location,
      employmentType,
      description,
      requirements,
      applicationUrl,
      deadline,
    } = req.body;

    const updateFields = { updatedAt: new Date() };
    if (title) updateFields.title = title.trim();
    if (company) updateFields.company = company.trim();
    if (location) updateFields.location = location.trim();
    if (employmentType) updateFields.employmentType = employmentType.trim();
    if (description) updateFields.description = description.trim();
    if (requirements !== undefined)
      updateFields.requirements = requirements?.trim() || "";
    if (applicationUrl !== undefined)
      updateFields.applicationUrl = applicationUrl?.trim() || "";
    if (deadline !== undefined)
      updateFields.deadline = deadline ? new Date(deadline) : null;

    const updatedJob = await collections.career.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!updatedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  }),
);

// DELETE /api/jobs/:id - Delete a job post (ADMIN ONLY)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid job ID format" });
    }
    const deletedJob = await collections.career.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, message: "Job deleted successfully" });
  }),
);

// GET /api/jobs/:id/applications - View applications for a job (ADMIN ONLY)
router.get(
  "/:id/applications",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid job ID format" });
    }

    const applications = await collections.careerApplications
      .aggregate([
        { $match: { jobId: new ObjectId(id) } },
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
            documents: 1,
            notes: 1,
            createdAt: 1,
            "user._id": 1,
            "user.name": 1,
            "user.email": 1,
          },
        },
      ])
      .toArray();

    res.status(200).json({ success: true, data: applications });
  }),
);

// POST /api/jobs/:id/apply - User applies to a job (Protected)
router.post(
  "/:id/apply",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid job ID format" });
    }

    const job = await collections.career.findOne({ _id: new ObjectId(id) });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Applications for this job are closed.",
      });
    }

    const { documents, notes } = req.body;
    const application = {
      jobId: job._id,
      userId: req.user._id,
      documents: documents?.trim() || "",
      notes: notes?.trim() || "",
      createdAt: new Date(),
    };

    await collections.careerApplications.insertOne(application);

    res
      .status(201)
      .json({ success: true, message: "Application submitted successfully." });
  }),
);

module.exports = router;

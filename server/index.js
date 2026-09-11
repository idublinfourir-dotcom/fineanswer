require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

// Route modules
const programsRouter     = require("./routes/programs");
const authRouter         = require("./routes/auth");
const usersRouter        = require("./routes/users");
const successStoriesRouter = require("./routes/successStories");
const blogsRouter        = require("./routes/blogs");
const videosRouter       = require("./routes/videos");
const eventsRouter       = require("./routes/events");
const jobsRouter         = require("./routes/jobs");
const documentsRouter    = require("./routes/documents");
const adminRouter        = require("./routes/admin");
const paymentRouter      = require("./routes/payment");
const messagesRouter     = require("./routes/messages");

const app = express();
const port = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", "https://fine-answer-wcij.vercel.app", "https://www.fineanswer.net"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static routes (no DB required) ─────────────────────────────────────────
app.get("/", (_req, res) => res.send("Running Bhaai Running"));

app.get("/api/health", (_req, res) =>
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() }),
);

// Programs search (Google Sheets — no DB)
app.use("/api/programs", programsRouter);

// ── Connect DB then mount all DB-dependent routes ──────────────────────────
const ready = connectDB()
  .then(() => {
    app.use("/api/auth",            authRouter);
    app.use("/api/users",           usersRouter);
    app.use("/api/success-stories", successStoriesRouter);
    app.use("/api/blogs",           blogsRouter);
    app.use("/api/videos",          videosRouter);
    app.use("/api/events",          eventsRouter);
    app.use("/api/jobs",            jobsRouter);
    app.use("/api/documents",       documentsRouter);
    app.use("/api/admin",           adminRouter);
    app.use("/api",                 paymentRouter);   // /api/create-payment, /api/payment/*
    app.use("/api/send-message",    messagesRouter);

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  })
  .catch((err) => {
    console.error(
      "Backend init failed:",
      err && err.message ? err.message : err,
    );
    throw err;
  });

// ── Export / Listen ─────────────────────────────────────────────────────────
if (process.env.VERCEL) {
  // Vercel Serverless: export a handler (no app.listen)
  module.exports = async (req, res) => {
    await ready;
    return app(req, res);
  };
} else {
  // Local dev / traditional hosting
  ready
    .catch(() => {})
    .finally(() => {
      app.listen(port, () => {
        console.log(`Port Is Running On ${port}`);
      });
    });
}

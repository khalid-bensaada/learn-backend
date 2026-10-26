require("dotenv").config();

const path = require("node:path");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/learn_backend";

// Express middleware: parse incoming JSON request bodies.
app.use(express.json());

// Serve the HTML, CSS and JavaScript learning website.
app.use(express.static(path.join(__dirname)));

// Mongoose schema: describe the structure of a note.
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer"],
    },
    body: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Body must be 2000 characters or fewer"],
    },
  },
  { timestamps: true },
);

// Mongoose model: use it to query MongoDB.
const Note = mongoose.model("Note", noteSchema);

// Check the server and database status.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// GET /api/notes — return all notes.
app.get("/api/notes", async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// POST /api/notes — validate and save a note.
app.post("/api/notes", async (req, res, next) => {
  try {
    const note = await Note.create({
      title: req.body.title,
      body: req.body.body,
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

// Centralized error handling for API routes.
app.use((error, req, res, next) => {
  console.error(error);

  const isValidationError = error.name === "ValidationError";

  res.status(isValidationError ? 400 : 500).json({
    error: isValidationError ? "Validation failed" : "Server error",
    message: error.message,
  });
});

// Connect to MongoDB before accepting requests.
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Connected to MongoDB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

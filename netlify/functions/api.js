// Netlify Functions entry point for Express backend
// This file wraps the Express app using serverless-http for Netlify compatibility

const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

// Initialize Express app
const app = express();

/**
 * CORS configuration for Netlify Functions
 * Allows requests from Firebase hosting domain and localhost for development
 */
const getAllowedOrigins = () => {
  const defaultOrigins = [
    "https://your-firebase-project.web.app",
    "https://your-firebase-project.firebaseapp.com",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
  ];

  // Allow environment-based CORS origins
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim());
  }

  return defaultOrigins;
};

const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "User-Agent",
    "X-Requested-With",
  ],
};

app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// --- API Routes ---

/**
 * Health check endpoint
 * @route GET /api/health
 * @returns {object} 200 - { status: "ok" }
 * @returns {object} 500 - { error: "Service unavailable" }
 */
app.get("/api/health", (req, res) => {
  try {
    res.status(200).json({
      status: "ok",
      message: "Netlify Functions backend is healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ error: "Service unavailable" });
  }
});

/**
 * API keys endpoint
 * Retrieves API keys from Netlify environment variables
 * @route GET /api/keys
 * @returns {object} 200 - Object containing API keys
 * @returns {object} 500 - { error: "Failed to retrieve API keys" }
 */
app.get("/api/keys", (req, res) => {
  try {
    // Retrieve API keys from Netlify environment variables
    const apiKeys = {
      gemini: {
        key1:
          process.env.GEMINI_API_KEY_1 ||
          "AIzaSyAZEMYcD3ZS18ADAAJtto0Q_hk0KhqvnNo",
        key2:
          process.env.GEMINI_API_KEY_2 ||
          "AIzaSyASkpi1juXqc6QR9ph4T5Jhb227mC9RynQ",
        key3:
          process.env.GEMINI_API_KEY_3 ||
          "AIzaSyBMAnMgNvy4pfK5oHI-Q87vRFh6k8yfF24",
      },
      gdrive: {
        apiKey: process.env.GDRIVE_API_KEY || "YOUR_GDRIVE_API_KEY_HERE",
        folderId: process.env.GDRIVE_FOLDER_ID || "YOUR_GDRIVE_FOLDER_ID_HERE",
      },
    };

    res.status(200).json(apiKeys);
  } catch (error) {
    console.error("Failed to retrieve API keys:", error);
    res.status(500).json({ error: "Failed to retrieve API keys" });
  }
});

/**
 * Catch-all route for undefined endpoints
 */
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

/**
 * Global error handler
 */
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// Export the serverless function
module.exports.handler = serverless(app);

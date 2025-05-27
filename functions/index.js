// Import necessary modules
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors"); // For handling Cross-Origin Resource Sharing

// Initialize Express app
const app = express();

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

// --- API Routes ---

/**
 * Health check endpoint
 * @route GET /api/health
 * @returns {object} 200 - { status: "ok" }
 * @returns {object} 500 - { error: "Service unavailable" }
 */
app.get("/api/health", (req, res) => {
  try {
    res.status(200).json({status: "ok", message: "Backend is healthy"});
  } catch (error) {
    functions.logger.error("Health check failed:", error);
    res.status(500).json({error: "Service unavailable"});
  }
});

/**
 * API keys endpoint
 * IMPORTANT:Secure these keys properly using Firebase environment configuration
 * or Google Cloud Secret Manager. DO NOT hardcode sensitive keys in production.
 * @route GET /api/keys
 * @returns {object} 200 - Object containing API keys
 * @returns {object} 500 - { error: "Failed to retrieve API keys" }
 */
app.get("/api/keys", (req, res) => {
  try {
    // TODO:eplace with secure key retrieval (e.g., Firebase environment config)
    // Example: functions.config().keys.gemini_api_key
    const apiKeys = {
      gemini: {
        key1:
          functions.config().keys.gemini_api_key1 ||
          "AIzaSyAZEMYcD3ZS18ADAAJtto0Q_hk0KhqvnNo",
        key2:
          functions.config().keys.gemini_api_key2 ||
          "AIzaSyASkpi1juXqc6QR9ph4T5Jhb227mC9RynQ",
        key3:
          functions.config().keys.gemini_api_key3 ||
          "AIzaSyBMAnMgNvy4pfK5oHI-Q87vRFh6k8yfF24",
      },
      gdrive: {
        apiKey:
          functions.config().keys.gdrive_api_key || "YOUR_GDRIVE_API_KEY_HERE",
        folderId:
          functions.config().keys.gdrive_folder_id ||
          "YOUR_GDRIVE_FOLDER_ID_HERE",
      },
      // Add other keys as needed
    };
    res.status(200).json(apiKeys);
  } catch (error) {
    functions.logger.error("Failed to retrieve API keys:", error);
    res.status(500).json({error: "Failed to retrieve API keys"});
  }
});

// Expose Express app as a single Firebase Function
exports.backend = functions.https.onRequest(app);

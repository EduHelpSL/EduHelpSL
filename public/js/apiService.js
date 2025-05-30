// --- Secure API Service ---

/**
 * Service for securely fetching API keys from the backend
 * This ensures API keys are not exposed in the frontend code
 */

const API_BASE_URL = "https://eduhelpsl.netlify.app/api"; // Using absolute path to Netlify backend

/**
 * Cache for API keys to avoid multiple requests
 */
let apiKeysCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches API keys from the secure backend endpoint
 * @returns {Promise<Object>} Object containing API keys
 */
export async function fetchApiKeys() {
  try {
    // Check if we have valid cached keys
    if (
      apiKeysCache &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    ) {
      return apiKeysCache;
    }

    const response = await fetch(`${API_BASE_URL}/keys`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "EduHelpSL-Frontend/1.0",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch API keys: ${response.status} ${response.statusText}`
      );
    }

    const keys = await response.json();

    // Cache the keys
    apiKeysCache = keys;
    cacheTimestamp = Date.now();

    console.log("API keys fetched successfully from backend");
    return keys;
  } catch (error) {
    console.error("Error fetching API keys:", error);
    throw new Error(
      "Failed to load API configuration. Please ensure the backend server is running."
    );
  }
}

/**
 * Gets a Gemini API key with rotation support
 * @returns {Promise<string>} Gemini API key
 */
export async function getGeminiApiKey() {
  try {
    const keys = await fetchApiKeys();

    // Use geminiApiKey1 and geminiApiKey2 for rotation
    const geminiKeys = [];
    if (keys.geminiApiKey1) geminiKeys.push(keys.geminiApiKey1);
    if (keys.geminiApiKey2) geminiKeys.push(keys.geminiApiKey2);

    if (geminiKeys.length === 0) {
      throw new Error("No Gemini API keys (1 or 2) available from backend");
    }

    // Simple rotation based on current time (e.g., switch every minute)
    // This will alternate between key 0 and key 1 if both are present
    const keyIndex = Math.floor(Date.now() / (60 * 1000)) % geminiKeys.length;
    return geminiKeys[keyIndex];
  } catch (error) {
    console.error("Error getting Gemini API key:", error);
    throw error;
  }
}

/**
 * Gets Google Drive API configuration
 * @returns {Promise<Object>} Google Drive API configuration
 */
export async function getGDriveConfig() {
  try {
    const keys = await fetchApiKeys();

    if (!keys.googleDriveApiKey) { // Assuming folderId might also come from keys if backend sends it
      throw new Error("Google Drive API key not found in response from backend");
    }

    // GDRIVE_FOLDER_ID needs to be sent from the backend as well.
    // For now, we only use googleDriveApiKey. If keys.googleDriveFolderId exists, use it.
    return {
      apiKey: keys.googleDriveApiKey,
      folderId: keys.googleDriveFolderId || null // Safely access folderId, defaults to null if not present
    };
  } catch (error) {
    console.error("Error getting Google Drive config:", error);
    throw error;
  }
}

/**
 * Checks if the backend API is available
 * @returns {Promise<boolean>} True if backend is available
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
}

/**
 * Clears the API keys cache
 */
export function clearApiKeysCache() {
  apiKeysCache = null;
  cacheTimestamp = null;
  console.log("API keys cache cleared");
}

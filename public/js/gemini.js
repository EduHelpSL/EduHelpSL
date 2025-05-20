// --- Gemini API Initialization ---

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { showError } from "./utils.js"; // Assuming showError is exported from utils.js
import { dom } from "./domCache.js"; // Assuming dom is needed to update input state on failure
import { state } from "./state.js"; // Assuming state is needed to update placeholder text on failure

// This function initializes the Gemini SDK and returns the necessary instances and status.
// It should be called once during the app's initialization.
export function initializeGemini(config) {
    let genAI = null;
    let geminiModelInstance = null;
    let isGeminiActive = false;

    try {
        // Check if API key is provided and is not the placeholder
        if (!config.geminiApiKey || config.geminiApiKey === "thisisfakeapireplaceitwithreal") {
            const errorMessage = "Gemini API Key is missing or placeholder. Chat functionality will be disabled.";
            console.error(errorMessage);
            // Show a persistent error message to the user
            showError('errorChatInit', errorMessage, true);
            isGeminiActive = false;
        } else {
            // Initialize the GoogleGenerativeAI SDK
            genAI = new GoogleGenerativeAI(config.geminiApiKey);

            // Get the generative model instance
            geminiModelInstance = genAI.getGenerativeModel({
                model: config.geminiModel,
                // Configure safety settings
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                ],
                // Configure generation parameters
                generationConfig: { temperature: 0.7, topP: 0.9 }
            });

            console.log("GoogleGenerativeAI SDK initialized successfully.");
            isGeminiActive = true;

            // Enable chat input and button if they were disabled by a previous state
             if (dom.chatInput) dom.chatInput.disabled = false;
             if (dom.sendBtn) dom.sendBtn.disabled = false;
             if (dom.chatInput) dom.chatInput.placeholder = state.translations['chatPlaceholder'] || "Ask a question...";
        }

    } catch (error) {
        console.error("Failed to initialize GoogleGenerativeAI SDK:", error);
        isGeminiActive = false;
        // Show a persistent error message for other initialization errors
        showError('errorChatInit', error.message || "SDK Initialization Failed", true);
        // Disable chat input and button on failure
        if (dom.chatInput) dom.chatInput.disabled = true;
        if (dom.sendBtn) dom.sendBtn.disabled = true;
        if (dom.chatInput) dom.chatInput.placeholder = state.translations['chatDisabled'] || "Chat unavailable";
    }

    // Return the initialized instances and active status
    return { genAI, modelInstance: geminiModelInstance, isGeminiActive };
}

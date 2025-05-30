// --- Chat Functions ---

import { dom } from "./domCache.js";
import { state } from "./state.js";
import { config } from "./config.js"; // Assuming config is needed for Gemini setup and max history
import {
  parseSimpleMarkdown,
  showError,
  resetFileInput,
  autoGrowTextarea,
} from "./utils.js"; // Import utility functions
import { getTranslation } from "./translation.js"; // Import for welcome message and error text
import { canAccessChat, showChatAccessDenied } from "./auth.js";

// --- Gemini API Setup ---
// However, the functions that *use* the Gemini instance can be here.
// We'll assume `genAI` and `geminiModelInstance` are initialized elsewhere (e.g., main.js)
// and accessible, or passed into chat functions.

let genAI = null; // Placeholder
let geminiModelInstance = null; // Placeholder
let isGeminiActive = false; // Placeholder

// Function to update the visual chat online status indicator
export function updateChatOnlineStatus(isOnline) {
  if (dom.chatStatusDot) {
    dom.chatStatusDot.classList.toggle("online", isOnline);
    dom.chatStatusDot.classList.toggle("offline", !isOnline);
  }
  if (dom.chatStatusText) {
    dom.chatStatusText.textContent = isOnline 
      ? getTranslation("chatStatusOnline", "Online") 
      : getTranslation("chatStatusOffline", "Offline");
    dom.chatStatusText.classList.toggle("online", isOnline);
    dom.chatStatusText.classList.toggle("offline", !isOnline);
  }
  // Also update the general Gemini active state and UI elements
  isGeminiActive = isOnline;
  if (dom.chatInput) dom.chatInput.disabled = !isGeminiActive;
  if (dom.sendBtn) dom.sendBtn.disabled = !isGeminiActive;
  if (dom.chatInput) {
    dom.chatInput.placeholder = isGeminiActive
      ? getTranslation("chatPlaceholder", "Ask a question...")
      : getTranslation("chatDisabled", "Chat unavailable");
  }
  console.log(`Chat status updated to: ${isOnline ? 'Online' : 'Offline'}`);
}

// Function to set the Gemini instance from the main initialization
export function setGeminiInstances(genAIInstance, modelInstance, activeStatus) {
  genAI = genAIInstance;
  geminiModelInstance = modelInstance;
  isGeminiActive = activeStatus;
  console.log("Gemini instances set in chat module.");
  // Update UI based on initial Gemini state
  if (dom.chatInput) dom.chatInput.disabled = !isGeminiActive;
  if (dom.sendBtn) dom.sendBtn.disabled = !isGeminiActive;
  // Call the new function to update the visual status and dependent UI
  updateChatOnlineStatus(activeStatus);
}

// Define system prompt dynamically - Updated for file input
const getSystemPrompt = () => {
  return `Role:
 You are EduHelp SL, a warm, professional, and intelligent AI assistant modeled after a trusted Sri Lankan school teacher. You support students from Grades 1 to 13 across the National Curriculum, and you're fluent in both English and Tamil.

🎓 Responsibilities & Behavioral Guidelines:
📘 Subject Expertise
Provide accurate, age-appropriate, and curriculum-aligned explanations in core subjects including:


Mathematics, Science, Languages (English, Tamil, Sinhala),


History, Geography, ICT, Commerce, Art, and more.


Adjust the depth and tone of your responses to suit the student’s grade level.


🌐 Language Use
CRITICAL RULE: Always respond in the interface language set as ${state.currentLang}.


If the user’s most recent message is clearly in the other language (Tamil or English), switch accordingly for that message only.


Use simple, clear vocabulary and explain terms in a way that is easy to understand.


🎯 Teaching Style
Adopt a supportive, patient, and motivating tone.


Use a step-by-step breakdown for complex topics.


Encourage the student’s independent thinking and problem-solving skills.


📚 In-App Resource Guidance
Guide students in navigating the EduHelpSL platform features:


How to use the Library (Textbooks, Past Papers, Other Materials).


How to explore the Videos section (organized by Grade → Subject → Unit).


Important: You cannot access specific files, external links, or actual video/text content. Base your help strictly on the structure and categories available in the app.


🧾 File Interaction
If a user uploads a PDF or image, acknowledge the file:


Example: "Based on the image you sent and your question about triangles..."


You may refer to the file by name or type, but you cannot deeply analyze or extract full content.


Relate the file to the user's accompanying question, if relevant.


📝 Essay Writing Policy
When asked to write essays in any language, do NOT provide full essays.


This discourages creativity and may be considered academic dishonesty.


Instead, give:


A brief overview of the topic.


A few key points or ideas the student can expand upon.


🧠 Communication Style & Formatting
Keep responses concise, friendly, and helpful.


Use basic Markdown for clarity:


Bold for important terms or steps.


* for bullet points, 1. for ordered steps.


Ensure good paragraph spacing.


Avoid advanced Markdown like headings (#), tables, or code blocks.


🔒 Limitations
Politely inform users that:


You cannot browse the internet.


You do not access personal user data or any external databases.


Avoid AI system references like:


"I am a large language model developed by Google/OpenAI."


Instead say: "I am your AI tutor here to help with your schoolwork."



Current interface language: ${state.currentLang}


`;
};

export function addChatWelcomeMessage() {
  if (!dom.chatMessages) return;

  // Remove existing welcome message if any
  const existingWelcome = dom.chatMessages.querySelector(".welcome-message");
  if (existingWelcome) {
    existingWelcome.remove();
  }

  // Add the new welcome message
  const welcomeDiv = document.createElement("div");
  welcomeDiv.className = "welcome-message";
  welcomeDiv.dataset.langKey = "chatWelcome"; // Use lang key for translation
  welcomeDiv.textContent = getTranslation("chatWelcome") || "How can I help?";
  dom.chatMessages.appendChild(welcomeDiv);
  console.log("Chat welcome message added.");
}

// Modified addChatMessage to include attachment info and use parseSimpleMarkdown
export function addChatMessage(text, role, attachmentInfo = null) {
  if (!dom.chatMessages) return null;

  // Remove the initial welcome message if this is the first actual message
  if (dom.chatMessages.querySelector(".welcome-message")) {
    dom.chatMessages.innerHTML = ""; // Clear all content including welcome message
  }

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role === "user" ? "user" : "bot"}`;

  // Add text content (parsed for bot, raw for user)
  if (text) {
    // Only add text node/parsed HTML if text exists
    if (role === "bot") {
      msgDiv.innerHTML = parseSimpleMarkdown(text); // Use parsed HTML for bot messages
    } else {
      msgDiv.textContent = text; // Use textContent for user messages to avoid parsing issues
    }
  }

  // Add attachment info within the user message bubble
  if (role === "user" && attachmentInfo) {
    const attachmentDiv = document.createElement("div");
    attachmentDiv.className = "message-attachment";

    const iconSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    iconSvg.setAttribute("class", "icon icon-paperclip");
    iconSvg.setAttribute("viewBox", "0 0 24 24");
    iconSvg.setAttribute("fill", "currentColor");
    iconSvg.setAttribute("width", "14px");
    iconSvg.setAttribute("height", "14px");
    const iconPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    iconPath.setAttribute(
      "d",
      "M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v11.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"
    );
    iconSvg.appendChild(iconPath);

    const nameSpan = document.createElement("span");
    nameSpan.className = "message-attachment-name";
    nameSpan.textContent = attachmentInfo.name;

    attachmentDiv.appendChild(iconSvg);
    attachmentDiv.appendChild(nameSpan);

    // Add margin if there was also text content above the attachment
    if (text) {
      attachmentDiv.style.marginTop = "0.5rem";
    }

    msgDiv.appendChild(attachmentDiv);
  }

  dom.chatMessages.appendChild(msgDiv);

  // Scroll to the bottom of the chat messages with a slight delay
  setTimeout(() => {
    if (dom.chatMessages) {
      dom.chatMessages.scrollTo({
        top: dom.chatMessages.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 50); // Short delay to allow DOM update

  return msgDiv;
}

// Modified getGeminiResponse to handle potential file data
export async function getGeminiResponse(messageParts, botMessageElement) {
  // Ensure Gemini is active and model instance is available
  if (!isGeminiActive || !geminiModelInstance) {
    const errorText = getTranslation("errorChatInit") || "Chat unavailable.";
    if (botMessageElement)
      botMessageElement.innerHTML = `<p><em>${errorText}</em></p>`;
    showError("errorChatInit", "Gemini not initialized", true); // Show fatal error
    return;
  }

  // Prepare message history for the API call
  // Use config for maxChatHistory
  const maxHistoryItems = config.maxChatHistory * 2; // User + Model messages
  let historyToSend = state.chatState.messageHistory.slice(-maxHistoryItems);

  // Ensure history starts with a user message if it's not empty
  if (historyToSend.length > 0 && historyToSend[0].role !== "user") {
    console.warn("Chat history did not start with user message. Correcting...");
    const firstUserIndex = historyToSend.findIndex((m) => m.role === "user");
    historyToSend =
      firstUserIndex >= 0 ? historyToSend.slice(firstUserIndex) : [];
  }

  try {
    // Send the request to the Gemini model
    // ... existing code ...
    const result = await geminiModelInstance.generateContentStream({
      systemInstruction: {
        role: "system", // Role for system instruction is typically just 'system' or implied
        parts: [{ text: getSystemPrompt() }],
      },
      contents: [
        ...historyToSend,
        { role: "user", parts: messageParts }, // Add the current user message parts (text + file)
      ],
      generationConfig: { temperature: 0.5, topP: 0.5 }, // Example config
    });
    // ... existing code ...
    // Safety settings are usually configured when getting the model instance, not per request for streaming
    // safetySettings: [
    //      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    //      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    //      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    //      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    //  ],

    let accumulatedText = "";
    // Clear initial placeholder/typing indicator text in the bot message element
    botMessageElement.innerHTML = "";

    // Process the streaming response
    for await (const chunk of result.stream) {
      try {
        // Append text from the chunk
        accumulatedText += chunk.text();
        // Update the bot message element with parsed markdown
        botMessageElement.innerHTML = parseSimpleMarkdown(accumulatedText);

        // Scroll to bottom as new content arrives
        if (dom.chatMessages) {
          dom.chatMessages.scrollTo({
            top: dom.chatMessages.scrollHeight,
            behavior: "auto",
          });
        }
      } catch (streamError) {
        console.error("Stream chunk processing error:", streamError);
        // Append error message to the bot message element
        botMessageElement.innerHTML += `<br><p><em>${
          getTranslation("errorStream") || "(Error receiving response)"
        }</em></p>`;
        showError(
          "errorChatResponse",
          streamError.message || "Streaming error"
        );
        break; // Stop processing the stream on error
      }
    }

    console.log("Streaming finished.");

    // Add the complete bot response to the message history
    state.chatState.messageHistory.push({
      role: "model",
      parts: [{ text: accumulatedText }],
    });

    // Trim history to max length
    while (state.chatState.messageHistory.length > maxHistoryItems) {
      state.chatState.messageHistory.shift();
    }
    updateChatOnlineStatus(true); // AI responded successfully
  } catch (error) {
    updateChatOnlineStatus(false); // AI failed to respond or error during processing
    console.error("Gemini API error:", error);

    // Display an error message in the bot's bubble
    let errorMsg =
      getTranslation("errorChatResponse") || "Error processing request.";
    if (error.message) {
      errorMsg += ` (${error.message})`;
    }
    if (botMessageElement) {
      botMessageElement.innerHTML = `<p><em>${errorMsg}</em></p>`;
    }

    // Show a general error notification
    showError("errorChatResponse", error.message || error.toString());

    // Optional: Remove the last user message from history if the API call failed immediately
    // (This prevents the history from getting out of sync if a request fails before processing)
    const lastMessageInHistory =
      state.chatState.messageHistory[state.chatState.messageHistory.length - 1];
    const lastUserMsgText = messageParts.find((p) => p.text)?.text;
    if (
      lastUserMsgText &&
      lastMessageInHistory &&
      lastMessageInHistory.role === "user" &&
      lastMessageInHistory.parts.find((p) => p.text)?.text === lastUserMsgText
    ) {
      console.log(
        "API Error: Removing last user message from history due to API failure."
      );
      state.chatState.messageHistory.pop();
    }
  } finally {
    // Re-enable input and hide typing indicator regardless of success or failure
    if (dom.typingIndicator) dom.typingIndicator.classList.remove("visible");
    state.chatState.isBotTyping = false;
    if (dom.sendBtn) dom.sendBtn.disabled = false;
    if (dom.chatInput) {
      dom.chatInput.disabled = false;
      dom.chatInput.focus(); // Set focus back to input
      autoGrowTextarea(dom.chatInput); // Adjust textarea height
    }
    // Ensure chat messages are scrolled to the bottom after processing
    setTimeout(() => {
      // Short delay for final rendering
      if (dom.chatMessages) {
        dom.chatMessages.scrollTo({
          top: dom.chatMessages.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  }
}

// Modified handleSendMessage to include attached file data AND pass info to addChatMessage
export async function handleSendMessage() {
  // Check authentication before processing
  if (!canAccessChat()) {
    showChatAccessDenied();
    return;
  }

  // Ensure DOM elements are available, bot is not typing, and Gemini is active
  if (
    !dom.chatInput ||
    !dom.sendBtn ||
    state.chatState.isBotTyping ||
    !isGeminiActive
  ) {
    console.warn(
      "Cannot send message: Input/Button missing, bot typing, or Gemini inactive."
    );
    return;
  }

  const textMessage = dom.chatInput.value.trim();
  const fileData = state.chatState.attachedFile; // Get attached file data from state

  // Do not send if both text and file are empty
  if (!textMessage && !fileData) {
    console.log("Attempted to send empty message.");
    return;
  }

  // Construct the message parts array for the Gemini API
  const userMessageParts = [];

  // Add text part if there is text
  if (textMessage) {
    userMessageParts.push({ text: textMessage });
  }

  // Add file part if there is a file attached
  if (fileData) {
    // The API expects inlineData for file parts
    userMessageParts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data, // Base64 encoded data
      },
    });
  }

  // Add the user's message to the UI and history
  // Pass fileData name to addChatMessage for display
  addChatMessage(
    textMessage || `(${getTranslation("fileAttached") || "File Attached"})`,
    "user",
    fileData ? { name: fileData.name } : null
  );

  // Add the user message to the state history
  state.chatState.messageHistory.push({
    role: "user",
    parts: userMessageParts,
  });

  // Trim message history to configured max length
  const maxHistoryItems = config.maxChatHistory * 2;
  while (state.chatState.messageHistory.length > maxHistoryItems) {
    state.chatState.messageHistory.shift(); // Remove the oldest message
  }

  // Clear the input field and attachment
  dom.chatInput.value = "";
  autoGrowTextarea(dom.chatInput); // Reset textarea height
  removeAttachment(); // Remove attachment preview and clear state

  // Disable input and button, show typing indicator
  dom.sendBtn.disabled = true;
  dom.chatInput.disabled = true;
  state.chatState.isBotTyping = true;
  if (dom.typingIndicator) {
    dom.typingIndicator.textContent =
      state.translations["loadingText"] || "Thinking...";
    dom.typingIndicator.classList.add("visible");
  }

  // Add a placeholder bot message element while waiting for the response
  const botMsgElem = addChatMessage("...", "bot");

  // If the bot message element wasn't created, something is wrong, abort.
  if (!botMsgElem) {
    console.error("Failed to create bot message element.");
    if (dom.typingIndicator) dom.typingIndicator.classList.remove("visible");
    state.chatState.isBotTyping = false;
    if (dom.sendBtn) dom.sendBtn.disabled = false;
    if (dom.chatInput) dom.chatInput.disabled = false;
    return;
  }

  // Get the response from Gemini (handles streaming and errors)
  try {
    await getGeminiResponse(userMessageParts, botMsgElem);
  } catch (error) {
    // getGeminiResponse already handles showing errors and updating UI, but catch here if needed for further actions
    console.error("Error during Gemini response handling:", error);
  } finally {
    // The finally block in getGeminiResponse already handles UI state cleanup (disabling/enabling inputs, hiding indicator)
  }
}

export function clearChat() {
  console.log("Clearing chat...");
  if (!dom.chatMessages) return;

  // Clear all messages from the UI
  dom.chatMessages.innerHTML = "";

  // Add the welcome message back
  addChatWelcomeMessage();

  // Clear message history in state
  state.chatState.messageHistory = [];

  // Remove any attached file
  removeAttachment();

  // Reset input field
  if (dom.chatInput) {
    dom.chatInput.value = "";
    autoGrowTextarea(dom.chatInput); // Reset textarea height
  }
  console.log("Chat cleared.");
}

// --- Chat File Attachment Handling ---
export function handleFileAttachment(event) {
  // Ensure dom.chatFileInput is available
  if (!dom.chatFileInput) {
    console.error("Chat file input element not found.");
    return;
  }
  const file = event.target.files?.[0];
  if (!file) {
    console.log("No file selected.");
    return;
  }

  // Use config for maxFileSizeMB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    showError("errorFileType", `Unsupported type: ${file.type}`);
    resetFileInput(dom.chatFileInput); // Reset the file input
    return;
  }

  const maxSize = config.maxFileSizeMB * 1024 * 1024; // Convert MB to bytes
  if (file.size > maxSize) {
    showError("errorFileSize", `> ${config.maxFileSizeMB}MB`);
    resetFileInput(dom.chatFileInput); // Reset the file input
    return;
  }

  // Read the file as a Data URL (Base64)
  const reader = new FileReader();

  reader.onload = (e) => {
    // The result is a Data URL (e.g., "data:image/png;base64,...")
    // We only need the base64 part after the comma
    const base64Data = e.target.result.split(",")[1];

    // Store file data in state
    state.chatState.attachedFile = {
      name: file.name,
      mimeType: file.type,
      data: base64Data,
    };
    console.log(
      `File attached: ${file.name} (${file.type}, ${file.size} bytes)`
    );

    // Show the attachment preview in the UI
    showAttachmentPreview(file.name);
  };

  reader.onerror = () => {
    console.error("Error reading file:", reader.error);
    showError("errorFileRead");
    state.chatState.attachedFile = null; // Clear state
    hideAttachmentPreview(); // Hide UI preview
    resetFileInput(dom.chatFileInput); // Reset the file input
  };

  reader.readAsDataURL(file);
}

export function showAttachmentPreview(filename) {
  // Ensure DOM elements exist
  if (!dom.attachmentPreview || !dom.attachmentFilename) return;

  dom.attachmentFilename.textContent = filename;
  dom.attachmentPreview.style.display = "flex"; // Show the preview element
}

export function removeAttachment() {
  state.chatState.attachedFile = null; // Clear attached file from state
  hideAttachmentPreview(); // Hide the preview UI
  // Reset the file input element's value
  if (dom.chatFileInput) {
    dom.chatFileInput.value = ""; // Clear the selected file
  }
  console.log("Attachment removed.");
}

function hideAttachmentPreview() {
  if (!dom.attachmentPreview || !dom.attachmentFilename) return;
  dom.attachmentPreview.style.display = "none"; // Hide the preview element
  dom.attachmentFilename.textContent = ""; // Clear filename text
}

// Helper to automatically adjust textarea height
// This function is also in utils.js, keep one definitive version
// Moving this to utils.js
/*
function autoGrowTextarea() {
    if (!dom.chatInput) return;
    dom.chatInput.style.height = 'auto';
    dom.chatInput.style.height = dom.chatInput.scrollHeight + 'px';
}
*/

// Function to setup chat specific event listeners
export function setupChatEventListeners() {
  // Ensure DOM elements are available
  if (
    !dom.chatInput ||
    !dom.sendBtn ||
    !dom.attachFileBtn ||
    !dom.chatFileInput ||
    !dom.clearChatBtn ||
    !dom.removeAttachmentBtn
  ) {
    console.warn(
      "Chat DOM elements not fully available for event listener setup."
    );
    return;
  }

  // Send button click
  dom.sendBtn.addEventListener("click", () => {
    if (!canAccessChat()) {
      showChatAccessDenied();
      return;
    }
    handleSendMessage();
  });

  // Input keydown (for sending on Enter)
  dom.chatInput.addEventListener("keydown", (e) => {
    // Check for Enter key (but not Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline behavior
      if (!canAccessChat()) {
        showChatAccessDenied();
        return;
      }
      handleSendMessage(); // Send the message
    }
  });

  // Input focus (check auth when user tries to focus)
  dom.chatInput.addEventListener("focus", () => {
    if (!canAccessChat()) {
      dom.chatInput.blur();
      showChatAccessDenied();
      return;
    }
  });

  // Input input (for auto-growing textarea)
  dom.chatInput.addEventListener("input", () =>
    autoGrowTextarea(dom.chatInput)
  );

  // Clear chat button click
  dom.clearChatBtn.addEventListener("click", () => {
    if (!canAccessChat()) {
      showChatAccessDenied();
      return;
    }
    clearChat();
  });

  // Attach file button click (triggers hidden file input click)
  dom.attachFileBtn.addEventListener("click", () => {
    if (!canAccessChat()) {
      showChatAccessDenied();
      return;
    }
    dom.chatFileInput.click();
  });

  // Hidden file input change (when a file is selected)
  dom.chatFileInput.addEventListener("change", (event) => {
    if (!canAccessChat()) {
      showChatAccessDenied();
      return;
    }
    handleFileAttachment(event);
  });

  // Remove attachment button click
  dom.removeAttachmentBtn.addEventListener("click", () => {
    if (!canAccessChat()) {
      showChatAccessDenied();
      return;
    }
    removeAttachment();
  });

  console.log("Chat event listeners set up.");
}

// Import HarmCategory and HarmBlockThreshold if needed for setGeminiInstances or getGeminiResponse
// Assuming they are available globally or imported in main.js where the SDK is initialized.
// If not, they would need to be passed or imported here.
// import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Example import if using modules directly

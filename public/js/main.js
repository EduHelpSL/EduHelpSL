// IMPORTANT: Ensure type="module" is on your script tag in index.html
// <script src="assets/js/main.js" type="module"></script>

// --- Import Core Modules ---
import { config } from "./config.js";
import { state } from "./state.js";
import { dom, cacheDomElements } from "./domCache.js";
import { initializeGemini } from "./gemini.js";
import { setupAllEventListeners } from "./eventListeners.js";
import { switchLanguage, getTranslation } from "./translation.js";
import { navigateToPage, updateCopyrightYear } from "./navigation.js";
import {
  addChatWelcomeMessage,
  setGeminiInstances as setChatGeminiInstances,
} from "./chat.js";
import { autoGrowTextarea, showError } from "./utils.js";
import { initializeAuth, showAuthError, showAuthMessage } from "./auth.js";
// Import specific library functions needed for initialization and setup
import {
  initializeMainLibraryFilters, // This function seems to be missing, relying on fallback
  // populateMainGradeFilter, // Fallback - No longer needed
  // populateMainYearFilter, // Fallback - No longer needed
  setupLibraryEventListeners,
  populateListViewYearFilter, // Corrected import name
  renderResourceList,
  resetLibrarySection, // Needed if reset is triggered elsewhere
} from "./library.js";
import {
  renderUnitGrid,
  renderVideoList,
  setupVideosEventListeners,
} from "./videos.js";
import { setupScrollEventListeners } from "./scroll.js";
import {
  populateGradeGrid,
  setRenderingFunctions,
  reRenderDynamicContent,
} from "./commonRendering.js";

// Import Google AI SDK
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// --- Initialization ---
async function initializeEduHelpApp() {
  console.log("Initializing EduHelp App...");

  // Check backend health first
  try {
    const { checkBackendHealth } = await import("./apiService.js");
    const isBackendHealthy = await checkBackendHealth();
    if (!isBackendHealthy) {
      console.warn(
        "Backend server is not responding. Some features may be limited."
      );
      showError(
        "errorBackend",
        "Backend server unavailable. Some features may be limited.",
        false
      );
    }
  } catch (error) {
    console.warn("Could not check backend health:", error);
  }

  // 1. Cache DOM elements FIRST
  if (!cacheDomElements()) {
    console.error(
      "Failed to cache critical DOM elements. Aborting initialization."
    );
    showAuthError(
      "Fatal Error: Failed to load UI elements. Please refresh the page."
    );
    return;
  }
  console.log("DOM elements cached.");

  // 2. Determine initial language
  let initialLang = config.defaultLang;
  try {
    const savedLang = localStorage.getItem(config.localStorageLangKey);
    if (savedLang && (savedLang === "en" || savedLang === "ta")) {
      initialLang = savedLang;
    }
  } catch (e) {
    console.warn("LocalStorage error reading language preference:", e);
  }
  state.currentLang = initialLang;

  // 3. Load initial translations (await this!)
  try {
    await switchLanguage(initialLang);
    console.log(`Initial language loaded: ${initialLang}`);
    // Once translations are loaded, make the content visible
    if (dom.globalLoader) {
      dom.globalLoader.style.display = "none"; // Hide the new loader
    }
    document.body.classList.remove("content-loading");
    document.body.classList.add("content-ready");
    console.log("Content revealed after language load.");
  } catch (error) {
    console.error("Failed initial language load:", error);
    showError("errorLangSwitch", "Failed to load language.", true);
    // Do not remove content-loading or add content-ready if language load fails.
    // This will keep the loading state active, indicating an issue.
    return; // Abort if initial language fails
  }

  // 4. Initialize authentication
  try {
    await initializeAuth();
    console.log("Authentication initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize authentication:", error);
  }

  // 5. Initialize Gemini
  try {
    const geminiInstances = await initializeGemini(
      config,
      HarmCategory,
      HarmBlockThreshold
    );
    if (geminiInstances) {
      setChatGeminiInstances(
        geminiInstances.genAI,
        geminiInstances.modelInstance,
        geminiInstances.isGeminiActive
      );
      console.log("Gemini instances set in chat module.");
    } else {
      console.warn("Gemini initialization failed or skipped.");
      setChatGeminiInstances(null, null, false);
    }
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    showError(
      "errorChatInit",
      "Failed to initialize chat service. Please ensure the backend server is running.",
      true
    );
    // Set inactive instances to disable chat
    setChatGeminiInstances(null, null, false);
  }

  // 6. Set dynamic rendering functions in commonRendering module
  setRenderingFunctions(
    { populateYearFilter: populateListViewYearFilter, renderResourceList }, // Library functions
    { renderUnitGrid, renderVideoList } // Videos functions
  );
  console.log("Dynamic rendering functions linked.");

  // 7. Setup all event listeners
  setupAllEventListeners(); // This should internally call setupLibraryEventListeners, setupVideosEventListeners, etc.
  console.log("Event listeners set up.");

  // 8. Set initial page/view state correctly
  dom.pages.forEach((page) =>
    page.classList.toggle("active", page.id === state.currentPage)
  );
  // Ensure correct view is active within library/videos if navigating directly (though usually starts at home)
  if (state.currentPage === "library") {
    resetLibrarySection(); // Reset to initial state on load if starting here
  }
  // Add similar reset logic for videos if needed
  // Set initial home view active if starting on home
  if (dom.homePage && state.currentPage === "home") {
    const homeView = dom.homePage.querySelector(".view") || dom.homePage; // Adjust if home doesn't use sub-views
    homeView.classList.add("active");
  }

  // 9. Populate initial UI content
  if (dom.libraryGradeGrid) populateGradeGrid(dom.libraryGradeGrid);
  if (dom.videoGradeGrid) populateGradeGrid(dom.videoGradeGrid);

  // Initialize library data from Google Drive
  try {
    // Import the function dynamically to avoid circular dependencies
    const { initializeLibraryData } = await import("./library.js");
    if (typeof initializeLibraryData === "function") {
      await initializeLibraryData();
      console.log("Library data initialized from Google Drive");
    } else {
      console.error(
        "'initializeLibraryData' function not found. Check library.js exports."
      );
    }
  } catch (error) {
    console.error("Failed to initialize library data:", error);
  }

  // Populate the NEW main library filters using the integrated function
  if (typeof initializeMainLibraryFilters === "function") {
    initializeMainLibraryFilters();
  } else {
    console.error(
      "'initializeMainLibraryFilters' function not found. Check library.js exports."
    );
  }

  // Initialize chat state and UI
  if (dom.chatInput) autoGrowTextarea(dom.chatInput);
  if (dom.chatMessages && dom.chatMessages.children.length === 0) {
    addChatWelcomeMessage();
  }

  // Update copyright year
  updateCopyrightYear();

  console.log("EduHelp App Initialized successfully.");

  // 10. Register Service Worker for caching
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );

        // Check for updates on registration
        registration.addEventListener("updatefound", () => {
          console.log("New service worker update found.");
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }
}

// --- Start the application after the DOM is fully loaded ---
document.addEventListener("DOMContentLoaded", () => {
  initializeEduHelpApp();
});

// --- Login Popup and Firebase Auth Logic ---
// Function-level comments included for clarity

/**
 * Sets up the Firebase authentication state observer.
 * Updates the application state based on user login status.
 */
function setupAuthStateObserver() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in.
      console.log("User is signed in:", user);
      state.auth.isUserLoggedIn = true;
      state.auth.userProfile = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      };
      // Update UI for logged-in user (e.g., show profile, hide login button)
      if (dom.loginButton) dom.loginButton.style.display = "none";
      if (dom.logoutButton) dom.logoutButton.style.display = "block";
      if (dom.userProfileContainer)
        dom.userProfileContainer.style.display = "flex"; // Or 'block'
      if (dom.userProfileName)
        dom.userProfileName.textContent = user.displayName || user.email;
      if (dom.userProfilePic) {
        if (user.photoURL) {
          dom.userProfilePic.src = user.photoURL;
          dom.userProfilePic.style.display = "block";
        } else {
          dom.userProfilePic.style.display = "none"; // Hide if no photoURL
        }
      }
      closeLoginPopup(); // Close login popup if open
    } else {
      // User is signed out.
      console.log("User is signed out.");
      state.auth.isUserLoggedIn = false;
      state.auth.userProfile = null;
      // Update UI for logged-out user (e.g., show login button, hide profile)
      if (dom.loginButton) dom.loginButton.style.display = "block";
      if (dom.logoutButton) dom.logoutButton.style.display = "none";
      if (dom.userProfileContainer)
        dom.userProfileContainer.style.display = "none";
      if (dom.userProfileName) dom.userProfileName.textContent = "";
      if (dom.userProfilePic) {
        dom.userProfilePic.src = "";
        dom.userProfilePic.style.display = "none";
      }
    }
    // Potentially trigger other UI updates or logic based on auth state change
    // For example, re-render parts of the UI that depend on login state.
    reRenderDynamicContent(); // Example: if some content visibility depends on login
  });
}

/**
 * Closes the login popup modal.
 */
function closeLoginPopup() {
  if (dom.loginPopupModal) {
    dom.loginPopupModal.style.display = "none";
    console.log("Login popup closed.");
  }
}

// Firebase authentication is now handled by auth.js module

// Authentication UI is now handled by auth.js module

/**
 * Shows the login popup modal.
 */
export function showLoginPopup() {
  const popup = document.getElementById("login-popup");
  if (popup) {
    popup.style.display = "flex";
    popup.style.alignItems = "center"; // Ensure centering property is applied inline
    popup.style.justifyContent = "center"; // Ensure centering property is applied inline
  }
}

/**
 * Shows an in-app notification at the bottom of the screen.
 * @param {string} message - The message to display.
 * @param {number} [duration=3000] - How long to display the notification in milliseconds.
 */
function showInAppNotification(message, duration = 3000) {
  const notificationElement = document.getElementById("inAppNotification");
  if (notificationElement) {
    notificationElement.textContent = message;
    notificationElement.classList.add("show");

    // Automatically hide after duration
    setTimeout(() => {
      notificationElement.classList.remove("show");
    }, duration);
  }
}

/**
 * Hides the login popup modal.
 */
function hideLoginPopup() {
  const popup = document.getElementById("login-popup");
  if (popup) popup.style.display = "none";
}

/**
 * Handles sign-in with Google using Firebase Auth.
 */
function handleGoogleSignIn() {
  const displayNameInput = document.getElementById("displayName");
  const name = displayNameInput ? displayNameInput.value.trim() : "";

  if (!name) {
    showAuthMessage(
      getTranslation("enterYourNamePrompt", "Please enter your name.")
    );
    if (displayNameInput) displayNameInput.focus();
    return;
  }
  if (!window.firebase || !window.firebase.auth) {
    showAuthError("Firebase not loaded. Please try again later.");
    return;
  }
  const provider = new window.firebase.auth.GoogleAuthProvider();
  window.firebase
    .auth()
    .signInWithPopup(provider)
    .then(async (result) => {
      const user = result.user;
      if (user) {
        try {
          await user.updateProfile({
            displayName: name,
          });
          console.log(
            "User profile updated with display name for Google sign-in."
          );
          // showInAppNotification(
          //   getTranslation("signInSuccessName", "Signed in as: {name}").replace(
          //     "{name}",
          //     name || user.displayName
          //   )
          // ); // Removed this notification as it's handled in auth.js
          hideLoginPopup();
        } catch (updateError) {
          console.error(
            "Error updating profile for Google sign-in: ",
            updateError
          );
          showInAppNotification(
            getTranslation(
              "profileUpdateFailed",
              "Signed in, but failed to update your name: {error}"
            ).replace("{error}", updateError.message),
            5000 // Show error for longer
          );
          hideLoginPopup(); // Still hide popup on sign-in success even if name update fails
        }
      } else {
        showInAppNotification(
          getTranslation("signInSuccessGeneric", "Signed in successfully.")
        );
        hideLoginPopup();
      }
    })
    .catch((error) => {
      showAuthError("Google sign-in failed: " + error.message);
    });
}

// Attach event listeners after DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  // Login button event
  const loginBtn = document.querySelector(".login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", showLoginPopup);
  }
  // Popup close event
  const closeBtn = document.getElementById("login-popup-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideLoginPopup);
    closeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") hideLoginPopup();
    });
  }
  // Google sign-in event
  const googleBtn = document.getElementById("google-signin-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", handleGoogleSignIn);
  }
  // Hide popup on outside click
  const popup = document.getElementById("login-popup");
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) hideLoginPopup();
    });
  }
});
